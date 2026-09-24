
# 📋 Proposal: Cloud Deployment & Automated CI/CD Pipeline
### Module Type: **IV.10 Module of Choice (Major — 2 Points)**
**Prepared by:** DevOps Team (Aysadeq & Osama)  
**Target Audience:** Project Manager & Development Team  

---

## 1. Executive Summary

We propose claiming **"Production Cloud Deployment on AWS with Automated CI/CD Pipeline"** as our **Major Module of Choice (2 Points)** under section `IV.10` of the `ft_transcendence` subject.

Rather than running the application exclusively on `localhost`, this module transitions the Freelancer platform into a live, production-grade cloud SaaS accessible on the public internet via a custom domain with automated SSL/TLS encryption and zero-touch continuous deployment.

---

## 2. Subject Justification (Mandatory for Section IV.10)

The 42 subject requires clear answers to 4 criteria in our `README.md` to accept a Module of Choice as a Major (2 points):

| Subject Criteria | Our Architectural Implementation |
| :--- | :--- |
| **1. Why did we choose this module?** | A real-world freelancer marketplace must be accessible over the internet to real users across various devices (mobile, desktop), not confined to an isolated `localhost` environment. |
| **2. What technical challenges does it address?** | - **Cloud Networking & Security**: AWS VPC, locked-down Security Groups (firewall allowing only 80, 443, and secured SSH).<br>- **Automated Delivery**: GitHub Actions CI/CD pipeline that tests and deploys code on `git push` with zero downtime.<br>- **Automated Cryptography**: Traefik integration with Let's Encrypt for automatic HTTPS certificate issuance and renewal.<br>- **Cloud Data Persistence**: AWS EBS persistent storage for PostgreSQL databases and monitoring metrics. |
| **3. How does it add value to the project?** | It drastically improves the developer experience (instant testing of PRs in production) and gives evaluators an unforgettable experience: they can interact with the live app on their phones during the evaluation. |
| **4. Why does it deserve Major (2 pts) status?** | It is not a trivial manual VPS launch. It integrates 4 production engineering disciplines: Cloud Infrastructure (AWS), Automation (CI/CD), Reverse Proxy Ingress (Traefik/Let's Encrypt), and Automated Disaster Recovery. |

---

## 3. How It Integrates with Our Existing DevOps Stack

This module creates a cohesive, professional 5-point DevOps ecosystem:

```
                      [GitHub Repository]
                               │  git push (merge to master)
                               ▼
               [GitHub Actions CI/CD Pipeline]
                - Automated Linter & Unit Tests
                - Secure SSH / Deploy Trigger
                               │
                               ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                      AWS EC2 Cloud                          │
 │                                                             │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │                 Traefik Reverse Proxy                 │  │
 │  │        (Public Ports 80 & 443 + Let's Encrypt)        │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              │                              │
 │        ┌─────────────────────┼─────────────────────┐        │
 │        ▼                     ▼                     ▼        │
 │   [Frontend /           [PostgreSQL &         [Prometheus & │
 │    FastAPI App]           Backups]              Grafana]    │
 │   (Freelancer Core)    (Minor - 1 pt)        (Major - 2 pts)│
 └─────────────────────────────────────────────────────────────┘
```

1. **Monitoring (Major — 2 pts)**: Prometheus and Grafana will monitor real-time traffic and server resource metrics on this live AWS instance.
2. **Backups & Disaster Recovery (Minor — 1 pt)**: Nightly database dumps will be scheduled and archived on persistent cloud storage.
3. **Cloud & CI/CD (Major of Choice — 2 pts)**: The cloud infrastructure that hosts the entire system.

---

## 4. Impact on Team & Developers

- **Zero Disruption to Frontend/Backend**: Zakaria, Amine, and Hossin will continue developing locally using `docker compose up`. The cloud deployment does not require any code changes to their features.
- **Faster Testing**: Whenever a feature is merged to `master`, it goes live on the test URL automatically within 2 minutes.

---