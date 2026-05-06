"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, Route, Anchor, ArrowLeftRight, Circle } from "lucide-react";
import SimilarityModal from "@/components/SimilarityModal";

/* ─── Constants ─── */
const API_BASE = "https://pratamuy-efhub-backend-api.hf.space";

const tactics = [
  { id: "quick_counter", label: "Quick Counter", icon: Zap },
  { id: "long_ball_counter", label: "Long Ball Counter", icon: Route },
  { id: "possession", label: "Possession", icon: Anchor },
  { id: "out_wide", label: "Out Wide", icon: ArrowLeftRight },
];

const lines = [
  { id: "depan", label: "Forwards" },
  { id: "tengah", label: "Midfielders" },
  { id: "belakang", label: "Defenders" },
];

/* ─── Types ─── */
interface PlayerStat {
  label: string;
  value: number;
  color: "cyan" | "gold";
}

interface APIPlayer {
  player_id: number;
  name: string;
  ovr: number;
  playstyle: string;
  position: string;
  card_type: string;
  stats: PlayerStat[];
}

/* ─── Helpers: split name into first/last ─── */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT: Stat Progress Bar
   ═══════════════════════════════════════════════════════════════ */
function StatBar({ stat }: { stat: PlayerStat }) {
  return (
    <div>
      <div className="flex justify-between font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em] text-m3-on-surface-variant mb-1">
        <span>{stat.label}</span>
        <span className={stat.color === "gold" ? "text-efhub-amber" : "text-efhub-cyan"}>
          {stat.value}
        </span>
      </div>
      <div className="h-1.5 w-full bg-m3-primary-container rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${stat.color === "gold"
              ? "bg-gradient-to-r from-[#fabd00] to-[#ffd000]"
              : "bg-efhub-cyan"
            }`}
          style={{ width: `${stat.value}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT: Player Card
   ═══════════════════════════════════════════════════════════════ */
function PlayerCard({
  player,
  onViewFit,
}: {
  player: APIPlayer;
  onViewFit: (player: APIPlayer) => void;
}) {
  const { firstName, lastName } = splitName(player.name);
  const playstyleColor = player.ovr >= 95 ? "gold" : "cyan";

  return (
    <article className="glass-panel-level-1 rounded-lg p-6 glass-panel-hover transition-all flex flex-col relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Circle className="w-[150px] h-[150px]" />
      </div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6 z-10 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-efhub-cyan/10 text-efhub-cyan font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em] px-2 py-1 rounded-full border border-efhub-cyan/30">
              {player.position}
            </span>
            <span
              className={`font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em] px-2 py-1 rounded-full border ${playstyleColor === "gold"
                  ? "bg-efhub-amber/10 text-efhub-amber border-efhub-amber/30"
                  : "bg-efhub-cyan/10 text-efhub-cyan border-efhub-cyan/30"
                }`}
            >
              {player.playstyle}
            </span>
          </div>
          <h3 className="font-[var(--font-display)] text-2xl font-semibold text-m3-on-surface leading-tight">
            {firstName}
            {lastName && <><br />{lastName}</>}
          </h3>
        </div>
        <div className="w-16 h-16 rounded-lg bg-m3-surface-container-low border border-efhub-cyan flex items-center justify-center ai-pulse shrink-0">
          <span className="font-[var(--font-label)] text-[28px] font-bold text-efhub-cyan">
            {player.ovr}
          </span>
        </div>
      </div>
      {/* Stats */}
      <div className="flex flex-col gap-3 z-10">
        {player.stats.map((stat) => (
          <StatBar key={stat.label} stat={stat} />
        ))}
      </div>
      {/* Card Type Badge */}
      <div className="mt-3 z-10">
        <span className="font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em] text-m3-on-surface-variant opacity-50">
          {player.card_type}
        </span>
      </div>
      {/* Action Button */}
      <button
        onClick={() => onViewFit(player)}
        className="mt-4 w-full bg-m3-surface-container-high border border-white/10 text-efhub-cyan font-[var(--font-label)] text-xs font-bold tracking-[0.08em] uppercase py-2 rounded-sm hover:border-efhub-cyan transition-colors z-10"
      >
        VIEW TACTICAL FIT
      </button>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT: Skeleton Player Card
   ═══════════════════════════════════════════════════════════════ */
function SkeletonPlayerCard() {
  return (
    <div className="glass-panel-level-1 rounded-lg p-6 flex flex-col animate-pulse">
      <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-3">
        <div>
          <div className="flex gap-2 mb-2">
            <div className="h-5 w-10 bg-m3-surface-container-high rounded-full" />
            <div className="h-5 w-24 bg-m3-surface-container-high rounded-full" />
          </div>
          <div className="h-7 w-36 bg-m3-surface-container-high rounded mb-1" />
          <div className="h-7 w-28 bg-m3-surface-container-high rounded" />
        </div>
        <div className="w-16 h-16 bg-m3-surface-container-high rounded-lg" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <div className="h-3 w-20 bg-m3-surface-container-high rounded" />
              <div className="h-3 w-8 bg-m3-surface-container-high rounded" />
            </div>
            <div className="h-1.5 w-full bg-m3-primary-container rounded-full" />
          </div>
        ))}
      </div>
      <div className="mt-6 h-8 w-full bg-m3-surface-container-high rounded" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: Tactical Recommender
   ═══════════════════════════════════════════════════════════════ */
export default function RecommenderPage() {
  const [activeTactic, setActiveTactic] = useState("long_ball_counter");
  const [activeLine, setActiveLine] = useState("depan");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<APIPlayer | null>(null);

  /* ─── API State ─── */
  const [players, setPlayers] = useState<APIPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─── Fetch players when tactic or line changes ─── */
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`${API_BASE}/get-players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taktik: activeTactic, lini: activeLine }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPlayers(data.players ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeTactic, activeLine]);

  const handleViewFit = useCallback((player: APIPlayer) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="font-[var(--font-display)] text-[32px] font-semibold leading-tight text-m3-on-surface mb-2">
          Tactical Recommender
        </h1>
        <p className="font-[var(--font-body)] text-base leading-relaxed text-m3-on-surface-variant max-w-2xl">
          AI-driven scouting module optimized for high-performance formations.
          Adjust tactical bias to refine the player matrix.
        </p>
      </div>

      {/* Tactical Bias Engine */}
      <section className="mb-10">
        <h2 className="font-[var(--font-label)] text-xs font-bold tracking-[0.08em] text-m3-on-surface-variant mb-3 uppercase">
          TACTICAL BIAS ENGINE
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tactics.map((t) => {
            const isActive = activeTactic === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTactic(t.id)}
                className={`glass-panel-level-1 py-3 px-4 rounded-sm font-[var(--font-label)] text-xs font-bold tracking-[0.08em] uppercase flex items-center justify-center gap-2 transition-all ${isActive
                    ? "text-efhub-cyan border-efhub-cyan ai-pulse"
                    : "text-m3-on-surface-variant hover:border-efhub-cyan"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Player Line Tabs */}
      <section className="mb-6 border-b border-white/10 pb-1">
        <div className="flex gap-6 overflow-x-auto">
          {lines.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLine(l.id)}
              className={`pb-1 border-b-2 font-[var(--font-display)] text-2xl font-semibold whitespace-nowrap transition-colors ${activeLine === l.id
                  ? "border-efhub-cyan text-efhub-cyan"
                  : "border-transparent text-m3-on-surface-variant hover:text-m3-on-surface"
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      {/* Player Cards Grid */}
      {isLoading ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPlayerCard key={i} />
          ))}
        </section>
      ) : error ? (
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-m3-error-container/20 flex items-center justify-center mb-4">
            <Circle className="w-10 h-10 text-m3-error opacity-50" />
          </div>
          <p className="font-[var(--font-display)] text-xl font-semibold text-m3-error mb-1">
            Connection Failed
          </p>
          <p className="font-[var(--font-body)] text-sm text-m3-on-surface-variant max-w-md">
            {error}. Make sure the backend is running on {API_BASE}.
          </p>
        </section>
      ) : players.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.player_id} player={player} onViewFit={handleViewFit} />
          ))}
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-m3-surface-container-high flex items-center justify-center mb-4">
            <Circle className="w-10 h-10 text-m3-on-surface-variant opacity-30" />
          </div>
          <p className="font-[var(--font-display)] text-xl font-semibold text-m3-on-surface-variant mb-1">
            No players found
          </p>
          <p className="font-[var(--font-body)] text-sm text-m3-on-surface-variant max-w-md">
            No players match the current filter. Try switching the line.
          </p>
        </section>
      )}

      {/* Similarity Modal */}
      <SimilarityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playerId={selectedPlayer?.player_id ?? 0}
        playerName={selectedPlayer?.name}
        playerOvr={selectedPlayer?.ovr}
        playerPlaystyle={selectedPlayer?.playstyle}
        playerPosition={selectedPlayer?.position}
        playerStats={selectedPlayer?.stats || []}
        playerUrl={selectedPlayer?.url}
        taktik={activeTactic}
        lini={activeLine}
      />
    </>
  );
}
