# Concert POC — Punjab & Sind Bank (PSB)

## Overview

This repository contains the Proof of Concept (POC) for implementing **IBM Concert** at **Punjab & Sind Bank (PSB)**. The goal of this POC is to demonstrate how Concert can provide end-to-end observability, application risk management, and operational intelligence across PSB's application portfolio.

IBM Concert is an AI-powered application management platform that consolidates data from disparate tools and systems to give teams a unified view of application health, vulnerabilities, compliance posture, and operational risk.

---

## Objectives

- Demonstrate Concert's ability to ingest and correlate data from PSB's existing toolchain
- Provide a unified, prioritised view of application risk across PSB's critical banking applications
- Showcase AI-driven insights for vulnerability remediation and compliance tracking
- Validate integration capabilities with PSB's CI/CD pipelines, security scanners, and monitoring tools
- Enable stakeholders to evaluate Concert as a strategic platform for application lifecycle management

---

## Scope

The POC covers the following areas:

| Area | Description |
|---|---|
| **Application Inventory** | Onboarding key PSB applications into Concert's application catalog |
| **Vulnerability Management** | Ingesting CVE and SBOM data from security scanners |
| **Compliance Tracking** | Mapping applications against regulatory and internal policy controls |
| **Risk Prioritisation** | Using Concert's AI to surface the highest-impact risks |
| **Operational Insights** | Correlating deployment, incident, and change data for root cause analysis |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        IBM Concert                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  App Catalog │  │  Risk Engine │  │  AI Insights     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │  Data Ingestion Layer
        ┌────────────────┼────────────────────┐
        │                │                    │
┌───────▼──────┐  ┌──────▼───────┐  ┌────────▼───────┐
│  CI/CD Tools │  │  Security    │  │  Monitoring &  │
│  (Jenkins /  │  │  Scanners    │  │  Observability │
│   GitLab CI) │  │  (Twistlock, │  │  (Instana,     │
│              │  │   SonarQube) │  │   Dynatrace)   │
└──────────────┘  └──────────────┘  └────────────────┘
        │                │                    │
        └────────────────┼────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   PSB Application   │
              │      Portfolio      │
              └─────────────────────┘
```

---

## PSB Applications in Scope

The following PSB applications are being onboarded as part of this POC:

- **Core Banking System (CBS)** — Primary transactional banking platform
- **Internet Banking Portal** — Customer-facing web and mobile banking
- **Payment Gateway** — NEFT / RTGS / IMPS payment processing
- **Loan Management System (LMS)** — Retail and corporate lending workflows
- **Anti-Money Laundering (AML) Engine** — Regulatory compliance and fraud detection

---

## Integrations

| Tool / System | Purpose | Status |
|---|---|---|
| Jenkins | CI/CD pipeline data ingestion | Planned |
| SonarQube | SAST / code quality results | Planned |
| Twistlock / Prisma Cloud | Container vulnerability scanning | Planned |
| ServiceNow | Incident and change management | Planned |
| Instana | Application performance monitoring | Planned |
| Artifactory | SBOM and artifact metadata | Planned |

---

## Prerequisites

Before running the POC environment, ensure the following are in place:

1. **IBM Concert instance** — SaaS or on-premises deployment provisioned
2. **API credentials** — Concert API key generated for data ingestion
3. **Network access** — POC environment has connectivity to Concert endpoints
4. **Tool credentials** — Service accounts for SonarQube, Jenkins, ServiceNow, etc.
5. **Application inventory** — List of applications, owners, and environments from PSB

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<org>/Concert_poc.git
cd Concert_poc
```

### 2. Configure Environment Variables

Copy the sample environment file and populate it with your credentials:

```bash
cp .env.example .env
```

Edit `.env` with the required values:

```env
CONCERT_API_URL=https://<concert-instance>/api
CONCERT_API_KEY=<your-api-key>
SONARQUBE_URL=https://<sonarqube-host>
SONARQUBE_TOKEN=<your-token>
JENKINS_URL=https://<jenkins-host>
JENKINS_USER=<user>
JENKINS_TOKEN=<token>
```

### 3. Ingest Application Data

Run the ingestion script to onboard PSB applications into Concert:

```bash
python scripts/ingest_applications.py
```

### 4. Run Vulnerability Scan Ingestion

```bash
python scripts/ingest_vulnerabilities.py
```

### 5. Access the Concert Dashboard

Log in to the Concert UI and navigate to the **Application Catalog** to view the onboarded PSB applications, their risk scores, and prioritised recommendations.

---

## POC Deliverables

- [ ] Application catalog populated with PSB applications
- [ ] Vulnerability data ingested and correlated to applications
- [ ] Risk scores generated and validated with PSB security team
- [ ] Compliance posture dashboard configured
- [ ] AI-generated remediation recommendations reviewed
- [ ] Integration with at least one CI/CD pipeline demonstrated
- [ ] POC findings and evaluation report prepared

---

## Key Contacts

| Role | Name | Organisation |
|---|---|---|
| POC Lead | TBD | IBM |
| Technical Architect | TBD | IBM |
| PSB IT Security Lead | TBD | PSB |
| PSB DevOps Lead | TBD | PSB |

---

## Timeline

| Phase | Description | Duration |
|---|---|---|
| Phase 1 | Environment setup and connectivity validation | Week 1 |
| Phase 2 | Application onboarding and data ingestion | Week 2–3 |
| Phase 3 | Integration with security and CI/CD tools | Week 4–5 |
| Phase 4 | Dashboard configuration and AI insights review | Week 6 |
| Phase 5 | POC evaluation, findings report, and presentation | Week 7 |

---

## References

- [IBM Concert Documentation](https://www.ibm.com/docs/en/concert)
- [IBM Concert API Reference](https://www.ibm.com/docs/en/concert?topic=reference-api)
- [Punjab & Sind Bank IT Policy](https://www.psbindia.com)

---

## License

This POC repository is intended for internal evaluation purposes only. All content is confidential and proprietary to IBM and Punjab & Sind Bank.
