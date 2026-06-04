import React, { useState, useRef, useEffect } from "react";
import {
  useListConversations, useCreateConversation,
  useGetConversation, useSendMessage, useDeleteConversation, useUpdateConversation,
  getListConversationsQueryKey, getGetConversationQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Edit2, Check, X, MessageSquare,
  Send, ChevronDown, Loader2
} from "lucide-react";

const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "deepseek-r1-distill-llama-70b",
];

const MODES = ["CHAT", "RESEARCH", "CODE REVIEW"];

export default function Chat() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedMode, setSelectedMode] = useState("CHAT");
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useListConversations();
  const { data: conversation } = useGetConversation(activeId!, {
    query: { enabled: !!activeId }
  });
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();
  const deleteConversation = useDeleteConversation();
  const updateConversation = useUpdateConversation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  async function handleNewChat() {
    const conv = await createConversation.mutateAsync({
      data: { title: "New Chat", model: selectedModel }
    });
    await queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
    setActiveId(conv.id);
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    let id = activeId;
    if (!id) {
      const conv = await createConversation.mutateAsync({
        data: { title: input.slice(0, 40), model: selectedModel }
      });
      await queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      id = conv.id;
      setActiveId(id);
    }
    const msg = input;
    setInput("");
    setSending(true);
    try {
      await sendMessage.mutateAsync({ id: id!, data: { content: msg, model: selectedModel } });
      await queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(id!) });
      await queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteConversation.mutateAsync({ id });
    await queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
    if (activeId === id) setActiveId(null);
  }

  async function handleRename(id: number) {
    if (!renameValue.trim()) return;
    await updateConversation.mutateAsync({ id, data: { title: renameValue } });
    await queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
    setRenamingId(null);
  }

  return (
    <div className="flex h-full">
      {/* History sidebar */}
      <div className="w-[200px] flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0d0d0d]">
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 border border-white/[0.1] text-white/70 hover:text-white hover:border-white/20 text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="px-4 py-1.5">
          <span className="text-white/25 text-[10px] tracking-[0.15em] uppercase font-medium">History</span>
        </div>
        <div className="flex-1 overflow-auto px-2 pb-3 space-y-0.5">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                  activeId === conv.id ? "bg-white/[0.08] text-white" : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
                }`}
                onClick={() => setActiveId(conv.id)}
              >
                {renamingId === conv.id ? (
                  <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleRename(conv.id); }}
                      className="flex-1 bg-white/[0.08] text-white text-xs px-1.5 py-0.5 rounded outline-none border border-white/20 min-w-0"
                      autoFocus
                    />
                    <button onClick={() => handleRename(conv.id)} className="text-green-400 hover:text-green-300 flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setRenamingId(null)} className="text-white/40 hover:text-white/70 flex-shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs truncate flex-1">{conv.title}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setRenamingId(conv.id); setRenameValue(conv.title); }}
                        className="p-0.5 text-white/25 hover:text-white/60"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                        className="p-0.5 text-white/25 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-white/20 text-xs text-center py-6">No chats yet</p>
          )}
        </div>
      </div>

      {/* Chat main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-auto p-6">
          {!activeId || !conversation ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center mb-5">
                <MessageSquare className="w-7 h-7 text-white/40" />
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-white/35 text-sm text-center max-w-sm">
                Ask MadarX anything. From coding questions to creative writing, I'm here to help.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {conversation.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/[0.07] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-white/60">MX</span>
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-white/[0.07] border border-white/[0.06] text-white"
                      : "text-white/80"
                  }`}>
                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-white/60">MX</span>
                  </div>
                  <div className="flex items-center gap-1 py-2">
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-white/[0.15] transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message MadarX..."
                rows={1}
                className="w-full bg-transparent text-white/80 placeholder:text-white/25 text-sm px-4 pt-3 pb-1 outline-none resize-none"
              />
              <div className="flex items-center justify-between px-3 pb-3 pt-1">
                {/* Model selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="flex items-center gap-1.5 text-white/35 hover:text-white/60 text-[11px] font-semibold tracking-wider transition-colors"
                  >
                    {selectedModel.toUpperCase()}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showModelDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 bg-[#1a1a1a] border border-white/[0.08] rounded-lg py-1 min-w-[220px] shadow-2xl z-10">
                      {MODELS.map((m) => (
                        <button
                          key={m}
                          onClick={() => { setSelectedModel(m); setShowModelDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-white/[0.06] transition-colors ${
                            m === selectedModel ? "text-white" : "text-white/45"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {MODES.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`px-2.5 py-1 text-[10px] font-bold tracking-widest rounded transition-colors ${
                        selectedMode === mode
                          ? "bg-white/[0.08] text-white"
                          : "text-white/25 hover:text-white/50"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed transition-all ml-1"
                  >
                    {sending ? <Loader2 className="w-3.5 h-3.5 text-black animate-spin" /> : <Send className="w-3.5 h-3.5 text-black" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
