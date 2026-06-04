import React, { useState, useEffect } from "react";
import { User, Bot, Paintbrush, Bell, Shield, Check } from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "ai", label: "AI Preferences", icon: Bot },
  { id: "appearance", label: "Appearance", icon: Paintbrush },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Data", icon: Shield },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${value ? "bg-white/70" : "bg-white/15"}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

const MODELS = [
  "llama-3.3-70b-versatile (Groq)",
  "meta/llama-3.3-70b-instruct (NVIDIA)",
  "meta-llama/llama-3.3-70b-instruct:free (OpenRouter)",
  "llama-3.1-8b-instant (Groq)",
  "mixtral-8x7b-32768 (Groq)",
];

const THEMES = ["Dark", "Darker", "OLED"];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("mx_display_name") ?? "MadarX User");

  // AI Preferences
  const [defaultModel, setDefaultModel] = useState(() => localStorage.getItem("mx_default_model") ?? MODELS[0]);
  const [coworkerMode, setCoworkerMode] = useState(() => localStorage.getItem("mx_coworker") === "true");
  const [smartRouting, setSmartRouting] = useState(() => localStorage.getItem("mx_smart_routing") !== "false");
  const [memoryEnabled, setMemoryEnabled] = useState(() => localStorage.getItem("mx_memory") !== "false");

  // Notifications
  const [notifAgents, setNotifAgents] = useState(() => localStorage.getItem("mx_notif_agents") !== "false");
  const [notifAlerts, setNotifAlerts] = useState(() => localStorage.getItem("mx_notif_alerts") !== "false");
  const [notifModels, setNotifModels] = useState(() => localStorage.getItem("mx_notif_models") === "true");

  // Appearance
  const [theme, setTheme] = useState(() => localStorage.getItem("mx_theme") ?? "Dark");

  function saveProfile() {
    localStorage.setItem("mx_display_name", displayName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveAI() {
    localStorage.setItem("mx_default_model", defaultModel);
    localStorage.setItem("mx_coworker", String(coworkerMode));
    localStorage.setItem("mx_smart_routing", String(smartRouting));
    localStorage.setItem("mx_memory", String(memoryEnabled));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveNotifications() {
    localStorage.setItem("mx_notif_agents", String(notifAgents));
    localStorage.setItem("mx_notif_alerts", String(notifAlerts));
    localStorage.setItem("mx_notif_models", String(notifModels));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveTheme() {
    localStorage.setItem("mx_theme", theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">System Settings</h1>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-400 text-sm">
            <Check className="w-4 h-4" /> Saved
          </div>
        )}
      </div>

      <div className="flex gap-5">
        {/* Tabs */}
        <div className="w-[200px] flex-shrink-0">
          <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors border-b border-white/[0.05] last:border-0 ${
                    activeTab === tab.id ? "bg-white/[0.07] text-white font-medium" : "text-white/45 hover:text-white/70 hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#111] border border-white/[0.07] rounded-xl p-6">
          {activeTab === "profile" && (
            <div>
              <h2 className="text-white font-semibold mb-1">User Profile</h2>
              <p className="text-white/40 text-sm mb-6">Manage your system identity and account details.</p>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-white/40 text-[10px] tracking-widest uppercase font-semibold block mb-2">Display Name</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-[10px] tracking-widest uppercase font-semibold block mb-2">System Level</label>
                  <div className="flex items-center justify-between bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-4 py-2.5">
                    <span className="text-white/70 text-sm">Administrator</span>
                    <span className="text-[10px] font-bold tracking-widest border border-white/20 text-white/50 px-2 py-0.5 rounded">ELITE PLAN</span>
                  </div>
                </div>
                <button onClick={saveProfile} className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div>
              <h2 className="text-white font-semibold mb-1">AI Preferences</h2>
              <p className="text-white/40 text-sm mb-6">Configure AI providers and behavior. MadarX automatically picks the best provider for each task.</p>
              <div className="space-y-5 max-w-md">
                <div>
                  <label className="text-white/40 text-[10px] tracking-widest uppercase font-semibold block mb-2">Default Model</label>
                  <select
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white/70 text-sm outline-none focus:border-white/20 transition-colors"
                  >
                    {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Smart Routing", desc: "Auto-select best AI provider per task (NVIDIA for code, OpenRouter for research, Groq for chat)", value: smartRouting, set: setSmartRouting },
                    { label: "AI Coworker Mode", desc: "Let MadarX work autonomously in the background on tasks", value: coworkerMode, set: setCoworkerMode },
                    { label: "Memory Learning", desc: "Allow MadarX to store and recall information across chats", value: memoryEnabled, set: setMemoryEnabled },
                  ].map(({ label, desc, value, set }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.05]">
                      <div>
                        <p className="text-white/80 text-sm font-medium">{label}</p>
                        <p className="text-white/35 text-xs mt-0.5">{desc}</p>
                      </div>
                      <Toggle value={value} onChange={set} />
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-lg p-3 text-xs text-white/35 space-y-1 mb-3">
                    <p className="text-white/50 font-semibold text-[10px] tracking-widest uppercase mb-2">Active API Keys</p>
                    <p>✓ GROQ_API_KEY — Fast chat & general tasks</p>
                    <p>✓ NVIDIA_API_KEY — Code & reasoning tasks</p>
                    <p>✓ OPENROUTER_API_KEY — Research & long context</p>
                  </div>
                  <button onClick={saveAI} className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div>
              <h2 className="text-white font-semibold mb-1">Appearance</h2>
              <p className="text-white/40 text-sm mb-6">Customize how MadarX looks.</p>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-white/40 text-[10px] tracking-widest uppercase font-semibold block mb-3">Theme</label>
                  <div className="flex gap-3">
                    {THEMES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                          theme === t ? "border-white/40 text-white bg-white/[0.08]" : "border-white/[0.08] text-white/40 hover:text-white/70"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={saveTheme} className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
                  Save Appearance
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-white font-semibold mb-1">Notifications</h2>
              <p className="text-white/40 text-sm mb-6">Manage your notification preferences.</p>
              <div className="space-y-0 max-w-md">
                {[
                  { label: "Agent completions", desc: "Notify when an agent finishes a task", value: notifAgents, set: setNotifAgents },
                  { label: "System alerts", desc: "Critical system and API status alerts", value: notifAlerts, set: setNotifAlerts },
                  { label: "New model releases", desc: "Get notified when new AI models are available", value: notifModels, set: setNotifModels },
                ].map(({ label, desc, value, set }) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-4 border-b border-white/[0.05]">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{label}</p>
                      <p className="text-white/35 text-xs mt-0.5">{desc}</p>
                    </div>
                    <Toggle value={value} onChange={set} />
                  </div>
                ))}
              </div>
              <button onClick={saveNotifications} className="mt-5 px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
                Save Notifications
              </button>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h2 className="text-white font-semibold mb-1">Privacy & Data</h2>
              <p className="text-white/40 text-sm mb-6">Control your data and privacy settings.</p>
              <div className="space-y-3 max-w-md">
                <button
                  onClick={async () => {
                    const res = await fetch("/api/memory");
                    const data = await res.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "madarx-memories.json"; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full text-left flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border border-white/[0.07] rounded-lg hover:border-white/[0.12] transition-colors"
                >
                  <span className="text-white/70 text-sm">Export my memories (JSON)</span>
                  <span className="text-white/30 text-xs">↓</span>
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/chat/conversations");
                    const data = await res.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "madarx-conversations.json"; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full text-left flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border border-white/[0.07] rounded-lg hover:border-white/[0.12] transition-colors"
                >
                  <span className="text-white/70 text-sm">Export conversations (JSON)</span>
                  <span className="text-white/30 text-xs">↓</span>
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Delete ALL memories permanently?")) return;
                    await fetch("/api/memory", { method: "DELETE" });
                  }}
                  className="w-full text-left flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border border-red-500/20 rounded-lg hover:border-red-500/40 transition-colors"
                >
                  <span className="text-red-400/80 text-sm">Delete all memories</span>
                  <span className="text-white/30 text-xs">→</span>
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Delete ALL conversations permanently?")) return;
                    const res = await fetch("/api/chat/conversations");
                    const convs = await res.json();
                    for (const c of convs) {
                      await fetch(`/api/chat/conversations/${c.id}`, { method: "DELETE" });
                    }
                  }}
                  className="w-full text-left flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border border-red-500/20 rounded-lg hover:border-red-500/40 transition-colors"
                >
                  <span className="text-red-400/80 text-sm">Delete all conversations</span>
                  <span className="text-white/30 text-xs">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
