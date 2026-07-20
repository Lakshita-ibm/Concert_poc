"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, ArrowRight, ShieldAlert, Award } from "lucide-react";

const API = "http://localhost:8000/api";

interface Control {
  name: string;
  status: "Pass" | "Warning" | "Fail";
  icon?: string;
}

interface ComplianceData {
  score: number;
  controls: Control[];
}

const mockCompliance: ComplianceData = {
  score: 83,
  controls: [
    { name: "Asset Inventory", status: "Pass" },
    { name: "Vulnerability Management", status: "Warning" },
    { name: "Certificate Management", status: "Warning" },
    { name: "SBOM", status: "Pass" },
    { name: "Audit Evidence", status: "Pass" },
    { name: "Third Party Risk", status: "Warning" },
  ],
};

const RBI_FRAMEWORK = [
  { section: "IS Audit", requirement: "Annual IS Audit by CERT-In empanelled auditors", status: "Compliant", lastAudit: "Jan 2025" },
  { section: "Patch Management", requirement: "Critical patches within 30 days, High within 60 days", status: "Non-Compliant", lastAudit: "Ongoing" },
  { section: "Vulnerability Assessment", requirement: "Quarterly VAPT of internet-facing systems", status: "Compliant", lastAudit: "Apr 2025" },
  { section: "Certificate Management", requirement: "No expired certificates in production", status: "Non-Compliant", lastAudit: "Jul 2025" },
  { section: "Incident Response", requirement: "Report incidents to RBI within 6 hours", status: "Compliant", lastAudit: "Continuous" },
  { section: "Data Localisation", requirement: "All payment data stored in India", status: "Compliant", lastAudit: "Mar 2025" },
  { section: "Third Party Risk", requirement: "Annual vendor risk assessment", status: "Partial", lastAudit: "Feb 2025" },
  { section: "SBOM", requirement: "Software bill of materials for critical apps", status: "Compliant", lastAudit: "Jun 2025" },
];

export default function Compliance() {
  const [data, setData] = useState<ComplianceData>(mockCompliance);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${API}/compliance`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const statusColor = (s: string) =>
    s === "Pass" || s === "Compliant" ? "#22c55e" :
    s === "Warning" || s === "Partial" ? "#f97316" : "#ef4444";

  const StatusIcon = ({ s }: { s: string }) =>
    s === "Pass" || s === "Compliant" ? <CheckCircle size={16} className="text-green-500" /> :
    s === "Warning" || s === "Partial" ? <AlertTriangle size={16} className="text-orange-400" /> :
    <XCircle size={16} className="text-red-500" />;

  const scoreColor = data.score >= 90 ? "#22c55e" : data.score >= 75 ? "#f97316" : "#ef4444";

  // Dynamic recommendations based on warnings
  const getRecommendations = () => {
    const recs = [];
    const warnings = data.controls.filter(c => c.status === "Warning" || c.status === "Fail");
    
    if (warnings.some(c => c.name === "Certificate Management")) {
      recs.push({
        title: "Certificate Management Action Required",
        desc: "Renew expired TLS/mTLS certificates on UPI Gateway and AEPS Service. Renew expiring-soon certificates in 10 days.",
        priority: "High"
      });
    }
    if (warnings.some(c => c.name === "Vulnerability Management")) {
      recs.push({
        title: "CVE Remediation Hotfix Needed",
        desc: "Schedule emergency patch window to remediate 5 Critical severity vulnerabilities (CVSS 9.0+) detected across active services.",
        priority: "High"
      });
    }
    if (warnings.some(c => c.name === "Third Party Risk")) {
      recs.push({
        title: "SBOM Component Upgrades",
        desc: "Upgrade vulnerable third-party dependencies (e.g. Log4j, Spring Boot) identified in Mobile Banking & UPI Gateway.",
        priority: "Medium"
      });
    }
    
    if (recs.length === 0) {
      recs.push({
        title: "All controls aligned",
        desc: "No immediate compliance gaps detected. Maintain standard monitoring schedules.",
        priority: "Low"
      });
    }
    return recs;
  };

  return (
    <div className="p-8 space-y-8 min-h-screen" style={{ background: "linear-gradient(135deg, #0d1117 0%, #0f1622 100%)" }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-green-400 font-semibold uppercase tracking-widest">Compliance Audit Ready</span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <ShieldCheck size={18} className="text-[#22c55e]" />
          </div>
          RBI Compliance Dashboard
        </h1>
        <p className="text-[#57606a] text-sm mt-1 ml-11">IT Security &amp; Risk Governance Circular: RBI/2021-22/117 Compliance Mapping</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Score Dial */}
        <div className="rounded-xl border border-[#1e2533] p-6 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #161b27, #0f1622)" }}>
          <div className="text-[#57606a] text-xs mb-4 uppercase tracking-widest font-semibold">Compliance Rating</div>
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1e2533" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" strokeWidth="10"
                stroke={scoreColor}
                strokeDasharray={`${(data.score / 100) * 314} 314`}
                strokeLinecap="round"
                className="transition-all duration-1000"
                style={{ filter: `drop-shadow(0 0 6px ${scoreColor}66)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{loading ? "..." : `${data.score}%`}</span>
              <span className="text-[10px] text-[#8b949e] uppercase font-semibold">RBI Ready</span>
            </div>
          </div>
          <div className="text-xs text-[#8b949e] mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ background: "#0f1117", borderColor: scoreColor + "40" }}>
            <Award size={12} style={{ color: scoreColor }} />
            <span style={{ color: scoreColor }}>{data.score >= 90 ? "Excellent Posture" : data.score >= 75 ? "Good Standing" : "Action Required"}</span>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="col-span-2 rounded-xl border border-[#1e2533] p-6" style={{ background: "#161b27" }}>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#22c55e]" /> Cyber Security Framework (CSF) Controls
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {loading ? (
              <div className="col-span-2 text-center text-[#57606a] py-8">Loading controls...</div>
            ) : (
              data.controls.map((c) => (
                <div key={c.name} className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all hover:border-opacity-60" style={{
                  background: "#0f1117",
                  border: `1px solid ${statusColor(c.status)}25`,
                }}>
                  <StatusIcon s={c.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-[#57606a] uppercase tracking-wider font-semibold">PSB-Control</div>
                    <div className="text-sm text-white font-medium truncate mt-0.5">{c.name}</div>
                  </div>
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                    color: statusColor(c.status),
                    background: statusColor(c.status) + "18",
                    border: `1px solid ${statusColor(c.status)}30`
                  }}>{c.status}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Remediation Plan & RBI Framework Table Split */}
      <div className="grid grid-cols-3 gap-6">
        {/* RBI Framework Table */}
        <div className="col-span-2 rounded-xl border border-[#1e2533] p-6" style={{ background: "#161b27" }}>
          <h2 className="text-sm font-semibold text-white mb-4">RBI IT Security Framework: Circular Mapping</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#57606a] border-b border-[#1e2533] text-xs uppercase tracking-wider font-semibold">
                <th className="py-2 pb-3 text-left">Section</th>
                <th className="py-2 pb-3 text-left">Requirement</th>
                <th className="py-2 pb-3 text-center">Audit Status</th>
                <th className="py-2 pb-3 text-right">Last Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {RBI_FRAMEWORK.map((row, idx) => (
                <tr key={row.section} className={`border-b border-[#1e2533]/40 hover:bg-[#1e2533]/30 transition-colors ${idx === RBI_FRAMEWORK.length - 1 ? "border-b-0" : ""}`}>
                  <td className="py-3 text-white text-xs font-bold">{row.section}</td>
                  <td className="py-3 text-[#8b949e] text-xs pr-4 leading-relaxed">{row.requirement}</td>
                  <td className="py-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border" style={{
                      background: statusColor(row.status) + "18",
                      color: statusColor(row.status),
                      borderColor: statusColor(row.status) + "33"
                    }}>{row.status}</span>
                  </td>
                  <td className="py-3 text-xs text-[#57606a] font-mono text-right">{row.lastAudit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic Compliance Checklist */}
        <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <ShieldAlert size={16} className="text-[#f97316]" /> Gap Remediation Plan
          </h2>
          <p className="text-xs text-[#57606a] leading-relaxed">
            Recommended immediate actions required to remediate gaps and achieve 100% regulatory compliance.
          </p>
          <div className="space-y-3 pt-2">
            {getRecommendations().map((rec, i) => (
              <div key={i} className="bg-[#0f1117] border border-[#1e2533] rounded-lg p-4 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-red-950/20 text-red-400 border border-red-500/20"
                        style={{
                          color: rec.priority === "High" ? "#ef4444" : "#f97316",
                          borderColor: rec.priority === "High" ? "#ef444430" : "#f9731630",
                          background: rec.priority === "High" ? "#ef444410" : "#f9731610"
                        }}>
                    {rec.priority} Priority
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white pt-1">{rec.title}</h3>
                <p className="text-[11px] text-[#8b949e] leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
