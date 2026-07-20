"use client";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node, Edge, Background, Controls, MiniMap,
  useNodesState, useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Network, ShieldAlert, CheckCircle2, User, Building, Shield, Activity, Bug } from "lucide-react";

const API = "http://localhost:8000/api";

const nodeStyle = (risk: number) => ({
  background: risk >= 80 ? "#2d1b1b" : risk >= 65 ? "#2d1e10" : "#0f1d2a",
  border: `1px solid ${risk >= 80 ? "#ef4444" : risk >= 65 ? "#f97316" : "#3b82f6"}`,
  color: "#fff",
  borderRadius: 10,
  padding: "12px 18px",
  fontSize: 12,
  minWidth: 160,
  textAlign: "center" as const,
  transition: "all 0.2s ease-in-out",
});

export default function ArenaView() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rawNodes, setRawNodes] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${API}/arena`)
      .then((r) => r.json())
      .then((data) => {
        setRawNodes(data.nodes);
        
        // Map raw nodes to ReactFlow nodes
        const flowNodes = data.nodes.map((node: any) => ({
          id: node.id,
          position: { x: node.x, y: node.y },
          data: {
            label: `${node.label}\n${node.status === "Healthy" ? "" : "⚠ "}Risk ${node.riskScore}`,
            risk: node.riskScore,
            status: node.status,
            raw: node
          },
          style: nodeStyle(node.riskScore)
        }));
        
        // Map raw edges to ReactFlow edges
        const flowEdges = data.edges.map((edge: any) => {
          const sourceNode = data.nodes.find((n: any) => n.id === edge.source);
          const status = sourceNode?.status || "Healthy";
          const stroke = status === "Critical" ? "#ef4444" : (status === "Warning" ? "#f97316" : "#3b82f6");
          
          return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            animated: status === "Critical" || status === "Warning",
            style: { stroke, strokeWidth: 1.5, transition: "opacity 0.2s" },
            label: edge.relationship,
            labelStyle: { fill: "#8b949e", fontSize: 8, fontWeight: 500 },
            labelBgStyle: { fill: "#0f1117", fillOpacity: 0.75 }
          };
        });
        
        setNodes(flowNodes);
        setEdges(flowEdges);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading arena data:", err);
        setLoading(false);
      });
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelected(node.id);
  }, []);

  // Connected nodes highlighting logic (FR-025)
  const connectedNodeIds = new Set<string>();
  if (selected) {
    connectedNodeIds.add(selected);
    edges.forEach((edge) => {
      if (edge.source === selected) connectedNodeIds.add(edge.target);
      if (edge.target === selected) connectedNodeIds.add(edge.source);
    });
  }

  const nodesWithHighlight = nodes.map((node) => {
    if (!selected) return node;
    const isConnected = connectedNodeIds.has(node.id);
    return {
      ...node,
      style: {
        ...node.style,
        opacity: isConnected ? 1 : 0.35,
        boxShadow: node.id === selected ? "0 0 15px rgba(59, 130, 246, 0.8)" : "none",
        transform: node.id === selected ? "scale(1.05)" : "scale(1)"
      }
    };
  });

  const edgesWithHighlight = edges.map((edge) => {
    if (!selected) return edge;
    const isConnected = edge.source === selected || edge.target === selected;
    return {
      ...edge,
      style: {
        ...edge.style,
        opacity: isConnected ? 1 : 0.15,
        strokeWidth: isConnected ? 2.5 : 1.5
      }
    };
  });

  // Details for side panel (FR-026)
  const selectedNode = selected ? rawNodes.find((n) => n.id === selected) : null;

  // Resolve dependency labels
  const getDependencyLabels = (depIds: string[]) => {
    return depIds.map((id) => {
      const node = rawNodes.find((n) => n.id === id);
      return node ? node.label : id;
    });
  };

  const getStatusColor = (status: string) => {
    if (status === "Healthy") return "#22c55e";
    if (status === "Warning") return "#f97316";
    return "#ef4444";
  };

  const getStatusBg = (status: string) => {
    if (status === "Healthy") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status === "Warning") return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  return (
    <div className="flex h-screen bg-[#0f1117]">
      {/* Topology Canvas */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-[#0a0d13]/90 border border-[#1e2533] rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-white font-semibold text-sm flex items-center gap-1.5">
              <Network size={16} className="text-[#3b82f6]" /> Arena View: Topology Mapping
            </span>
          </div>
          <div className="text-[#57606a] text-[10px] uppercase tracking-wider mt-0.5">Click any node to inspect risk & dependencies</div>
          <div className="flex items-center gap-4 mt-2">
            {[["Critical", "#ef4444"], ["Warning", "#f97316"], ["Healthy", "#3b82f6"]].map(([l, c]) => (
              <span key={l} className="flex items-center gap-1 text-[10px] text-[#8b949e] font-semibold">
                <span className="w-2 h-2 rounded-full" style={{ background: c }}></span>{l}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[#57606a]">
            Loading interactive topology...
          </div>
        ) : (
          <ReactFlow
            nodes={nodesWithHighlight}
            edges={edgesWithHighlight}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            style={{ background: "#0f1117" }}
          >
            <Background color="#1e2533" gap={24} size={1} />
            <Controls style={{ background: "#161b27", border: "1px solid #1e2533" }} />
            <MiniMap 
              style={{ background: "#0a0d13", border: "1px solid #1e2533" }} 
              nodeColor={(n) => {
                const r = (n.data as any).risk || 0;
                return r >= 80 ? "#ef4444" : r >= 65 ? "#f97316" : "#3b82f6";
              }} 
            />
          </ReactFlow>
        )}
      </div>

      {/* Detail Panel */}
      <div className="w-80 bg-[#0a0d13] border-l border-[#1e2533] p-6 overflow-auto flex flex-col justify-between">
        {selectedNode ? (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] text-[#57606a] uppercase tracking-wider font-semibold">Asset Details</span>
              <h2 className="text-lg font-bold text-white mt-1 leading-tight">{selectedNode.label}</h2>
              <span className="text-[10px] text-[#57606a] block font-mono mt-0.5">Asset ID: {selectedNode.id}</span>
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border mt-2 ${getStatusBg(selectedNode.status)}`}>
                {selectedNode.status === "Healthy" ? <CheckCircle2 size={10} /> : <ShieldAlert size={10} />}
                {selectedNode.status}
              </span>
            </div>

            <div className="space-y-4 border-t border-[#1e2533] pt-4 text-xs">
              <div>
                <div className="text-[#57606a] flex items-center gap-1.5 mb-1">
                  <Activity size={12} /> Asset Classification
                </div>
                <div className="text-white font-medium">{selectedNode.type}</div>
              </div>

              <div>
                <div className="text-[#57606a] flex items-center gap-1.5 mb-1">
                  <ShieldAlert size={12} /> Risk score
                </div>
                <div className="text-2xl font-black" style={{ color: getStatusColor(selectedNode.status) }}>
                  {selectedNode.riskScore}
                </div>
              </div>

              <div>
                <div className="text-[#57606a] flex items-center gap-1.5 mb-1">
                  <User size={12} /> Asset Owner
                </div>
                <div className="text-white font-medium">{selectedNode.owner}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#161b27] border border-[#1e2533] rounded p-2 text-center">
                  <div className="text-[#57606a] text-[10px] mb-0.5 flex items-center justify-center gap-1">
                    <Bug size={10} /> Open CVEs
                  </div>
                  <div className="text-white font-bold text-sm" style={{ color: selectedNode.cves > 0 ? "#f97316" : "#22c55e" }}>
                    {selectedNode.cves}
                  </div>
                </div>
                <div className="bg-[#161b27] border border-[#1e2533] rounded p-2 text-center">
                  <div className="text-[#57606a] text-[10px] mb-0.5 flex items-center justify-center gap-1">
                    <Shield size={10} /> Certificate
                  </div>
                  <div className="text-white font-bold text-xs truncate px-1" style={{ color: selectedNode.cert === "Expired" ? "#ef4444" : (selectedNode.cert === "Expiring Soon" ? "#f97316" : "#22c55e") }}>
                    {selectedNode.cert}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[#57606a] mb-2 font-medium">Mapped Dependencies</div>
                {selectedNode.deps && selectedNode.deps.length > 0 ? (
                  <div className="space-y-1.5">
                    {getDependencyLabels(selectedNode.deps).map((depLabel) => (
                      <div key={depLabel} className="text-xs text-[#8b949e] bg-[#161b27] rounded px-3 py-1.5 border border-[#1e2533]/50">
                        {depLabel}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#57606a] italic">No downstream dependencies mapped</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#57606a] text-sm my-auto">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-semibold text-white mb-1">Inspect Topology</div>
            Click any node in the interactive service network to analyze its risk score, certificate status, open vulnerabilities, owner, and dependencies.
          </div>
        )}

        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="w-full mt-4 bg-[#161b27] hover:bg-[#1e2533] border border-[#1e2533] text-white text-xs font-semibold py-2 rounded transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>
    </div>
  );
}
