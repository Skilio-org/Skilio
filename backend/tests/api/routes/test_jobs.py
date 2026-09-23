
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import UserRole
from tests.utils.user import create_random_user, user_authentication_headers
from tests.utils.utils import random_lower_string


def _make_client_headers(client: TestClient, db: Session) -> tuple[dict[str, str], any]:
    user = create_random_user(db)
    user.active_role = UserRole.CLIENT
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    headers = user_authentication_headers(client=client, email=user.email, password=password)
    return headers, user


def _make_freelancer_headers(client: TestClient, db: Session) -> tuple[dict[str, str], any]:
    user = create_random_user(db)
    user.active_role = UserRole.FREELANCER
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    headers = user_authentication_headers(client=client, email=user.email, password=password)
    return headers, user


def test_create_job_by_client(client: TestClient, db: Session) -> None:
    headers, user = _make_client_headers(client, db)
    data = {
        "title": "Build a FastAPI Backend",
        "description": "Need an expert in FastAPI and PostgreSQL to build API endpoints.",
        "budget_type": "fixed",
        "budget": 1500.0,
        "location": "Remote",
        "category": "Web Mobile & Software Dev",
        "skills": ["FastAPI", "Python", "PostgreSQL"],
    }
    response = client.post(f"{settings.API_V1_STR}/jobs/", headers=headers, json=data)
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert content["budget_type"] == "fixed"
    assert content["budget"] == 1500.0
    assert content["category"] == "Web Mobile & Software Dev"
    assert content["status"] == "open"
    assert content["client_id"] == str(user.id)
    assert content["client_name"] == user.full_name
    assert content["proposals_count"] == 0
    assert content["is_saved"] is False
    assert content["has_applied"] is False

    skills = content["skills"]
    assert "FastAPI" in skills
    assert "Python" in skills
    assert "PostgreSQL" in skills


def test_create_job_by_freelancer_forbidden(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    data = {
        "title": "Unauthorized Job",
        "description": "Freelancers cannot post jobs",
        "budget_type": "fixed",
        "budget": 500.0,
    }
    response = client.post(f"{settings.API_V1_STR}/jobs/", headers=headers, json=data)
    assert response.status_code == 403
    assert response.json()["detail"] == "Only clients can post jobs"


def test_read_jobs_feed_and_sorting(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)
    client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={
            "title": "Low Budget Job",
            "description": "Simple task",
            "budget_type": "hourly",
            "budget": 20.0,
        },
    )
    client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={
            "title": "High Budget Job",
            "description": "Complex task",
            "budget_type": "hourly",
            "budget": 100.0,
        },
    )

    # Test default feed (newest first)
    response = client.get(f"{settings.API_V1_STR}/jobs/?sort_by=newest")
    assert response.status_code == 200
    content = response.json()
    assert content["count"] >= 2

    # Test sorting by budget descending
    response_desc = client.get(f"{settings.API_V1_STR}/jobs/?sort_by=budget_desc")
    assert response_desc.status_code == 200
    desc_data = response_desc.json()["data"]
    budgets = [j["budget"] for j in desc_data]
    assert budgets == sorted(budgets, reverse=True)

    # Test sorting by budget ascending
    response_asc = client.get(f"{settings.API_V1_STR}/jobs/?sort_by=budget_asc")
    assert response_asc.status_code == 200
    asc_data = response_asc.json()["data"]
    budgets_asc = [j["budget"] for j in asc_data]
    assert budgets_asc == sorted(budgets_asc)


def test_read_jobs_feed_filters(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)
    client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={
            "title": "React Frontend Specialist",
            "description": "Develop modern UI with React and TypeScript",
            "budget_type": "fixed",
            "budget": 2500.0,
            "category": "Web Mobile & Software Dev",
            "skills": ["React", "TypeScript"],
        },
    )
    client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={
            "title": "DevOps Engineer Needed",
            "description": "Setup Kubernetes cluster on AWS",
            "budget_type": "hourly",
            "budget": 75.0,
            "category": "IT & Networking",
            "skills": ["Docker", "Kubernetes", "AWS"],
        },
    )

    # Search by skill via keyword q (without needing skill query param)
    r_skill = client.get(f"{settings.API_V1_STR}/jobs/?q=Docker")
    assert r_skill.status_code == 200
    docker_jobs = r_skill.json()["data"]
    assert len(docker_jobs) >= 1
    assert any("Docker" in j["skills"] for j in docker_jobs)

    # Filter by category
    r_cat = client.get(f"{settings.API_V1_STR}/jobs/?category=IT%20%26%20Networking")
    assert r_cat.status_code == 200
    for job in r_cat.json()["data"]:
        assert job["category"] == "IT & Networking"

    # Filter by budget_type
    r_type = client.get(f"{settings.API_V1_STR}/jobs/?budget_type=hourly")
    assert r_type.status_code == 200
    for job in r_type.json()["data"]:
        assert job["budget_type"] == "hourly"

    # Filter by budget range
    r_range = client.get(f"{settings.API_V1_STR}/jobs/?min_budget=2000&max_budget=3000")
    assert r_range.status_code == 200
    for job in r_range.json()["data"]:
        assert 2000 <= job["budget"] <= 3000

    # Filter by search keyword q
    r_search = client.get(f"{settings.API_V1_STR}/jobs/?q=Kubernetes")
    assert r_search.status_code == 200
    assert any("Kubernetes" in j["description"] for j in r_search.json()["data"])


def test_save_and_unsave_job(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)

    # Create job
    create_resp = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=client_headers,
        json={
            "title": "Saveable Job",
            "description": "Bookmark this job to test",
            "budget_type": "fixed",
            "budget": 800.0,
        },
    )
    job_id = create_resp.json()["id"]

    # Freelancer saves the job
    save_resp = client.post(f"{settings.API_V1_STR}/jobs/{job_id}/save", headers=freelancer_headers)
    assert save_resp.status_code == 200
    assert save_resp.json()["message"] == "Job post saved successfully"

    # Verify job shows is_saved=True in detail and feed
    detail_resp = client.get(f"{settings.API_V1_STR}/jobs/{job_id}", headers=freelancer_headers)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["is_saved"] is True

    # List saved jobs
    saved_resp = client.get(f"{settings.API_V1_STR}/jobs/saved", headers=freelancer_headers)
    assert saved_resp.status_code == 200
    saved_data = saved_resp.json()
    assert saved_data["count"] >= 1
    assert any(s["job_post_id"] == job_id for s in saved_data["data"])

    # Unsave job
    unsave_resp = client.delete(f"{settings.API_V1_STR}/jobs/{job_id}/save", headers=freelancer_headers)
    assert unsave_resp.status_code == 200
    assert unsave_resp.json()["message"] == "Job post removed from saved"

    # Verify is_saved is now False
    detail_after = client.get(f"{settings.API_V1_STR}/jobs/{job_id}", headers=freelancer_headers)
    assert detail_after.json()["is_saved"] is False


def test_client_cannot_save_job(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    create_resp = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=client_headers,
        json={
            "title": "Job For Client Test",
            "description": "Testing save permissions",
            "budget_type": "fixed",
            "budget": 400.0,
        },
    )
    job_id = create_resp.json()["id"]
    save_resp = client.post(f"{settings.API_V1_STR}/jobs/{job_id}/save", headers=client_headers)
    assert save_resp.status_code == 403


def test_update_job(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    other_client_headers, _ = _make_client_headers(client, db)

    create_resp = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=client_headers,
        json={
            "title": "Original Job Title",
            "description": "Original Description",
            "budget_type": "hourly",
            "budget": 50.0,
            "skills": ["Python"],
        },
    )
    job_id = create_resp.json()["id"]

    # Non-owner cannot update
    fail_update = client.put(
        f"{settings.API_V1_STR}/jobs/{job_id}",
        headers=other_client_headers,
        json={"title": "Hacked Title"},
    )
    assert fail_update.status_code == 403

    # Owner updates title, budget, status, and skills
    update_resp = client.put(
        f"{settings.API_V1_STR}/jobs/{job_id}",
        headers=client_headers,
        json={
            "title": "Updated Job Title",
            "budget": 75.0,
            "status": "closed",
            "skills": ["Python", "FastAPI"],
        },
    )
    assert update_resp.status_code == 200
    content = update_resp.json()
    assert content["title"] == "Updated Job Title"
    assert content["budget"] == 75.0
    assert content["status"] == "closed"
    skills = content["skills"]
    assert "FastAPI" in skills
    assert "Python" in skills


def test_delete_job(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    other_client_headers, _ = _make_client_headers(client, db)

    create_resp = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=client_headers,
        json={
            "title": "Job to Delete",
            "description": "Will be deleted",
            "budget_type": "fixed",
            "budget": 300.0,
        },
    )
    job_id = create_resp.json()["id"]

    # Non-owner cannot delete
    fail_del = client.delete(f"{settings.API_V1_STR}/jobs/{job_id}", headers=other_client_headers)
    assert fail_del.status_code == 403

    # Owner deletes
    del_resp = client.delete(f"{settings.API_V1_STR}/jobs/{job_id}", headers=client_headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["message"] == "Job post deleted successfully"

    # Check 404
    get_resp = client.get(f"{settings.API_V1_STR}/jobs/{job_id}")
    assert get_resp.status_code == 404


def test_create_job_with_custom_skills(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    data = {
        "title": "AI Agent Developer",
        "description": "Need an engineer skilled in prompt engineering and arbitrary tools.",
        "budget_type": "fixed",
        "budget": 3000.0,
        "skills": ["Prompt Engineering", "Custom Agentic AI", "FastAPI"],
    }
    response = client.post(f"{settings.API_V1_STR}/jobs/", headers=client_headers, json=data)
    assert response.status_code == 200
    content = response.json()
    assert content["skills"] == ["Prompt Engineering", "Custom Agentic AI", "FastAPI"]

    # Keyword search finding custom skill
    search_resp = client.get(f"{settings.API_V1_STR}/jobs/?q=Prompt%20Engineering")
    assert search_resp.status_code == 200
    found_jobs = search_resp.json()["data"]
    assert any(content["id"] == j["id"] for j in found_jobs)


def test_saved_jobs_crud_and_filters(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, freelancer = _make_freelancer_headers(client, db)

    # Create two jobs in different categories
    job1_resp = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=client_headers,
        json={
            "title": "UI/UX Mobile App Designer",
            "description": "Figma design for iOS app",
            "budget_type": "fixed",
            "budget": 1200.0,
            "category": "Design & Creative",
        },
    )
    job1_id = job1_resp.json()["id"]

    job2_resp = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=client_headers,
        json={
            "title": "SEO Marketing Specialist",
            "description": "Improve organic search rankings",
            "budget_type": "fixed",
            "budget": 800.0,
            "category": "Sales & Marketing",
        },
    )
    job2_id = job2_resp.json()["id"]

    # Save job 1 via POST /jobs/saved
    save1 = client.post(
        f"{settings.API_V1_STR}/jobs/saved",
        headers=freelancer_headers,
        json={"job_post_id": job1_id},
    )
    assert save1.status_code == 200
    saved1_data = save1.json()
    assert saved1_data["job_post_id"] == job1_id
    assert saved1_data["job_post"]["title"] == "UI/UX Mobile App Designer"
    saved1_id = saved1_data["id"]

    # Save job 2 via POST /jobs/{id}/save
    save2 = client.post(
        f"{settings.API_V1_STR}/jobs/{job2_id}/save",
        headers=freelancer_headers,
    )
    assert save2.status_code == 200

    # Retrieve single saved job by saved record ID
    get_saved1 = client.get(f"{settings.API_V1_STR}/jobs/saved/{saved1_id}", headers=freelancer_headers)
    assert get_saved1.status_code == 200
    assert get_saved1.json()["job_post_id"] == job1_id

    # Retrieve single saved job by job post ID
    get_saved2 = client.get(f"{settings.API_V1_STR}/jobs/saved/{job2_id}", headers=freelancer_headers)
    assert get_saved2.status_code == 200
    assert get_saved2.json()["job_post_id"] == job2_id

    # Filter saved jobs by category
    cat_resp = client.get(
        f"{settings.API_V1_STR}/jobs/saved?category=Design%20%26%20Creative",
        headers=freelancer_headers,
    )
    assert cat_resp.status_code == 200
    assert cat_resp.json()["count"] == 1
    assert cat_resp.json()["data"][0]["job_post_id"] == job1_id

    # Filter saved jobs by search query
    q_resp = client.get(
        f"{settings.API_V1_STR}/jobs/saved?q=Marketing",
        headers=freelancer_headers,
    )
    assert q_resp.status_code == 200
    assert q_resp.json()["count"] == 1
    assert q_resp.json()["data"][0]["job_post_id"] == job2_id

    # Sort saved jobs by budget high
    sort_resp = client.get(
        f"{settings.API_V1_STR}/jobs/saved?sort_by=budget_high",
        headers=freelancer_headers,
    )
    assert sort_resp.status_code == 200
    assert sort_resp.json()["count"] == 2
    assert sort_resp.json()["data"][0]["job_post_id"] == job1_id  # 1200 > 800

    # Delete saved job 1 by saved_id
    del1 = client.delete(f"{settings.API_V1_STR}/jobs/saved/{saved1_id}", headers=freelancer_headers)
    assert del1.status_code == 200
    assert del1.json()["message"] == "Job post removed from saved"

    # Delete saved job 2 by job_post_id
    del2 = client.delete(f"{settings.API_V1_STR}/jobs/saved/{job2_id}", headers=freelancer_headers)
    assert del2.status_code == 200
    assert del2.json()["message"] == "Job post removed from saved"

    # Verify list is empty
    empty_resp = client.get(f"{settings.API_V1_STR}/jobs/saved", headers=freelancer_headers)
    assert empty_resp.json()["count"] == 0


def test_job_detail_has_draft_and_proposals_count(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)

    create_resp = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=client_headers,
        json={
            "title": "Fullstack Cloud Engineer",
            "description": "AWS and Docker setup",
            "budget_type": "fixed",
            "budget": 2500.0,
        },
    )
    job_id = create_resp.json()["id"]

    # Save job to bookmarks
    client.post(f"{settings.API_V1_STR}/jobs/{job_id}/save", headers=freelancer_headers)

    # Freelancer writes a draft
    draft = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id, "cover_letter": "Draft AWS notes", "status": "draft"},
    )
    draft_id = draft.json()["id"]

    # In detail: has_draft=True, has_applied=False, proposals_count=0
    detail1 = client.get(f"{settings.API_V1_STR}/jobs/{job_id}", headers=freelancer_headers)
    assert detail1.json()["has_draft"] is True
    assert detail1.json()["has_applied"] is False
    assert detail1.json()["proposals_count"] == 0

    # In saved jobs list: nested job has has_draft=True, has_applied=False, proposals_count=0
    saved_resp1 = client.get(f"{settings.API_V1_STR}/jobs/saved", headers=freelancer_headers)
    assert saved_resp1.json()["data"][0]["job_post"]["has_draft"] is True
    assert saved_resp1.json()["data"][0]["job_post"]["has_applied"] is False
    assert saved_resp1.json()["data"][0]["job_post"]["proposals_count"] == 0

    # Promote draft to pending
    client.put(
        f"{settings.API_V1_STR}/proposals/{draft_id}",
        headers=freelancer_headers,
        json={"status": "pending"},
    )

    # In detail: has_draft=False, has_applied=True, proposals_count=1
    detail2 = client.get(f"{settings.API_V1_STR}/jobs/{job_id}", headers=freelancer_headers)
    assert detail2.json()["has_draft"] is False
    assert detail2.json()["has_applied"] is True
    assert detail2.json()["proposals_count"] == 1

    # In saved jobs list: nested job has has_draft=False, has_applied=True, proposals_count=1
    saved_resp2 = client.get(f"{settings.API_V1_STR}/jobs/saved", headers=freelancer_headers)
    assert saved_resp2.json()["data"][0]["job_post"]["has_draft"] is False
    assert saved_resp2.json()["data"][0]["job_post"]["has_applied"] is True
    assert saved_resp2.json()["data"][0]["job_post"]["proposals_count"] == 1


