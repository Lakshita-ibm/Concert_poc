"use client";
import { useCallback, useState } from "react";
import ReactFlow, {
  Node, Edge, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge, Connection,
} from "reactflow";
import "reactflow/dist/style.css";

const nodeStyle = (risk: number) => ({
  background: risk >= 80 ? "#2d1b1b" : risk >= 65 ? "#2d1e10" : "#0f1d2a",
  border: `1px solid ${risk >= 80 ? "#ef4444" : risk >= 65 ? "#f97316" : "#3b82f6"}`,
  color: "#fff",
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 12,
  minWidth: 140,
  textAlign: "center" as const,
});

const initialNodes: Node[] = [
  { id: "upi", position: { x: 80, y: 20 }, data: { label: "UPI Service\n⚠ Risk 92", risk: 92 }, style: nodeStyle(92) },
  { id: "mobile", position: { x: 320, y: 20 }, data: { label: "Mobile Banking\n⚠ Risk 71", risk: 71 }, style: nodeStyle(71) },
  { id: "atm", position: { x: 560, y: 20 }, data: { label: "ATM Switch\n⚠ Risk 78", risk: 78 }, style: nodeStyle(78) },
  { id: "aeps", position: { x: 800, y: 20 }, data: { label: "AEPS Service\n Risk 65", risk: 65 }, style: nodeStyle(65) },
  { id: "api_gw", position: { x: 320, y: 160 }, data: { label: "API Gateway (Kong)\n⚠ Risk 85", risk: 85 }, style: nodeStyle(85) },
  { id: "cert", position: { x: 560, y: 160 }, data: { label: "Certificate\nupi-gateway.psb.in\n🔴 Expires in 5d", risk: 90 }, style: nodeStyle(90) },
  { id: "k8s", position: { x: 200, y: 300 }, data: { label: "Kubernetes Cluster\n Risk 60", risk: 60 }, style: nodeStyle(60) },
  { id: "db", position: { x: 450, y: 300 }, data: { label: "Core Banking DB\n Risk 55", risk: 55 }, style: nodeStyle(55) },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "upi", target: "api_gw", animated: true, style: { stroke: "#ef4444" } },
  { id: "e2", source: "mobile", target: "api_gw", animated: false, style: { stroke: "#f97316" } },
  { id: "e3", source: "atm", target: "api_gw", animated: false, style: { stroke: "#f97316" } },
  { id: "e4", source: "aeps", target: "api_gw", animated: false, style: { stroke: "#3b82f6" } },
  { id: "e5", source: "api_gw", target: "k8s", style: { stroke: "#3b82f6" } },
  { id: "e6", source: "api_gw", target: "cert", animated: true, style: { stroke: "#ef4444", strokeDasharray: "5,5" } },
  { id: "e7", source: "k8s", target: "db", style: { stroke: "#3b82f6" } },
];

const DETAILS: Record<string, { riskScore: number; owner: string; cves: number; cert?: string; deps: string[] }> = {
  upi: { riskScore: 92, owner: "Digital Banking Team", cves: 4, cert: "Expires in 5 days", deps: ["API Gateway", "Core Banking DB"] },
  mobile: { riskScore: 71, owner: "Mobile Team", cves: 5, cert: "Healthy (45d)", deps: ["API Gateway", "Core Banking DB"] },
  atm: { riskScore: 78, owner: "ATM Operations", cves: 2, cert: "None", deps: ["API Gateway"] },
  aeps: { riskScore: 65, owner: "Payments Team", cves: 3, cert: "Expires in 8 days", deps: ["API Gateway"] },
  api_gw: { riskScore: 85, owner: "Platform Team", cves: 2, cert: "Expires in 12 days", deps: ["Kubernetes Cluster", "Certificate Store"] },
  cert: { riskScore: 90, owner: "Platform Team", cves: 0, cert: "EXPIRES IN 5 DAYS", deps: ["UPI Gateway"] },
  k8s: { riskScore: 60, owner: "DevOps Team", cves: 1, cert: "None", deps: ["Core Banking DB"] },
  db: { riskScore: 55, owner: "DBA Team", cves: 0, cert: "None", deps: [] },
};

export default function ArenaView() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState<string | null>(null);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelected(node.id);
  }, []);

  const detail = selected ? DETAILS[selected] : null;
  const selNode = selected ? nodes.find(n => n.id === selected) : null;

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-[#0a0d13]/90 border border-[#1e2533] rounded-lg px-4 py-3">
          <div className="text-white font-semibold text-sm">Arena View — Service Topology</div>
          <div className="text-[#57606a] text-xs mt-0.5">Click any node to inspect risk details</div>
          <div className="flex items-center gap-4 mt-2">
            {[["Critical", "#ef4444"], ["High", "#f97316"], ["Healthy", "#3b82f6"]].map(([l, c]) => (
              <span key={l} className="flex items-center gap-1 text-xs text-[#8b949e]">
                <span className="w-2 h-2 rounded-full" style={{ background: c }}></span>{l}
              </span>
            ))}
          </div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          style={{ background: "#0f1117" }}
        >
          <Background color="#1e2533" gap={24} />
          <Controls style={{ background: "#161b27", border: "1px solid #1e2533" }} />
          <MiniMap style={{ background: "#0a0d13" }} nodeColor={(n) => {
            const r = (n.data as any).risk || 0;
            return r >= 80 ? "#ef4444" : r >= 65 ? "#f97316" : "#3b82f6";
          }} />
        </ReactFlow>
      </div>

      {/* Detail Panel */}
      <div className="w-80 bg-[#0a0d13] border-l border-[#1e2533] p-6 overflow-auto">
        {detail && selNode ? (
          <>
            <div className="text-white font-bold text-base mb-1">{String(selNode.data.label).split("\n")[0]}</div>
            <div className="text-[#57606a] text-xs mb-6">Node Details</div>
            <div className="space-y-4">
              <Detail label="Risk Score" value={String(detail.riskScore)} color={detail.riskScore >= 80 ? "#ef4444" : detail.riskScore >= 65 ? "#f97316" : "#22c55e"} />
              <Detail label="Owner" value={detail.owner} />
              <Detail label="Open CVEs" value={String(detail.cves)} color={detail.cves > 0 ? "#f97316" : "#22c55e"} />
              <Detail label="Certificate" value={detail.cert || "None"} color={detail.cert?.includes("Expires") ? "#eab308" : detail.cert?.includes("EXPIRES") ? "#ef4444" : "#22c55e"} />
              <div>
                <div className="text-xs text-[#57606a] mb-2">Dependencies</div>
                {detail.deps.length > 0 ? detail.deps.map(d => (
                  <div key={d} className="text-xs text-[#8b949e] bg-[#161b27] rounded px-2 py-1 mb-1">{d}</div>
                )) : <div className="text-xs text-[#57606a]">No dependencies</div>}
              </div>
            </div>
          </>
        ) : (
          <div className="text-[#57606a] text-sm mt-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            Click any node in the topology to inspect its risk, CVEs, certificates, and dependencies.
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-xs text-[#57606a] mb-0.5">{label}</div>
      <div className="text-sm font-semibold" style={{ color: color || "#fff" }}>{value}</div>
    </div>
  );
}
