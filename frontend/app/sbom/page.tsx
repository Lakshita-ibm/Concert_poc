"use client";
import { useEffect, useState } from "react";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";

const API = "http://localhost:8000/api";

const mockSbom = [
  {
    id: "sb1", application: "Mobile Banking", version: "4.2.1",
    impactedServices: ["Mobile Banking", "UPI", "API Layer"],
    totalComponents: 47, criticalComponents: 1, highComponents: 2,
    components: [
      { name: "Spring Boot", version: "2.7.5", license: "Apache-2.0", riskLevel: "Medium", cve: "CVE-2024-8888", cvss: 7.8 },
      { name: "Log4j", version: "2.14.1", license: "Apache-2.0", riskLevel: "Critical", cve: "CVE-2024-4040", cvss: 10.0 },
      { name: "OpenSSL", version: "1.1.1t", license: "OpenSSL", riskLevel: "Low", cve: null, cvss: null },
      { name: "PostgreSQL Driver", version: "42.5.0", license: "BSD-2", riskLevel: "Low", cve: null, cvss: null },
      { name: "Jackson Databind", version: "2.13.4", license: "Apache-2.0", riskLevel: "Medium", cve: null, cvss: null },
    ],
  },
  {
    id: "sb2", application: "UPI Gateway", version: "3.1.0",
    impactedServices: ["UPI", "ATM", "AEPS", "Mobile Banking", "Net Banking"],
    totalComponents: 23, criticalComponents: 1, highComponents: 1,
    components: [
      { name: "Kong Gateway", version: "3.3.0", license: "Apache-2.0", riskLevel: "Critical", cve: "CVE-2025-1111", cvss: 9.8 },
      { name: "Nginx", version: "1.24.0", license: "BSD-2", riskLevel: "Low", cve: null, cvss: null },
      { name: "LuaJIT", version: "2.1.0", license: "MIT", riskLevel: "Low", cve: null, cvss: null },
      { name: "OpenSSL", version: "3.0.8", license: "OpenSSL", riskLevel: "Low", cve: null, cvss: null },
    ],
  },
  {
    id: "sb3", application: "AEPS Service", version: "2.0.4",
    impactedServices: ["AEPS"],
    totalComponents: 31, criticalComponents: 0, highComponents: 1,
    components: [
      { name: "Node.js", version: "18.12.0", license: "MIT", riskLevel: "Medium", cve: "CVE-2024-9999", cvss: 7.5 },
      { name: "Express", version: "4.18.2", license: "MIT", riskLevel: "Low", cve: null, cvss: null },
      { name: "Passport.js", version: "0.6.0", license: "MIT", riskLevel: "Low", cve: null, cvss: null },
    ],
  },
];

const RISK_COLOR: Record<string, string> = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };

export default function SBOM() {
  const [sbom, setSbom] = useState(mockSbom);
  const [selected, setSelected] = useState(mockSbom[0]);

  useEffect(() => {
    fetch(`${API}/sbom`).then(r => r.json()).then(setSbom).catch(() => {});
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package size={24} className="text-[#3b82f6]" /> SBOM Intelligence
        </h1>
        <p className="text-[#57606a] text-sm mt-1">Software Bill of Materials — Component Risk Analysis</p>
      </div>

      {/* App Tabs */}
      <div className="flex gap-3">
        {sbom.map((s) => (
          <button key={s.id} onClick={() => setSelected(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selected.id === s.id ? "bg-[#1a2540] border-[#3b82f6] text-white" : "border-[#1e2533] text-[#8b949e] hover:border-[#3b82f6]/50 bg-[#161b27]"}`}>
            {s.application}
            {s.criticalComponents > 0 && (
              <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                {s.criticalComponents} Critical
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="space-y-4">
          <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-5">
            <div className="text-xs text-[#57606a] mb-3">Application</div>
            <div className="text-white font-bold">{selected.application}</div>
            <div className="text-[#57606a] text-xs">v{selected.version}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-3 text-center">
              <div className="text-xl font-bold text-white">{selected.totalComponents}</div>
              <div className="text-xs text-[#57606a]">Total</div>
            </div>
            <div className="bg-[#2d1b1b] rounded-xl border border-red-900/30 p-3 text-center">
              <div className="text-xl font-bold text-red-400">{selected.criticalComponents}</div>
              <div className="text-xs text-[#57606a]">Critical</div>
            </div>
            <div className="bg-[#2d1e10] rounded-xl border border-orange-900/30 p-3 text-center">
              <div className="text-xl font-bold text-orange-400">{selected.highComponents}</div>
              <div className="text-xs text-[#57606a]">High</div>
            </div>
          </div>
          <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-5">
            <div className="text-xs text-[#57606a] mb-2">Impacted Services</div>
            {selected.impactedServices.map(s => (
              <div key={s} className="text-xs text-[#c9d1d9] bg-[#0f1117] rounded px-2 py-1 mb-1">{s}</div>
            ))}
          </div>
        </div>

        {/* Component Table */}
        <div className="col-span-2 bg-[#161b27] rounded-xl border border-[#1e2533] p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Component Risk Analysis</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#57606a] border-b border-[#1e2533] text-xs">
                <th className="text-left py-2 font-medium">Component</th>
                <th className="text-left py-2 font-medium">Version</th>
                <th className="text-left py-2 font-medium">License</th>
                <th className="text-left py-2 font-medium">Risk</th>
                <th className="text-left py-2 font-medium">CVE</th>
                <th className="text-left py-2 font-medium">CVSS</th>
              </tr>
            </thead>
            <tbody>
              {selected.components.map((c) => (
                <tr key={c.name} className={`border-b border-[#1e2533]/50 hover:bg-[#1e2533]/20 ${c.riskLevel === "Critical" ? "bg-red-950/10" : ""}`}>
                  <td className="py-3 text-white font-medium flex items-center gap-2">
                    {c.riskLevel === "Critical" ? <AlertTriangle size={12} className="text-red-400" /> :
                     c.riskLevel === "Low" ? <CheckCircle size={12} className="text-green-500" /> : null}
                    {c.name}
                  </td>
                  <td className="py-3 text-[#8b949e] font-mono text-xs">{c.version}</td>
                  <td className="py-3 text-[#57606a] text-xs">{c.license}</td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                      background: RISK_COLOR[c.riskLevel] + "22",
                      color: RISK_COLOR[c.riskLevel],
                    }}>{c.riskLevel}</span>
                  </td>
                  <td className="py-3 text-xs font-mono" style={{ color: c.cve ? "#f97316" : "#57606a" }}>
                    {c.cve || "—"}
                  </td>
                  <td className="py-3 text-xs font-bold" style={{ color: c.cvss ? (c.cvss >= 9 ? "#ef4444" : c.cvss >= 7 ? "#f97316" : "#eab308") : "#57606a" }}>
                    {c.cvss ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
