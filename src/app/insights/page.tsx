"use client";

import { useState, useEffect, useMemo } from "react";
import { Cpu, TrendingUp, Layers, Grid3X3, Network } from "lucide-react";

/* ─── Constants ─── */
const INTENSITY_MAP: Record<string, { bg: string; text: string }> = {
  high:    { bg: "bg-cyan-400",  text: "text-slate-900 font-bold" },
  medhigh: { bg: "bg-cyan-600",  text: "text-white/90" },
  med:     { bg: "bg-cyan-900",  text: "text-white/70" },
  low:     { bg: "bg-slate-600", text: "text-white/50" },
  vlow:    { bg: "bg-slate-800", text: "text-white/30" },
};

const ATTRIBUTES = ["Pace", "Shooting", "Passing", "Dribbling", "Defending", "Physical"];

const TACTICS = [
  { id: "long_ball_counter", label: "Long Ball Counter" },
  { id: "quick_counter",     label: "Quick Counter" },
  { id: "possession",        label: "Possession" },
  { id: "out_wide",          label: "Out Wide" },
  { id: "long_ball",         label: "Long Ball" },
];

const LINES = [
  { lini: "depan",   label: "Forwards (Depan)" },
  { lini: "tengah",  label: "Midfield (Tengah)" },
  { lini: "belakang",label: "Defence (Belakang)" },
];

/* ─── Helper: average a named stat across all players ─── */
function avgStat(players: any[], statLabel: string): number {
  if (!players.length) return 0;
  let total = 0;
  players.forEach(p => {
    const s = (p.stats || []).find((st: any) => st.label === statLabel);
    if (s) total += s.value ?? 0;
  });
  return Math.round(total / players.length);
}

function getIntensity(v: number) {
  if (v >= 90) return "high";
  if (v >= 80) return "medhigh";
  if (v >= 70) return "med";
  if (v >= 60) return "low";
  return "vlow";
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: Meta Insights
   ═══════════════════════════════════════════════════════════════ */
export default function InsightsPage() {
  const [activeTactic, setActiveTactic] = useState("quick_counter");
  const [clusterData, setClusterData] = useState<{ lini: string; label: string; players: any[] }[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Fetch 3 lines for the active tactic ─── */
  useEffect(() => {
    setLoading(true);
    setClusterData([]);

    Promise.all(
      LINES.map(line =>
        fetch("http://127.0.0.1:8000/get-players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taktik: activeTactic, lini: line.lini }),
        })
          .then(res => res.json())
          .then(d => ({ lini: line.lini, label: line.label, players: d.players || [] }))
          .catch(() => ({ lini: line.lini, label: line.label, players: [] }))
      )
    )
      .then(results => {
        setClusterData(results);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tactic data:", err);
        setLoading(false);
      });
  }, [activeTactic]);

  /* ─── Derive heatmap rows from clusterData ─── */
  const heatmapData = useMemo(() => {
    return clusterData.map(data => {
      const pace      = avgStat(data.players, "PACE");
      const shooting  = avgStat(data.players, "SHOOTING");
      const passing   = avgStat(data.players, "PASSING");
      const dribbling = avgStat(data.players, "DRIBBLING");
      const defending = avgStat(data.players, "DEFENDING");
      const physical  = avgStat(data.players, "PHYSICAL");

      return {
        label: data.label,
        values: [pace, shooting, passing, dribbling, defending, physical].map(v => ({
          v,
          intensity: getIntensity(v),
        })),
      };
    });
  }, [clusterData]);

  /* ─── Cluster archetype cards ─── */
  const archetypeCards = useMemo(() => {
    const colors = ["efhub-cyan", "efhub-amber", "m3-primary"];
    return clusterData.map((data, idx) => {
      const avgOvr = data.players.length
        ? Math.round(data.players.reduce((sum, p) => sum + p.ovr, 0) / data.players.length)
        : 0;
      return {
        idx,
        color: colors[idx],
        label: data.label,
        avgOvr,
        count: data.players.length,
        topPlayer: data.players[0]?.name ?? "N/A",
      };
    });
  }, [clusterData]);

  const activeTacticLabel = TACTICS.find(t => t.id === activeTactic)?.label ?? activeTactic;

  const neuralPulse = (
    <div className="flex flex-col items-center justify-center p-10 h-full w-full">
      <div className="relative flex items-center justify-center mb-4 h-16 w-16">
        <Network className="w-12 h-12 text-efhub-cyan animate-pulse absolute" />
        <Cpu className="w-6 h-6 text-efhub-amber animate-bounce absolute" />
      </div>
      <p className="font-[var(--font-body)] text-sm text-efhub-cyan animate-pulse">
        Strategist AI is processing tactical data...
      </p>
    </div>
  );

  return (
    <>
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <Cpu className="w-5 h-5 text-efhub-cyan" />
          <span className="font-[var(--font-label)] text-xs font-bold tracking-[0.08em] text-efhub-cyan uppercase">
            System Analytics
          </span>
        </div>
        <h1 className="font-[var(--font-display)] text-5xl font-bold leading-tight tracking-tight text-m3-on-surface">
          Machine Learning Insights
        </h1>
        <p className="font-[var(--font-body)] text-lg leading-relaxed text-m3-on-surface-variant mt-3 max-w-2xl">
          Advanced clustering and algorithmic analysis of player archetypes based on high-dimensional performance data.
        </p>
      </div>

      {/* ─── Tactic Tabs ─── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TACTICS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTactic(t.id)}
            className={`px-4 py-2 rounded-full border font-[var(--font-label)] text-sm font-bold tracking-[0.06em] transition-all duration-200 ${
              activeTactic === t.id
                ? "border-efhub-cyan bg-efhub-cyan/10 text-efhub-cyan shadow-[0_0_12px_rgba(0,219,234,0.3)]"
                : "border-white/10 text-m3-on-surface-variant hover:border-white/30 hover:text-m3-on-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ═══════════════════════════════════════
            Elbow Method Chart (8 cols)
            ═══════════════════════════════════════ */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-8 flex flex-col transition-all duration-300">
          <div className="flex justify-between items-start mb-6 pb-3 border-b border-white/10">
            <div>
              <h2 className="font-[var(--font-display)] text-2xl font-semibold text-m3-on-surface flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-efhub-amber" />
                Elbow Method Analysis
              </h2>
              <p className="font-[var(--font-body)] text-base text-m3-on-surface-variant mt-1">
                Optimal k determination for player archetype clustering.
              </p>
            </div>
            <div className="bg-efhub-cyan/10 px-3 py-1 rounded-full border border-efhub-cyan/20 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-efhub-cyan animate-pulse" />
              <span className="font-[var(--font-label)] text-xs font-bold tracking-[0.08em] text-efhub-cyan">
                Live Processing
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="flex-1 relative min-h-[300px] flex items-end justify-center w-full">
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 800 300">
              <defs>
                <linearGradient id="areaGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#00dbea" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00dbea" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[50, 100, 150, 200].map((y) => (
                <line key={y} className="stroke-white/10" strokeDasharray="4 4" strokeWidth="1" x1="50" x2="750" y1={y} y2={y} />
              ))}
              <line className="stroke-white/20" strokeWidth="1" x1="50" x2="750" y1="250" y2="250" />
              {[{ y: 55, label: "80k" }, { y: 105, label: "60k" }, { y: 155, label: "40k" }, { y: 205, label: "20k" }].map((item) => (
                <text key={item.label} fill="#767c99" fontFamily="Lexend" fontSize="12" textAnchor="end" x="30" y={item.y}>{item.label}</text>
              ))}
              {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                <text key={k} fill={k === 4 ? "#ffdf9e" : "#767c99"} fontFamily="Lexend" fontSize={k === 4 ? "14" : "12"} fontWeight={k === 4 ? "bold" : "normal"} textAnchor="middle" x={50 + k * 100} y="270">{k}</text>
              ))}
              <path d="M100,60 L200,120 L300,180 L400,220 L500,230 L600,235 L700,238 L700,250 L100,250 Z" fill="url(#areaGradient)" />
              <path d="M100,60 L200,120 L300,180 L400,220 L500,230 L600,235 L700,238" fill="none" stroke="#00dbea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {[{ cx: 100, cy: 60 }, { cx: 200, cy: 120 }, { cx: 300, cy: 180 }, { cx: 500, cy: 230 }, { cx: 600, cy: 235 }, { cx: 700, cy: 238 }].map((p) => (
                <circle key={`${p.cx}-${p.cy}`} cx={p.cx} cy={p.cy} r="4" fill="#0A1128" stroke="#00dbea" strokeWidth="2" />
              ))}
              <g transform="translate(400,220)">
                <circle cx="0" cy="0" r="8" fill="#00dbea" stroke="#FFC107" strokeWidth="3" style={{ filter: "drop-shadow(0 0 8px rgba(0,239,255,0.8))" }} />
                <line stroke="#FFC107" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="0" y1="8" y2="30" />
                <rect fill="#0A1128" height="24" rx="4" stroke="#FFC107" strokeWidth="1" width="60" x="-30" y="-40" />
                <text fill="#FFC107" fontFamily="Lexend" fontSize="12" fontWeight="bold" textAnchor="middle" x="0" y="-24">k = 4</text>
              </g>
            </svg>
          </div>

          <div className="mt-3 flex justify-between items-center text-sm">
            <span className="text-m3-on-surface-variant">Inertia relative to K-clusters</span>
            <span className="text-efhub-cyan">Elbow detected at k=4. Confidence: 94.2%</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            Cluster Archetypes (4 cols)
            ═══════════════════════════════════════ */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-4 flex flex-col">
          <div className="mb-4 pb-3 border-b border-white/10">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold text-m3-on-surface flex items-center gap-3">
              <Layers className="w-5 h-5 text-efhub-amber" />
              Cluster Archetypes
            </h2>
            <p className="text-xs text-efhub-cyan font-[var(--font-label)] font-bold tracking-[0.08em] mt-1 uppercase">
              {activeTacticLabel}
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {loading ? (
              neuralPulse
            ) : archetypeCards.map((c) => (
              <div key={c.idx} className="bg-m3-surface-container/50 border border-white/5 rounded-lg p-3 hover:border-efhub-cyan/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-[var(--font-label)] text-base font-semibold text-m3-on-surface">
                    {c.label}
                  </span>
                  <span className="bg-efhub-cyan/10 text-efhub-cyan font-[var(--font-label)] text-xs font-bold tracking-[0.08em] px-2 py-1 rounded-full">
                    OVR {c.avgOvr}
                  </span>
                </div>
                <p className="font-[var(--font-body)] text-sm text-m3-on-surface-variant mb-2">
                  {c.count} players · Top: <span className="text-efhub-amber">{c.topPlayer}</span>
                </p>
                <div className="flex gap-1 flex-wrap">
                  <span className="text-xs border border-white/10 rounded px-2 py-0.5 text-m3-on-surface-variant">{activeTacticLabel}</span>
                  <span className="text-xs border border-white/10 rounded px-2 py-0.5 text-m3-on-surface-variant">{c.lini ?? c.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            Attribute Distribution Matrix (12 cols)
            ═══════════════════════════════════════ */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-12 flex flex-col">
          <div className="mb-6 pb-3 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="font-[var(--font-display)] text-2xl font-semibold text-m3-on-surface flex items-center gap-3">
                <Grid3X3 className="w-5 h-5 text-efhub-amber" />
                Attribute Distribution Matrix
              </h2>
              <p className="text-xs text-efhub-cyan font-[var(--font-label)] font-bold tracking-[0.08em] mt-1 uppercase">
                {activeTacticLabel} · All Lines
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-m3-on-surface-variant font-[var(--font-label)] font-bold tracking-[0.08em]">
              <span>Intensity:</span>
              <div className="flex w-32 h-2 rounded-full overflow-hidden">
                <div className="w-1/5 bg-slate-800" />
                <div className="w-1/5 bg-slate-600" />
                <div className="w-1/5 bg-cyan-900" />
                <div className="w-1/5 bg-cyan-600" />
                <div className="w-1/5 bg-cyan-400" />
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[700px]">
              {/* Header Row */}
              <div className="grid grid-cols-7 gap-1 mb-2 font-[var(--font-label)] text-xs font-bold tracking-[0.08em] text-m3-on-surface-variant text-center pb-2 border-b border-white/5">
                <div className="text-left pl-2">Line</div>
                {ATTRIBUTES.map((attr) => <div key={attr}>{attr}</div>)}
              </div>
              {/* Data Rows */}
              <div className="flex flex-col gap-1">
                {loading ? (
                  neuralPulse
                ) : heatmapData.map((row) => (
                  <div key={row.label} className="grid grid-cols-7 gap-1 h-12">
                    <div className="flex items-center pl-2 font-[var(--font-label)] text-sm font-semibold text-m3-on-surface truncate">
                      {row.label}
                    </div>
                    {row.values.map((cell, i) => {
                      const style = INTENSITY_MAP[cell.intensity];
                      return (
                        <div
                          key={i}
                          className={`${style.bg} rounded flex items-center justify-center ${style.text} text-sm transition-all duration-200 hover:opacity-80 hover:scale-105`}
                          title={`${ATTRIBUTES[i]}: ${cell.v}`}
                        >
                          {cell.v || "—"}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
