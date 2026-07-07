"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Network, Brain, ShieldCheck, AlertTriangle, Package, ChevronRight
} from "lucide-react";

const nav = [
  { label: "Executive Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Arena View", href: "/arena", icon: Network },
  { label: "AI Risk Correlation", href: "/ai-risk", icon: Brain },
  { label: "RBI Compliance", href: "/compliance", icon: ShieldCheck },
  { label: "Root Cause Analysis", href: "/rca", icon: AlertTriangle },
  { label: "SBOM Intelligence", href: "/sbom", icon: Package },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-64 bg-[#0a0d13] border-r border-[#1e2533] flex flex-col py-6 shrink-0">
      <div className="px-6 mb-8">
        <div className="text-xs text-[#3b82f6] font-semibold tracking-widest uppercase mb-1">IBM Concert</div>
        <div className="text-white font-bold text-lg leading-tight">Punjab & Sind Bank</div>
        <div className="text-[#57606a] text-xs mt-1">AI Operations & Risk Intelligence</div>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                active
                  ? "bg-[#1a2540] text-white border border-[#3b82f6]/30"
                  : "text-[#8b949e] hover:bg-[#161b27] hover:text-white"
              }`}
            >
              <Icon size={16} className={active ? "text-[#3b82f6]" : "text-[#57606a] group-hover:text-white"} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-[#3b82f6]" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 pt-4 border-t border-[#1e2533]">
        <div className="text-xs text-[#57606a]">POC Build — July 2025</div>
        <div className="text-xs text-[#3b82f6] mt-1">877 Branches · 5M+ Customers</div>
      </div>
    </aside>
  );
}
