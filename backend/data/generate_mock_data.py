import json
import os
import random

DATA_DIR = os.path.dirname(__file__)

def generate_services():
    # 5 Business Services
    services = [
        { "id": "s1", "name": "UPI", "riskScore": 92, "status": "Degraded", "uptime": "98.1%", "incidents": 3, "assets": ["a1", "a5", "a6", "a7"], "customers": "5M", "criticality": "Critical" },
        { "id": "s2", "name": "ATM", "riskScore": 78, "status": "Warning", "uptime": "99.2%", "incidents": 1, "assets": ["a2", "a7"], "customers": "2M", "criticality": "Critical" },
        { "id": "s3", "name": "AEPS", "riskScore": 65, "status": "Healthy", "uptime": "99.7%", "incidents": 0, "assets": ["a3", "a5", "a6"], "customers": "1.2M", "criticality": "High" },
        { "id": "s4", "name": "Mobile Banking", "riskScore": 71, "status": "Warning", "uptime": "99.4%", "incidents": 2, "assets": ["a4", "a5", "a7"], "customers": "3.5M", "criticality": "High" },
        { "id": "s5", "name": "Net Banking", "riskScore": 67, "status": "Healthy", "uptime": "99.6%", "incidents": 1, "assets": ["a8", "a5", "a7"], "customers": "1.8M", "criticality": "High" }
    ]
    with open(os.path.join(DATA_DIR, "services.json"), "w") as f:
        json.dump(services, f, indent=2)
    print("Generated 5 business services.")

def generate_assets():
    # 8 Assets
    assets = [
        { "id": "a1", "name": "UPI Gateway", "type": "API Gateway", "environment": "Production", "owner": "Digital Banking Team", "businessCriticality": "Critical", "riskScore": 92, "cves": 4, "certificates": 1, "customers": "5M", "branches": "877" },
        { "id": "a2", "name": "ATM Switch", "type": "Network Device", "environment": "Production", "owner": "ATM Operations", "businessCriticality": "Critical", "riskScore": 78, "cves": 2, "certificates": 0, "customers": "2M", "branches": "500" },
        { "id": "a3", "name": "AEPS Service", "type": "Microservice", "environment": "Production", "owner": "Payments Team", "businessCriticality": "High", "riskScore": 65, "cves": 3, "certificates": 1, "customers": "1.2M", "branches": "300" },
        { "id": "a4", "name": "Mobile Banking App", "type": "Application", "environment": "Production", "owner": "Mobile Team", "businessCriticality": "High", "riskScore": 71, "cves": 5, "certificates": 0, "customers": "3.5M", "branches": "877" },
        { "id": "a5", "name": "API Gateway (Kong)", "type": "API Gateway", "environment": "Production", "owner": "Platform Team", "businessCriticality": "Critical", "riskScore": 85, "cves": 2, "certificates": 2, "customers": "5M", "branches": "877" },
        { "id": "a6", "name": "Kubernetes Cluster", "type": "Infrastructure", "environment": "Production", "owner": "DevOps Team", "businessCriticality": "Critical", "riskScore": 60, "cves": 1, "certificates": 0, "customers": None, "branches": None },
        { "id": "a7", "name": "Core Banking DB", "type": "Database", "environment": "Production", "owner": "DBA Team", "businessCriticality": "Critical", "riskScore": 55, "cves": 0, "certificates": 0, "customers": None, "branches": None },
        { "id": "a8", "name": "Net Banking Portal", "type": "Web Application", "environment": "Production", "owner": "Web Team", "businessCriticality": "High", "riskScore": 67, "cves": 3, "certificates": 1, "customers": "1.8M", "branches": "877" }
    ]
    with open(os.path.join(DATA_DIR, "assets.json"), "w") as f:
        json.dump(assets, f, indent=2)
    print("Generated 8 assets.")

def generate_certificates():
    # 100 Certificates
    certs = []
    issuers = ["DigiCert", "Let's Encrypt", "GlobalSign", "Sectigo", "Entrust"]
    owners = ["Digital Banking", "ATM Operations", "Payments Team", "Mobile Team", "Web Team", "Platform Team", "DevOps Team"]
    assets_pool = [
        ("a1", "UPI Gateway", ["UPI"]),
        ("a2", "ATM Switch", ["ATM"]),
        ("a3", "AEPS Service", ["AEPS"]),
        ("a4", "Mobile Banking App", ["Mobile Banking"]),
        ("a5", "API Gateway (Kong)", ["UPI", "ATM", "AEPS", "Mobile Banking", "Net Banking"]),
        ("a8", "Net Banking Portal", ["Net Banking"])
    ]
    
    # 1. Expired (3 certificates)
    expired_days = [-5, -2, 0]
    for i, days in enumerate(expired_days):
        c_id = f"c_exp_{i+1}"
        asset_id, asset_name, svcs = assets_pool[i % len(assets_pool)]
        certs.append({
            "id": c_id,
            "certificateId": c_id.upper(),
            "name": f"expired-{i+1}.psb.in",
            "certificateName": f"expired-{i+1}.psb.in",
            "asset": asset_name,
            "assetId": asset_id,
            "issuer": random.choice(issuers),
            "expiresIn": days,
            "remainingDays": days,
            "expiryDate": f"2026-07-{16+days:02d}",
            "status": "Expired",
            "owner": owners[i % len(owners)],
            "type": "TLS",
            "services": svcs
        })
        
    # 2. Expiring Soon (9 certificates, <=10 days counts as expired/critical in dashboard KPI)
    expiring_soon_days = [2, 5, 8, 9, 12, 18, 22, 25, 29]
    for i, days in enumerate(expiring_soon_days):
        c_id = f"c_soon_{i+1}"
        asset_id, asset_name, svcs = assets_pool[(i + 3) % len(assets_pool)]
        certs.append({
            "id": c_id,
            "certificateId": c_id.upper(),
            "name": f"expiring-soon-{i+1}.psb.in",
            "certificateName": f"expiring-soon-{i+1}.psb.in",
            "asset": asset_name,
            "assetId": asset_id,
            "issuer": random.choice(issuers),
            "expiresIn": days,
            "remainingDays": days,
            "expiryDate": f"2026-08-{i+1:02d}",
            "status": "Expiring Soon",
            "owner": owners[(i + 3) % len(owners)],
            "type": "TLS",
            "services": svcs
        })
        
    # 3. Active (88 certificates)
    for i in range(88):
        c_id = f"c_act_{i+1}"
        days = random.randint(31, 365)
        asset_id, asset_name, svcs = assets_pool[i % len(assets_pool)]
        certs.append({
            "id": c_id,
            "certificateId": c_id.upper(),
            "name": f"secure-cert-{i+1}.psb.in",
            "certificateName": f"secure-cert-{i+1}.psb.in",
            "asset": asset_name,
            "assetId": asset_id,
            "issuer": random.choice(issuers),
            "expiresIn": days,
            "remainingDays": days,
            "expiryDate": f"2027-02-{random.randint(1, 28):02d}",
            "status": "Active",
            "owner": owners[i % len(owners)],
            "type": "TLS",
            "services": svcs
        })

    with open(os.path.join(DATA_DIR, "certificates.json"), "w") as f:
        json.dump(certs, f, indent=2)
    print(f"Generated {len(certs)} certificates.")

def generate_vulnerabilities():
    # 50 Vulnerabilities
    vulns = []
    assets_pool = [
        ("a1", "UPI Gateway", ["UPI", "Mobile Banking"]),
        ("a2", "ATM Switch", ["ATM"]),
        ("a3", "AEPS Service", ["AEPS"]),
        ("a4", "Mobile Banking App", ["Mobile Banking", "UPI", "Net Banking"]),
        ("a5", "API Gateway (Kong)", ["UPI", "ATM", "AEPS", "Mobile Banking", "Net Banking"]),
        ("a6", "Kubernetes Cluster", ["UPI", "AEPS", "Mobile Banking"]),
        ("a7", "Core Banking DB", ["UPI", "ATM", "AEPS", "Mobile Banking", "Net Banking"]),
        ("a8", "Net Banking Portal", ["Net Banking"])
    ]
    
    statuses = ["Open", "In Progress", "Resolved"]
    
    # 5 Critical (CVSS 9.0 - 10.0)
    for i in range(5):
        asset_id, asset_name, svcs = assets_pool[i % len(assets_pool)]
        cvss = round(random.uniform(9.0, 10.0), 1)
        vulns.append({
            "id": f"v_crit_{i+1}",
            "cve": f"CVE-2025-{1000 + i}",
            "cveId": f"CVE-2025-{1000 + i}",
            "severity": "Critical",
            "asset": asset_name,
            "assetId": asset_id,
            "description": f"Critical vulnerability allowing remote code execution or authorization bypass in {asset_name}.",
            "cvss": cvss,
            "riskScore": cvss,
            "status": "Open",
            "daysOpen": random.randint(1, 15),
            "affectedServices": svcs
        })
        
    # 15 High (CVSS 7.0 - 8.9)
    for i in range(15):
        asset_id, asset_name, svcs = assets_pool[(i + 5) % len(assets_pool)]
        cvss = round(random.uniform(7.0, 8.9), 1)
        vulns.append({
            "id": f"v_high_{i+1}",
            "cve": f"CVE-2024-{2000 + i}",
            "cveId": f"CVE-2024-{2000 + i}",
            "severity": "High",
            "asset": asset_name,
            "assetId": asset_id,
            "description": f"High severity vulnerability causing potential denial of service or privilege escalation in {asset_name}.",
            "cvss": cvss,
            "riskScore": cvss,
            "status": random.choice(["Open", "In Progress"]),
            "daysOpen": random.randint(5, 30),
            "affectedServices": svcs
        })
        
    # 20 Medium (CVSS 4.0 - 6.9)
    for i in range(20):
        asset_id, asset_name, svcs = assets_pool[i % len(assets_pool)]
        cvss = round(random.uniform(4.0, 6.9), 1)
        vulns.append({
            "id": f"v_med_{i+1}",
            "cve": f"CVE-2024-{3000 + i}",
            "cveId": f"CVE-2024-{3000 + i}",
            "severity": "Medium",
            "asset": asset_name,
            "assetId": asset_id,
            "description": f"Medium severity vulnerability leading to information disclosure or cross-site scripting in {asset_name}.",
            "cvss": cvss,
            "riskScore": cvss,
            "status": random.choice(statuses),
            "daysOpen": random.randint(10, 60),
            "affectedServices": svcs
        })
        
    # 10 Low (CVSS 0.1 - 3.9)
    for i in range(10):
        asset_id, asset_name, svcs = assets_pool[(i + 3) % len(assets_pool)]
        cvss = round(random.uniform(1.0, 3.9), 1)
        vulns.append({
            "id": f"v_low_{i+1}",
            "cve": f"CVE-2024-{4000 + i}",
            "cveId": f"CVE-2024-{4000 + i}",
            "severity": "Low",
            "asset": asset_name,
            "assetId": asset_id,
            "description": f"Low risk vulnerability with minimal impact or requiring high complexity exploit in {asset_name}.",
            "cvss": cvss,
            "riskScore": cvss,
            "status": "Resolved",
            "daysOpen": random.randint(15, 90),
            "affectedServices": svcs
        })

    with open(os.path.join(DATA_DIR, "vulnerabilities.json"), "w") as f:
        json.dump(vulns, f, indent=2)
    print(f"Generated {len(vulns)} vulnerabilities.")

def generate_sbom():
    # 250 SBOM Components distributed across 5 apps (Mobile Banking, UPI Gateway, AEPS Service, ATM Switch, Net Banking)
    apps = [
        { "id": "sb1", "application": "Mobile Banking", "version": "4.2.1", "impactedServices": ["Mobile Banking", "UPI", "API Layer"] },
        { "id": "sb2", "application": "UPI Gateway", "version": "3.1.0", "impactedServices": ["UPI", "ATM", "AEPS", "Mobile Banking", "Net Banking"] },
        { "id": "sb3", "application": "AEPS Service", "version": "2.0.4", "impactedServices": ["AEPS"] },
        { "id": "sb4", "application": "ATM Switch", "version": "1.8.0", "impactedServices": ["ATM"] },
        { "id": "sb5", "application": "Net Banking", "version": "5.0.2", "impactedServices": ["Net Banking", "API Layer"] }
    ]
    
    licenses = ["Apache-2.0", "MIT", "BSD-2", "BSD-3", "GPL-3.0", "OpenSSL", "LGPL-2.1"]
    libs = [
        "Spring Boot", "Log4j", "OpenSSL", "PostgreSQL Driver", "Jackson Databind",
        "Express", "React", "Next.js", "Lodash", "Axios", "Nginx", "LuaJIT", "FastAPI",
        "Uvicorn", "Pydantic", "Cryptography", "Requests", "Gunicorn", "Redis Client",
        "Hibernate", "Tomcat", "SLF4J", "Apache Commons", "H2 Database", "JUnit"
    ]
    
    sbom_data = []
    comp_counter = 0
    
    for i, app in enumerate(apps):
        components = []
        critical_count = 0
        high_count = 0
        
        for j in range(50):
            comp_counter += 1
            risk = "Low"
            cve = None
            cvss = None
            
            if j == 0 and i in [0, 1, 4]:
                risk = "Critical"
                cve = f"CVE-2025-{1500+i}"
                cvss = 9.8
                critical_count += 1
            elif j == 1 and i in [0, 2, 3]:
                risk = "High"
                cve = f"CVE-2024-{2500+i}"
                cvss = 8.2
                high_count += 1
            elif j == 2:
                risk = "Medium"
                cve = f"CVE-2024-{3500+i}"
                cvss = 6.5
                
            lib_name = libs[comp_counter % len(libs)] + f"-{comp_counter}"
            
            components.append({
                "name": lib_name,
                "version": f"{random.randint(1, 10)}.{random.randint(0, 9)}.{random.randint(0, 9)}",
                "license": random.choice(licenses),
                "riskLevel": risk,
                "cve": cve,
                "cvss": cvss
            })
            
        sbom_data.append({
            "id": app["id"],
            "application": app["application"],
            "version": app["version"],
            "components": components,
            "impactedServices": app["impactedServices"],
            "totalComponents": 50,
            "criticalComponents": critical_count,
            "highComponents": high_count
        })
        
    with open(os.path.join(DATA_DIR, "sbom.json"), "w") as f:
        json.dump(sbom_data, f, indent=2)
    print(f"Generated 250 SBOM components across {len(sbom_data)} applications.")

def generate_incidents():
    incidents = []
    services = ["UPI", "ATM", "AEPS", "Mobile Banking", "Net Banking"]
    severities = ["Critical", "High", "Medium"]
    statuses = ["Open", "In Progress", "Resolved"]
    
    causes = [
        "Expired API Certificate", "Buffer overflow in Switch firmware",
        "Log4j Exploit in Auth Service", "SQL Injection vulnerability in portal",
        "Memory leak in session controller", "BGP Routing loop at ISP gateway",
        "Hardware failover failure in HSM", "DDoS attack targeting payment gateway"
    ]
    
    for i in range(20):
        svc = services[i % len(services)]
        sev = "Critical" if i < 3 else ("High" if i < 10 else "Medium")
        status = "Open" if i < 2 else ("In Progress" if i < 7 else "Resolved")
        cause = causes[i % len(causes)]
        
        incidents.append({
            "id": f"i{i+1}",
            "title": f"{svc} Service Degradation — Incident {i+1}",
            "service": svc,
            "severity": sev,
            "status": status,
            "timestamp": f"2026-07-{16-i:02d}T09:00:00Z",
            "rootCause": f"{cause} affecting {svc}",
            "confidence": random.randint(80, 98),
            "chain": [
                { "step": 1, "event": "Alert Triggered", "detail": f"Anomaly detected in {svc} transaction latency." },
                { "step": 2, "event": "Root Cause Triggered", "detail": f"{cause} occurred in infrastructure." },
                { "step": 3, "event": "Secondary Impact", "detail": "Related microservices started rejecting connections." },
                { "step": 4, "event": "Service Impacted", "detail": f"{svc} service reported degraded operation status." }
            ],
            "recommendation": f"Perform immediate security patch or review {cause} to secure the component."
        })
        
    with open(os.path.join(DATA_DIR, "incidents.json"), "w") as f:
        json.dump(incidents, f, indent=2)
    print("Generated 20 incidents.")

def generate_arena():
    nodes = [
        { "id": "n1", "label": "UPI Service", "type": "Service", "status": "Critical", "riskScore": 92, "x": 100, "y": 20, "owner": "Digital Banking Team", "cves": 5, "cert": "Expired", "deps": ["n6", "n7"] },
        { "id": "n2", "label": "ATM Switch", "type": "Service", "status": "Warning", "riskScore": 78, "x": 300, "y": 20, "owner": "ATM Operations", "cves": 2, "cert": "Healthy", "deps": ["n8"] },
        { "id": "n3", "label": "AEPS Service", "type": "Service", "status": "Healthy", "riskScore": 65, "x": 500, "y": 20, "owner": "Payments Team", "cves": 3, "cert": "Expiring Soon", "deps": ["n9", "n10"] },
        { "id": "n4", "label": "Mobile Banking", "type": "Service", "status": "Warning", "riskScore": 71, "x": 700, "y": 20, "owner": "Mobile Team", "cves": 4, "cert": "Healthy", "deps": ["n6", "n10"] },
        { "id": "n5", "label": "Net Banking", "type": "Service", "status": "Healthy", "riskScore": 67, "x": 900, "y": 20, "owner": "Web Team", "cves": 1, "cert": "Healthy", "deps": ["n6", "n9"] },
        
        { "id": "n6", "label": "API Gateway", "type": "Application", "status": "Critical", "riskScore": 85, "x": 200, "y": 150, "owner": "Platform Team", "cves": 3, "cert": "Expired", "deps": ["n11", "n12"] },
        { "id": "n7", "label": "UPI Engine", "type": "Application", "status": "Healthy", "riskScore": 40, "x": 50, "y": 150, "owner": "Digital Banking", "cves": 0, "cert": "Healthy", "deps": ["n12", "n13"] },
        { "id": "n8", "label": "ATM Processor", "type": "Application", "status": "Warning", "riskScore": 68, "x": 350, "y": 150, "owner": "ATM Team", "cves": 1, "cert": "Healthy", "deps": ["n14"] },
        { "id": "n9", "label": "Web Portal", "type": "Application", "status": "Healthy", "riskScore": 30, "x": 600, "y": 150, "owner": "Web Team", "cves": 1, "cert": "Healthy", "deps": ["n15"] },
        { "id": "n10", "label": "Auth Service", "type": "Application", "status": "Warning", "riskScore": 70, "x": 800, "y": 150, "owner": "Platform Team", "cves": 2, "cert": "Healthy", "deps": ["n15", "n16"] },
        
        { "id": "n11", "label": "K8s Namespace A", "type": "Infrastructure", "status": "Healthy", "riskScore": 45, "x": 250, "y": 280, "owner": "DevOps", "cves": 0, "cert": "Healthy", "deps": ["n17"] },
        { "id": "n12", "label": "K8s Namespace B", "type": "Infrastructure", "status": "Healthy", "riskScore": 50, "x": 100, "y": 280, "owner": "DevOps", "cves": 0, "cert": "Healthy", "deps": ["n17"] },
        { "id": "n13", "label": "HSM Security Module", "type": "Infrastructure", "status": "Healthy", "riskScore": 25, "x": 20, "y": 280, "owner": "SecOps", "cves": 0, "cert": "Healthy", "deps": [] },
        { "id": "n14", "label": "ATM Network Switch", "type": "Infrastructure", "status": "Warning", "riskScore": 72, "x": 400, "y": 280, "owner": "Network Team", "cves": 1, "cert": "None", "deps": ["n18"] },
        { "id": "n15", "label": "Web App Server", "type": "Infrastructure", "status": "Healthy", "riskScore": 35, "x": 650, "y": 280, "owner": "Ops Team", "cves": 0, "cert": "Healthy", "deps": ["n18", "n19"] },
        { "id": "n16", "label": "IAM Server", "type": "Infrastructure", "status": "Healthy", "riskScore": 48, "x": 850, "y": 280, "owner": "SecOps", "cves": 0, "cert": "Healthy", "deps": ["n19"] },
        
        { "id": "n17", "label": "UPI Database", "type": "Database", "status": "Healthy", "riskScore": 50, "x": 150, "y": 410, "owner": "DBA Team", "cves": 0, "cert": "Healthy", "deps": [] },
        { "id": "n18", "label": "Core DB Cluster", "type": "Database", "status": "Healthy", "riskScore": 55, "x": 450, "y": 410, "owner": "DBA Team", "cves": 0, "cert": "Healthy", "deps": [] },
        { "id": "n19", "label": "Customer DB Store", "type": "Database", "status": "Healthy", "riskScore": 40, "x": 750, "y": 410, "owner": "DBA Team", "cves": 0, "cert": "Healthy", "deps": [] },
        { "id": "n20", "label": "Audit Logs DB", "type": "Database", "status": "Healthy", "riskScore": 30, "x": 950, "y": 410, "owner": "DBA Team", "cves": 0, "cert": "Healthy", "deps": [] }
    ]
    
    edges = [
        { "id": "e1", "source": "n1", "target": "n6", "relationship": "Routes via" },
        { "id": "e2", "source": "n1", "target": "n7", "relationship": "Processes via" },
        { "id": "e3", "source": "n2", "target": "n8", "relationship": "Connects via" },
        { "id": "e4", "source": "n3", "target": "n6", "relationship": "Routes via" },
        { "id": "e5", "source": "n3", "target": "n10", "relationship": "Authenticates with" },
        { "id": "e6", "source": "n4", "target": "n6", "relationship": "Routes via" },
        { "id": "e7", "source": "n4", "target": "n10", "relationship": "Authenticates with" },
        { "id": "e8", "source": "n5", "target": "n9", "relationship": "Accesses via" },
        { "id": "e9", "source": "n5", "target": "n10", "relationship": "Authenticates with" },
        
        { "id": "e10", "source": "n6", "target": "n11", "relationship": "Runs on" },
        { "id": "e11", "source": "n6", "target": "n12", "relationship": "Runs on" },
        { "id": "e12", "source": "n7", "target": "n12", "relationship": "Runs on" },
        { "id": "e13", "source": "n7", "target": "n13", "relationship": "Encrypts with" },
        { "id": "e14", "source": "n8", "target": "n14", "relationship": "Communicates via" },
        { "id": "e15", "source": "n9", "target": "n15", "relationship": "Hosted on" },
        { "id": "e16", "source": "n10", "target": "n15", "relationship": "Hosted on" },
        { "id": "e17", "source": "n10", "target": "n16", "relationship": "Authorizes via" },
        
        { "id": "e18", "source": "n11", "target": "n17", "relationship": "Persists to" },
        { "id": "e19", "source": "n12", "target": "n17", "relationship": "Persists to" },
        { "id": "e20", "source": "n12", "target": "n18", "relationship": "Reads from" },
        { "id": "e21", "source": "n14", "target": "n18", "relationship": "Syncs to" },
        { "id": "e22", "source": "n15", "target": "n18", "relationship": "Queries" },
        { "id": "e23", "source": "n15", "target": "n19", "relationship": "Reads customer info" },
        { "id": "e24", "source": "n16", "target": "n19", "relationship": "Queries identity" },
        { "id": "e25", "source": "n15", "target": "n20", "relationship": "Writes audit" },
        { "id": "e26", "source": "n16", "target": "n20", "relationship": "Writes audit" },
        
        { "id": "e27", "source": "n6", "target": "n10", "relationship": "Routes Auth requests" },
        { "id": "e28", "source": "n7", "target": "n17", "relationship": "Direct Database connect" },
        { "id": "e29", "source": "n8", "target": "n18", "relationship": "Direct Core DB access" },
        { "id": "e30", "source": "n10", "target": "n20", "relationship": "Security audit logger" }
    ]
    
    with open(os.path.join(DATA_DIR, "arena.json"), "w") as f:
        json.dump({ "nodes": nodes, "edges": edges }, f, indent=2)
    print("Generated 20 arena nodes and 30 edges.")

if __name__ == "__main__":
    generate_services()
    generate_assets()
    generate_certificates()
    generate_vulnerabilities()
    generate_sbom()
    generate_incidents()
    generate_arena()
