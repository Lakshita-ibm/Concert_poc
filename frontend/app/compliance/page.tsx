"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const API = "http://localhost:8000/api";

const mockCompliance = {
  score: 84,
  controls: [
    { name: "Asset Inventory", status: "Pass" },
    { name: "Vulnerability Management", status: "Pass" },
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
  const [data, setData] = useState(mockCompliance);

  useEffect(() => {
    fetch(`${API}/compliance`).then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const statusColor = (s: string) =>
    s === "Pass" || s === "Compliant" ? "#22c55e" :
    s === "Warning" || s === "Partial" ? "#f97316" : "#ef4444";

  const StatusIcon = ({ s }: { s: string }) =>
    s === "Pass" || s === "Compliant" ? <CheckCircle size={16} className="text-green-500" /> :
    s === "Warning" || s === "Partial" ? <AlertTriangle size={16} className="text-orange-400" /> :
    <XCircle size={16} className="text-red-500" />;

  const scoreColor = data.score >= 90 ? "#22c55e" : data.score >= 75 ? "#f97316" : "#ef4444";

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck size={24} className="text-[#22c55e]" /> RBI Compliance Dashboard
        </h1>
        <p className="text-[#57606a] text-sm mt-1">IT Security & Risk Governance — RBI Circular RBI/2021-22/117</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Score Dial */}
        <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-6 flex flex-col items-center justify-center">
          <div className="text-[#57606a] text-xs mb-3 uppercase tracking-widest">Overall Compliance Score</div>
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1e2533" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" strokeWidth="12"
                stroke={scoreColor}
                strokeDasharray={`${(data.score / 100) * 314} 314`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: scoreColor }}>{data.score}%</span>
              <span className="text-xs text-[#57606a]">RBI Ready</span>
            </div>
          </div>
          <div className="text-xs text-[#57606a] mt-3 text-center">2 controls need attention</div>
        </div>

        {/* Controls Grid */}
        <div className="col-span-2 bg-[#161b27] rounded-xl border border-[#1e2533] p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Control Status</h2>
          <div className="grid grid-cols-2 gap-3">
            {data.controls.map((c) => (
              <div key={c.name} className="flex items-center gap-3 bg-[#0f1117] rounded-lg px-4 py-3 border border-[#1e2533]">
                <StatusIcon s={c.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{c.name}</div>
                  <div className="text-xs font-medium" style={{ color: statusColor(c.status) }}>{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RBI Framework Table */}
      <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-6">
        <h2 className="text-sm font-semibold text-white mb-4">RBI IT Security Framework — Control Mapping</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#57606a] border-b border-[#1e2533]">
              <th className="text-left py-2 font-medium w-36">Section</th>
              <th className="text-left py-2 font-medium">Requirement</th>
              <th className="text-left py-2 font-medium w-28">Status</th>
              <th className="text-left py-2 font-medium w-28">Last Reviewed</th>
            </tr>
          </thead>
          <tbody>
            {RBI_FRAMEWORK.map((row) => (
              <tr key={row.section} className="border-b border-[#1e2533]/50 hover:bg-[#1e2533]/20">
                <td className="py-3 text-[#8b949e] text-xs font-medium">{row.section}</td>
                <td className="py-3 text-[#c9d1d9] text-xs">{row.requirement}</td>
                <td className="py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                    background: statusColor(row.status) + "22",
                    color: statusColor(row.status),
                  }}>{row.status}</span>
                </td>
                <td className="py-3 text-xs text-[#57606a]">{row.lastAudit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
