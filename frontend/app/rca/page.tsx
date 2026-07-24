"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Zap, Shield, ChevronRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const mockIncidents = [
  {
    id: "i1", title: "UPI Transaction Failures: Peak Hour", service: "UPI", severity: "Critical",
    status: "Open", timestamp: "2025-07-10T09:23:00Z",
    rootCause: "Expired API Certificate on UPI Gateway", confidence: 96,
    chain: [
      { step: 1, event: "Alert Detected", detail: "200+ UPI transaction failures reported" },
      { step: 2, event: "Certificate Expired", detail: "upi-gateway.psb.in TLS certificate expired" },
      { step: 3, event: "API Gateway Failure", detail: "Kong API Gateway rejecting TLS handshakes" },
      { step: 4, event: "UPI Service Impacted", detail: "UPI service degraded: 877 branches affected" },
    ],
    recommendation: "Renew upi-gateway.psb.in certificate immediately. Patch CVE-2025-1111 within 24 hours.",
  },
  {
    id: "i2", title: "ATM Network Intermittent Connectivity", service: "ATM", severity: "High",
    status: "In Progress", timestamp: "2025-07-09T14:10:00Z",
    rootCause: "Buffer overflow vulnerability in ATM Switch firmware", confidence: 87,
    chain: [
      { step: 1, event: "Alert Detected", detail: "ATM connectivity alerts from 50 locations" },
      { step: 2, event: "Firmware Exploit", detail: "CVE-2025-0890 triggered buffer overflow" },
      { step: 3, event: "ATM Switch Instability", detail: "ATM Switch rebooting intermittently" },
      { step: 4, event: "ATM Service Impacted", detail: "500 ATMs experiencing intermittent outages" },
    ],
    recommendation: "Apply firmware patch for CVE-2025-0890. Schedule maintenance window within 48 hours.",
  },
  {
    id: "i3", title: "Mobile Banking Login Degradation", service: "Mobile Banking", severity: "High",
    status: "Resolved", timestamp: "2025-07-08T18:45:00Z",
    rootCause: "Log4j CVE-2024-4040 exploited in authentication service", confidence: 91,
    chain: [
      { step: 1, event: "Alert Detected", detail: "Login failures spike: 3.5M users affected" },
      { step: 2, event: "CVE Exploited", detail: "CVE-2024-4040 Log4j exploit in auth service" },
      { step: 3, event: "Auth Service Down", detail: "Authentication microservice crashed" },
      { step: 4, event: "Mobile Banking Impacted", detail: "Users unable to login for 45 minutes" },
    ],
    recommendation: "Upgrade Log4j to 2.17.1+. Rotate auth service secrets.",
  },
];

// Sanitize em-dashes from API data
function cleanTitle(title: string) {
  return title.replace(/\s*—\s*/g, ": ").replace(/\s*--\s*/g, ": ");
}

const SEV_COLOR: Record<string, string> = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308" };
const STATUS_COLOR: Record<string, string> = { Open: "#ef4444", "In Progress": "#f97316", Resolved: "#22c55e" };
const STEP_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#ef4444"];

export default function RCA() {
  const [incidents, setIncidents] = useState(mockIncidents);
  const [selected, setSelected] = useState<typeof mockIncidents[0] | null>(mockIncidents[0]);

  useEffect(() => {
    fetch(`${API}/incidents`)
      .then(r => r.json())
      .then(data => setIncidents(data.map((inc: any) => ({ ...inc, title: cleanTitle(inc.title) }))))
      .catch(() => { });
  }, []);

  return (
    <div className="p-8 min-h-screen" style={{ background: "linear-gradient(135deg, #0d1117 0%, #0f1622 100%)" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}>
            <AlertTriangle size={20} className="text-[#f97316]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Root Cause Analysis</h1>
        </div>
        <p className="text-[#57606a] text-sm ml-12">AI-powered incident correlation and causal chain analysis</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Incidents", value: incidents.length, icon: <AlertTriangle size={16} />, color: "#f97316" },
          { label: "Open / In Progress", value: incidents.filter(i => i.status !== "Resolved").length, icon: <Clock size={16} />, color: "#ef4444" },
          { label: "Avg AI Confidence", value: `${Math.round(incidents.reduce((a, i) => a + i.confidence, 0) / incidents.length)}%`, icon: <Zap size={16} />, color: "#22c55e" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: "#161b27", border: "1px solid #1e2533" }}>
            <div className="p-2.5 rounded-lg" style={{ background: stat.color + "22", color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-[#57606a]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-col Layout — equal height, both columns scroll independently */}
      <div className="grid grid-cols-[320px_1fr] gap-6" style={{ height: "calc(100vh - 340px)", minHeight: "480px" }}>

        {/* LEFT: Incident List — full height, scrollable */}
        <div className="flex flex-col min-h-0 rounded-xl border overflow-hidden" style={{ background: "#161b27", border: "1px solid #1e2533" }}>
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="text-xs text-[#57606a] uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} />
              Active Incidents
              <span className="ml-auto text-[#3b82f6] font-bold">{incidents.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
            {incidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelected(inc)}
                className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${selected?.id === inc.id
                    ? "border-[#3b82f6]"
                    : "border-[#1e2533] hover:border-[#3b82f6]/50"
                  }`}
                style={{
                  background: selected?.id === inc.id
                    ? "linear-gradient(135deg, #1a2035, #1e2540)"
                    : "#0f1117",
                  boxShadow: selected?.id === inc.id ? "0 0 0 1px rgba(59,130,246,0.15), 0 4px 16px rgba(59,130,246,0.08)" : "none",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-sm text-white font-medium leading-tight">{inc.title}</span>
                  {selected?.id === inc.id && (
                    <ChevronRight size={14} className="text-[#3b82f6] flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                    background: SEV_COLOR[inc.severity] + "22", color: SEV_COLOR[inc.severity]
                  }}>{inc.severity}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                    background: STATUS_COLOR[inc.status] + "22", color: STATUS_COLOR[inc.status]
                  }}>{inc.status}</span>
                </div>
                <div className="text-xs text-[#57606a] mt-2">
                  {new Date(inc.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Detail Panel — full height, scrollable */}
        <div className="flex flex-col min-h-0 overflow-y-auto space-y-5">
          {selected ? (
            <>
              {/* Incident Header Card */}
              <div className="rounded-xl border p-6 flex-shrink-0" style={{ background: "#161b27", border: "1px solid #1e2533" }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="text-white font-bold text-lg leading-snug mb-1">{selected.title}</div>
                    <div className="text-[#57606a] text-xs">
                      Service: <span className="text-[#8b949e]">{selected.service}</span>
                      &nbsp;&middot;&nbsp;
                      {new Date(selected.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                        background: SEV_COLOR[selected.severity] + "22", color: SEV_COLOR[selected.severity]
                      }}>{selected.severity}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                        background: STATUS_COLOR[selected.status] + "22", color: STATUS_COLOR[selected.status]
                      }}>{selected.status}</span>
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className="text-xs text-[#57606a] mb-1">AI Confidence</div>
                    <div className="text-4xl font-black" style={{
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}>{selected.confidence}%</div>
                    <div className="w-16 h-1.5 rounded-full mt-2 mx-auto overflow-hidden" style={{ background: "#1e2533" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${selected.confidence}%`,
                        background: "linear-gradient(90deg, #16a34a, #22c55e)"
                      }} />
                    </div>
                  </div>
                </div>

                {/* Causal Chain */}
                <div className="text-xs text-[#57606a] uppercase tracking-widest mb-4">Causal Chain</div>
                <div className="space-y-1">
                  {selected.chain.map((step, i) => (
                    <div key={step.step} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                          style={{ background: STEP_COLORS[i] ?? "#3b82f6", boxShadow: `0 0 12px ${STEP_COLORS[i] ?? "#3b82f6"}44` }}
                        >
                          {step.step}
                        </div>
                        {i < selected.chain.length - 1 && (
                          <div className="w-px flex-1 my-1" style={{ background: "linear-gradient(to bottom, #1e2533, transparent)", minHeight: "20px" }} />
                        )}
                      </div>
                      <div className="pb-3 pt-1">
                        <div className="text-sm font-semibold text-white">{step.event}</div>
                        <div className="text-xs text-[#8b949e] mt-0.5 leading-relaxed">{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Root Cause + Recommendation */}
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="rounded-xl p-5" style={{
                  background: "linear-gradient(135deg, #2d1b1b, #1f1010)",
                  border: "1px solid rgba(239,68,68,0.25)"
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                    <div className="text-xs text-[#ef4444] font-medium uppercase tracking-wider">Probable Root Cause</div>
                  </div>
                  <div className="text-white font-semibold text-sm leading-relaxed">{selected.rootCause}</div>
                </div>
                <div className="rounded-xl p-5" style={{
                  background: "linear-gradient(135deg, #0f1d2a, #0a1520)",
                  border: "1px solid rgba(59,130,246,0.25)"
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    <div className="text-xs text-[#3b82f6] font-medium uppercase tracking-wider">Recommended Action</div>
                  </div>
                  <div className="text-[#c9d1d9] text-sm leading-relaxed">{selected.recommendation}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full rounded-xl" style={{ background: "#161b27", border: "1px solid #1e2533" }}>
              <div className="text-center">
                <AlertTriangle size={32} className="text-[#57606a] mx-auto mb-3" />
                <div className="text-[#57606a] text-sm">Select an incident to view analysis</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
