import React, { useState } from "react";
import { Layers, Play, Code2, Loader2, Sparkles } from "lucide-react";
import { useCreateConversation, useSendMessage, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const TEMPLATES = [
  { label: "Dashboard App", desc: "Analytics dashboard with charts" },
  { label: "Landing Page", desc: "Marketing site with hero + CTA" },
  { label: "SaaS App", desc: "Full-featured web application" },
  { label: "E-Commerce", desc: "Product listing + checkout flow" },
  { label: "Blog Platform", desc: "Content management + publishing" },
  { label: "Portfolio", desc: "Professional showcase site" },
];

export default function AppBuilder() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const createConv = useCreateConversation();
  const sendMsg = useSendMessage();

  async function handleBuild() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setOutput(null);
    try {
      const conv = await createConv.mutateAsync({
        data: { title: `Build: ${prompt.slice(0, 30)}`, model: "llama-3.3-70b-versatile" }
      });
      const p = `You are an expert app builder AI. Generate a complete, production-ready React component for: ${prompt}\n\nProvide clean, modern code with Tailwind CSS. Include the component code and a brief explanation.`;
      const res = await sendMsg.mutateAsync({ id: conv.id, data: { content: p, model: "llama-3.3-70b-versatile" } });
      await queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conv.id) });
      setOutput(res.content || "Build complete.");
    } catch {
      setOutput("Error: Could not build app.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">App Builder</h1>
        <p className="text-white/40 text-sm">Build anything. Powered by AI.</p>
      </div>

      {/* Prompt */}
      <div className="max-w-2xl mb-6">
        <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-white/[0.15] transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the app you want to build..."
            rows={3}
            className="w-full bg-transparent text-white/80 placeholder:text-white/25 text-sm px-5 pt-4 pb-2 outline-none resize-none"
          />
          <div className="flex items-center justify-end px-4 pb-3">
            <button
              onClick={handleBuild}
              disabled={!prompt.trim() || loading}
              className="flex items-center gap-2 bg-white text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-white/90 disabled:opacity-30 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Building..." : "Build"}
            </button>
          </div>
        </div>
      </div>

      {/* Templates */}
      {!output && !loading && (
        <>
          <h2 className="text-white/60 text-sm font-semibold mb-3 max-w-2xl">Templates</h2>
          <div className="grid grid-cols-3 gap-3 max-w-2xl">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => setPrompt(t.desc)}
                className="bg-[#111] border border-white/[0.07] rounded-xl p-4 text-left hover:border-white/[0.14] hover:bg-[#151515] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mb-3">
                  <Layers className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-white/80 text-sm font-medium mb-1">{t.label}</p>
                <p className="text-white/35 text-xs">{t.desc}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Output */}
      {(output || loading) && (
        <div className="max-w-2xl bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05]">
            <Code2 className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-sm font-medium">Generated App</span>
            {loading && <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin ml-auto" />}
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-2">
                {[70, 50, 90, 40, 75].map((w, i) => (
                  <div key={i} className="h-3 bg-white/[0.04] rounded animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              <pre className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap font-mono overflow-auto max-h-96">{output}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
