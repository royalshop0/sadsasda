import React, { useState } from "react";
import { Plus, Eye, Wrench, Zap, Bot, Play, FileCode } from "lucide-react";
import { useSendMessage, useCreateConversation, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const LANGUAGES = ["TypeScript", "JavaScript", "Python", "Rust", "Go"];

const defaultCode = `// Welcome to MadarX Coding
console.log('Hello World');`;

export default function Coding() {
  const [code, setCode] = useState(defaultCode);
  const [selectedLang, setSelectedLang] = useState("TypeScript");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState("index.ts");
  const queryClient = useQueryClient();
  const createConv = useCreateConversation();
  const sendMsg = useSendMessage();

  async function runAI(action: string) {
    setLoading(true);
    setOutput(null);
    try {
      const conv = await createConv.mutateAsync({
        data: { title: `${action} code`, model: "llama-3.3-70b-versatile" }
      });
      const prompt = action === "EXPLAIN"
        ? `Explain this ${selectedLang} code concisely:\n\n${code}`
        : action === "FIX"
        ? `Fix any bugs in this ${selectedLang} code. Return only the corrected code with a brief explanation:\n\n${code}`
        : `Optimize this ${selectedLang} code for performance and readability:\n\n${code}`;
      const result = await sendMsg.mutateAsync({ id: conv.id, data: { content: prompt, model: "llama-3.3-70b-versatile" } });
      await queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conv.id) });
      setOutput(result.content || "Done.");
    } catch {
      setOutput("Error: Could not reach AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="h-10 border-b border-white/[0.06] flex items-center px-4 gap-4 flex-shrink-0 bg-[#0d0d0d]">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs font-semibold tracking-wide transition-colors"
          >
            LANGUAGE: <span className="text-white/80">{selectedLang.toUpperCase()}</span>
          </button>
          {showLangMenu && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/[0.08] rounded-lg py-1 min-w-[140px] shadow-xl z-10">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setSelectedLang(lang); setShowLangMenu(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/[0.06] transition-colors ${lang === selectedLang ? "text-white" : "text-white/45"}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-white/[0.06]" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => runAI("EXPLAIN")} disabled={loading} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs font-medium transition-colors disabled:opacity-40">
            <Eye className="w-3.5 h-3.5" /> EXPLAIN
          </button>
          <button onClick={() => runAI("FIX")} disabled={loading} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs font-medium transition-colors disabled:opacity-40">
            <Wrench className="w-3.5 h-3.5" /> FIX
          </button>
          <button onClick={() => runAI("OPTIMIZE")} disabled={loading} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs font-medium transition-colors disabled:opacity-40">
            <Zap className="w-3.5 h-3.5" /> OPTIMIZE
          </button>
        </div>

        <div className="flex-1" />

        <button onClick={() => runAI("EXPLAIN")} disabled={loading} className="flex items-center gap-1.5 border border-white/[0.1] text-white/60 hover:text-white hover:border-white/20 text-xs font-semibold px-3 py-1 rounded transition-colors disabled:opacity-40">
          <Bot className="w-3.5 h-3.5" /> AI AGENT
        </button>
        <button className="flex items-center gap-1.5 bg-white/[0.07] text-white/70 hover:bg-white/[0.12] hover:text-white text-xs font-semibold px-3 py-1 rounded transition-colors">
          <Play className="w-3.5 h-3.5" /> RUN REVIEW
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Explorer panel */}
        <div className="w-[185px] flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0d0d0d]">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-white/30 text-[10px] tracking-[0.15em] font-semibold uppercase">Explorer</span>
            <button className="text-white/30 hover:text-white/60 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-2">
            {["index.ts", "utils.ts", "types.ts"].map((file) => (
              <button
                key={file}
                onClick={() => setActiveFile(file)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left ${
                  activeFile === file ? "bg-white/[0.07] text-white" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                {file}
              </button>
            ))}
          </div>
        </div>

        {/* Code editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-[#0a0a0a] text-white/70 font-mono text-sm px-6 py-4 outline-none resize-none border-0 leading-relaxed"
            spellCheck={false}
          />

          {/* AI Output panel */}
          {(output || loading) && (
            <div className="border-t border-white/[0.06] bg-[#0d0d0d] p-4 max-h-48 overflow-auto">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-3.5 h-3.5 text-white/40" />
                <span className="text-white/40 text-xs font-semibold tracking-wide uppercase">AI Response</span>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <pre className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap font-sans">{output}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
