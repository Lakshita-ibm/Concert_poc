"use client";
import { useEffect, useState } from "react";
import { Bug, ShieldAlert, Search, Shield, Activity, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Vulnerability {
  id: string;
  cve: string;
  cveId: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  asset: string;
  assetId: string;
  description: string;
  cvss: number;
  riskScore: number;
  status: "Open" | "In Progress" | "Resolved";
  daysOpen: number;
  affectedServices: string[];
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

export default function VulnerabilityIntelligence() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [selected, setSelected] = useState<Vulnerability | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${API}/vulnerabilities`)
      .then((r) => r.json())
      .then((data) => {
        setVulns(data);
        if (data.length > 0) setSelected(data[0]);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const filteredVulns = vulns.filter((v) => {
    const matchesSeverity = filterSeverity === "All" || v.severity === filterSeverity;
    const matchesSearch =
      v.cve.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const total = vulns.length;
  const critical = vulns.filter((v) => v.severity === "Critical").length;
  const high = vulns.filter((v) => v.severity === "High").length;
  const medium = vulns.filter((v) => v.severity === "Medium").length;
  const low = vulns.filter((v) => v.severity === "Low").length;

  const chartData = [
    { name: "Critical", value: critical, color: SEVERITY_COLORS.Critical },
    { name: "High", value: high, color: SEVERITY_COLORS.High },
    { name: "Medium", value: medium, color: SEVERITY_COLORS.Medium },
    { name: "Low", value: low, color: SEVERITY_COLORS.Low },
  ].filter((d) => d.value > 0);

  const getStatusColor = (status: string) => {
    if (status === "Resolved") return "#22c55e";
    if (status === "In Progress") return "#f97316";
    return "#ef4444";
  };

  const getStatusBg = (status: string) => {
    if (status === "Resolved") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status === "In Progress") return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  return (
    <div className="p-8 space-y-6 min-h-screen" style={{ background: "linear-gradient(135deg, #0d1117 0%, #0f1622 100%)" }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-xs text-purple-400 font-semibold uppercase tracking-widest">Continuous Vulnerability Scanning</span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
            <Bug size={18} className="text-[#a855f7]" />
          </div>
          Vulnerability Intelligence
        </h1>
        <p className="text-[#57606a] text-sm mt-1 ml-11">CVE assessment, vulnerability severities distribution, and remediation mapping</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Total CVEs", value: total, sub: "Active scanned libraries", color: "#3b82f6", gradient: "linear-gradient(135deg, #161b27, #0f1622)", border: "#1e2533" },
          { label: "Critical (9.0+)", value: critical, sub: "Immediate hotfix", color: "#ef4444", gradient: "linear-gradient(135deg, #1f0b0b, #150707)", border: "rgba(239,68,68,0.3)" },
          { label: "High (7.0-8.9)", value: high, sub: "Remediate in 30 days", color: "#f97316", gradient: "linear-gradient(135deg, #1f1408, #150e05)", border: "rgba(249,115,22,0.3)" },
          { label: "Medium (4.0-6.9)", value: medium, sub: "Remediate in 60-90 days", color: "#eab308", gradient: "linear-gradient(135deg, #1f1c08, #151205)", border: "rgba(234,179,8,0.3)" },
          { label: "Low (0.1-3.9)", value: low, sub: "Monitor &amp; upgrade", color: "#22c55e", gradient: "linear-gradient(135deg, #0d2118, #0a1810)", border: "rgba(34,197,94,0.3)" },
        ].map(({ label, value, sub, color, gradient, border }) => (
          <div key={label} className="rounded-xl p-5 relative overflow-hidden" style={{ background: gradient, border: `1px solid ${border}` }}>
            <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full opacity-10" style={{ background: color }} />
            <div className="text-xs font-semibold mb-2" style={{ color }}>{label}</div>
            <div className="text-3xl font-black text-white">{loading ? "..." : value}</div>
            <div className="text-xs text-[#57606a] mt-1" dangerouslySetInnerHTML={{ __html: sub }} />
          </div>
        ))}
      </div>

      {/* Chart + Table row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Severity Donut Chart */}
        <div className="rounded-xl border border-[#1e2533] p-6 flex flex-col items-center" style={{ background: "#161b27" }}>
          <h2 className="text-sm font-semibold text-white mb-4 w-full text-left">Severity Distribution</h2>
          <div className="w-full h-44 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-[#57606a]">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #1e2533", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{total}</span>
              <span className="text-[10px] text-[#57606a] uppercase tracking-wide">Scanned</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full mt-4 border-t border-[#1e2533] pt-4 text-center">
            {chartData.map((d) => (
              <div key={d.name}>
                <div className="text-sm font-black" style={{ color: d.color }}>{d.value}</div>
                <div className="text-[10px] text-[#57606a]">{d.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vuln Table */}
        <div className="col-span-2 rounded-xl border border-[#1e2533] p-6 space-y-4" style={{ background: "#161b27" }}>
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-sm font-semibold text-white">Vulnerability Inventory</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#57606a]" />
                <input type="text" placeholder="Search CVE, asset..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#0f1117] border border-[#1e2533] rounded-lg px-3 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-[#3b82f6] w-44 transition-colors"
                />
              </div>
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-[#0f1117] border border-[#1e2533] rounded-lg px-3 py-1.5 text-xs text-[#8b949e] focus:outline-none focus:border-[#3b82f6]">
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="overflow-auto max-h-[300px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0" style={{ background: "#161b27" }}>
                <tr className="text-[#57606a] border-b border-[#1e2533] text-xs uppercase tracking-wider">
                  <th className="py-2 pb-3 font-semibold">CVE ID</th>
                  <th className="py-2 pb-3 font-semibold">Target Asset</th>
                  <th className="py-2 pb-3 text-center font-semibold">CVSS</th>
                  <th className="py-2 pb-3 text-center font-semibold">Status</th>
                  <th className="py-2 pb-3 text-right font-semibold">Age</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-12 text-center text-[#57606a]">Loading vulnerabilities...</td></tr>
                ) : filteredVulns.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-[#57606a]">No vulnerabilities found.</td></tr>
                ) : (
                  filteredVulns.map((v) => (
                    <tr key={v.id} onClick={() => setSelected(v)}
                      className={`border-b border-[#1e2533]/40 hover:bg-[#1e2533]/40 cursor-pointer transition-all duration-150 ${selected?.id === v.id ? "bg-[#1e2533]/60" : ""}`}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[v.severity] }} />
                          <span className="text-white font-semibold font-mono text-xs">{v.cve}</span>
                        </div>
                      </td>
                      <td className="py-3 text-[#8b949e] max-w-[150px] truncate text-xs">{v.asset}</td>
                      <td className="py-3 text-center font-black text-sm" style={{ color: SEVERITY_COLORS[v.severity] }}>
                        {v.cvss.toFixed(1)}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getStatusBg(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[#57606a] text-xs font-mono">{v.daysOpen}d</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Selected CVE Detail Panel */}
      {selected && (
        <div className="rounded-xl border border-[#1e2533] p-6 grid grid-cols-3 gap-6" style={{ background: "#161b27" }}>
          <div className="space-y-4">
            <span className="text-[10px] text-[#57606a] uppercase tracking-wider font-semibold">Active Vulnerability Analysis</span>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <ShieldAlert size={20} style={{ color: SEVERITY_COLORS[selected.severity] }} />
              {selected.cve}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase" style={{
                background: SEVERITY_COLORS[selected.severity] + "22",
                color: SEVERITY_COLORS[selected.severity],
                border: `1px solid ${SEVERITY_COLORS[selected.severity]}33`
              }}>{selected.severity} Severity</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getStatusBg(selected.status)}`}>
                {selected.status}
              </span>
            </div>
            <div className="rounded-xl p-4" style={{ background: SEVERITY_COLORS[selected.severity] + "10", border: `1px solid ${SEVERITY_COLORS[selected.severity]}25` }}>
              <div className="text-[10px] text-[#57606a] mb-1 uppercase tracking-wide">CVSS v3.1 Base Score</div>
              <div className="text-4xl font-black" style={{ color: SEVERITY_COLORS[selected.severity] }}>
                {selected.cvss.toFixed(1)}
              </div>
              <div className="w-full bg-[#1e2533] rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(selected.cvss / 10) * 100}%`, background: SEVERITY_COLORS[selected.severity] }} />
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-4 border-l border-[#1e2533] pl-6">
            <div>
              <h3 className="text-xs text-[#57606a] font-medium flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                <Info size={12} /> Description
              </h3>
              <p className="text-sm text-[#c9d1d9] leading-relaxed">{selected.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#0f1117] rounded-lg p-3 border border-[#1e2533]">
                <span className="text-[#57606a] block mb-1 uppercase tracking-wide text-[10px]">Scanned Target Asset</span>
                <span className="text-white font-semibold">{selected.asset}</span>
                <span className="text-[#57606a] block text-[10px] font-mono mt-1">ID: {selected.assetId}</span>
              </div>
              <div className="bg-[#0f1117] rounded-lg p-3 border border-[#1e2533]">
                <span className="text-[#57606a] block mb-1 uppercase tracking-wide text-[10px]">Detection History</span>
                <span className="text-white font-semibold">Open for {selected.daysOpen} days</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs text-[#57606a] font-medium flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                <Activity size={12} /> Impacted Business Services
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selected.affectedServices.map((svc) => (
                  <span key={svc} className="bg-[#0f1117] text-[#c9d1d9] px-2 py-1 rounded-md text-[10px] border border-[#1e2533] font-medium">
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #0f1d2a, #0a1520)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <h4 className="text-xs text-[#3b82f6] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield size={12} /> Recommended Remediation
              </h4>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Apply vendor security patch or upgrade libraries immediately to address security exposure.
                Rotate secrets or credentials associated with <span className="text-white font-medium">{selected.asset}</span> if compromised.
                Monitor logs for suspicious traffic patterns.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
