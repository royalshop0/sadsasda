import React, { useState } from "react";
import { useListFiles } from "@workspace/api-client-react";
import { FolderOpen, Upload, Search, FileText, Image, FileCode, File } from "lucide-react";

function getFileIcon(type: string) {
  if (type.includes("image")) return Image;
  if (type.includes("text") || type.includes("pdf")) return FileText;
  if (type.includes("code") || type.includes("json")) return FileCode;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function Files() {
  const { data: files, isLoading } = useListFiles();
  const [search, setSearch] = useState("");

  const filtered = files?.filter((f) =>
    f.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">Files</h1>
          <p className="text-white/40 text-sm">All file storage. Unlimited capacity.</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
          <Upload className="w-4 h-4" /> Upload File
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files..."
          className="w-full bg-[#111] border border-white/[0.07] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white/70 placeholder:text-white/25 outline-none focus:border-white/15 transition-colors"
        />
      </div>

      {/* File list */}
      {isLoading ? (
        <div className="text-white/30 text-sm text-center py-12">Loading files...</div>
      ) : filtered && filtered.length > 0 ? (
        <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2.5 border-b border-white/[0.05]">
            <span className="text-white/25 text-[10px] tracking-widest uppercase">Type</span>
            <span className="text-white/25 text-[10px] tracking-widest uppercase">Name</span>
            <span className="text-white/25 text-[10px] tracking-widest uppercase">Size</span>
            <span className="text-white/25 text-[10px] tracking-widest uppercase">Date</span>
          </div>
          {filtered.map((file) => {
            const Icon = getFileIcon(file.mimeType || "");
            return (
              <div key={file.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 items-center border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-white/80 text-sm truncate">{file.filename}</p>
                <p className="text-white/35 text-xs">{formatSize(file.size || 0)}</p>
                <p className="text-white/25 text-xs">
                  {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-6 h-6 text-white/30" />
          </div>
          <p className="text-white/40 text-sm">No files uploaded</p>
          <p className="text-white/20 text-xs mt-1">Upload files to get started</p>
        </div>
      )}
    </div>
  );
}
