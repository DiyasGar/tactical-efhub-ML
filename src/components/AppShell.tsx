"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Brain,
  Bot,
  BarChart3,
  HelpCircle,
  LogOut,
  Search,
  UserCircle,
  Settings,
} from "lucide-react";

/* ─── Navigation Items ─── */
const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recommender", label: "Recommender", icon: Brain },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];



/* ─── Top App Bar (Desktop) ─── */
function TopAppBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://pratamuy-efhub-backend-api.hf.space/search-players?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.status === "success" && data.results) {
          setSearchResults(data.results);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="fixed top-0 w-full z-50 hidden md:flex justify-between items-center px-5 h-16 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      {/* Left: Brand */}
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold uppercase tracking-widest text-amber-400 font-[var(--font-display)]">
          Tactical HUD
        </span>
      </div>

      {/* Right: Search Bar */}
      <div className="flex items-center">
        <div ref={dropdownRef} className="relative flex flex-col items-end">
          <div className="relative flex items-center bg-[#121936] border border-slate-700/50 rounded-lg focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all duration-300 w-64 focus-within:w-72 overflow-hidden z-50">
            <Search className="absolute left-3 text-slate-500 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Meta Players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsDropdownOpen(true);
              }}
              className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 py-2 pl-9 pr-4 focus:outline-none"
            />
            {isSearching && (
              <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-400 animate-pulse w-full shadow-[0_0_8px_#22d3ee]"></div>
            )}
          </div>

          {/* Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl z-40 max-h-64 overflow-y-auto custom-scrollbar">
              {searchResults.map((player) => (
                <a
                  key={player.player_id}
                  href={player.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-between items-center px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {player.name}
                    </span>
                    <span className="text-xs text-slate-500 font-[var(--font-label)] tracking-wider">
                      {player.position} • {player.card_type}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {player.ovr}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Sidebar Navigation ─── */
function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 z-40 hidden md:flex flex-col pt-20 pb-8 bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 shadow-2xl transition-all duration-300 ease-in-out">
      {/* Brand */}
      <div className="px-5 mb-16">
        <h2 className="text-lg font-black text-amber-400 font-[var(--font-display)] tracking-widest">
          STRATEGIST AI
        </h2>
        <p className="text-xs font-bold tracking-[0.08em] text-slate-500 mt-1 font-[var(--font-label)] uppercase">
          Elite Tier
        </p>
      </div>

      {/* Main Nav */}
      <div className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg
                font-[var(--font-display)] text-sm uppercase tracking-wider
                transition-all duration-200
                ${isActive
                  ? "text-cyan-400 border-r-2 border-cyan-400 bg-cyan-400/10"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>


    </nav>
  );
}

/* ─── Mobile Top Bar ─── */
function MobileTopBar() {
  return (
    <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <span className="text-xl font-bold uppercase tracking-widest text-amber-400 font-[var(--font-display)]">
        Tactical HUD
      </span>

    </header>
  );
}

/* ─── Combined App Shell ─── */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopAppBar />
      <MobileTopBar />
      <SideNav />

      {/* Main Content Canvas */}
      <main className="md:ml-64 pt-20 p-5 min-h-screen relative">
        {children}
      </main>
    </>
  );
}
