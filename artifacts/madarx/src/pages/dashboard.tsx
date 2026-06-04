import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetDashboardStats, useGetRecentActivity } from "@workspace/api-client-react";
import {
  MessageSquare, Code2, Layers, Users, Search,
  Zap, FolderOpen, Brain, Monitor, BarChart2,
  ChevronRight, ArrowRight
} from "lucide-react";
import logoImage from "@assets/MX_1780567719762.png";

const modules = [
  { label: "AI Chat", sub: "ALL MODELS", icon: MessageSquare, href: "/chat" },
  { label: "Coding", sub: "FULL DEV SUITE", icon: Code2, href: "/coding" },
  { label: "App Builder", sub: "BUILD ANYTHING", icon: Layers, href: "/app-builder" },
  { label: "Agents", sub: "MULTI-AGENT SYSTEM", icon: Users, href: "/agents" },
  { label: "Research", sub: "DEEP INTELLIGENCE", icon: Search, href: "/research" },
  { label: "Automation", sub: "WORKFLOWS & TASKS", icon: Zap, href: "/automation" },
  { label: "Files", sub: "ALL FILE STORAGE", icon: FolderOpen, href: "/files" },
  { label: "Memory", sub: "INFINITE RECALL", icon: Brain, href: "/memory" },
  { label: "Computer", sub: "CONTROL YOUR PC", icon: Monitor, href: "/computer" },
  { label: "Analytics", sub: "REAL-TIME DATA", icon: BarChart2, href: "/analytics" },
];

const performanceMetrics = [
  { label: "Speed", value: 98 },
  { label: "Intelligence", value: 100 },
  { label: "Memory", value: 100 },
  { label: "Efficiency", value: 97 },
];

// Simulate coworker tasks cycling through
const COWORKER_TASKS = [
  ["Active", "Monitoring system", "Indexing memories", "Standing by"],
  ["Active", "Browsing the web", "Fetching latest AI news", "Compiling results"],
  ["Active", "Analyzing patterns", "Reading conversation history", "Building context"],
  ["Active", "Optimizing responses", "Caching frequent queries", "Ready"],
  ["Active", "Running automation", "Checking workflows", "All systems nominal"],
];

function DonutChart({ value }: { value: number }) {
  const size = 120, sw = 8, r = (size - sw) / 2;
  const circ = 2 * Math.PI * r, dash = (value / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeWidth={sw}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white text-2xl font-bold leading-none">{value}%</span>
        <span className="text-white/40 text-[9px] tracking-widest uppercase mt-0.5">Optimal</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: activities, isLoading: activitiesLoading } = useGetRecentActivity();
  const [coworkerSet, setCoworkerSet] = useState(0);

  // Cycle through coworker task states every 4s
  useEffect(() => {
    const id = setInterval(() => setCoworkerSet((n) => (n + 1) % COWORKER_TASKS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const coworkerItems = COWORKER_TASKS[coworkerSet];

  return (
    <div className="flex h-full">
      {/* Main area */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Hero */}
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center border border-white/20 rounded px-2 py-0.5 text-[10px] tracking-widest text-white/50 mb-4">
              MADARX 1.0
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-2">
              Your AI <span className="font-black">Operating System.</span>
            </h1>
            <p className="text-white/40 text-lg mb-6">Limitless Power. One Platform.</p>
            <Link href="/agents">
              <button className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors">
                Explore All Tools <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/[0.015] blur-3xl pointer-events-none" />
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-5 gap-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.label} href={mod.href}>
                <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4 cursor-pointer hover:border-white/[0.15] hover:bg-[#161616] transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-white/[0.1] transition-colors">
                    <Icon className="w-4 h-4 text-white/70" />
                  </div>
                  <p className="text-white text-sm font-semibold leading-tight">{mod.label}</p>
                  <p className="text-white/30 text-[10px] tracking-widest mt-0.5">{mod.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
            <button className="text-white/30 text-xs hover:text-white/60 transition-colors tracking-widest">VIEW ALL</button>
          </div>
          <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
            {activitiesLoading ? (
              <div className="p-6 text-center text-white/30 text-sm">Loading...</div>
            ) : activities && activities.length > 0 ? (
              <div className="divide-y divide-white/[0.05]">
                {activities.map((item) => {
                  const iconMap: Record<string, React.ComponentType<any>> = {
                    chat: MessageSquare, coding: Code2, memory: Brain, research: Search, files: FolderOpen
                  };
                  const Icon = iconMap[item.type] || MessageSquare;
                  return (
                    <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.title}</p>
                        <p className="text-white/40 text-xs truncate">{item.description}</p>
                      </div>
                      <span className="text-white/30 text-xs whitespace-nowrap flex-shrink-0">{item.timeAgo}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-white/30 text-sm">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-[280px] flex-shrink-0 border-l border-white/[0.06] overflow-auto p-4 space-y-4">
        {/* MadarX 1.0 Model card */}
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="inline-flex items-center border border-white/20 rounded px-2 py-0.5 text-[9px] tracking-widest text-white/50 mb-2">
                ROYAL MODEL
              </div>
              <h3 className="text-white font-bold text-base">MadarX 1.0</h3>
            </div>
            <img src={logoImage} alt="MX" className="w-8 h-8 object-contain opacity-70" />
          </div>
          <p className="text-white/40 text-xs leading-relaxed mb-3">
            All benefits of ChatGPT, Claude, Gemini, DeepSeek & more.
          </p>
          <Link href="/models">
            <button className="flex items-center gap-1 text-white/60 text-xs hover:text-white transition-colors">
              View All Models <ChevronRight className="w-3 h-3" />
            </button>
          </Link>
        </div>

        {/* System Performance */}
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
          <h3 className="text-white/50 text-[10px] tracking-widest uppercase mb-4">System Performance</h3>
          <div className="flex justify-center mb-4">
            <DonutChart value={98} />
          </div>
          <div className="space-y-2.5">
            {performanceMetrics.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">{m.label}</span>
                  <span className="text-white/80 font-medium">{m.value}%</span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-white/70 rounded-full" style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Coworker Mode - live cycling tasks */}
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white/50 text-[10px] tracking-widest uppercase">AI Coworker Mode</h3>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            {coworkerItems.map((item, i) => (
              <div key={`${coworkerSet}-${i}`} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? "bg-green-500" : i === coworkerItems.length - 1 ? "bg-white/20" : "bg-white/10"}`} />
                <span className={`text-xs transition-all ${i === 1 ? "text-white/70 font-medium" : "text-white/35"}`}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/agents">
            <button className="mt-3 w-full text-center text-[10px] text-white/30 hover:text-white/60 transition-colors tracking-wide">
              Manage Agents →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
