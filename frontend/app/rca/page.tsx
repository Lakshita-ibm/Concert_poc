"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";

const API = "http://localhost:8000/api";

const mockIncidents = [
  {
    id: "i1", title: "UPI Transaction Failures — Peak Hour", service: "UPI", severity: "Critical",
    status: "Open", timestamp: "2025-07-10T09:23:00Z",
    rootCause: "Expired API Certificate on UPI Gateway", confidence: 96,
    chain: [
      { step: 1, event: "Alert Detected", detail: "200+ UPI transaction failures reported" },
      { step: 2, event: "Certificate Expired", detail: "upi-gateway.psb.in TLS certificate expired" },
      { step: 3, event: "API Gateway Failure", detail: "Kong API Gateway rejecting TLS handshakes" },
      { step: 4, event: "UPI Service Impacted", detail: "UPI service degraded — 877 branches affected" },
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
      { step: 1, event: "Alert Detected", detail: "Login failures spike — 3.5M users affected" },
      { step: 2, event: "CVE Exploited", detail: "CVE-2024-4040 Log4j exploit in auth service" },
      { step: 3, event: "Auth Service Down", detail: "Authentication microservice crashed" },
      { step: 4, event: "Mobile Banking Impacted", detail: "Users unable to login for 45 minutes" },
    ],
    recommendation: "Upgrade Log4j to 2.17.1+. Rotate auth service secrets.",
  },
];

const SEV_COLOR: Record<string, string> = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308" };
const STATUS_COLOR: Record<string, string> = { Open: "#ef4444", "In Progress": "#f97316", Resolved: "#22c55e" };

export default function RCA() {
  const [incidents, setIncidents] = useState(mockIncidents);
  const [selected, setSelected] = useState<typeof mockIncidents[0] | null>(mockIncidents[0]);

  useEffect(() => {
    fetch(`${API}/incidents`).then(r => r.json()).then(setIncidents).catch(() => {});
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle size={24} className="text-[#f97316]" /> Root Cause Analysis
        </h1>
        <p className="text-[#57606a] text-sm mt-1">AI-powered incident correlation and causal chain analysis</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="space-y-3">
          <div className="text-xs text-[#57606a] uppercase tracking-widest mb-2">Active Incidents</div>
          {incidents.map((inc) => (
            <button key={inc.id} onClick={() => setSelected(inc)}
              className={`w-full text-left bg-[#161b27] rounded-xl border p-4 transition-all ${selected?.id === inc.id ? "border-[#3b82f6]" : "border-[#1e2533] hover:border-[#3b82f6]/50"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm text-white font-medium leading-tight">{inc.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{
                  background: SEV_COLOR[inc.severity] + "22", color: SEV_COLOR[inc.severity]
                }}>{inc.severity}</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{
                  background: STATUS_COLOR[inc.status] + "22", color: STATUS_COLOR[inc.status]
                }}>{inc.status}</span>
              </div>
            </button>
          ))}
        </div>

        {/* RCA Detail */}
        <div className="col-span-2 space-y-5">
          {selected && (
            <>
              <div className="bg-[#161b27] rounded-xl border border-[#1e2533] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-white font-bold text-base">{selected.title}</div>
                    <div className="text-[#57606a] text-xs mt-1">Service: {selected.service} · {new Date(selected.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#57606a]">AI Confidence</div>
                    <div className="text-3xl font-black text-[#22c55e]">{selected.confidence}%</div>
                  </div>
                </div>

                {/* Causal Chain */}
                <div className="text-xs text-[#57606a] uppercase tracking-widest mb-4">Causal Chain</div>
                <div className="space-y-2">
                  {selected.chain.map((step, i) => (
                    <div key={step.step} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white
                          ${i === 0 ? "bg-[#f97316]" : i === selected.chain.length - 1 ? "bg-[#ef4444]" : "bg-[#3b82f6]"}`}>
                          {step.step}
                        </div>
                        {i < selected.chain.length - 1 && <div className="w-px h-6 bg-[#1e2533] mt-1" />}
                      </div>
                      <div className="pb-2">
                        <div className="text-sm font-semibold text-white">{step.event}</div>
                        <div className="text-xs text-[#8b949e]">{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#2d1b1b] border border-[#ef4444]/30 rounded-xl p-5">
                  <div className="text-xs text-[#57606a] mb-1">Probable Root Cause</div>
                  <div className="text-white font-semibold text-sm">{selected.rootCause}</div>
                </div>
                <div className="bg-[#0f1d2a] border border-[#3b82f6]/30 rounded-xl p-5">
                  <div className="text-xs text-[#57606a] mb-1">Recommended Action</div>
                  <div className="text-[#c9d1d9] text-sm leading-relaxed">{selected.recommendation}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
