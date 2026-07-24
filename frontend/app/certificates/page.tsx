"use client";
import { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle2, Search, Calendar, User, Building, ShieldAlert, Clock, TrendingDown } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Certificate {
  id: string;
  certificateId: string;
  name: string;
  certificateName: string;
  asset: string;
  assetId: string;
  issuer: string;
  expiresIn: number;
  remainingDays: number;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired";
  owner: string;
  type: string;
  services: string[];
}

export default function CertificateIntelligence() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${API}/certificates`)
      .then((r) => r.json())
      .then((data) => {
        setCerts(data);
        if (data.length > 0) setSelected(data[0]);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const filteredCerts = certs.filter((c) => {
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.asset.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const total = certs.length;
  const active = certs.filter((c) => c.status === "Active").length;
  const expiring = certs.filter((c) => c.status === "Expiring Soon").length;
  const expired = certs.filter((c) => c.status === "Expired").length;

  const getStatusColor = (status: string) => {
    if (status === "Active") return "#22c55e";
    if (status === "Expiring Soon") return "#f97316";
    return "#ef4444";
  };

  const getStatusBg = (status: string) => {
    if (status === "Active") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status === "Expiring Soon") return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  const urgencyBar = (days: number) => {
    if (days <= 0) return 100;
    if (days >= 365) return 0;
    return Math.round((1 - days / 365) * 100);
  };

  return (
    <div className="p-8 space-y-6 min-h-screen" style={{ background: "linear-gradient(135deg, #0d1117 0%, #0f1622 100%)" }}>
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">Trust &amp; Security Policy</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
              <Shield size={18} className="text-[#3b82f6]" />
            </div>
            Certificate Intelligence
          </h1>
          <p className="text-[#57606a] text-sm mt-1 ml-11">Digital certificates inventory, status tracking, and expiration alerts</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Certificates", value: total, sub: "Monitored endpoints", color: "#3b82f6", gradient: "linear-gradient(135deg, #161b27, #0f1622)", border: "#1e2533" },
          { label: "Active", value: active, sub: "Healthy TLS/mTLS", color: "#22c55e", gradient: "linear-gradient(135deg, #0d2118, #0a1810)", border: "rgba(34,197,94,0.3)" },
          { label: "Expiring Soon", value: expiring, sub: "Renew within 30 days", color: "#f97316", gradient: "linear-gradient(135deg, #1f1408, #150e05)", border: "rgba(249,115,22,0.3)" },
          { label: "Expired", value: expired, sub: "Immediate attention", color: "#ef4444", gradient: "linear-gradient(135deg, #1f0b0b, #150707)", border: "rgba(239,68,68,0.3)" },
        ].map(({ label, value, sub, color, gradient, border }) => (
          <div key={label} className="rounded-xl p-5 relative overflow-hidden" style={{ background: gradient, border: `1px solid ${border}` }}>
            <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full opacity-10" style={{ background: color }} />
            <div className="text-xs font-semibold mb-2" style={{ color }}>{label}</div>
            <div className="text-3xl font-black text-white">{loading ? "..." : value}</div>
            <div className="text-xs text-[#57606a] mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Filters and Table/Details Split */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main List */}
        <div className="col-span-2 rounded-xl border border-[#1e2533] p-6 space-y-4" style={{ background: "#161b27" }}>
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-sm font-semibold text-white">Certificate Inventory</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#57606a]" />
                <input
                  type="text"
                  placeholder="Search name, owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#0f1117] border border-[#1e2533] rounded-lg px-3 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-[#3b82f6] w-44 transition-colors"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0f1117] border border-[#1e2533] rounded-lg px-3 py-1.5 text-xs text-[#8b949e] focus:outline-none focus:border-[#3b82f6] transition-colors"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="overflow-auto max-h-[500px] -mx-2 px-2">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0" style={{ background: "#161b27" }}>
                <tr className="text-[#57606a] border-b border-[#1e2533] text-xs uppercase tracking-wider">
                  <th className="py-2 pb-3 font-semibold">Certificate Name</th>
                  <th className="py-2 pb-3 font-semibold">Owner</th>
                  <th className="py-2 pb-3 text-center font-semibold">Days Left</th>
                  <th className="py-2 pb-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-12 text-center text-[#57606a]">
                    <Shield size={24} className="mx-auto mb-2 opacity-40 animate-pulse" />
                    Loading certificates...
                  </td></tr>
                ) : filteredCerts.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-[#57606a]">No certificates found.</td></tr>
                ) : (
                  filteredCerts.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`border-b border-[#1e2533]/40 hover:bg-[#1e2533]/40 cursor-pointer transition-all duration-150 ${selected?.id === c.id ? "bg-[#1e2533]/60" : ""}`}
                    >
                      <td className="py-3 pr-2 text-white font-medium truncate max-w-[200px]">{c.name}</td>
                      <td className="py-3 text-[#8b949e] text-xs">{c.owner}</td>
                      <td className="py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono text-xs font-bold" style={{ color: getStatusColor(c.status) }}>{c.remainingDays}</span>
                          <div className="w-12 h-1 rounded-full overflow-hidden bg-[#0f1117]">
                            <div className="h-full rounded-full" style={{
                              width: `${urgencyBar(c.remainingDays)}%`,
                              background: getStatusColor(c.status),
                            }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getStatusBg(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="rounded-xl border border-[#1e2533] p-6 space-y-5" style={{ background: "#161b27" }}>
          {selected ? (
            <>
              <div>
                <span className="text-[10px] text-[#57606a] uppercase tracking-wider font-semibold">Certificate Details</span>
                <h3 className="text-base font-bold text-white mt-1 break-all leading-snug">{selected.name}</h3>
                <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border mt-2 font-semibold ${getStatusBg(selected.status)}`}>
                  {selected.status === "Active" ? <CheckCircle2 size={10} /> : <ShieldAlert size={10} />}
                  {selected.status}
                </span>
              </div>

              {/* Urgency ring */}
              {selected.status !== "Active" && (
                <div className="rounded-lg p-3 flex items-center gap-3" style={{
                  background: getStatusColor(selected.status) + "15",
                  border: `1px solid ${getStatusColor(selected.status)}30`
                }}>
                  <Clock size={14} style={{ color: getStatusColor(selected.status) }} />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: getStatusColor(selected.status) }}>
                      {selected.remainingDays <= 0 ? "Certificate Expired" : `Expires in ${selected.remainingDays} days`}
                    </div>
                    <div className="text-[10px] text-[#57606a] mt-0.5">Action required</div>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs border-t border-[#1e2533] pt-4">
                <div>
                  <div className="text-[#57606a] flex items-center gap-1.5 mb-1">
                    <Building size={12} /> Target Asset
                  </div>
                  <div className="text-white font-medium">{selected.asset}</div>
                  <div className="text-[#8b949e] text-[10px] font-mono mt-0.5 bg-[#0f1117] px-2 py-1 rounded mt-1">ID: {selected.assetId}</div>
                </div>

                <div>
                  <div className="text-[#57606a] flex items-center gap-1.5 mb-1">
                    <User size={12} /> Owner / Department
                  </div>
                  <div className="text-white font-medium">{selected.owner}</div>
                </div>

                <div>
                  <div className="text-[#57606a] flex items-center gap-1.5 mb-1">
                    <Calendar size={12} /> Expiry Configuration
                  </div>
                  <div className="text-white font-medium">Valid until: {selected.expiryDate}</div>
                  <div className="text-[#8b949e] mt-0.5">
                    Remaining: <span className="font-bold" style={{ color: getStatusColor(selected.status) }}>{selected.remainingDays} days</span>
                  </div>
                </div>

                <div>
                  <div className="text-[#57606a] flex items-center gap-1.5 mb-1">
                    <Shield size={12} /> Certificate Issuer &amp; Type
                  </div>
                  <div className="text-white font-medium">{selected.issuer}</div>
                  <div className="text-[#8b949e] text-[10px] font-mono mt-0.5">{selected.type} Certificate</div>
                </div>

                <div>
                  <div className="text-[#57606a] mb-2 font-medium">Affected Business Services</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.services.map((svc) => (
                      <span key={svc} className="bg-[#0f1117] text-[#c9d1d9] px-2 py-1 rounded-md text-[10px] border border-[#1e2533] font-medium">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-[#57606a] text-xs">
              <Shield size={32} className="mx-auto mb-3 text-[#57606a] opacity-40" />
              Select a certificate to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
