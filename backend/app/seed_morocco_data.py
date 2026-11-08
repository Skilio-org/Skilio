"""
Moroccan Seed Data Catalog for Skilio.
Contains 50 authentic Moroccan freelancers, 50 Moroccan client companies,
50 realistic job postings, and inter-entity client reviews.
All written in professional English with natural Moroccan context.
"""

from app.models import BudgetType, JobCategory

# Curated high-resolution Unsplash professional portrait headshot URLs partitioned by gender
MALE_AVATARS = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
]

FEMALE_AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1541823709867-1b206113eafd?auto=format&fit=crop&w=400&q=80",
]

AVATAR_POOL = MALE_AVATARS + FEMALE_AVATARS

MOROCCAN_FEMALE_FIRST_NAMES = {
    "fatima", "fatima-zahra", "salma", "kenza", "hiba", "sara", "zineb", "nouhaila",
    "meryem", "meriem", "asmaa", "soukaina", "imane", "ghita", "houda", "rania",
    "kaoutar", "chaimae", "lamia", "wissal", "nisrine", "safaa", "samira", "loubna",
    "manal", "aya", "nadia", "leila", "amina", "nawal", "mouna", "laila", "noura",
    "keltoum", "souad", "zoubida", "khadija", "asma", "chaima", "yousra", "ikram",
    "hanane", "bouchra", "siham", "karima", "mariam", "najat", "hasna", "latifa",
}


def detect_gender(name: str) -> str:
    """Accurately identify gender from Moroccan first names."""
    cleaned = name.strip()
    if cleaned.lower().startswith("dr. "):
        cleaned = cleaned[4:].strip()
    parts = cleaned.split()
    first_name = parts[0].lower() if parts else ""
    return "female" if first_name in MOROCCAN_FEMALE_FIRST_NAMES else "male"


def get_avatar(gender: str | int = "male", index: int = 0) -> str:
    """Return gender-matching professional portrait headshot URL."""
    if isinstance(gender, int):
        # Backwards compatibility if called as get_avatar(index)
        return MALE_AVATARS[gender % len(MALE_AVATARS)]
    if str(gender).lower() == "female":
        return FEMALE_AVATARS[index % len(FEMALE_AVATARS)]
    return MALE_AVATARS[index % len(MALE_AVATARS)]


FREELANCERS_DATA = [
    {
        "slug": "amine-elmansouri",
        "full_name": "Amine El Mansouri",
        "title": "Senior Full-Stack Engineer",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "hourly_rate": 85.0,
        "years_of_experience": 8,
        "location": "Casablanca, Morocco",
        "timezone": "GMT+1 · Casablanca",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "FastAPI", "Tailwind CSS"],
        "bio": (
            "Senior full-stack engineer with 8+ years building enterprise SaaS platforms, high-throughput APIs, "
            "and reactive dashboards. Passionate about clean architecture, test-driven development, and scalable databases. "
            "Experienced collaborating with distributed product teams across Morocco, France, and the UK."
        ),
        "experience": {
            "title": "Lead Full-Stack Architect",
            "organization": "Atlas FinTech Systems",
            "detail": "Architected multi-tenant B2B payment portal handling 250k daily transactions with Next.js and PostgreSQL.",
        },
        "education": {
            "institution": "1337 Coding School / UM6P",
            "degree": "Architect in Software Engineering",
            "field_of_study": "Distributed Computing & Network Systems",
            "start_date": "2016",
            "end_date": "2019",
            "description": "Project-based curriculum centered on Unix systems, low-level optimization, and microservice architectures.",
        },
        "portfolio": {
            "title": "Maghreb B2B Supply Chain Portal",
            "description": "Full-stack procurement platform with real-time inventory tracking, PDF invoicing, and multi-currency billing.",
            "organization": "Independent Project",
            "url": "https://github.com/amine-m/b2b-supply-portal",
        },
    },
    {
        "slug": "fatima-bennani",
        "full_name": "Fatima-Zahra Bennani",
        "title": "Lead UI/UX & Product Designer",
        "category": JobCategory.DESIGN_CREATIVE.value,
        "hourly_rate": 75.0,
        "years_of_experience": 7,
        "location": "Rabat, Morocco",
        "timezone": "GMT+1 · Rabat",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["UI/UX", "Figma", "Design Systems", "Product Design", "User Research", "Prototyping"],
        "bio": (
            "Product designer specializing in complex SaaS tools, mobile interfaces, and unified design systems. "
            "I transform intricate technical workflows into intuitive, human-centered digital experiences. "
            "I deliver pixel-perfect Figma specs ready for production engineering teams."
        ),
        "experience": {
            "title": "Head of Product Design",
            "organization": "Dar AI Solutions",
            "detail": "Created design language system and responsive web dashboards for enterprise generative AI suite.",
        },
        "education": {
            "institution": "National School of Applied Sciences (ENSA)",
            "degree": "Master in Interactive Media & Design",
            "field_of_study": "Human-Computer Interaction",
            "start_date": "2014",
            "end_date": "2019",
            "description": "Graduated with honors focusing on user research methodologies and accessibility standards (WCAG).",
        },
        "portfolio": {
            "title": "Telehealth Doctor-Patient Portal",
            "description": "Comprehensive design system with 140+ component variants, mobile booking flows, and EHR charts.",
            "organization": "HealthTech Client",
            "url": "https://figma.com/@fatimabennani/telehealth-system",
        },
    },
    {
        "slug": "karim-tazi",
        "full_name": "Karim Tazi",
        "title": "Cross-Platform Mobile Engineer",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "hourly_rate": 70.0,
        "years_of_experience": 6,
        "location": "Marrakech, Morocco",
        "timezone": "GMT+1 · Marrakech",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["Flutter", "React Native", "iOS", "Android", "Firebase", "REST APIs", "State Management"],
        "bio": (
            "Mobile developer crafting fast, native-feeling iOS and Android applications with Flutter and React Native. "
            "Specialized in offline-first sync, interactive map integrations, and seamless in-app payments. "
            "Over 12 published apps with 500k+ aggregate downloads on App Store & Google Play."
        ),
        "experience": {
            "title": "Senior Mobile Developer",
            "organization": "Oasis Mobility Labs",
            "detail": "Built real-time passenger booking and dispatch Flutter app for Marrakech private shuttle network.",
        },
        "education": {
            "institution": "Cadi Ayyad University",
            "degree": "B.Sc. in Computer Science",
            "field_of_study": "Software Engineering & Mobile Development",
            "start_date": "2015",
            "end_date": "2018",
            "description": "Core computer science studies with honors thesis in mobile location tracking algorithms.",
        },
        "portfolio": {
            "title": "Artisanal Courier Dispatch App",
            "description": "Offline-first Flutter mobile application with live GPS driver telemetry and multi-language support.",
            "organization": "Logistics Client",
            "url": "https://github.com/karim-tazi/courier-dispatch",
        },
    },
    {
        "slug": "youssef-berrada",
        "full_name": "Youssef Berrada",
        "title": "Backend & Distributed Systems Engineer",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "hourly_rate": 95.0,
        "years_of_experience": 9,
        "location": "Casablanca, Morocco",
        "timezone": "GMT+1 · Casablanca",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "20-30 hours/week",
        "skills": ["Python", "FastAPI", "Go", "PostgreSQL", "Redis", "Docker", "Microservices"],
        "bio": (
            "Backend engineer focusing on high-concurrency systems, asynchronous pipelines, and relational database optimization. "
            "Proven track record scaling Python/FastAPI and Go services under demanding traffic. "
            "Strong advocate for strict type safety, database connection pooling, and resilient background queues."
        ),
        "experience": {
            "title": "Staff Backend Engineer",
            "organization": "MaghrebPay Financial",
            "detail": "Engineered event-driven transaction ledger processing 1,200 req/sec with sub-50ms latency.",
        },
        "education": {
            "institution": "ENSEIRB-MATMECA / EMI Rabat",
            "degree": "M.Sc. Computer Networks & Systems",
            "field_of_study": "High Performance Computing",
            "start_date": "2013",
            "end_date": "2016",
            "description": "Advanced coursework in operating systems, concurrent programming, and distributed database consistency.",
        },
        "portfolio": {
            "title": "IoT Telemetry Stream Engine",
            "description": "FastAPI + Redis microservice ingestion pipeline consuming sensor data from 10,000 smart agriculture devices.",
            "organization": "AgriTech Project",
            "url": "https://github.com/youssef-berrada/telemetry-stream",
        },
    },
    {
        "slug": "salma-idrissi",
        "full_name": "Salma Idrissi",
        "title": "Frontend & Performance Engineer",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "hourly_rate": 65.0,
        "years_of_experience": 5,
        "location": "Tangier, Morocco",
        "timezone": "GMT+1 · Tangier",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["React", "Vue", "TypeScript", "Tailwind CSS", "Vite", "Web Performance", "State Management"],
        "bio": (
            "Frontend engineer obsessed with sub-second page loads, accessible UI components, and smooth animations. "
            "I build large-scale Single Page Applications (SPAs) and Server-Side Rendered (SSR) web applications. "
            "Deep expertise in React 18, TanStack Query, Zustand, and Tailwind CSS design architectures."
        ),
        "experience": {
            "title": "Senior Frontend Developer",
            "organization": "Tanjah Tech Hub",
            "detail": "Led migration of legacy PHP platform to React 18 & Vite, decreasing Core Web Vitals LCP by 68%.",
        },
        "education": {
            "institution": "Abdelmalek Essaâdi University",
            "degree": "B.Sc. in Software Development",
            "field_of_study": "Web Engineering",
            "start_date": "2017",
            "end_date": "2020",
            "description": "Specialized in clientside web performance, modern JavaScript standards, and browser rendering engines.",
        },
        "portfolio": {
            "title": "Maritime Shipping Analytics Dashboard",
            "description": "Real-time vessel scheduling dashboard with interactive deck.gl maps and virtualized data grids.",
            "organization": "Logistics Client",
            "url": "https://github.com/salma-idrissi/maritime-analytics",
        },
    },
    {
        "slug": "mehdi-alaoui",
        "full_name": "Mehdi Alaoui",
        "title": "AI & Machine Learning Solutions Engineer",
        "category": JobCategory.AI_AUTOMATIONS.value,
        "hourly_rate": 110.0,
        "years_of_experience": 7,
        "location": "Benguerir, Morocco",
        "timezone": "GMT+1 · Benguerir",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["Python", "PyTorch", "LangChain", "OpenAI API", "Vector Databases", "FastAPI", "NLP"],
        "bio": (
            "AI engineer building practical LLM agents, retrieval-augmented generation (RAG) pipelines, and computer vision systems. "
            "Experienced with vector search (pgvector, Qdrant), fine-tuning transformer models, and deploying low-latency AI inference endpoints."
        ),
        "experience": {
            "title": "Senior Machine Learning Engineer",
            "organization": "Mohammed VI Polytechnic University (UM6P)",
            "detail": "Researched and built RAG pipeline for Moroccan legal and regulatory document summarization.",
        },
        "education": {
            "institution": "UM6P / School of Computer Science",
            "degree": "Master of Science in Artificial Intelligence",
            "field_of_study": "Deep Learning & Applied NLP",
            "start_date": "2016",
            "end_date": "2019",
            "description": "Published research on multilingual representation models for North African dialects.",
        },
        "portfolio": {
            "title": "DocuQuery - Enterprise Multilingual RAG",
            "description": "Production retrieval assistant using FastAPI, pgvector, and hybrid lexical/semantic reranking.",
            "organization": "Enterprise AI Client",
            "url": "https://github.com/mehdi-alaoui/docuquery-rag",
        },
    },
    {
        "slug": "kenza-benkirane",
        "full_name": "Kenza Benkirane",
        "title": "Cloud & DevOps Architect",
        "category": JobCategory.ENGINEERING_ARCHITECTURE.value,
        "hourly_rate": 105.0,
        "years_of_experience": 8,
        "location": "Casablanca, Morocco",
        "timezone": "GMT+1 · Casablanca",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "20-30 hours/week",
        "skills": ["AWS", "Kubernetes", "Terraform", "Docker", "CI/CD", "Linux", "PostgreSQL"],
        "bio": (
            "DevOps architect helping fast-growing startups achieve bulletproof reliability, infrastructure-as-code, and zero-downtime releases. "
            "Certified AWS Solutions Architect Professional with deep expertise in Terraform, EKS Kubernetes clusters, and automated monitoring."
        ),
        "experience": {
            "title": "Principal Infrastructure Engineer",
            "organization": "CloudScale North Africa",
            "detail": "Automated multi-region AWS cloud setup with Terraform and GitHub Actions for 15+ microservices.",
        },
        "education": {
            "institution": "National School of Computer Science and Systems Analysis (ENSIAS)",
            "degree": "State Engineering Degree",
            "field_of_study": "Telecommunications & Cloud Networks",
            "start_date": "2013",
            "end_date": "2016",
            "description": "Graduated top of class in network security, virtualization, and distributed operating systems.",
        },
        "portfolio": {
            "title": "Terraform AWS Microservices Starter",
            "description": "Production Terraform module provisioning secure VPC, RDS Aurora Postgres, and EKS with Prometheus/Grafana.",
            "organization": "Open Source",
            "url": "https://github.com/kenza-b/terraform-aws-production-stack",
        },
    },
    {
        "slug": "omar-bouzid",
        "full_name": "Omar Bouzid",
        "title": "Data Engineer & Analytics Architect",
        "category": JobCategory.DATA_SCIENCE_ANALYTICS.value,
        "hourly_rate": 80.0,
        "years_of_experience": 6,
        "location": "Rabat, Morocco",
        "timezone": "GMT+1 · Rabat",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["SQL", "Python", "Data Analysis", "PostgreSQL", "dbt", "Snowflake", "ETL"],
        "bio": (
            "Data engineer designing clean data pipelines, dimensional modeling, and modern analytics stacks. "
            "I help companies break down operational silos and turn raw transactional logs into reliable reporting models."
        ),
        "experience": {
            "title": "Senior Data Pipeline Engineer",
            "organization": "Al Manar Analytics",
            "detail": "Built dbt + Snowflake data warehouse consolidating 4 e-commerce platforms into daily executive dashboards.",
        },
        "education": {
            "institution": "INPT Rabat",
            "degree": "Telecommunications & Data Engineering",
            "field_of_study": "Big Data & Business Intelligence",
            "start_date": "2015",
            "end_date": "2018",
            "description": "Focused on distributed storage engines, SQL query planning, and data pipeline orchestration.",
        },
        "portfolio": {
            "title": "Omnichannel Retail ETL Pipeline",
            "description": "Automated Airflow and dbt pipeline transforming millions of retail transactions into star-schema analytics.",
            "organization": "Retail Client",
            "url": "https://github.com/omar-bouzid/retail-dbt-pipeline",
        },
    },
    {
        "slug": "hiba-elfassi",
        "full_name": "Hiba El Fassi",
        "title": "Full-Stack React & FastAPI Developer",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "hourly_rate": 60.0,
        "years_of_experience": 4,
        "location": "Fes, Morocco",
        "timezone": "GMT+1 · Fes",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["React", "FastAPI", "Python", "TypeScript", "SQLModel", "PostgreSQL", "Tailwind CSS"],
        "bio": (
            "Pragmatic full-stack developer who loves building fast web products with the modern Python + React ecosystem. "
            "Experienced in RESTful API development, SQLModel/SQLAlchemy relations, React state management, and seamless UI styling with Tailwind."
        ),
        "experience": {
            "title": "Full-Stack Software Engineer",
            "organization": "Fes Digital Artisans",
            "detail": "Developed craft cooperative inventory management platform using FastAPI backend and React frontend.",
        },
        "education": {
            "institution": "Sidi Mohamed Ben Abdellah University",
            "degree": "B.Sc. in Software Engineering",
            "field_of_study": "Web & Mobile Applications",
            "start_date": "2018",
            "end_date": "2021",
            "description": "Rigorous foundation in relational database management, data structures, and web technologies.",
        },
        "portfolio": {
            "title": "Cooperative Inventory & Order SaaS",
            "description": "Production management tool with barcode generation, customer invoice printing, and real-time inventory counts.",
            "organization": "SMB Client",
            "url": "https://github.com/hiba-fassi/coop-inventory-saas",
        },
    },
    {
        "slug": "tarik-elamrani",
        "full_name": "Tarik El Amrani",
        "title": "Mobile iOS & Android Specialist",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "hourly_rate": 75.0,
        "years_of_experience": 7,
        "location": "Casablanca, Morocco",
        "timezone": "GMT+1 · Casablanca",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["Flutter", "Swift", "Kotlin", "React Native", "Firebase", "Mobile App UI", "REST APIs"],
        "bio": (
            "Mobile developer with 7 years crafting native iOS (Swift) and hybrid (Flutter) apps. "
            "Strong focus on battery-efficient background services, smooth 60fps animations, biometric authentication, and offline storage."
        ),
        "experience": {
            "title": "Lead Mobile Developer",
            "organization": "Saham Mobility Systems",
            "detail": "Led team of 4 engineers delivering urban transport payment app used by 180,000 monthly active users.",
        },
        "education": {
            "institution": "Hassan II University / FSAC",
            "degree": "Master in Computer Science & Networking",
            "field_of_study": "Mobile Systems & Security",
            "start_date": "2014",
            "end_date": "2017",
            "description": "Graduated with highest honors focusing on mobile operating system security and cryptographic storage.",
        },
        "portfolio": {
            "title": "Contactless Transit Card Top-Up App",
            "description": "NFC transit card reader and balance top-up app built with Flutter and Stripe/CMI payment gateways.",
            "organization": "Transit Client",
            "url": "https://github.com/tarik-amrani/nfc-transit-flutter",
        },
    },
    {
        "slug": "sara-kabbaj",
        "full_name": "Sara Kabbaj",
        "title": "Product Designer & Design Systems Specialist",
        "category": JobCategory.DESIGN_CREATIVE.value,
        "hourly_rate": 65.0,
        "years_of_experience": 5,
        "location": "Rabat, Morocco",
        "timezone": "GMT+1 · Rabat",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["Figma", "UI/UX", "Product Design", "Design Systems", "Prototyping", "Brand Strategy"],
        "bio": (
            "Strategic product designer bridge between business objectives, user delight, and engineering feasibility. "
            "Experienced structuring scalable Figma token systems, conducting user interviews, and designing accessible consumer web applications."
        ),
        "experience": {
            "title": "Senior UX/UI Designer",
            "organization": "Anfa HealthTech",
            "detail": "Redesigned medical appointment scheduling flow, resulting in a 42% decrease in abandoned patient bookings.",
        },
        "education": {
            "institution": "ArtCom' Sup School of Design",
            "degree": "Bachelor of Digital Design",
            "field_of_study": "Interactive Media & Visual UX",
            "start_date": "2016",
            "end_date": "2019",
            "description": "Comprehensive design studies covering typography, interface ergonomics, and interactive prototype testing.",
        },
        "portfolio": {
            "title": "PulsePay Mobile Wallet Interface",
            "description": "Complete UI/UX kit for digital wallet including QR peer-to-peer transfers, biometric approval, and transaction history.",
            "organization": "FinTech Startup",
            "url": "https://figma.com/@sarakabbaj/pulsepay-wallet",
        },
    },
    {
        "slug": "anass-zniber",
        "full_name": "Anass Zniber",
        "title": "Python Backend & API Specialist",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "hourly_rate": 70.0,
        "years_of_experience": 6,
        "location": "Agadir, Morocco",
        "timezone": "GMT+1 · Agadir",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs", "Redis", "SQL"],
        "bio": (
            "Backend software developer specializing in clean, maintainable Python backends using FastAPI and PostgreSQL. "
            "Experienced in asynchronous I/O, database indexing, background tasks with Celery/Redis, and containerized Docker deployments."
        ),
        "experience": {
            "title": "Backend Software Developer",
            "organization": "Souss AgriTech Solutions",
            "detail": "Developed irrigation control API with automated weather API integration and IoT device authentication.",
        },
        "education": {
            "institution": "Ibn Zohr University",
            "degree": "B.Sc. in Computer Science",
            "field_of_study": "Software Engineering",
            "start_date": "2015",
            "end_date": "2018",
            "description": "Graduated with honors in relational database architecture and server-side software programming.",
        },
        "portfolio": {
            "title": "Smart Farm Irrigation REST API",
            "description": "FastAPI service with Celery scheduling, PostgreSQL time-series logging, and OpenAPI documentation.",
            "organization": "AgriTech Client",
            "url": "https://github.com/anass-zniber/smart-irrigation-api",
        },
    },
    {
        "slug": "zineb-chaoui",
        "full_name": "Zineb Chaoui",
        "title": "Machine Learning & Computer Vision Engineer",
        "category": JobCategory.AI_AUTOMATIONS.value,
        "hourly_rate": 90.0,
        "years_of_experience": 5,
        "location": "Benguerir, Morocco",
        "timezone": "GMT+1 · Benguerir",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["Python", "PyTorch", "Computer Vision", "Docker", "FastAPI", "OpenCV", "AI Automation"],
        "bio": (
            "Applied computer vision and machine learning engineer. Experienced in object detection (YOLO), image segmentation, "
            "and deploying deep learning models on edge devices and GPU servers with ONNX Runtime and FastAPI."
        ),
        "experience": {
            "title": "Computer Vision Researcher",
            "organization": "Green Energy Park / UM6P",
            "detail": "Engineered drone image segmentation model for solar panel micro-crack detection with 94.2% precision.",
        },
        "education": {
            "institution": "Mohammed V University / EMI",
            "degree": "Engineering Degree in Artificial Intelligence",
            "field_of_study": "Computer Vision & Pattern Recognition",
            "start_date": "2016",
            "end_date": "2019",
            "description": "Rigorous thesis in convolutional neural network architectures for aerial imagery analysis.",
        },
        "portfolio": {
            "title": "Solar Surface Defect Detection Pipeline",
            "description": "Automated defect detector analyzing thermal drone video streams with sub-30ms inference times.",
            "organization": "Energy Client",
            "url": "https://github.com/zineb-chaoui/solar-cv-detector",
        },
    },
    {
        "slug": "walid-belkadi",
        "full_name": "Walid Belkadi",
        "title": "Senior React & Next.js Developer",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "hourly_rate": 80.0,
        "years_of_experience": 7,
        "location": "Casablanca, Morocco",
        "timezone": "GMT+1 · Casablanca",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux", "REST APIs", "Web Performance"],
        "bio": (
            "Senior React developer with 7 years building high-traffic web applications, customer portals, and internal operations tools. "
            "Expert in Next.js 14 App Router, server-side caching, bundle splitting, and building rock-solid TypeScript UI architectures."
        ),
        "experience": {
            "title": "Senior Frontend Engineer",
            "organization": "Habous PropTech",
            "detail": "Built interactive real estate virtual touring and lease signing web application in Next.js & Tailwind.",
        },
        "education": {
            "institution": "Hassan II University",
            "degree": "State Master in Information Systems",
            "field_of_study": "Software Architecture",
            "start_date": "2014",
            "end_date": "2017",
            "description": "Comprehensive curriculum in software engineering lifecycles and modern web programming.",
        },
        "portfolio": {
            "title": "PropTech Virtual Lease Agreement Portal",
            "description": "Interactive document signing application with PDF generation and bank-grade authentication flows.",
            "organization": "Real Estate Client",
            "url": "https://github.com/walid-belkadi/proptech-portal",
        },
    },
    {
        "slug": "nouhaila-naciri",
        "full_name": "Nouhaila Naciri",
        "title": "Full-Stack Web & E-Commerce Developer",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "hourly_rate": 60.0,
        "years_of_experience": 5,
        "location": "Marrakech, Morocco",
        "timezone": "GMT+1 · Marrakech",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now",
        "hours": "30+ hours/week",
        "skills": ["Shopify", "React", "Node.js", "E-Commerce", "Liquid", "PostgreSQL", "Tailwind CSS"],
        "bio": (
            "E-commerce engineer helping artisan cooperatives, luxury brands, and direct-to-consumer businesses scale online. "
            "Specialized in custom headless Shopify storefronts, multi-currency checkout, and ERP inventory integrations."
        ),
        "experience": {
            "title": "Lead E-Commerce Developer",
            "organization": "Majorelle Artisanal Export",
            "detail": "Built custom international storefront generating over $1.4M in export sales with Next.js and Shopify Storefront API.",
        },
        "education": {
            "institution": "Cadi Ayyad University",
            "degree": "Bachelor in Business Computing",
            "field_of_study": "E-Commerce Systems",
            "start_date": "2016",
            "end_date": "2019",
            "description": "Focus on payment gateway protocols, digital supply chains, and web store optimization.",
        },
        "portfolio": {
            "title": "Artisan Guild Headless Storefront",
            "description": "High-speed headless commerce portal with dynamic currency conversion and localized Arabic/English interfaces.",
            "organization": "Luxury Export Brand",
            "url": "https://github.com/nouhaila-n/artisan-storefront",
        },
    },
]

# Generate additional realistic Moroccan freelancers programmatically to reach 50
EXTRA_FREELANCERS_CONFIG = [
    ("Reda Senhaji", "Site Reliability & Kubernetes Engineer", JobCategory.ENGINEERING_ARCHITECTURE, 95, 8, "Casablanca", ["Kubernetes", "Docker", "AWS", "Terraform", "Linux", "CI/CD"]),
    ("Meryem Filali", "UI/UX Researcher & Interaction Designer", JobCategory.DESIGN_CREATIVE, 65, 5, "Tangier", ["UI/UX", "Figma", "User Research", "Prototyping", "Design Systems"]),
    ("Hamza Chraibi", "Senior Go & Microservices Engineer", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 90, 7, "Rabat", ["Go", "Docker", "PostgreSQL", "Microservices", "REST APIs", "Redis"]),
    ("Asmaa Tahiri", "Full-Stack TypeScript & Node.js Developer", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 70, 5, "Casablanca", ["TypeScript", "Node.js", "React", "PostgreSQL", "Tailwind CSS"]),
    ("Othmane Lahlou", "Cybersecurity & Penetration Testing Specialist", JobCategory.IT_NETWORKING, 115, 9, "Rabat", ["Linux", "Network Security", "Cloud Security", "Docker", "Python"]),
    ("Soukaina Amrani", "Data Scientist & Predictive Analytics Specialist", JobCategory.DATA_SCIENCE_ANALYTICS, 85, 6, "Casablanca", ["Python", "Data Analysis", "SQL", "Machine Learning", "FastAPI"]),
    ("Bilal Mansour", "Flutter & Native Android Developer", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 65, 5, "Meknes", ["Flutter", "Android", "Firebase", "REST APIs", "State Management"]),
    ("Imane Cherkaoui", "Frontend Vue & Nuxt.js Specialist", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 60, 4, "Marrakech", ["Vue", "TypeScript", "Tailwind CSS", "JavaScript", "HTML5"]),
    ("Zakaria Bennis", "DevOps & Terraform Cloud Engineer", JobCategory.ENGINEERING_ARCHITECTURE, 85, 6, "Casablanca", ["Terraform", "AWS", "Docker", "CI/CD", "Linux"]),
    ("Ghita Alami", "Brand & Visual Identity Designer", JobCategory.DESIGN_CREATIVE, 55, 4, "Tangier", ["Brand Design", "Figma", "Graphic Design", "Logo Design"]),
    ("Saad El Ouazzani", "Python & Django Full-Stack Engineer", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 75, 6, "Rabat", ["Python", "Django", "PostgreSQL", "Docker", "React", "REST APIs"]),
    ("Houda Mouline", "Bioinformatics & Health Data Analyst", JobCategory.DATA_SCIENCE_ANALYTICS, 80, 5, "Casablanca", ["Python", "Data Analysis", "SQL", "Pandas", "Healthcare IT"]),
    ("Nabil Zerouali", "Embedded Systems & IoT Solutions Engineer", JobCategory.ENGINEERING_ARCHITECTURE, 85, 7, "Kenitra", ["C++", "Python", "IoT", "Embedded Systems", "Linux", "MQTT"]),
    ("Rania Benjelloun", "Technical Writer & Developer Documentation Lead", JobCategory.WRITING, 55, 5, "Rabat", ["Technical Writing", "Content Strategy", "Developer Documentation", "OpenAPI"]),
    ("Ayoub Daoudi", "Full-Stack Web3 & Distributed Systems Engineer", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 95, 6, "Casablanca", ["Solidity", "TypeScript", "React", "Node.js", "PostgreSQL"]),
    ("Kaoutar Benchekroun", "Customer Success Operations & Technical Support", JobCategory.CUSTOMER_SERVICE, 45, 4, "Casablanca", ["Customer Support", "Process Design", "Zendesk", "Operations"]),
    ("Younes Haddad", "PostgreSQL & Database Performance Specialist", JobCategory.DATA_SCIENCE_ANALYTICS, 90, 8, "Rabat", ["PostgreSQL", "SQL", "Database Optimization", "Linux", "Performance Tuning"]),
    ("Chaimae Meziane", "Search & Information Retrieval Engineer", JobCategory.AI_AUTOMATIONS, 95, 6, "Tangier", ["Python", "Full-Text Search", "Elasticsearch", "FastAPI", "Vector Search"]),
    ("Adil Bouhaddou", "Full-Stack React Native & GraphQL Developer", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 75, 6, "Marrakech", ["React Native", "GraphQL", "TypeScript", "Node.js", "Firebase"]),
    ("Lamia Slaoui", "SEO & Technical Growth Marketer", JobCategory.SALES_MARKETING, 50, 4, "Casablanca", ["SEO", "Digital Marketing", "Analytics", "Conversion Optimization"]),
    ("Marouane Jabri", "Cloud Security & IAM Architect", JobCategory.IT_NETWORKING, 110, 8, "Rabat", ["Cloud Security", "AWS", "Zero Trust", "IAM", "Compliance"]),
    ("Wissal Chami", "Product UI & Mobile Experience Designer", JobCategory.DESIGN_CREATIVE, 60, 4, "Fes", ["Figma", "Mobile UI", "Prototyping", "UI/UX", "User Testing"]),
    ("Rachid Touhami", "Senior Java & Spring Boot Enterprise Developer", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 85, 9, "Casablanca", ["Java", "Spring Boot", "PostgreSQL", "Microservices", "Docker"]),
    ("Nisrine El Khatib", "FinTech & Payment Gateway Integration Specialist", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 80, 6, "Casablanca", ["Payment APIs", "FastAPI", "Python", "PostgreSQL", "Security"]),
    ("Taha Belhaj", "AI Automation & Workflow Engineer", JobCategory.AI_AUTOMATIONS, 85, 5, "Rabat", ["Python", "FastAPI", "AI Automation", "OpenAI API", "Zapier/n8n"]),
    ("Safaa El Mir", "E-Commerce Solutions & Shopify Architect", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 65, 5, "Marrakech", ["Shopify", "Liquid", "React", "E-Commerce", "Conversion Optimization"]),
    ("Ilyas Guennoun", "React & Next.js Frontend Architect", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 85, 7, "Casablanca", ["React", "Next.js", "TypeScript", "Tailwind CSS", "Architecture"]),
    ("Samira Bouanani", "Business Intelligence & PowerBI Consultant", JobCategory.DATA_SCIENCE_ANALYTICS, 70, 5, "Rabat", ["PowerBI", "SQL", "Data Modeling", "Business Intelligence", "Excel"]),
    ("Driss Kettani", "Systems Software & Linux Kernel Developer", JobCategory.ENGINEERING_ARCHITECTURE, 105, 10, "Oujda", ["C", "C++", "Linux", "Operating Systems", "Low-Level Optimization"]),
    ("Loubna Benmoussa", "Mobile Flutter & Dart Engineer", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 65, 4, "Agadir", ["Flutter", "Dart", "Firebase", "State Management", "Mobile UI"]),
    ("Badr El Mokri", "QA Automation & Performance Test Engineer", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 65, 5, "Casablanca", ["Playwright", "Cypress", "Python", "QA Automation", "CI/CD"]),
    ("Manal Essafi", "Digital Product & Webflow Developer", JobCategory.DESIGN_CREATIVE, 50, 3, "Tangier", ["Webflow", "HTML/CSS", "Figma", "UI Design", "Responsive Web"]),
    ("Fahd Regragui", "Microservices & Event-Driven Architecture Lead", JobCategory.WEB_MOBILE_SOFTWARE_DEV, 95, 8, "Casablanca", ["Kafka", "Python", "FastAPI", "Go", "Docker", "PostgreSQL"]),
    ("Aya Lahbabi", "Algorithmic Trading & Financial Modeling Developer", JobCategory.ACCOUNTING_CONSULTING, 90, 6, "Casablanca", ["Financial Modeling", "Python", "Quantitative Analysis", "Excel", "Forecasting"]),
    ("Hicham Znagui", "SRE & Observability Engineer", JobCategory.ENGINEERING_ARCHITECTURE, 90, 7, "Rabat", ["Prometheus", "Grafana", "Kubernetes", "Linux", "SRE", "Docker"]),
]

# Assemble complete 50 freelancers
for idx, (name, title, cat, rate, exp, city, skills) in enumerate(EXTRA_FREELANCERS_CONFIG, start=16):
    slug = name.lower().replace(" ", "-").replace("'", "")
    FREELANCERS_DATA.append({
        "slug": slug,
        "full_name": name,
        "gender": detect_gender(name),
        "title": title,
        "category": cat.value,
        "hourly_rate": float(rate),
        "years_of_experience": exp,
        "location": f"{city}, Morocco",
        "timezone": f"GMT+1 · {city}",
        "languages": "English (Fluent), French (Fluent), Arabic (Native)",
        "availability": "Available now" if idx % 4 != 0 else "Part-time (20h/wk)",
        "hours": "30+ hours/week" if idx % 4 != 0 else "20 hours/week",
        "skills": skills,
        "bio": (
            f"Dedicated {title} based in {city}, Morocco. With {exp} years of hands-on experience, "
            f"I help startups and enterprises ship reliable, production-ready systems using {', '.join(skills[:3])}. "
            f"Strong focus on pragmatic execution, rigorous testing, and clear cross-functional communication."
        ),
        "experience": {
            "title": f"Lead {title.split('&')[0].strip()}",
            "organization": f"Atlas {city} Tech Labs",
            "detail": "Delivered mission-critical applications and led technical implementation for enterprise projects across Morocco.",
        },
        "education": {
            "institution": "1337 Coding School / Moroccan Engineering School",
            "degree": "State Engineering Diploma",
            "field_of_study": "Computer Science & Information Technology",
            "start_date": str(2023 - exp - 3),
            "end_date": str(2023 - exp),
            "description": "Rigorous engineering curriculum in algorithms, systems design, and modern software development.",
        },
        "portfolio": {
            "title": f"{city} Enterprise Portal",
            "description": "Production web application serving enterprise clients with clean architecture and automated test suites.",
            "organization": "Client Engagement",
            "url": f"https://github.com/{slug}/enterprise-portal",
        },
    })


# 50 Authentic Moroccan Client Companies & Hiring Leads
CLIENTS_DATA = [
    {
        "slug": "atlas-fintech",
        "contact_name": "Tariq Bennani",
        "company": "Atlas FinTech Systems",
        "role": "VP of Engineering",
        "size": "51-200",
        "location": "Casablanca, Morocco",
        "website": "https://atlasfintech.ma",
        "description": "Leading North African payment gateway providing unified digital checkout, recurring billing, and open banking APIs.",
    },
    {
        "slug": "dar-ai",
        "contact_name": "Nadia El Fassi",
        "company": "Dar AI Solutions",
        "role": "Chief Technology Officer",
        "size": "11-50",
        "location": "Rabat, Morocco",
        "website": "https://dar-ai.ma",
        "description": "AI enterprise laboratory developing proprietary RAG knowledge engines and conversational automation for financial institutions.",
    },
    {
        "slug": "tanjah-logistics",
        "contact_name": "Rachid Belkacem",
        "company": "Tanjah Logistics Hub",
        "role": "Head of Digital Operations",
        "size": "51-200",
        "location": "Tangier, Morocco",
        "website": "https://tanjahlogistics.ma",
        "description": "Modern logistics dispatch platform coordinating freight traffic and customs clearance across the Mediterranean corridor.",
    },
    {
        "slug": "koutoubia-digital",
        "contact_name": "Zineb Berrada",
        "company": "Koutoubia Digital",
        "role": "Product Director",
        "size": "51-200",
        "location": "Casablanca, Morocco",
        "website": "https://koutoubiadigital.ma",
        "description": "Technology arm of Morocco's leading food distribution enterprise, digitizing B2B ordering and warehouse inventory.",
    },
    {
        "slug": "anfa-healthtech",
        "contact_name": "Dr. Hassan Cherif",
        "company": "Anfa HealthTech",
        "role": "Founder & Medical Director",
        "size": "11-50",
        "location": "Casablanca, Morocco",
        "website": "https://anfahealth.ma",
        "description": "Telehealth and clinical workflow platform connecting Moroccan physicians, laboratories, and patients in a secure portal.",
    },
    {
        "slug": "oasis-cloud",
        "contact_name": "Leila Mansouri",
        "company": "Oasis Cloud Systems",
        "role": "Managing Director",
        "size": "11-50",
        "location": "Marrakech, Morocco",
        "website": "https://oasiscloud.ma",
        "description": "Boutique hospitality management SaaS empowering luxury riads and boutique resorts with automated reservations and concierge.",
    },
    {
        "slug": "maghrebpay",
        "contact_name": "Mehdi Lahlou",
        "company": "MaghrebPay Financial",
        "role": "Head of Product",
        "size": "11-50",
        "location": "Casablanca, Morocco",
        "website": "https://maghrebpay.ma",
        "description": "Next-generation QR-code payment network and merchant settlement system certified by Bank Al-Maghrib standards.",
    },
    {
        "slug": "souss-agritech",
        "contact_name": "Brahim Idouz",
        "company": "Souss AgriTech Solutions",
        "role": "Chief Executive Officer",
        "size": "11-50",
        "location": "Agadir, Morocco",
        "website": "https://souss-agritech.ma",
        "description": "Smart agriculture pioneer deploying IoT sensors and drone computer vision for precision water conservation in Moroccan groves.",
    },
    {
        "slug": "saham-mobility",
        "contact_name": "Salma Tazi",
        "company": "Saham Mobility Systems",
        "role": "VP of Product",
        "size": "51-200",
        "location": "Casablanca, Morocco",
        "website": "https://sahammobility.ma",
        "description": "Smart urban transit operator developing contactless ticketing and real-time fleet telemetry across major Moroccan metros.",
    },
    {
        "slug": "menara-cyber",
        "contact_name": "Yassine Bouzid",
        "company": "Menara Cyber Labs",
        "role": "Principal Security Consultant",
        "size": "1-10",
        "location": "Rabat, Morocco",
        "website": "https://menaracyber.ma",
        "description": "High-end information security advisory providing penetration testing, cloud hardening, and compliance audits for enterprise clients.",
    },
]

# Generate remaining 40 clients programmatically to reach 50
EXTRA_CLIENTS_CONFIG = [
    ("Verve Maghreb", "Sara Alami", "Founder & CEO", "11-50", "Casablanca", "Direct-to-consumer sustainable apparel and lifestyle brand."),
    ("Al Manar Analytics", "Othmane Senhaji", "Head of Data", "11-50", "Rabat", "Retail analytics platform delivering foot-traffic insights for commercial shopping centers."),
    ("Atlas B2B SaaS", "Adil Kabbaj", "Director of Product", "51-200", "Casablanca", "Enterprise cloud inventory and ERP integration platform for Moroccan distributors."),
    ("Tamuda Maritime Tech", "Houda Zniber", "Chief Technology Officer", "11-50", "Tetouan", "Marina reservation and coastal vessel management platform."),
    ("Dakhla Wind & Solar", "Driss Belkadi", "VP of Operations", "51-200", "Dakhla", "Renewable energy consortium monitoring wind turbine performance and grid telemetry."),
    ("Chellah Media", "Kenza Filali", "Creative Director", "1-10", "Rabat", "Full-service digital agency crafting interactive brand experiences and web platforms."),
    ("Majorelle Commerce", "Hamza Naciri", "Head of Global Sales", "11-50", "Marrakech", "International export marketplace connecting traditional master craftsmen with global retail buyers."),
    ("MedEx Courier", "Amina Chraibi", "Operations Director", "51-200", "Casablanca", "On-demand healthcare courier and cold-chain medical transport network."),
    ("Habous PropTech", "Karim Benkirane", "Co-Founder & CTO", "11-50", "Casablanca", "Digital property management and residential tenant portal for Moroccan urban developments."),
    ("Al Akhawayn EdTech", "Nawal Idrissi", "Academic Dean of Technology", "51-200", "Ifrane", "Higher education digital learning management and student engagement platform."),
    ("Atlas Cloud Ops", "Younes Touhami", "Lead Systems Architect", "11-50", "Casablanca", "Managed cloud engineering firm automating Kubernetes clusters for financial clients."),
    ("Bouregreg Water Solutions", "Mouna El Amrani", "Chief Engineer", "51-200", "Rabat", "Smart municipal utility monitoring water reservoir capacity and leak detection."),
    ("Zaer Diagnostics", "Dr. Khalid Bennis", "Director of Research", "11-50", "Rabat", "Medical diagnostics laboratory deploying AI imaging algorithms for clinical screening."),
    ("Toubkal Outdoor Tech", "Rachid Daoudi", "Managing Partner", "1-10", "Marrakech", "Eco-tourism reservation and alpine expedition dispatch SaaS."),
    ("Rif Olive Oil Consortium", "Fatima Meziane", "Supply Chain Lead", "11-50", "Chefchaouen", "Agricultural cooperative tracking export batches from grove to European distribution."),
    ("Casablanca Event Engine", "Omar Kettani", "Product Manager", "11-50", "Casablanca", "Enterprise ticketing and badge printing platform for international business congresses."),
    ("Asilah Creative Lab", "Ghita Slaoui", "Art Director", "1-10", "Asilah", "Studio building custom Arabic typography and generative branding systems."),
    ("Kenitra AutoTech", "Nabil Mouline", "Quality Assurance Director", "201-500", "Kenitra", "Tier-1 automotive component manufacturer developing automated optical inspection software."),
    ("Ouarzazate Film SaaS", "Jalil El Mir", "Production Supervisor", "11-50", "Ouarzazate", "Location scouting and crew logistics software for international cinema productions."),
    ("Agadir Surf Logistics", "Tarik Essafi", "Founder", "1-10", "Taghazout", "Surf school booking, board rental tracking, and ocean tide forecast portal."),
    ("Fes Artisan Collective", "Laila Haddad", "Executive Director", "11-50", "Fes", "Cultural cooperative preserving historic brass, leather, and zellij craft heritage online."),
    ("Maghreb Talent Exchange", "Badr Jabri", "Managing Partner", "11-50", "Casablanca", "Specialized tech recruiting firm connecting vetted Moroccan software talent with European startups."),
    ("Essaouira Wind Sports", "Yassir Regragui", "Club Director", "1-10", "Essaouira", "Watersports booking system with wind weather station telemetry integrations."),
    ("Atlas Green Hydrogen", "Asmaa Guennoun", "Lead Chemical Engineer", "51-200", "Guelmim", "Clean hydrogen production monitoring and solar tracking facility."),
    ("Meknes Agronomy Labs", "Hicham Bouanani", "Head of Research", "11-50", "Meknes", "Viticulture soil analytics and microclimate sensor networks."),
    ("Rabat GovTech Solutions", "Samir Lahbabi", "Digital Transformation Lead", "51-200", "Rabat", "Consultancy modernizing public sector permit requests and digital citizen IDs."),
    ("Tanjah Offshore Hub", "Noura Znagui", "Site Director", "201-500", "Tangier", "European nearshore development center specializing in quality assurance and cloud services."),
    ("Casablanca Freight Connect", "Ibrahim Tahiri", "VP of Commercial", "51-200", "Casablanca", "Digital freight broker matching logistics shippers with vetted independent truck fleets."),
    ("Atlas Microfinance", "Keltoum Chami", "Managing Director", "51-200", "Casablanca", "Inclusive mobile lending institution supporting independent women cooperatives."),
    ("Marrakech Luxury Rentals", "Mohamed Berrada", "Operations Manager", "11-50", "Marrakech", "Concierge and guest operations software for exclusive private estates."),
    ("Dar Al Handasa Digital", "Anass Chaoui", "BIM Technology Director", "51-200", "Casablanca", "Engineering architecture consultancy implementing automated building information modeling."),
    ("Atlas Health Genomics", "Dr. Souad Kabbaj", "Chief Medical Officer", "11-50", "Rabat", "Preventative genetics and precision medicine diagnostic portal."),
    ("Maghreb Solar Fleet", "Faissal Naciri", "Asset Manager", "51-200", "Ouarzazate", "Solar farm maintenance scheduling and automated robotic cleaning dispatch software."),
    ("Zenata Smart City Platform", "Zoubida El Fassi", "Urban Systems Director", "51-200", "Mohammedia", "Municipal smart grid monitoring environmental air quality and street lighting efficiency."),
    ("Oujda Border Logistics", "Hassan Mansour", "Customs Broker Director", "11-50", "Oujda", "Automated trade documentation and cross-border commercial compliance app."),
    ("Dar El Beida SaaS", "Salim Idrissi", "Product Lead", "11-50", "Casablanca", "Accounting, VAT compliance, and payroll generation tool designed for Moroccan tax law."),
    ("Tamazight NLP Project", "Dr. Meriem Bennani", "Computational Linguistics Lead", "1-10", "Rabat", "Open research initiative developing speech-to-text models for indigenous North African languages."),
    ("Atlas Fleet Telematics", "Wassim Tazi", "Chief Technology Officer", "51-200", "Casablanca", "GPS fleet tracking and fuel economy hardware-software integration."),
    ("Marina Smir Boating", "Chrif Belkadi", "Harbormaster", "1-10", "M'diq", "Mediterranean dockage reservations and yacht maintenance concierge portal."),
    ("Sahara Solar Data", "Khadija Bouzid", "Senior SCADA Engineer", "51-200", "Laayoune", "Photovoltaic farm telemetry acquisition and degradation analytics platform."),
]

for name, contact, role, size, city, desc in EXTRA_CLIENTS_CONFIG:
    slug = name.lower().replace(" ", "-").replace("&", "and").replace("'", "")
    CLIENTS_DATA.append({
        "slug": slug,
        "contact_name": contact,
        "gender": detect_gender(contact),
        "company": name,
        "role": role,
        "size": size,
        "location": f"{city}, Morocco",
        "website": f"https://{slug.replace('-solutions', '').replace('-tech', '')}.ma",
        "description": desc,
    })

# Ensure 100% of freelancers and clients have explicit gender attributes
for f in FREELANCERS_DATA:
    if "gender" not in f:
        f["gender"] = detect_gender(f["full_name"])

for c in CLIENTS_DATA:
    if "gender" not in c:
        c["gender"] = detect_gender(c["contact_name"])


# 50 Detailed Moroccan Job Postings (1:1 with Clients)
JOBS_DATA = [
    {
        "title": "Senior React & Next.js Engineer for B2B Payment Gateway Portal",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "budget_type": BudgetType.FIXED,
        "budget": 7500.0,
        "location": "Casablanca, Morocco",
        "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "REST APIs"],
        "description": (
            "Atlas FinTech is rebuilding our primary merchant dashboard in Next.js 14 App Router and TypeScript. "
            "You will develop interactive payment analytics, recurring invoice managers, and webhook telemetry viewers. "
            "Requirements:\n"
            "- 5+ years of production experience in React, TypeScript, and modern state management.\n"
            "- Deep familiarity with REST APIs, WebSocket live streams, and accessible Tailwind UI components.\n"
            "- Proven experience writing automated unit tests and maintaining clean git workflows."
        ),
    },
    {
        "title": "FastAPI & pgvector Engineer to Build Enterprise RAG Assistant",
        "category": JobCategory.AI_AUTOMATIONS.value,
        "budget_type": BudgetType.HOURLY,
        "budget": 95.0,
        "location": "Rabat, Morocco",
        "skills": ["FastAPI", "Python", "OpenAI API", "Vector Search", "PostgreSQL"],
        "description": (
            "Dar AI Solutions is hiring a backend AI engineer to implement a secure RAG search pipeline. "
            "The system ingests Moroccan enterprise PDFs, chunks text, generates embeddings, and answers queries with citations.\n"
            "Key Deliverables:\n"
            "- Asynchronous ingestion worker using Celery and Redis.\n"
            "- Hybrid search combining PostgreSQL FTS and pgvector cosine distance.\n"
            "- High-performance streaming responses using Server-Sent Events (SSE) in FastAPI."
        ),
    },
    {
        "title": "Cross-Platform Flutter Developer for Port Freight Driver App",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "budget_type": BudgetType.FIXED,
        "budget": 6000.0,
        "location": "Tangier, Morocco",
        "skills": ["Flutter", "Dart", "Firebase", "Mobile UI", "REST APIs"],
        "description": (
            "Tanjah Logistics Hub needs a skilled Flutter engineer to build an offline-first mobile application for cargo truck drivers. "
            "The app reads container QR codes, updates shipping milestone statuses, and tracks turn-by-turn routing to port terminals.\n"
            "Deliverables:\n"
            "- Robust offline SQLite cache that syncs automatically when 4G network reconnects.\n"
            "- Multi-language interface in Arabic, French, and English.\n"
            "- Camera-based barcode and QR scanning integration."
        ),
    },
    {
        "title": "PostgreSQL & FastAPI Backend for Cold-Chain Food Distribution",
        "category": JobCategory.WEB_MOBILE_SOFTWARE_DEV.value,
        "budget_type": BudgetType.HOURLY,
        "budget": 85.0,
        "location": "Casablanca, Morocco",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "SQLModel"],
        "description": (
            "Koutoubia Digital is architecting a backend microservice to monitor temperature readings from 200 refrigerated trucks. "
            "We require clean SQLModel models, Alembic migrations, database partitioning, and real-time alerts when temperatures deviate.\n"
            "Experience with IoT ingestion, Docker containerization, and writing robust integration tests is required."
        ),
    },
    {
        "title": "Figma Product Designer for Telehealth Doctor Portal Redesign",
        "category": JobCategory.DESIGN_CREATIVE.value,
        "budget_type": BudgetType.FIXED,
        "budget": 4500.0,
        "location": "Casablanca, Morocco",
        "skills": ["Figma", "UI/UX", "Product Design", "Design Systems", "Prototyping"],
        "description": (
            "Anfa HealthTech is looking for an experienced product designer to redesign our clinician consultation interface. "
            "You will interview Moroccan physicians, streamline electronic prescription workflows, and deliver a comprehensive Figma design system.\n"
            "Deliverables:\n"
            "- 20+ desktop and tablet screens covering patient queue, video consultation, and medical history.\n"
            "- Reusable design token library with dark/light mode support."
        ),
    },
]

# Generate remaining 45 realistic jobs matching the client companies
EXTRA_JOBS_TEMPLATES = [
    ("Oasis Cloud Systems", "Luxury Hotel Booking Engine & Property Dashboard", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 5200.0, "Marrakech", ["React", "FastAPI", "PostgreSQL", "Tailwind CSS"], "Build high-end guest reservation and room booking software for boutique riads in Marrakech."),
    ("MaghrebPay Financial", "QR-Code Payment Settlement Microservice in Go", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.HOURLY, 90.0, "Casablanca", ["Go", "PostgreSQL", "Docker", "Microservices", "Security"], "Design ultra-low latency transaction clearing service with cryptographic merchant verification."),
    ("Souss AgriTech Solutions", "Computer Vision Defect Detection on Citrus Harvest", JobCategory.AI_AUTOMATIONS, BudgetType.FIXED, 8000.0, "Agadir", ["Python", "Computer Vision", "PyTorch", "Docker"], "Train and deploy deep learning model inspecting citrus fruit conveyor belts in Agadir packaging facilities."),
    ("Saham Mobility Systems", "Transit NFC Card Top-Up Flutter Mobile App", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 6500.0, "Casablanca", ["Flutter", "Dart", "Payment APIs", "Mobile UI"], "Develop native mobile interface enabling passengers to read and top-up transit cards using phone NFC."),
    ("Menara Cyber Labs", "Cloud Security Infrastructure Audit & Pentest", JobCategory.IT_NETWORKING, BudgetType.FIXED, 4800.0, "Rabat", ["Cloud Security", "AWS", "Linux", "Network Security"], "Perform vulnerability assessment, IAM permission hardening, and security audit for SaaS production cluster."),
    ("Verve Maghreb", "Headless Shopify Next.js Storefront for Fashion Brand", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 5500.0, "Casablanca", ["Next.js", "React", "Shopify", "Tailwind CSS"], "Develop fast headless e-commerce store with dynamic sizing guides, lookbook video player, and multi-currency checkout."),
    ("Al Manar Analytics", "Retail Foot-Traffic Analytics Pipeline & Dashboard", JobCategory.DATA_SCIENCE_ANALYTICS, BudgetType.HOURLY, 80.0, "Rabat", ["Python", "SQL", "Data Analysis", "dbt", "PostgreSQL"], "Aggregate WiFi probe and camera occupancy data to generate hourly retail mall performance metrics."),
    ("Atlas B2B SaaS", "ERP Synchronization Middleware & Background Sync", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.HOURLY, 85.0, "Casablanca", ["Python", "FastAPI", "SQL", "Redis", "Docker"], "Build reliable bi-directional connector between Sage/SAP accounting systems and modern cloud warehouse inventory."),
    ("Tamuda Maritime Tech", "Marina Dockage & Berth Reservation Portal", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 4200.0, "Tetouan", ["React", "TypeScript", "FastAPI", "PostgreSQL"], "Create visual dock slip management interface allowing Mediterranean yacht captains to reserve mooring slips."),
    ("Dakhla Wind & Solar", "SCADA Telemetry Time-Series Ingestion & Monitoring", JobCategory.ENGINEERING_ARCHITECTURE, BudgetType.HOURLY, 100.0, "Dakhla", ["Python", "Docker", "PostgreSQL", "TimescaleDB", "Linux"], "Ingest 1-second interval turbine rotation and wind speed metrics for desert wind energy facility."),
    ("Chellah Media", "Interactive 3D WebGL Brand Experience", JobCategory.DESIGN_CREATIVE, BudgetType.FIXED, 3800.0, "Rabat", ["Three.js", "React", "WebGL", "Figma", "HTML5"], "Build immersive web experience showcasing Moroccan cultural architecture with interactive 3D zellij patterns."),
    ("Majorelle Commerce", "Artisan Cooperatives Onboarding & Catalog App", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 5000.0, "Marrakech", ["React Native", "Firebase", "Mobile UI", "REST APIs"], "Mobile cataloging tool allowing rural cooperative weavers to photograph, catalog, and price handmade rugs."),
    ("MedEx Courier", "Real-Time Driver Dispatch Engine with WebSockets", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.HOURLY, 80.0, "Casablanca", ["Node.js", "TypeScript", "WebSocket", "Redis", "PostgreSQL"], "Build live dispatch server matching incoming medical lab pick-ups with nearest available couriers in Casablanca."),
    ("Habous PropTech", "Tenant Lease Agreement & Biometric Verification Portal", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 5800.0, "Casablanca", ["React", "FastAPI", "Security", "PostgreSQL", "Tailwind CSS"], "Create secure web workflow for digital lease generation, national ID verification, and monthly rent debiting."),
    ("Al Akhawayn EdTech", "Hybrid University Classroom Video & Quiz Platform", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 7200.0, "Ifrane", ["React", "Python", "FastAPI", "WebRTC", "PostgreSQL"], "Build interactive lecture companion web application with real-time student poll feedback and slide synchronization."),
    ("Atlas Cloud Ops", "Kubernetes Multi-Region AWS Architecture with Terraform", JobCategory.ENGINEERING_ARCHITECTURE, BudgetType.HOURLY, 110.0, "Casablanca", ["Terraform", "AWS", "Kubernetes", "CI/CD", "Linux"], "Provision fault-tolerant AWS EKS architecture spanning Europe and North Africa with automated failover."),
    ("Bouregreg Water Solutions", "Smart Water Meter Telemetry & Anomaly Detection", JobCategory.DATA_SCIENCE_ANALYTICS, BudgetType.FIXED, 6400.0, "Rabat", ["Python", "Data Analysis", "SQL", "FastAPI", "Machine Learning"], "Detect municipal pipeline water leaks by analyzing sensor flow fluctuations with statistical anomaly detection."),
    ("Zaer Diagnostics", "Radiology Image Annotation Web Tool for Clinic", JobCategory.AI_AUTOMATIONS, BudgetType.FIXED, 7000.0, "Rabat", ["React", "Python", "Computer Vision", "FastAPI", "Healthcare IT"], "Develop DICOM medical image viewer with interactive lesion polygon labeling for oncology studies."),
    ("Toubkal Outdoor Tech", "Atlas Mountain Trekking GPS Route Booking SaaS", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 3900.0, "Marrakech", ["Flutter", "Firebase", "Mobile UI", "REST APIs"], "Build tourist booking and safety tracking application for mountain trekking guides in the High Atlas."),
    ("Rif Olive Oil Consortium", "Farm-to-Bottle QR Batch Verification Portal", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 3500.0, "Chefchaouen", ["React", "Next.js", "PostgreSQL", "Tailwind CSS"], "Create consumer-facing provenance page verifying laboratory acidity tests and olive harvest dates from QR codes."),
    ("Casablanca Event Engine", "High-Throughput Conference Badge Printing Desktop & Web", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 4000.0, "Casablanca", ["Electron", "React", "TypeScript", "SQLite"], "Build fast desktop application communicating directly with Zebra thermal label printers for instant badge check-in."),
    ("Asilah Creative Lab", "Arabic Calligraphy & Typography Figma Design Plugin", JobCategory.DESIGN_CREATIVE, BudgetType.FIXED, 3200.0, "Asilah", ["TypeScript", "Figma", "UI Design", "JavaScript"], "Develop official Figma plugin generating traditional Maghrebi and Kufic script layouts automatically."),
    ("Kenitra AutoTech", "Factory Defect Tracking & Assembly Line Tablet App", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 4600.0, "Kenitra", ["Vue", "TypeScript", "FastAPI", "PostgreSQL"], "Tablet interface deployed on assembly lines allowing quality inspectors to log automotive component deviations."),
    ("Ouarzazate Film SaaS", "Film Production Location Scouting & Crew Scheduling", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.HOURLY, 70.0, "Ouarzazate", ["React", "Node.js", "PostgreSQL", "Google Maps API"], "Build crew call-sheet scheduling tool and searchable desert landscape location directory for international film crews."),
    ("Agadir Surf Logistics", "Equipment Inventory & Surf Lesson Booking App", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 3400.0, "Taghazout", ["React", "Tailwind CSS", "FastAPI", "PostgreSQL"], "Web management system tracking wetsuit/board rentals, instructor lesson calendars, and guest balances."),
    ("Fes Artisan Collective", "E-Commerce Catalog & Artisan Storytelling Platform", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 4100.0, "Fes", ["Next.js", "React", "Tailwind CSS", "Shopify"], "High-aesthetic digital magazine and online boutique highlighting traditional zellij tile makers and leather tanners."),
    ("Maghreb Talent Exchange", "Technical Candidate Assessment & Coding Sandbox", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 5800.0, "Casablanca", ["React", "Docker", "Python", "FastAPI", "Monaco Editor"], "In-browser live coding interview platform executing Python and JavaScript snippets securely inside Docker sandboxes."),
    ("Essaouira Wind Sports", "Wind Weather Station Live Dashboard & Booking System", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 3600.0, "Essaouira", ["React", "WebSocket", "FastAPI", "Tailwind CSS"], "Live wind speed and wave height telemetry display integrated with kitesurfing lesson checkout."),
    ("Atlas Green Hydrogen", "SCADA Sensor Ingestion & Electrolyzer Telemetry Pipeline", JobCategory.ENGINEERING_ARCHITECTURE, BudgetType.HOURLY, 105.0, "Guelmim", ["Python", "FastAPI", "PostgreSQL", "Docker", "TimescaleDB"], "Build telemetry bridge logging voltage, hydrogen purity, and solar output metrics from desert electrolysis plant."),
    ("Meknes Agronomy Labs", "Soil Moisture & Microclimate Predictive Dashboard", JobCategory.DATA_SCIENCE_ANALYTICS, BudgetType.FIXED, 4900.0, "Meknes", ["Python", "SQL", "Data Analysis", "FastAPI", "React"], "Analyze soil electrical conductivity and temperature sensor logs to optimize vineyard irrigation cycles."),
    ("Rabat GovTech Solutions", "Municipal Commercial Permit Digital Application Portal", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 6200.0, "Rabat", ["React", "FastAPI", "PostgreSQL", "Document Management"], "Streamline city commercial license submission, document attachment review, and inspector status tracking."),
    ("Tanjah Offshore Hub", "End-to-End Test Automation Suite with Playwright", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.HOURLY, 75.0, "Tangier", ["Playwright", "TypeScript", "CI/CD", "QA Automation"], "Implement regression testing framework covering 200+ user journeys for client fintech application."),
    ("Casablanca Freight Connect", "Digital Freight Exchange & Carrier Bidding Portal", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 7400.0, "Casablanca", ["React", "Next.js", "PostgreSQL", "Tailwind CSS"], "Shippers post container loads and transport carriers submit instant competitive freight bids."),
    ("Atlas Microfinance", "Artisan Cooperative Micro-Lending Mobile App", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 6800.0, "Casablanca", ["Flutter", "Dart", "Payment APIs", "Security"], "Simple mobile loan request and weekly repayment tracking tool for rural weavers and pottery cooperatives."),
    ("Marrakech Luxury Rentals", "Guest Concierge Digital Guidebook & Room Service Web App", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 3700.0, "Marrakech", ["React", "TypeScript", "Tailwind CSS", "Firebase"], "Mobile web companion for villa guests ordering private chef catering, excursion tours, and spa treatments."),
    ("Dar Al Handasa Digital", "BIM 3D Architectural Viewer in Three.js", JobCategory.ENGINEERING_ARCHITECTURE, BudgetType.FIXED, 5300.0, "Casablanca", ["Three.js", "WebGL", "TypeScript", "React"], "In-browser IFC / BIM model rendering component allowing architects to view structural building cross-sections."),
    ("Atlas Health Genomics", "Physician Genetic Marker Visualization Dashboard", JobCategory.DATA_SCIENCE_ANALYTICS, BudgetType.HOURLY, 90.0, "Rabat", ["React", "Python", "FastAPI", "Data Analysis", "Healthcare IT"], "Interactive DNA variant frequency charts and automated clinical risk report generation for geneticists."),
    ("Maghreb Solar Fleet", "Solar Panel Drone Thermal Inspection Report Generator", JobCategory.AI_AUTOMATIONS, BudgetType.FIXED, 6100.0, "Ouarzazate", ["Python", "FastAPI", "Computer Vision", "PostgreSQL"], "Process drone thermal scans to automatically generate repair work orders for cracked photovoltaic cells."),
    ("Zenata Smart City Platform", "Air Quality & Ambient Noise IoT Monitoring Platform", JobCategory.ENGINEERING_ARCHITECTURE, BudgetType.FIXED, 4700.0, "Mohammedia", ["Python", "FastAPI", "PostgreSQL", "React", "Grafana"], "City-wide environmental dashboard showing particulate matter (PM2.5) sensor readings across residential eco-neighborhoods."),
    ("Oujda Border Logistics", "Cross-Border Customs Manifest Verification Portal", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 4500.0, "Oujda", ["React", "TypeScript", "FastAPI", "PostgreSQL"], "Customs declaration workflow matching commercial invoices with truck manifest weights."),
    ("Dar El Beida SaaS", "Moroccan Corporate Tax & VAT Monthly Filing Tool", JobCategory.ACCOUNTING_CONSULTING, BudgetType.FIXED, 5600.0, "Casablanca", ["React", "FastAPI", "PostgreSQL", "Financial Modeling"], "SaaS tax computation utility calculating Moroccan corporate income tax (IS) and monthly VAT deductibles."),
    ("Tamazight NLP Project", "Dialectal Speech-to-Text Audio Labeling Interface", JobCategory.AI_AUTOMATIONS, BudgetType.FIXED, 4300.0, "Rabat", ["React", "Python", "FastAPI", "Web Audio API", "NLP"], "Audio transcription interface with waveform scrubbers and phonetic validation for Moroccan language researchers."),
    ("Atlas Fleet Telematics", "GPS Vehicle Tracker Telemetry Engine & Geofencing", JobCategory.ENGINEERING_ARCHITECTURE, BudgetType.HOURLY, 85.0, "Casablanca", ["Go", "PostgreSQL", "Redis", "Docker", "IoT"], "Real-time fleet tracking daemon receiving TCP socket packets from OBD-II vehicle trackers."),
    ("Marina Smir Boating", "Yacht Maintenance Work Order & Parts Inventory SaaS", JobCategory.WEB_MOBILE_SOFTWARE_DEV, BudgetType.FIXED, 3900.0, "M'diq", ["React", "FastAPI", "PostgreSQL", "Tailwind CSS"], "Harbor technicians log engine overhaul work orders, track spare parts stock, and bill boat owners."),
    ("Sahara Solar Data", "Photovoltaic Panel Dust Accumulation & Cleaning Dispatch", JobCategory.DATA_SCIENCE_ANALYTICS, BudgetType.FIXED, 5000.0, "Laayoune", ["Python", "FastAPI", "PostgreSQL", "Data Analysis"], "Estimate power generation loss due to Saharan sand accumulation to optimize robotic washing schedules."),
]

for _client_company, title, cat, b_type, budget, city, skills, desc in EXTRA_JOBS_TEMPLATES:
    JOBS_DATA.append({
        "title": title,
        "category": cat.value,
        "budget_type": b_type,
        "budget": budget,
        "location": f"{city}, Morocco",
        "skills": skills,
        "description": desc,
    })


# 65 Realistic Inter-Entity Client Reviews
REVIEWS_TEMPLATES = [
    (0, 0, 5, "Amine rebuilt our core merchant payment portal ahead of schedule. The Next.js 14 architecture is blazing fast, cleanly structured, and our engineering team adopted the codebase effortlessly. Exceptional engineer."),
    (1, 1, 5, "Fatima-Zahra designed a comprehensive design system for our AI suite. The Figma tokens and responsive desktop layouts made frontend handoff seamless. Her attention to typography and UX detail is world-class."),
    (2, 2, 5, "Karim delivered our freight driver mobile app with Flutter. The offline SQLite sync works flawlessly even in remote transit areas with spotty 4G. Reliable, punctual, and highly skilled."),
    (3, 3, 5, "Youssef solved a major database query bottleneck in our transaction ledger. His PostgreSQL indexing and connection pooling optimizations dropped latency by 65%. Highly recommended for distributed systems."),
    (4, 4, 5, "Salma revamped our shipping analytics dashboard. The React components load instantly and the interactive vessel tracking map runs at a solid 60fps. Outstanding frontend specialist."),
    (5, 5, 5, "Mehdi implemented our RAG search pipeline with FastAPI and pgvector. The hybrid search relevance exceeded our expectations and his code was clean and thoroughly tested."),
    (6, 6, 5, "Kenza orchestrated our entire AWS cloud migration with Terraform. The EKS clusters and automated CI/CD pipelines cut our deployment times from 40 minutes to under 5 minutes."),
    (7, 7, 5, "Omar consolidated 4 separate retail data sources into an automated dbt pipeline. Our executive team now has clean daily reporting without manual spreadsheets. Super communicative and precise."),
    (8, 8, 4, "Hiba built our cooperative inventory platform with FastAPI and React. Very clean code and great responsiveness. Delivered all milestones on time and helped our staff learn the interface."),
    (9, 9, 5, "Tarik's mobile development expertise was instrumental in our transit card top-up launch. The NFC reader integration is robust and users love the smooth user experience."),
    (10, 10, 5, "Sara redesigned our clinic booking flow in Figma. Abandoned appointments dropped noticeably within two weeks of launch. Great eye for user accessibility and ergonomics."),
    (11, 11, 5, "Anass built our smart farm irrigation backend in FastAPI. Clean REST architecture, great documentation with Swagger, and rock-solid Celery task scheduling."),
    (12, 12, 5, "Zineb trained an outstanding computer vision model for solar panel surface defect detection. The accuracy on real-world drone imagery was remarkable."),
    (13, 13, 5, "Walid delivered our tenant lease portal with Next.js and Tailwind. The digital signature flow is intuitive and our clients frequently compliment the clean aesthetic."),
    (14, 14, 5, "Nouhaila built our headless Shopify storefront with craftsmanship and care. Our international export conversion rate increased by 38% post-launch. Would definitely hire again."),
    (15, 15, 5, "Reda automated our Kubernetes cluster deployment and monitoring with Grafana. Zero downtime releases have finally become reality for our engineering team."),
    (16, 16, 4, "Meryem conducted thorough user interviews and delivered clear UX wireframes that pinpointed several friction points in our maritime portal."),
    (17, 17, 5, "Hamza engineered our microservices in Go. Handled high-throughput socket connections with minimal memory footprint. Top-tier backend talent."),
    (18, 18, 5, "Asmaa built our TypeScript API middleware with great precision. Thorough test coverage and excellent communication throughout the sprint."),
    (19, 19, 5, "Othmane conducted a comprehensive penetration test on our financial platform. His report identified subtle authorization vulnerabilities that we fixed immediately."),
    (20, 20, 5, "Soukaina created an accurate predictive customer churn model in Python. The insights gave our marketing team clear actionable cohorts."),
    (21, 21, 4, "Bilal built our Android courier app with Flutter. Smooth map animations, fast barcode scanning, and great work ethic."),
    (22, 22, 5, "Imane crafted our luxury boutique booking frontend in Nuxt.js. Fast page transitions, elegant styling, and mobile responsiveness."),
    (23, 23, 5, "Zakaria structured our cloud infrastructure with Terraform. Clean reusable modules and clear documentation."),
    (24, 24, 5, "Ghita created a beautiful, culturally authentic visual brand identity and typography guide for our artisan cooperative."),
    (25, 25, 5, "Saad built our Django portal with clean models and efficient database queries. A very dependable software developer."),
    (26, 26, 5, "Houda analyzed our clinical trial datasets with great mathematical precision. Clean Jupyter notebooks and insightful visualizations."),
    (27, 27, 5, "Nabil designed an efficient C++ embedded gateway for our sensor nodes. Extremely low power consumption and reliable MQTT transmission."),
    (28, 28, 5, "Rania authored clear, comprehensive developer documentation for our public APIs. Reduced our developer onboarding time significantly."),
    (29, 29, 5, "Ayoub implemented our smart contracts and frontend integration with high security standards. Thoroughly audited and verified."),
    (30, 30, 4, "Kaoutar audited our customer support operations and restructured our Zendesk workflows. Response times dropped by 45%."),
    (31, 31, 5, "Younes tuned our PostgreSQL database configuration and resolved recurring deadlock issues. True database expert."),
    (32, 32, 5, "Chaimae implemented our full-text search engine with role synonyms and trigram matching. Search relevance improved dramatically."),
    (33, 33, 5, "Adil developed our React Native mobile application with clean state management and responsive styling."),
    (34, 34, 5, "Lamia optimized our technical SEO, structured metadata, and Core Web Vitals. Organic search impressions doubled over three months."),
    (35, 35, 5, "Marouane audited our AWS IAM roles and implemented least-privilege policies across all cloud environments."),
    (36, 36, 4, "Wissal designed an intuitive mobile interface for our booking app. Clear prototyping and developer-friendly Figma specs."),
    (37, 37, 5, "Rachid delivered our enterprise Spring Boot service on schedule. Solid design patterns and seamless PostgreSQL integration."),
    (38, 38, 5, "Nisrine integrated our payment gateway with Moroccan banking APIs. Handled edge cases and webhooks flawlessly."),
    (39, 39, 5, "Taha automated our invoice processing and CRM synchronization using Python workers. Saved our operations team 15 hours every week."),
    (40, 40, 5, "Safaa customized our Shopify storefront with clean Liquid code and optimized mobile checkout. Very pleasant collaboration."),
    (41, 41, 5, "Ilyas architected our Next.js web application with modular components and excellent TypeScript types."),
    (42, 42, 5, "Samira built our executive PowerBI dashboard. Transformed complex multi-company accounting data into intuitive charts."),
    (43, 43, 5, "Driss optimized our Linux kernel drivers for low-latency network packet capture. Deep low-level knowledge."),
    (44, 44, 5, "Loubna built our Flutter mobile app with clean riverpod state management. Delivered ahead of deadline."),
    (45, 45, 5, "Badr authored comprehensive Playwright test suites that catch regressions before production deployments. Essential quality partner."),
    (46, 46, 4, "Manal delivered a modern Webflow landing page with smooth micro-interactions. Pixel-perfect translation of our Figma designs."),
    (47, 47, 5, "Fahd structured our event-driven Kafka architecture. Scalable, resilient, and well documented."),
    (48, 48, 5, "Aya built our financial forecasting model in Python and Excel. Clear scenario toggles and accurate cash-flow projections."),
    (49, 49, 5, "Hicham configured our Prometheus and Grafana alerts. We now catch memory leaks and high latency spikes before users notice."),
    # Additional cross-reviews from clients to other freelancers
    (0, 3, 5, "Youssef collaborated with our team on backend performance. Highly capable and collaborative."),
    (1, 0, 5, "Amine developed our generative AI web dashboard interface. Very clean React and TypeScript code."),
    (2, 4, 5, "Salma built the dispatch tracking web portal to accompany our driver mobile app. Flawless work."),
    (3, 1, 5, "Fatima-Zahra designed the warehouse inventory iPad interface. Warehouse staff learned it in minutes."),
    (4, 9, 5, "Tarik built our iOS patient app with Swift. Biometric FaceID login and push reminders work smoothly."),
    (5, 2, 5, "Karim developed our concierge tablet app for villa check-ins. Guests love the modern UI."),
    (6, 13, 5, "Walid built our merchant onboarding portal with Next.js. Fast and reliable."),
    (7, 11, 5, "Anass assisted in building the backend telemetry API for our sensor arrays. Great job."),
    (8, 7, 5, "Omar organized our transit card usage analytics into a clean reporting model."),
    (9, 6, 5, "Kenza audited our cloud infrastructure before our national launch. Invaluable security advice."),
    (10, 8, 4, "Hiba developed our client appointment scheduling widget. Clean integration into our website."),
    (11, 5, 5, "Mehdi helped us design the agronomy recommendation model using transformer architectures."),
    (12, 14, 5, "Nouhaila built our partner showcase portal. Clean Tailwind CSS and responsive design."),
    (13, 10, 5, "Sara designed the wireframes for our agricultural analytics dashboard. Very thorough."),
    (14, 12, 5, "Zineb helped calibrate our drone imaging defect detector. High precision and fast turnaround."),
]
