import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")

def load(filename: str):
    with open(os.path.join(DATA_DIR, filename)) as f:
        return json.load(f)

def get_services():    return load("services.json")
def get_assets():      return load("assets.json")
def get_vulns():       return load("vulnerabilities.json")
def get_certs():       return load("certificates.json")
def get_incidents():   return load("incidents.json")
def get_sbom():        return load("sbom.json")
def get_arena():       return load("arena.json")

def get_dashboard_kpis():
    vulns = get_vulns()
    certs = get_certs()
    services = get_services()
    incidents = get_incidents()
    critical_risks = sum(1 for v in vulns if v["severity"] == "Critical" and v["status"] == "Open")
    affected_services = len(set(s for v in vulns for s in v["affectedServices"] if v["status"] == "Open"))
    expired_certs = sum(1 for c in certs if c["expiresIn"] <= 10)
    high_cves = sum(1 for v in vulns if v["severity"] in ["Critical", "High"] and v["status"] == "Open")
    compliance_drift = sum(1 for s in services if s["status"] in ["Warning", "Degraded"])
    return {
        "criticalRisks": critical_risks,
        "affectedServices": affected_services,
        "expiredCertificates": expired_certs,
        "highCVEs": high_cves,
        "complianceDrift": compliance_drift,
    }
