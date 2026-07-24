"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Server, Shield, Bug, Activity, TrendingUp, ArrowUpRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const STATUS_COLORS: Record<string, string> = {
  Degraded: "#ef4444",
  Warning: "#f97316",
  Healthy: "#22c55e",
};

const mock_kpis = { criticalRisks: 15, affectedServices: 7, expiredCertificates: 3, highCVEs: 29, complianceDrift: 4 };
const mock_services = [
  { name: "UPI", riskScore: 92, status: "Degraded", uptime: "98.1%", incidents: 3 },
  { name: "ATM", riskScore: 78, status: "Warning", uptime: "99.2%", incidents: 1 },
  { name: "AEPS", riskScore: 65, status: "Healthy", uptime: "99.7%", incidents: 0 },
  { name: "Mobile Banking", riskScore: 71, status: "Warning", uptime: "99.4%", incidents: 2 },
  { name: "Net Banking", riskScore: 67, status: "Healthy", uptime: "99.6%", incidents: 1 },
];
const mock_vulns = [
  { severity: "Critical", count: 3 }, { severity: "High", count: 8 },
  { severity: "Medium", count: 11 }, { severity: "Low", count: 5 },
];

export default function Dashboard() {
  const [kpis, setKpis] = useState(mock_kpis);
  const [services, setServices] = useState(mock_services);
  const [vulnDist, setVulnDist] = useState(mock_vulns);

  useEffect(() => {
    fetch(`${API}/dashboard/kpis`).then(r => r.json()).then(setKpis).catch(() => { });
    fetch(`${API}/services`).then(r => r.json()).then((data) => {
      setServices(data);
      fetch(`${API}/vulnerabilities`).then(r => r.json()).then((vulns) => {
        const dist: Record<string, number> = {};
        vulns.forEach((v: any) => { dist[v.severity] = (dist[v.severity] || 0) + 1; });
        setVulnDist(Object.entries(dist).map(([severity, count]) => ({ severity, count })));
      }).catch(() => { });
    }).catch(() => { });
  }, []);

  const kpiCards = [
    { label: "Critical Risks", value: kpis.criticalRisks, icon: AlertTriangle, color: "#ef4444", gradient: "linear-gradient(135deg, #2d1b1b, #1a0f0f)" },
    { label: "Affected Services", value: kpis.affectedServices, icon: Server, color: "#f97316", gradient: "linear-gradient(135deg, #2d1e10, #1a1008)" },
    { label: "Expired Certs", value: kpis.expiredCertificates, icon: Shield, color: "#eab308", gradient: "linear-gradient(135deg, #2d2710, #1a1808)" },
    { label: "High CVEs", value: kpis.highCVEs, icon: Bug, color: "#a855f7", gradient: "linear-gradient(135deg, #1f1533, #130d22)" },
    { label: "Compliance Drift", value: kpis.complianceDrift, icon: Activity, color: "#3b82f6", gradient: "linear-gradient(135deg, #0f1d3a, #08122a)" },
  ];

  return (
    <div className="p-8 min-h-screen" style={{ background: "linear-gradient(135deg, #0d1117 0%, #0f1622 100%)" }}>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs text-red-400 font-semibold uppercase tracking-widest">Live Risk Monitor</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Executive Risk Dashboard</h1>
          <p className="text-[#57606a] text-sm mt-1">Punjab &amp; Sind Bank: Digital Services Risk Intelligence</p>
        </div>
        <div className="text-xs text-[#57606a] bg-[#161b27] border border-[#1e2533] rounded-lg px-3 py-2">
          Last updated: <span className="text-[#8b949e]">Just now</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {kpiCards.map(({ label, value, icon: Icon, color, gradient }) => (
          <div key={label} className="rounded-xl border border-[#1e2533] p-5 relative overflow-hidden group hover:border-opacity-60 transition-all duration-200"
            style={{ background: gradient }}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10" style={{ background: color }} />
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg" style={{ background: color + "22" }}>
                <Icon size={16} style={{ color }} />
              </div>
              <ArrowUpRight size={14} className="text-[#57606a] group-hover:text-white transition-colors" />
            </div>
            <div className="text-3xl font-black" style={{ color }}>{value}</div>
            <div className="text-xs text-[#8b949e] mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Risk Distribution */}
        <div className="rounded-xl border border-[#1e2533] p-6" style={{ background: "#161b27" }}>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#3b82f6]" /> Risk Distribution by Severity
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vulnDist} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fill: "#57606a", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="severity" type="category" tick={{ fill: "#8b949e", fontSize: 12 }} width={70} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #1e2533", borderRadius: "8px", color: "#fff", fontSize: "12px" }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" radius={6}>
                {vulnDist.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] || "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Business Services Risk */}
        <div className="rounded-xl border border-[#1e2533] p-6" style={{ background: "#161b27" }}>
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Server size={16} className="text-[#3b82f6]" /> Business Services Risk Score
          </h2>
          <div className="space-y-4">
            {services.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-28 text-xs text-[#8b949e] truncate font-medium">{s.name}</div>
                <div className="flex-1 bg-[#0f1117] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${s.riskScore}%`,
                      background: s.riskScore >= 80
                        ? "linear-gradient(90deg, #dc2626, #ef4444)"
                        : s.riskScore >= 65
                          ? "linear-gradient(90deg, #ea580c, #f97316)"
                          : "linear-gradient(90deg, #16a34a, #22c55e)",
                    }}
                  />
                </div>
                <div className="w-8 text-xs font-bold text-right" style={{
                  color: s.riskScore >= 80 ? "#ef4444" : s.riskScore >= 65 ? "#f97316" : "#22c55e"
                }}>{s.riskScore}</div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium w-20 text-center" style={{
                  background: (STATUS_COLORS[s.status] || "#22c55e") + "22",
                  color: STATUS_COLORS[s.status] || "#22c55e"
                }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-xl border border-[#1e2533] p-6" style={{ background: "#161b27" }}>
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-[#22c55e]" /> Service Health Overview
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#57606a] border-b border-[#1e2533] text-xs uppercase tracking-wider">
              <th className="text-left py-2 pb-3 font-semibold">Service</th>
              <th className="text-left py-2 pb-3 font-semibold">Status</th>
              <th className="text-left py-2 pb-3 font-semibold">Risk Score</th>
              <th className="text-left py-2 pb-3 font-semibold">Uptime</th>
              <th className="text-left py-2 pb-3 font-semibold">Active Incidents</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, idx) => (
              <tr key={s.name} className={`border-b border-[#1e2533]/50 hover:bg-[#1e2533]/30 transition-colors ${idx === services.length - 1 ? "border-b-0" : ""}`}>
                <td className="py-3 text-white font-semibold">{s.name}</td>
                <td className="py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                    background: (STATUS_COLORS[s.status] || "#22c55e") + "22",
                    color: STATUS_COLORS[s.status] || "#22c55e"
                  }}>{s.status}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#0f1117] rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${s.riskScore}%`,
                        background: s.riskScore >= 80 ? "#ef4444" : s.riskScore >= 65 ? "#f97316" : "#22c55e"
                      }} />
                    </div>
                    <span className="font-bold text-xs" style={{
                      color: s.riskScore >= 80 ? "#ef4444" : s.riskScore >= 65 ? "#f97316" : "#22c55e"
                    }}>{s.riskScore}</span>
                  </div>
                </td>
                <td className="py-3 text-[#8b949e] font-mono text-sm">{s.uptime}</td>
                <td className="py-3">
                  {s.incidents > 0 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500/10 text-red-400 border border-red-500/20">{s.incidents} active</span>
                  ) : (
                    <span className="text-xs text-[#57606a]">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
