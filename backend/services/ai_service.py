import os
import json
from dotenv import load_dotenv

load_dotenv()

DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")

def _get_client():
    from openai import AzureOpenAI
    return AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_KEY", "dummy"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", "https://placeholder.openai.azure.com/"),
    )

PSB_CONTEXT = """
You are an AI risk intelligence assistant for Punjab & Sind Bank (PSB), India.
PSB operates UPI, ATM, AEPS, Mobile Banking, and Net Banking services across 877 branches serving 5M+ customers.
You analyze security vulnerabilities, certificates, and incidents to produce business-impact risk scores and recommendations.
Always respond in structured JSON.
"""

def correlate_risk(service: str, cve: str, certificate: str, availability: str) -> dict:
    prompt = f"""
{PSB_CONTEXT}

Analyze this risk signal for PSB:
Service: {service}
CVE: {cve or 'None'}
Certificate Status: {certificate or 'None'}
Availability: {availability or 'Unknown'}

Return JSON:
{{
  "businessRiskScore": <0-100>,
  "reason": "<2-3 sentence explanation referencing PSB context>",
  "impact": "<business impact statement>",
  "recommendedActions": ["<action1>", "<action2>", "<action3>"]
}}
"""
    try:
        resp = _get_client().chat.completions.create(
            model=DEPLOYMENT,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(resp.choices[0].message.content)
    except Exception:
        # Fallback mock response for demo without API key
        return {
            "businessRiskScore": 92,
            "reason": f"{service} supports 877 PSB branches and 5M digital banking customers. The combination of {cve or 'active CVE'} and {certificate or 'certificate issue'} creates a critical attack surface.",
            "impact": "Potential UPI transaction failures affecting digital banking across all PSB branches. RBI compliance breach risk.",
            "recommendedActions": [
                f"Patch {cve or 'CVE'} within 24 hours",
                "Renew expiring certificate immediately",
                "Enable WAF rules on API Gateway as interim mitigation"
            ]
        }

def nl_query(query: str, context_data: dict) -> dict:
    data_str = json.dumps(context_data, indent=2)
    prompt = f"""
{PSB_CONTEXT}

Current PSB system data:
{data_str}

User query: {query}

Return JSON:
{{
  "answer": "<direct answer>",
  "details": "<supporting detail>",
  "recommendation": "<action if applicable>"
}}
"""
    try:
        resp = _get_client().chat.completions.create(
            model=DEPLOYMENT,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(resp.choices[0].message.content)
    except Exception:
        return {
            "answer": "UPI Gateway is at highest risk with a Business Risk Score of 92.",
            "details": "Critical CVE-2025-1111 (CVSS 9.8) combined with expiring TLS certificate on upi-gateway.psb.in creates a critical exposure for 5M customers across 877 branches.",
            "recommendation": "Immediate patching of CVE-2025-1111 and certificate renewal required within 24 hours."
        }

def weekly_summary(services: list, vulns: list, certs: list) -> dict:
    critical = [v for v in vulns if v["severity"] == "Critical" and v["status"] == "Open"]
    expiring = [c for c in certs if c["expiresIn"] <= 10]
    try:
        prompt = f"""
{PSB_CONTEXT}
Generate a weekly executive risk summary for PSB management.
Critical open CVEs: {len(critical)}
Certificates expiring within 10 days: {len(expiring)}
Services in warning/degraded state: {sum(1 for s in services if s['status'] != 'Healthy')}
Return JSON: {{"summary": "<4-5 sentence executive summary>", "urgentActions": ["<action1>", "<action2>"]}}
"""
        resp = _get_client().chat.completions.create(
            model=DEPLOYMENT,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(resp.choices[0].message.content)
    except Exception:
        return {
            "summary": f"{len(critical)} critical risks detected across PSB digital infrastructure. {len(expiring)} certificate(s) nearing expiry pose immediate TLS failure risk. UPI service is exposed to a high-impact CVE affecting 5M customers. Recommended remediation within 72 hours to avoid RBI compliance breach.",
            "urgentActions": [
                "Renew upi-gateway.psb.in certificate within 48 hours",
                "Patch CVE-2025-1111 and CVE-2024-4040 immediately"
            ]
        }
