from pydantic import BaseModel
from typing import Optional

class RiskCorrelationRequest(BaseModel):
    service: str
    cve: Optional[str] = None
    certificate: Optional[str] = None
    availability: Optional[str] = None

class NLQueryRequest(BaseModel):
    query: str
