import React from "react";
import { useGetAnalyticsOverview } from "@workspace/api-client-react";
import { BarChart2, TrendingUp, MessageSquare, Brain, Zap } from "lucide-react";

function BarGroup({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/40 text-xs w-24 flex-shrink-0 text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-white/60 rounded-full transition-all duration-700"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-white/60 text-xs w-8 text-right">{value}</span>
    </div>
  );
}

export default function Analytics() {
  const { data: overview } = useGetAnalyticsOverview();

  const statCards = [
    { label: "Total Messages", value: overview?.totalMessages ?? "—", icon: MessageSquare, trend: "+12%" },
    { label: "Conversations", value: overview?.totalConversations ?? "—", icon: BarChart2, trend: "+5%" },
    { label: "Memories Stored", value: overview?.memoriesCount ?? "—", icon: Brain, trend: "+3%" },
    { label: "Tokens Used", value: overview?.tokensUsed ? `${(overview.tokensUsed / 1000).toFixed(0)}K` : "—", icon: Zap, trend: "+18%" },
  ];

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-white/40 text-sm">Real-time data on your AI usage.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#111] border border-white/[0.07] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white/50" />
                </div>
                <span className="text-green-400/80 text-xs font-medium">{s.trend}</span>
              </div>
              <p className="text-white text-2xl font-bold mb-1">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Usage chart */}
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Daily Usage</h2>
          <div className="space-y-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <BarGroup key={day} label={day} value={[12, 28, 19, 35, 22, 8, 15][i]} max={40} />
            ))}
          </div>
        </div>

        {/* Model usage */}
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Model Usage</h2>
          <div className="space-y-3">
            {[
              { label: "Llama 3.3 70B", value: 68 },
              { label: "Llama 3.1 8B", value: 20 },
              { label: "Mixtral 8x7B", value: 8 },
              { label: "Gemma 2 9B", value: 4 },
            ].map((m) => (
              <BarGroup key={m.label} label={m.label} value={m.value} max={100} />
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-white/[0.05]">
            <h3 className="text-white/50 text-xs uppercase tracking-widest mb-3">Feature Usage</h3>
            <div className="space-y-3">
              {[
                { label: "AI Chat", value: 45 },
                { label: "Coding", value: 28 },
                { label: "Research", value: 18 },
                { label: "Agents", value: 9 },
              ].map((f) => (
                <BarGroup key={f.label} label={f.label} value={f.value} max={50} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
