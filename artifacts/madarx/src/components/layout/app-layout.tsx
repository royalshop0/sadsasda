import React from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, Code2, Layers, Users,
  Zap, FolderOpen, Brain, BarChart2, Settings,
  Search, Mic, Puzzle, Bell, ChevronRight
} from "lucide-react";
import logoImage from "@assets/MX_1780567719762.png";
import { useHealthCheck } from "@workspace/api-client-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/coding", label: "Coding", icon: Code2 },
  { href: "/app-builder", label: "App Builder", icon: Layers },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/automation", label: "Automation", icon: Zap },
  { href: "/files", label: "Files", icon: FolderOpen },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();
  const isHealthy = health?.status === "ok";

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[130px] flex-shrink-0 flex flex-col bg-[#0d0d0d] border-r border-white/[0.06]">
        {/* Logo */}
        <Link href="/">
          <div className="flex flex-col items-center justify-center pt-6 pb-4 cursor-pointer">
            <img src={logoImage} alt="MX" className="w-9 h-9 object-contain" />
            <span className="text-white font-bold text-[11px] tracking-[0.2em] mt-2">MADARX</span>
            <span className="text-white/30 text-[9px] tracking-[0.15em] mt-0.5">AI OS</span>
          </div>
        </Link>

        <div className="w-full h-px bg-white/[0.06] mb-2" />

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-center cursor-pointer transition-all duration-150 group ${
                    isActive
                      ? "bg-white/[0.1] text-white"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/40 group-hover:text-white/70"}`} />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="text-center">
            <p className="text-[9px] text-white/30 tracking-widest uppercase">System Status</p>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isHealthy ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
              <span className="text-[9px] text-white/40 uppercase tracking-wide">
                ALL SYSTEMS<br />NOMINAL
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[52px] flex-shrink-0 flex items-center px-6 border-b border-white/[0.06] bg-[#0a0a0a] gap-4">
          {/* Welcome */}
          <div className="flex items-center gap-2 min-w-0 w-52 flex-shrink-0">
            <span className="text-white/80 text-sm font-medium truncate">Welcome back, MadarX User</span>
            <span className="text-[10px] font-bold tracking-widest border border-white/20 text-white/60 px-1.5 py-0.5 rounded flex-shrink-0">
              ELITE PLAN
            </span>
          </div>

          {/* Search bar */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="What do you want MadarX to do?"
                className="w-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] rounded-md py-1.5 pl-8 pr-20 text-sm text-white/70 placeholder:text-white/30 outline-none transition-all focus:border-white/20 focus:bg-white/[0.07]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="inline-flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-white/30">
                  ⌘
                </kbd>
                <kbd className="inline-flex items-center rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-white/30">
                  K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
              <Puzzle className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.08] text-white/60 hover:bg-white/[0.12] transition-colors ml-1 text-xs font-bold">
              M
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
