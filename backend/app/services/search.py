import re
from typing import Any

from sqlalchemy import String, cast, func, literal_column

from app.models import FreelancerProfile, JobPost, User

# Canonical synonym clusters for common industry roles and concepts
ROLE_SYNONYMS: dict[str, list[str]] = {
    # Engineering / Development
    "developer": ["engineer", "dev", "devs", "programmer", "software", "coder"],
    "engineer": ["developer", "dev", "devs", "programmer", "software", "coder"],
    "dev": ["developer", "engineer", "programmer", "software"],
    "devs": ["developer", "engineer", "programmer", "software"],
    "programmer": ["developer", "engineer", "dev", "software"],
    "coder": ["developer", "engineer", "dev", "programmer"],
    "software": ["developer", "engineer", "dev", "programmer"],
    # Design
    "designer": ["design", "ui", "ux", "ui/ux", "product designer"],
    "design": ["designer", "ui", "ux", "ui/ux"],
    "ui": ["designer", "ux", "ui/ux", "design"],
    "ux": ["designer", "ui", "ui/ux", "design"],
    # Writing & Content
    "writer": ["copywriter", "content"],
    "copywriter": ["writer", "content"],
    # Marketing
    "marketer": ["marketing", "growth", "seo"],
    "marketing": ["marketer", "growth", "seo"],
    # Frontend / Backend / Mobile
    "frontend": ["front-end", "ui", "client-side"],
    "backend": ["back-end", "api", "server-side"],
    "mobile": ["ios", "android", "flutter", "react native"],
}


def build_tsquery_string(q: str) -> str | None:
    """
    Parse a user query string into a PostgreSQL tsquery string with:
    - Alphanumeric token sanitization
    - Prefix wildcards (:*) on tokens
    - Role synonym expansion into boolean OR disjunctions
    - Multi-term conjunction with &
    """
    clean = q.strip()
    if not clean:
        return None

    # Extract alphanumeric words (skipping standalone special chars)
    tokens = re.findall(r"[a-zA-Z0-9]+", clean.lower())
    if not tokens:
        return None

    clauses: list[str] = []
    for token in tokens:
        # Check if the token has role synonyms
        synonyms = ROLE_SYNONYMS.get(token)
        if synonyms:
            all_variants = sorted(set([token] + synonyms))
            # Format each as prefix wildcard variant:*
            variant_strs = [
                f"{v}:*" for v in all_variants if re.match(r"^[a-zA-Z0-9]+$", v)
            ]
            if len(variant_strs) > 1:
                clauses.append(f"({' | '.join(variant_strs)})")
            elif variant_strs:
                clauses.append(variant_strs[0])
        else:
            clauses.append(f"{token}:*")

    if not clauses:
        return None

    return " & ".join(clauses)


def get_freelancer_document_vector() -> Any:
    """
    Build a weighted PostgreSQL tsvector for FreelancerProfile:
    - Weight A (1.0): title, skills
    - Weight B (0.4): category, user.full_name
    - Weight C (0.2): location
    - Weight D (0.1): bio
    """
    weight_a = literal_column("'A'")
    weight_b = literal_column("'B'")
    weight_c = literal_column("'C'")
    weight_d = literal_column("'D'")

    return (
        func.setweight(
            func.to_tsvector("english", func.coalesce(FreelancerProfile.title, "")),
            weight_a,
        )
        .op("||")(
            func.setweight(
                func.to_tsvector(
                    "english",
                    func.coalesce(cast(FreelancerProfile.skills, String), ""),
                ),
                weight_a,
            )
        )
        .op("||")(
            func.setweight(
                func.to_tsvector(
                    "english", func.coalesce(FreelancerProfile.category, "")
                ),
                weight_b,
            )
        )
        .op("||")(
            func.setweight(
                func.to_tsvector("english", func.coalesce(User.full_name, "")),
                weight_b,
            )
        )
        .op("||")(
            func.setweight(
                func.to_tsvector(
                    "english", func.coalesce(FreelancerProfile.location, "")
                ),
                weight_c,
            )
        )
        .op("||")(
            func.setweight(
                func.to_tsvector("english", func.coalesce(FreelancerProfile.bio, "")),
                weight_d,
            )
        )
    )


def get_job_document_vector() -> Any:
    """
    Build a weighted PostgreSQL tsvector for JobPost:
    - Weight A (1.0): title, skills
    - Weight B (0.4): category
    - Weight C (0.2): location
    - Weight D (0.1): description
    """
    weight_a = literal_column("'A'")
    weight_b = literal_column("'B'")
    weight_c = literal_column("'C'")
    weight_d = literal_column("'D'")

    return (
        func.setweight(
            func.to_tsvector("english", func.coalesce(JobPost.title, "")),
            weight_a,
        )
        .op("||")(
            func.setweight(
                func.to_tsvector(
                    "english", func.coalesce(cast(JobPost.skills, String), "")
                ),
                weight_a,
            )
        )
        .op("||")(
            func.setweight(
                func.to_tsvector("english", func.coalesce(JobPost.category, "")),
                weight_b,
            )
        )
        .op("||")(
            func.setweight(
                func.to_tsvector("english", func.coalesce(JobPost.location, "")),
                weight_c,
            )
        )
        .op("||")(
            func.setweight(
                func.to_tsvector("english", func.coalesce(JobPost.description, "")),
                weight_d,
            )
        )
    )


def build_freelancer_search_filter(q: str) -> tuple[Any, Any] | tuple[None, None]:
    """
    Constructs a SQLModel/SQLAlchemy filter and ranking expression for FreelancerProfile search.
    Combines:
    1. PostgreSQL Full-Text Search (tsvector @@ tsquery) with synonym expansion.
    2. pg_trgm fuzzy word_similarity for typo tolerance.
    """
    clean_q = q.strip()
    if not clean_q:
        return None, None

    tsquery_str = build_tsquery_string(clean_q)
    if not tsquery_str:
        return None, None

    doc_vector = get_freelancer_document_vector()
    tsquery = func.to_tsquery("english", tsquery_str)

    fts_condition = doc_vector.op("@@")(tsquery)

    # Trigram fuzzy similarity for typo resilience
    trgm_condition = (
        func.word_similarity(clean_q, func.coalesce(FreelancerProfile.title, ""))
        >= 0.45
    ) | (
        func.word_similarity(
            clean_q, func.coalesce(cast(FreelancerProfile.skills, String), "")
        )
        >= 0.45
    )

    filter_condition = fts_condition | trgm_condition

    # Relevance score combining FTS rank and title similarity
    rank_expr = func.ts_rank(doc_vector, tsquery) + (
        func.word_similarity(clean_q, func.coalesce(FreelancerProfile.title, "")) * 0.5
    )

    return filter_condition, rank_expr


def build_job_search_filter(q: str) -> tuple[Any, Any] | tuple[None, None]:
    """
    Constructs a SQLModel/SQLAlchemy filter and ranking expression for JobPost search.
    """
    clean_q = q.strip()
    if not clean_q:
        return None, None

    tsquery_str = build_tsquery_string(clean_q)
    if not tsquery_str:
        return None, None

    doc_vector = get_job_document_vector()
    tsquery = func.to_tsquery("english", tsquery_str)

    fts_condition = doc_vector.op("@@")(tsquery)

    trgm_condition = (
        func.word_similarity(clean_q, func.coalesce(JobPost.title, "")) >= 0.45
    ) | (
        func.word_similarity(clean_q, func.coalesce(cast(JobPost.skills, String), ""))
        >= 0.45
    )

    filter_condition = fts_condition | trgm_condition

    rank_expr = func.ts_rank(doc_vector, tsquery) + (
        func.word_similarity(clean_q, func.coalesce(JobPost.title, "")) * 0.5
    )

    return filter_condition, rank_expr
