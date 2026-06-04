import React, { useState } from "react";
import { useListMemories, useDeleteMemory, useCreateMemory, getListMemoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Brain, Plus, Search, Clock, Trash2, X, AlertTriangle } from "lucide-react";

export default function Memory() {
  const queryClient = useQueryClient();
  const { data: memories, isLoading } = useListMemories();
  const deleteMemory = useDeleteMemory();
  const createMemory = useCreateMemory();

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = memories?.filter(
    (m) =>
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      (m.tags && m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  );

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteMemory.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteAll() {
    setShowConfirmAll(false);
    // Call delete all endpoint directly
    await fetch("/api/memory", { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
  }

  async function handleAdd() {
    if (!newContent.trim()) return;
    await createMemory.mutateAsync({ data: { content: newContent, tags } });
    await queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
    setNewContent("");
    setTags([]);
    setShowAdd(false);
  }

  function addTag() {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">Memory</h1>
          <p className="text-white/40 text-sm">Infinite recall. Everything MadarX knows about you.</p>
        </div>
        <div className="flex items-center gap-2">
          {memories && memories.length > 0 && (
            <button
              onClick={() => setShowConfirmAll(true)}
              className="flex items-center gap-1.5 border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/50 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Memory
          </button>
        </div>
      </div>

      {/* Confirm delete all */}
      {showConfirmAll && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400/90 text-sm flex-1">Delete all {memories?.length} memories permanently?</p>
          <button onClick={handleDeleteAll} className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">
            Yes, Delete All
          </button>
          <button onClick={() => setShowConfirmAll(false)} className="text-white/40 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add memory form */}
      {showAdd && (
        <div className="mb-5 bg-[#111] border border-white/[0.1] rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">New Memory</h3>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Enter memory content..."
            rows={3}
            className="w-full bg-[#0d0d0d] border border-white/[0.07] rounded-lg px-3 py-2.5 text-white/80 text-sm placeholder:text-white/25 outline-none focus:border-white/15 resize-none mb-3 transition-colors"
          />
          <div className="flex items-center gap-2 mb-3">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="Add tag (Enter)"
              className="flex-1 bg-[#0d0d0d] border border-white/[0.07] rounded-lg px-3 py-1.5 text-white/70 text-sm placeholder:text-white/25 outline-none focus:border-white/15 transition-colors"
            />
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 text-[10px] text-white/50 border border-white/[0.1] px-2 py-0.5 rounded">
                {t}
                <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-white/30 hover:text-white/60"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!newContent.trim()} className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-white/90 disabled:opacity-30 transition-all">
              Save
            </button>
            <button onClick={() => { setShowAdd(false); setNewContent(""); setTags([]); }} className="border border-white/[0.1] text-white/50 text-xs font-medium px-4 py-1.5 rounded-lg hover:text-white/70 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search memories..."
          className="w-full bg-[#111] border border-white/[0.07] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white/70 placeholder:text-white/25 outline-none focus:border-white/15 transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Total Memories", value: memories?.length ?? 0 },
          { label: "Tags Used", value: [...new Set(memories?.flatMap(m => m.tags ?? []) ?? [])].length },
          { label: "Showing", value: filtered?.length ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
            <p className="text-white text-2xl font-bold mb-1">{s.value}</p>
            <p className="text-white/40 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Memories list */}
      {isLoading ? (
        <div className="text-white/30 text-sm text-center py-12">Loading memories...</div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((mem) => (
            <div key={mem.id} className="group bg-[#111] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.12] transition-colors relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-white/80 text-sm leading-relaxed">{mem.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {mem.tags && mem.tags.length > 0 && mem.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-white/35 border border-white/[0.08] px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                {mem.createdAt && (
                  <div className="flex items-center gap-1 text-white/25 text-[10px] ml-auto">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {/* Delete button */}
              <button
                onClick={() => handleDelete(mem.id)}
                disabled={deletingId === mem.id}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md bg-red-500/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-30"
              >
                {deletingId === mem.id ? <span className="text-[8px]">...</span> : <Trash2 className="w-3 h-3" />}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-white/30" />
          </div>
          <p className="text-white/40 text-sm">{search ? "No memories match your search" : "No memories yet"}</p>
          <p className="text-white/20 text-xs mt-1">Start chatting to build your memory bank</p>
        </div>
      )}
    </div>
  );
}
