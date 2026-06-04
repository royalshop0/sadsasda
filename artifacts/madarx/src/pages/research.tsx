import React, { useState } from "react";
import { Search, Globe, FileText, Loader2, Sparkles } from "lucide-react";
import { useCreateConversation, useSendMessage, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Research() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const createConv = useCreateConversation();
  const sendMsg = useSendMessage();

  async function handleResearch() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const conv = await createConv.mutateAsync({
        data: { title: query.slice(0, 40), model: "llama-3.3-70b-versatile" }
      });
      const prompt = `You are a deep research AI. Conduct thorough research on the following topic and provide a comprehensive, well-structured analysis:\n\n${query}\n\nProvide: 1) Executive Summary 2) Key Findings 3) Analysis 4) Conclusions`;
      const res = await sendMsg.mutateAsync({ id: conv.id, data: { content: prompt, model: "llama-3.3-70b-versatile" } });
      await queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conv.id) });
      setResult(res.content || "Research complete.");
    } catch {
      setResult("Error: Could not complete research.");
    } finally {
      setLoading(false);
    }
  }

  const TOPICS = [
    "AI market trends 2025", "Quantum computing breakthroughs",
    "Climate tech investment", "Web3 adoption rates",
  ];

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">Research</h1>
        <p className="text-white/40 text-sm">Deep intelligence. Powered by your AI keys.</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mb-6">
        <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-white/[0.15] transition-colors">
          <div className="flex items-center gap-3 px-4 py-3">
            <Search className="w-5 h-5 text-white/30 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleResearch(); }}
              placeholder="What do you want to research?"
              className="flex-1 bg-transparent text-white/80 placeholder:text-white/25 text-sm outline-none"
            />
            <button
              onClick={handleResearch}
              disabled={!query.trim() || loading}
              className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Research
            </button>
          </div>
        </div>

        {/* Quick topics */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-white/25 text-xs">Quick:</span>
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setQuery(t)}
              className="text-white/40 hover:text-white/70 text-xs border border-white/[0.07] hover:border-white/[0.14] px-2.5 py-1 rounded-md transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {(result || loading) && (
        <div className="max-w-2xl bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05]">
            <Globe className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-sm font-medium">Research Results</span>
            {loading && <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin ml-auto" />}
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-2">
                {[80, 60, 90, 50].map((w, i) => (
                  <div key={i} className="h-3 bg-white/[0.04] rounded animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              <pre className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result}</pre>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="max-w-2xl grid grid-cols-2 gap-3">
          {[
            { icon: Globe, title: "Web Research", desc: "Real-time data synthesis from multiple sources" },
            { icon: FileText, title: "Document Analysis", desc: "Upload and analyze any document" },
            { icon: Search, title: "Deep Search", desc: "Multi-layer intelligence gathering" },
            { icon: Sparkles, title: "AI Synthesis", desc: "Combine findings into clear insights" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-white/80 text-sm font-medium mb-1">{card.title}</p>
                <p className="text-white/35 text-xs">{card.desc}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
