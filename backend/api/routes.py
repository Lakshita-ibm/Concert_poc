from fastapi import APIRouter
from backend.services import data_service, ai_service
from backend.models.schemas import RiskCorrelationRequest, NLQueryRequest

router = APIRouter()

@router.get("/dashboard/kpis")
def kpis():
    return data_service.get_dashboard_kpis()

@router.get("/services")
def services():
    return data_service.get_services()

@router.get("/assets")
def assets():
    return data_service.get_assets()

@router.get("/vulnerabilities")
def vulnerabilities():
    return data_service.get_vulns()

@router.get("/certificates")
def certificates():
    return data_service.get_certs()

@router.get("/incidents")
def incidents():
    return data_service.get_incidents()

@router.get("/sbom")
def sbom():
    return data_service.get_sbom()

@router.post("/ai/correlate-risk")
def correlate_risk(req: RiskCorrelationRequest):
    result = ai_service.correlate_risk(req.service, req.cve, req.certificate, req.availability)
    return result

@router.post("/ai/query")
def nl_query(req: NLQueryRequest):
    context = {
        "services": data_service.get_services(),
        "vulnerabilities": data_service.get_vulns(),
        "certificates": data_service.get_certs(),
    }
    return ai_service.nl_query(req.query, context)

@router.get("/ai/weekly-summary")
def weekly_summary():
    return ai_service.weekly_summary(
        data_service.get_services(),
        data_service.get_vulns(),
        data_service.get_certs(),
    )

@router.get("/compliance")
def compliance():
    vulns = data_service.get_vulns()
    certs = data_service.get_certs()
    assets = data_service.get_assets()
    sbom = data_service.get_sbom()
    cert_issues = any(c["expiresIn"] <= 10 for c in certs)
    third_party_risk = any(c["riskLevel"] in ["Critical", "High"] for s in sbom for c in s["components"])
    return {
        "score": 84,
        "controls": [
            { "name": "Asset Inventory", "status": "Pass", "icon": "check" },
            { "name": "Vulnerability Management", "status": "Pass", "icon": "check" },
            { "name": "Certificate Management", "status": "Warning" if cert_issues else "Pass", "icon": "warning" if cert_issues else "check" },
            { "name": "SBOM", "status": "Pass", "icon": "check" },
            { "name": "Audit Evidence", "status": "Pass", "icon": "check" },
            { "name": "Third Party Risk", "status": "Warning" if third_party_risk else "Pass", "icon": "warning" if third_party_risk else "check" },
        ]
    }
