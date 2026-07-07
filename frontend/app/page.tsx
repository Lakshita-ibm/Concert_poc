"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Server, Shield, Bug, Activity, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar, PieChart, Pie, Legend
} from "recharts";

const API = "http://localhost:8000/api";

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
    fetch(`${API}/dashboard/kpis`).then(r => r.json()).then(setKpis).catch(() => {});
    fetch(`${API}/services`).then(r => r.json()).then((data) => {
      setServices(data);
      const dist: Record<string, number> = {};
      fetch(`${API}/vulnerabilities`).then(r => r.json()).then((vulns) => {
        vulns.forEach((v: any) => { dist[v.severity] = (dist[v.severity] || 0) + 1; });
        setVulnDist(Object.entries(dist).map(([severity, count]) => ({ severity, count })));
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const kpiCards = [
    { label: "Critical Risks", value: kpis.criticalRisks, icon: AlertTriangle, color: "#ef4444", bg: "#2d1b1b" },
    { label: "Affected Services", value: kpis.affectedServices, icon: Server, color: "#f97316", bg: "#2d1e10" },
    { label: "Expired Certificates", value: kpis.expiredCertificates, icon: Shield, color: "#eab308", bg: "#2d2710" },
    { label: "High CVEs", value: kpis.highCVEs, icon: Bug, color: "#a855f7", bg: "#1f1533" },
    { label: "Compliance Drift", value: kpis.complianceDrift, icon: Activity, color: "#3b82f6", bg: "#0f1d3a" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-xs text-red-400 font-medium uppercase tracking-widest">Live Risk Monitor</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Executive Risk Dashboard</h1>
        <p className="text-[#57606a] text-sm mt-1">Punjab & Sind Bank — Digital Services Risk Intelligence</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-[#1e2533] p-5" style={{ background: bg }}>
            <div className="flex items-center justify-between mb-3">
              <Icon size={20} style={{ color }} />
              <span className="text-xs text-[#57606a]">PSB</span>
            </div>
            <div className="text-3xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs text-[#8b949e] mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Risk Distribution */}
        <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#3b82f6]" /> Risk Distribution by Severity
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vulnDist} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fill: "#57606a", fontSize: 12 }} />
              <YAxis dataKey="severity" type="category" tick={{ fill: "#8b949e", fontSize: 12 }} width={70} />
              <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #1e2533", color: "#fff" }} />
              <Bar dataKey="count" radius={4}>
                {vulnDist.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] || "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Business Services Risk */}
        <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Server size={16} className="text-[#3b82f6]" /> Business Services Risk Score
          </h2>
          <div className="space-y-3">
            {services.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-28 text-xs text-[#8b949e] truncate">{s.name}</div>
                <div className="flex-1 bg-[#1e2533] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${s.riskScore}%`,
                      background: s.riskScore >= 80 ? "#ef4444" : s.riskScore >= 65 ? "#f97316" : "#22c55e",
                    }}
                  />
                </div>
                <div className="w-8 text-xs font-bold" style={{
                  color: s.riskScore >= 80 ? "#ef4444" : s.riskScore >= 65 ? "#f97316" : "#22c55e"
                }}>{s.riskScore}</div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                  background: (STATUS_COLORS[s.status] || "#22c55e") + "22",
                  color: STATUS_COLORS[s.status] || "#22c55e"
                }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Service Health Overview</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#57606a] border-b border-[#1e2533]">
              <th className="text-left py-2 font-medium">Service</th>
              <th className="text-left py-2 font-medium">Status</th>
              <th className="text-left py-2 font-medium">Risk Score</th>
              <th className="text-left py-2 font-medium">Uptime</th>
              <th className="text-left py-2 font-medium">Active Incidents</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.name} className="border-b border-[#1e2533]/50 hover:bg-[#1e2533]/30">
                <td className="py-3 text-white font-medium">{s.name}</td>
                <td className="py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                    background: (STATUS_COLORS[s.status] || "#22c55e") + "22",
                    color: STATUS_COLORS[s.status] || "#22c55e"
                  }}>{s.status}</span>
                </td>
                <td className="py-3">
                  <span className="font-bold" style={{
                    color: s.riskScore >= 80 ? "#ef4444" : s.riskScore >= 65 ? "#f97316" : "#22c55e"
                  }}>{s.riskScore}</span>
                </td>
                <td className="py-3 text-[#8b949e]">{s.uptime}</td>
                <td className="py-3">
                  <span className={s.incidents > 0 ? "text-red-400 font-semibold" : "text-[#57606a]"}>
                    {s.incidents}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
