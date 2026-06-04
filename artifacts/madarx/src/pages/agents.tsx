import React, { useState } from "react";
import {
  Code2, Palette, Search, FileText, Globe, TrendingUp,
  BarChart2, Briefcase, Megaphone, Share2, Video, Bot,
  MessageSquare, Loader2, X
} from "lucide-react";
import { useCreateConversation, useSendMessage, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const AGENTS = [
  { id: 1, name: "Code Wizard", desc: "Your senior dev who codes at ...", icon: Code2, skills: ["Full-stack", "Debugging", "Optimization"], prompt: "You are Code Wizard, an expert senior software developer. Help with coding, debugging, and architecture." },
  { id: 2, name: "UI Designer", desc: "Figma meets code.", icon: Palette, skills: ["Design Systems", "Tailwind", "Animations"], prompt: "You are UI Designer, an expert in modern web design. Help create beautiful, responsive UIs with Tailwind CSS." },
  { id: 3, name: "Research Master", desc: "Your analyst on demand.", icon: Search, skills: ["Deep Dive", "Synthesis", "Verification"], prompt: "You are Research Master, a deep research analyst. Provide comprehensive, well-sourced research and analysis." },
  { id: 4, name: "Content Writer", desc: "Words that hit different.", icon: FileText, skills: ["Copywriting", "Storytelling", "Scripts"], prompt: "You are Content Writer, a professional copywriter. Create compelling, engaging content that converts." },
  { id: 5, name: "Marketing Guru", desc: "Your CMO.", icon: Globe, skills: ["GTM Strategy", "Growth", "Campaigns"], prompt: "You are Marketing Guru, an expert CMO-level marketer. Provide GTM strategies, growth tactics, and campaign ideas." },
  { id: 6, name: "SEO Expert", desc: "Ranks you #1.", icon: TrendingUp, skills: ["Keywords", "Audits", "Backlinks"], prompt: "You are SEO Expert. Provide keyword research, technical SEO audits, and ranking strategies." },
  { id: 7, name: "Data Analyst", desc: "Turns data into alpha.", icon: BarChart2, skills: ["Patterns", "Predictions", "Visuals"], prompt: "You are Data Analyst. Analyze data, identify patterns, and provide actionable insights." },
  { id: 8, name: "Business Strategist", desc: "Your co-founder brain.", icon: Briefcase, skills: ["Models", "Competitive", "Revenue"], prompt: "You are Business Strategist, a co-founder level advisor. Help with business models, competitive analysis, and revenue strategy." },
  { id: 9, name: "Creative Director", desc: "Big picture thinker.", icon: Megaphone, skills: ["Campaigns", "Branding", "Vision"], prompt: "You are Creative Director. Help with creative campaigns, brand identity, and visual storytelling." },
  { id: 10, name: "Automation Architect", desc: "Automates the boring stuff.", icon: Bot, skills: ["Workflows", "APIs", "Triggers"], prompt: "You are Automation Architect. Design workflows, API integrations, and automation pipelines." },
  { id: 11, name: "Social Media Agent", desc: "Clout factory.", icon: Share2, skills: ["Viral", "Scheduling", "Analytics"], prompt: "You are Social Media Agent. Create viral content strategies and social media growth plans." },
  { id: 12, name: "Video Scripter", desc: "Goes viral for you.", icon: Video, skills: ["Scripts", "Hooks", "CTA"], prompt: "You are Video Scripter. Write compelling video scripts with strong hooks and CTAs that go viral." },
];

type AgentChat = { userMsg: string; aiMsg: string };

export default function Agents() {
  const queryClient = useQueryClient();
  const [activated, setActivated] = useState<Set<number>>(new Set());
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [activeAgent, setActiveAgent] = useState<typeof AGENTS[0] | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<AgentChat[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const createConv = useCreateConversation();
  const sendMsg = useSendMessage();

  async function handleActivate(agent: typeof AGENTS[0]) {
    if (activated.has(agent.id)) {
      // Deactivate
      setActivated((prev) => { const n = new Set(prev); n.delete(agent.id); return n; });
      if (activeAgent?.id === agent.id) setActiveAgent(null);
      return;
    }
    setActivatingId(agent.id);
    await new Promise((r) => setTimeout(r, 600));
    setActivated((prev) => new Set(prev).add(agent.id));
    setActivatingId(null);
    setActiveAgent(agent);
    setChatHistory([]);
    setChatInput("");
  }

  async function handleChat() {
    if (!chatInput.trim() || !activeAgent || chatLoading) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatLoading(true);
    setChatHistory((h) => [...h, { userMsg, aiMsg: "" }]);
    try {
      const conv = await createConv.mutateAsync({ data: { title: `${activeAgent.name}: ${userMsg.slice(0, 30)}`, model: "llama-3.3-70b-versatile" } });
      const messages = [
        { role: "system", content: activeAgent.prompt },
        ...chatHistory.flatMap(h => [{ role: "user", content: h.userMsg }, { role: "assistant", content: h.aiMsg }]),
        { role: "user", content: userMsg },
      ];
      // Use the send message endpoint with system context built into the first message
      const fullPrompt = `${activeAgent.prompt}\n\nUser: ${userMsg}`;
      const result = await sendMsg.mutateAsync({ id: conv.id, data: { content: fullPrompt, model: "llama-3.3-70b-versatile" } });
      await queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conv.id) });
      setChatHistory((h) => {
        const updated = [...h];
        updated[updated.length - 1] = { userMsg, aiMsg: result.content || "Done." };
        return updated;
      });
    } catch {
      setChatHistory((h) => {
        const updated = [...h];
        updated[updated.length - 1] = { userMsg, aiMsg: "Error reaching AI. Please try again." };
        return updated;
      });
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Agent grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-1">Multi-Agent System</h1>
          <p className="text-white/40 text-sm">12 specialized AI agents. One OS.</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isActive = activated.has(agent.id);
            const isLoading = activatingId === agent.id;
            const isCurrent = activeAgent?.id === agent.id;
            return (
              <div
                key={agent.id}
                className={`bg-[#111] border rounded-xl p-5 flex flex-col transition-all ${
                  isCurrent ? "border-white/30 ring-1 ring-white/10" : isActive ? "border-white/15" : "border-white/[0.07] hover:border-white/[0.12]"
                }`}
              >
                {/* Status indicator */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? "bg-green-500 animate-pulse" : "bg-white/15"}`} />
                    <span className={`text-[9px] font-bold tracking-widest ${isActive ? "text-green-400" : "text-white/25"}`}>
                      {isActive ? "ACTIVE" : "IDLE"}
                    </span>
                  </div>
                </div>

                <h3 className="text-white font-semibold text-sm mb-1">{agent.name}</h3>
                <p className="text-white/40 text-xs mb-3">{agent.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                  {agent.skills.map((skill) => (
                    <span key={skill} className="text-[10px] text-white/40 border border-white/[0.08] px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleActivate(agent)}
                    disabled={!!isLoading}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-widest transition-all ${
                      isActive
                        ? "bg-white text-black hover:bg-white/90"
                        : "border border-white/[0.15] text-white/60 hover:text-white hover:border-white/30 hover:bg-white/[0.04]"
                    } disabled:opacity-50`}
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : isActive ? "DEACTIVATE" : "ACTIVATE"}
                  </button>
                  {isActive && (
                    <button
                      onClick={() => { setActiveAgent(agent); setChatHistory([]); setChatInput(""); }}
                      className="px-2.5 py-2 rounded-lg border border-white/[0.15] text-white/50 hover:text-white hover:border-white/30 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent chat panel */}
      {activeAgent && (
        <div className="w-[320px] flex-shrink-0 border-l border-white/[0.06] flex flex-col bg-[#0d0d0d]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div>
              <p className="text-white font-semibold text-sm">{activeAgent.name}</p>
              <p className="text-white/35 text-xs">{activeAgent.desc}</p>
            </div>
            <button onClick={() => setActiveAgent(null)} className="text-white/30 hover:text-white/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-center py-8">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mx-auto mb-2">
                  {React.createElement(activeAgent.icon, { className: "w-5 h-5 text-white/40" })}
                </div>
                <p className="text-white/40 text-xs">Chat with {activeAgent.name}</p>
              </div>
            )}
            {chatHistory.map((c, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end">
                  <div className="bg-white/[0.07] border border-white/[0.05] rounded-xl px-3 py-2 text-white text-xs max-w-[85%]">
                    {c.userMsg}
                  </div>
                </div>
                {c.aiMsg && (
                  <div className="flex justify-start">
                    <div className="text-white/70 text-xs leading-relaxed max-w-[90%]">
                      <pre className="whitespace-pre-wrap font-sans">{c.aiMsg}</pre>
                    </div>
                  </div>
                )}
                {!c.aiMsg && i === chatHistory.length - 1 && chatLoading && (
                  <div className="flex items-center gap-1 py-1">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                placeholder={`Ask ${activeAgent.name}...`}
                disabled={chatLoading}
                className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-white/80 placeholder:text-white/25 text-xs outline-none focus:border-white/15 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleChat}
                disabled={!chatInput.trim() || chatLoading}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-white/90 disabled:opacity-30 transition-all flex-shrink-0"
              >
                {chatLoading ? <Loader2 className="w-3.5 h-3.5 text-black animate-spin" /> : <MessageSquare className="w-3.5 h-3.5 text-black" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
