import React from "react";
import { Monitor, Mouse, Keyboard, Wifi } from "lucide-react";

export default function Computer() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">Computer</h1>
        <p className="text-white/40 text-sm">AI-controlled computer access. Coming soon.</p>
      </div>

      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-6">
          <Monitor className="w-9 h-9 text-white/30" />
        </div>
        <h2 className="text-white text-xl font-semibold mb-3">Computer Control</h2>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Let MadarX control your computer to complete tasks autonomously. Browse the web, write files, run applications — all hands-free.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[{ icon: Mouse, label: "Mouse Control" }, { icon: Keyboard, label: "Keyboard Input" }, { icon: Wifi, label: "Web Browsing" }].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
                <Icon className="w-5 h-5 text-white/30 mx-auto mb-2" />
                <p className="text-white/50 text-xs">{f.label}</p>
              </div>
            );
          })}
        </div>
        <button className="mt-8 px-5 py-2.5 border border-white/[0.12] text-white/50 text-sm font-medium rounded-lg hover:border-white/20 hover:text-white/70 transition-colors">
          Enable Computer Control
        </button>
      </div>
    </div>
  );
}
