import React, { useState } from "react";
import { Zap, Plus, Play, Pause, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const WORKFLOWS = [
  { id: 1, name: "Daily Research Digest", desc: "Compile top AI news daily at 8am", status: "active", runs: 12, lastRun: "2h ago" },
  { id: 2, name: "Code Review Bot", desc: "Auto-review PRs and suggest improvements", status: "paused", runs: 48, lastRun: "1d ago" },
  { id: 3, name: "Memory Organizer", desc: "Categorize and tag new memories hourly", status: "active", runs: 128, lastRun: "1h ago" },
  { id: 4, name: "Analytics Report", desc: "Send weekly usage summary", status: "active", runs: 6, lastRun: "3d ago" },
];

const TEMPLATES = [
  "Web scraping workflow", "Email summarizer", "File organizer",
  "Data pipeline", "Social media scheduler", "Report generator",
];

export default function Automation() {
  const [workflows, setWorkflows] = useState(WORKFLOWS);

  function toggleWorkflow(id: number) {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w
      )
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">Automation</h1>
          <p className="text-white/40 text-sm">Workflows & tasks. Set it and forget it.</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Workflows", value: workflows.filter((w) => w.status === "active").length },
          { label: "Total Runs", value: workflows.reduce((s, w) => s + w.runs, 0) },
          { label: "Paused", value: workflows.filter((w) => w.status === "paused").length },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
            <p className="text-white text-2xl font-bold mb-1">{s.value}</p>
            <p className="text-white/40 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Workflows */}
      <div className="space-y-3 mb-6">
        {workflows.map((w) => (
          <div key={w.id} className="bg-[#111] border border-white/[0.07] rounded-xl p-4 flex items-center gap-4 hover:border-white/[0.12] transition-colors">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.status === "active" ? "bg-green-500" : "bg-white/20"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{w.name}</p>
              <p className="text-white/40 text-xs truncate">{w.desc}</p>
            </div>
            <div className="text-white/30 text-xs text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" /> {w.lastRun}
              </div>
              <div>{w.runs} runs</div>
            </div>
            <button
              onClick={() => toggleWorkflow(w.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                w.status === "active"
                  ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  : "bg-white/[0.06] text-white/40 hover:bg-white/[0.1] hover:text-white/70"
              }`}
            >
              {w.status === "active" ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Resume</>}
            </button>
          </div>
        ))}
      </div>

      {/* Templates */}
      <h2 className="text-white/50 text-xs uppercase tracking-widest mb-3">Quick Templates</h2>
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs border border-white/[0.07] hover:border-white/[0.14] px-3 py-1.5 rounded-lg transition-colors"
          >
            <Zap className="w-3 h-3" /> {t}
          </button>
        ))}
      </div>
    </div>
  );
}
