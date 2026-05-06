"use client";

import { useState, useCallback } from "react";
import {
  X,
  Lightbulb,
  UserSearch,
  CheckCircle,
  SearchX,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radar,
} from "lucide-react";

/* ─── Types ─── */
interface Alternative {
  player_id: number;
  name: string;
  card_type: string;
  ovr: number;
  position: string;
  playstyle: string;
  match_percentage: number;
  url?: string;
}

interface APIResponse {
  status: string;
  target_player: string;
  target_ovr: number;
  cluster_id: number;
  taktik?: string;
  lini?: string;
  alternatives: Alternative[];
  message?: string;
}

interface SimilarityModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: number;
  playerName?: string;
  playerOvr?: number;
  playerPlaystyle?: string;
  playerPosition?: string;
  playerStats?: any[];
  playerUrl?: string;
  taktik?: string;
  lini?: string;
}

/* ─── Radar Chart Helper ─── */
function calculateRadarPoints(stats: any[]) {
  const centerX = 200;
  const centerY = 200;
  const maxRadius = 120;
  
  return stats.map((statObj, i) => {
    const statValue = typeof statObj === "number" ? statObj : (statObj?.value || 0);
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const r = (statValue / 100) * maxRadius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

/* ─── API Config ─── */
const API_BASE_URL = "http://127.0.0.1:8000";
const API_ENDPOINT = `${API_BASE_URL}/find-alternatives`;

/* ─── Match Color Utility ─── */
function getMatchColor(pct: number) {
  if (pct >= 90) return { bg: "bg-green-500", text: "text-green-500", border: "border-green-500/30", bgAlpha: "bg-green-500/10" };
  if (pct >= 85) return { bg: "bg-lime-500", text: "text-lime-500", border: "border-lime-500/30", bgAlpha: "bg-lime-500/10" };
  if (pct >= 80) return { bg: "bg-yellow-500", text: "text-yellow-500", border: "border-yellow-500/30", bgAlpha: "bg-yellow-500/10" };
  return { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/30", bgAlpha: "bg-orange-500/10" };
}

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 h-24 rounded-lg flex items-center p-4 animate-pulse justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-700 rounded" />
        <div>
          <div className="h-4 w-32 bg-slate-700 rounded mb-1" />
          <div className="h-3 w-24 bg-slate-700 rounded" />
        </div>
      </div>
      <div className="h-6 w-16 bg-slate-700 rounded-full" />
    </div>
  );
}

/* ─── Result Card ─── */
function ResultCard({ player }: { player: Alternative }) {
  const color = getMatchColor(player.match_percentage);
  const initials = player.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);
  const href = player.url && player.url !== "#" ? player.url : null;

  const inner = (
    <>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-m3-surface-container rounded overflow-hidden flex-shrink-0 relative border border-white/5 flex items-center justify-center">
          <span className="text-m3-on-surface-variant font-[var(--font-label)] text-xs font-bold tracking-[0.08em]">
            {initials}
          </span>
          <div className="absolute bottom-0 right-0 bg-efhub-amber text-m3-on-secondary-fixed font-[var(--font-label)] text-[10px] px-1 rounded-tl-sm font-bold">
            {player.ovr}
          </div>
        </div>
        {/* Info */}
        <div>
          <h4 className="font-[var(--font-body)] text-base text-m3-on-background font-semibold group-hover:text-efhub-cyan transition-colors flex items-center gap-1">
            {player.name}
            {href && <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />}
          </h4>
          <span className="font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em] text-m3-on-surface-variant">
            {player.playstyle} • {player.position}
          </span>
        </div>
      </div>
      {/* Match Badge */}
      <div className="flex flex-col items-end">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 ${color.bgAlpha} ${color.text} ${color.border} border rounded-full font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em]`}
        >
          <CheckCircle className="w-3 h-3" />
          {player.match_percentage}% Match
        </span>
        <span className="font-[var(--font-label)] text-[9px] font-bold tracking-[0.08em] text-m3-on-surface-variant mt-1">
          {player.card_type}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[rgba(10,17,40,0.7)] backdrop-blur-[12px] border border-white/10 rounded-lg p-3 flex items-center justify-between hover:border-efhub-cyan/50 hover:bg-white/5 transition-all cursor-pointer group"
      >
        {inner}
      </a>
    );
  }
  return (
    <div className="bg-[rgba(10,17,40,0.7)] backdrop-blur-[12px] border border-white/10 rounded-lg p-3 flex items-center justify-between hover:border-efhub-cyan/50 hover:bg-white/5 transition-all group">
      {inner}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT: Similarity Modal
   ═══════════════════════════════════════════════════════════════ */
export default function SimilarityModal({
  isOpen,
  onClose,
  playerId,
  playerName = "Robert Lewandowski",
  playerOvr = 98,
  playerPlaystyle = "Target Man Kuat",
  playerPosition = "ST",
  playerStats = [],
  playerUrl,
  taktik = "long_ball_counter",
  lini = "depan",
}: SimilarityModalProps) {
  /* ─── State ─── */
  const [baseCardsOnly, setBaseCardsOnly] = useState(true);
  const [ovrTolerance, setOvrTolerance] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Alternative[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emptyMsg, setEmptyMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  const validStats = playerStats && playerStats.length > 0 ? playerStats : [];
  const dynamicPoints = validStats.length > 0 ? calculateRadarPoints(validStats) : "";

  const highestStat = validStats.length > 0
    ? validStats.reduce((prev, current) => (prev.value > current.value ? prev : current))
    : { label: "N/A", value: 0 };

  /* ─── API Fetch ─── */
  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setEmptyMsg(null);
    setRecommendations([]);
    setHasSearched(true);
    setVisibleCount(3);

    console.log("[EFHub] 🔍 Generating alternatives...", {
      playerId,
      taktik,
      lini,
      baseCardsOnly,
      ovrTolerance,
    });

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: playerId,
          taktik,
          lini,
          base_only: baseCardsOnly,
          ovr_tolerance: ovrTolerance,
        }),
      });

      console.log("[EFHub] Response status:", response.status);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Unknown server error" }));
        throw new Error(err.detail || `HTTP Error ${response.status}`);
      }

      const data: APIResponse = await response.json();
      console.log("[EFHub] ✅ API Response:", data);

      if (data.alternatives && data.alternatives.length > 0) {
        setRecommendations(data.alternatives);
      } else {
        setEmptyMsg(
          data.message ||
            "Tidak ada pemain alternatif ditemukan. Coba perluas toleransi OVR atau nonaktifkan filter Base Cards Only."
        );
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("[EFHub] ❌ API Error:", msg);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [playerId, taktik, lini, baseCardsOnly, ovrTolerance]);

  /* ─── If not open, render nothing ─── */
  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-efhub-midnight/70 backdrop-blur-md z-[60] flex items-center justify-center p-5 overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-6xl bg-[#0f172a]/90 backdrop-blur-[24px] border border-white/20 rounded-xl shadow-[0_0_40px_rgba(0,219,234,0.15)] overflow-hidden z-[70] flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-3 right-3 text-m3-on-surface-variant hover:text-efhub-cyan transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ═══════════════════════════════════════
            LEFT COLUMN: Meta Radar Comparison
            ═══════════════════════════════════════ */}
        <div className="w-full md:w-1/2 p-4 md:p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
          {/* Player Header */}
          <div className="flex items-start justify-between mb-10 border-b border-white/10 pb-3">
            <div>
              {playerUrl && playerUrl !== "#" ? (
                <a
                  href={playerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 hover:text-efhub-cyan transition-colors"
                >
                  <h2 className="font-[var(--font-display)] text-[32px] font-semibold leading-tight text-m3-on-background mb-1 group-hover:text-efhub-cyan">
                    {playerName}
                  </h2>
                  <ExternalLink className="w-4 h-4 text-m3-on-surface-variant group-hover:text-efhub-cyan mt-0.5" />
                </a>
              ) : (
                <h2 className="font-[var(--font-display)] text-[32px] font-semibold leading-tight text-m3-on-background mb-1">
                  {playerName}
                </h2>
              )}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center px-3 py-1 bg-efhub-cyan/10 text-efhub-cyan font-[var(--font-label)] text-xs font-bold tracking-[0.08em] rounded-full border border-efhub-cyan/30 shadow-[0_0_10px_rgba(0,219,234,0.2)]">
                  {playerPlaystyle}
                </span>
                <span className="text-m3-on-surface-variant font-[var(--font-body)] text-base">
                  {playerPosition}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-[var(--font-label)] text-xl font-semibold text-efhub-amber">
                {playerOvr}
              </span>
              <span className="font-[var(--font-label)] text-xs font-bold tracking-[0.08em] text-m3-on-surface-variant uppercase">
                OVR
              </span>
            </div>
          </div>

          <div className="relative flex-grow flex items-center justify-center min-h-[300px] mb-6 w-full overflow-x-auto custom-scrollbar">
            <svg
              className="w-full max-w-[350px] h-auto drop-shadow-[0_0_15px_rgba(0,219,234,0.2)]"
              viewBox="0 0 400 400"
            >
              {/* Background Grid */}
              {[100, 80, 60, 40, 20].map((scale, i) => (
                <polygon
                  key={`bg-${i}`}
                  fill="none"
                  points={calculateRadarPoints(Array(6).fill(scale))}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}
              {/* Axes */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                return (
                  <line
                    key={`axis-${i}`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                    x1="200"
                    y1="200"
                    x2={200 + 120 * Math.cos(angle)}
                    y2={200 + 120 * Math.sin(angle)}
                  />
                );
              })}
              {/* Cluster Avg (Dashed Amber) */}
              <polygon
                fill="none"
                points={calculateRadarPoints(Array(6).fill(85))}
                stroke="#fabd00"
                strokeDasharray="4,4"
                strokeWidth="2"
              />
              {/* Player Polygon (Dynamic) */}
              {dynamicPoints ? (
                <polygon className="fill-efhub-cyan/20 stroke-efhub-cyan stroke-2" points={dynamicPoints} />
              ) : null}
              {/* Labels */}
              {(validStats.length > 0 ? validStats : Array(6).fill({label: "N/A"})).map((stat, i) => {
                const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                const labelRadius = 120 + 25;
                const x = 200 + labelRadius * Math.cos(angle);
                const y = 200 + labelRadius * Math.sin(angle);
                
                let anchor: "start" | "middle" | "end" = "middle";
                if (Math.abs(x - 200) > 10) {
                  anchor = x < 200 ? "end" : "start";
                }
                
                return (
                  <text
                    key={`label-${i}`}
                    fill="#94A3B8"
                    fontFamily="Lexend"
                    fontSize="10"
                    textAnchor={anchor}
                    x={x}
                    y={y + 4}
                  >
                    {stat.label}
                  </text>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-0 right-0 flex flex-col gap-1 bg-m3-surface-container-high/80 p-1 rounded border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-efhub-cyan/30 border border-efhub-cyan rounded-xs" />
                <span className="font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em] text-m3-on-surface-variant">
                  Player
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0 border-t-2 border-dashed border-efhub-amber" />
                <span className="font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em] text-m3-on-surface-variant">
                  Meta Avg
                </span>
              </div>
            </div>
          </div>

          {/* Insight Box */}
          <div className="mt-auto bg-efhub-cyan/5 border border-efhub-cyan/20 rounded-lg p-3 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-efhub-cyan mt-0.5 flex-shrink-0" />
            <p className="font-[var(--font-body)] text-base text-m3-on-surface-variant">
              <span className="text-m3-on-background font-semibold">Insight:</span>{" "}
              {highestStat.label} is exceptional at <span className="text-efhub-cyan">{highestStat.value}</span>, defining their tactical role in this system.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            RIGHT COLUMN: Find Alternatives
            ═══════════════════════════════════════ */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col bg-m3-surface-container-lowest/50 overflow-y-auto">
          <h3 className="font-[var(--font-display)] text-2xl font-semibold text-m3-on-background mb-10 border-b border-white/10 pb-3">
            Find Similar Meta Players
          </h3>

          {/* Controls */}
          <div className="flex flex-col gap-3 mb-10">
            {/* Toggle: Base Cards Only */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <label className="flex items-center justify-between cursor-pointer group bg-m3-surface-container-high/50 p-3 rounded-lg border border-white/5 hover:border-white/10 flex-1">
                <span className="font-[var(--font-body)] text-base text-m3-on-surface-variant group-hover:text-m3-on-background transition-colors">
                  Base Cards Only (F2P)
                </span>
                {/* Custom Toggle */}
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={baseCardsOnly}
                    onChange={(e) => setBaseCardsOnly(e.target.checked)}
                  />
                  <div
                    className={`block w-10 h-6 rounded-full border transition-colors ${
                      baseCardsOnly
                        ? "bg-efhub-cyan/20 border-efhub-cyan/50"
                        : "bg-m3-surface-variant border-white/10"
                    }`}
                  />
                  <div
                    className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-200 ${
                      baseCardsOnly
                        ? "translate-x-4 bg-efhub-cyan"
                        : "translate-x-0 bg-m3-outline"
                    }`}
                  />
                </div>
              </label>
            </div>

            {/* OVR Tolerance Slider */}
            <div className="bg-m3-surface-container-high/50 p-3 rounded-lg border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-[var(--font-body)] text-base text-m3-on-surface-variant">
                  OVR Tolerance
                </span>
                <span className="font-[var(--font-label)] text-sm font-semibold text-efhub-cyan">
                  ± {ovrTolerance}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={ovrTolerance}
                onChange={(e) => setOvrTolerance(parseInt(e.target.value))}
                className="w-full h-1 bg-m3-surface-variant rounded-lg appearance-none cursor-pointer accent-efhub-cyan"
              />
              <div className="flex justify-between text-[10px] font-[var(--font-label)] font-bold tracking-[0.08em] text-m3-outline mt-1">
                <span>0</span>
                <span>3</span>
                <span>5</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full bg-efhub-amber hover:bg-m3-secondary-fixed text-m3-on-secondary-fixed font-[var(--font-label)] text-xs font-bold tracking-[0.08em] uppercase py-3 rounded-lg shadow-[0_4px_14px_rgba(250,189,0,0.2)] transition-all flex items-center justify-center gap-1 mt-1 ${
                isLoading ? "opacity-70 cursor-wait" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Radar className="w-4 h-4 animate-spin" />
                  SCANNING DATABASE...
                </>
              ) : (
                <>
                  <UserSearch className="w-4 h-4" />
                  Generate Alternatives
                </>
              )}
            </button>
          </div>

          {/* Results Area */}
          {(() => {
            const filteredAlternatives = recommendations.filter((player) =>
              baseCardsOnly ? player.card_type === "Standard" : true
            );
            const displayedAlternatives = filteredAlternatives.slice(0, visibleCount);

            return (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Loading State */}
                  {isLoading && (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  )}

                  {/* Success: Render results */}
                  {!isLoading &&
                    displayedAlternatives.map((player) => (
                      <ResultCard key={player.player_id} player={player} />
                    ))}

                  {/* Empty State */}
                  {!isLoading &&
                    hasSearched &&
                    filteredAlternatives.length === 0 &&
                    !errorMsg &&
                    emptyMsg && (
                      <div className="bg-[rgba(10,17,40,0.7)] border border-white/10 rounded-lg p-6 text-center">
                        <SearchX className="w-10 h-10 text-m3-on-surface-variant mb-3 mx-auto" />
                        <p className="font-[var(--font-body)] text-m3-on-surface-variant">
                          {emptyMsg}
                        </p>
                      </div>
                    )}

                  {/* Error State */}
                  {!isLoading && errorMsg && (
                    <div className="bg-m3-error-container/10 border border-m3-error/30 rounded-lg p-6 text-center">
                      <AlertCircle className="w-10 h-10 text-m3-error mb-3 mx-auto" />
                      <p className="font-[var(--font-body)] text-m3-error font-semibold mb-1">
                        Connection Failed
                      </p>
                      <p className="font-[var(--font-body)] text-m3-on-surface-variant text-sm">
                        {errorMsg}
                      </p>
                      <p className="font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em] text-m3-on-surface-variant mt-3">
                        Make sure the backend is running on {API_BASE_URL}
                      </p>
                    </div>
                  )}

                  {/* Initial placeholder */}
                  {!isLoading && !hasSearched && filteredAlternatives.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-50">
                      <UserSearch className="w-12 h-12 text-m3-on-surface-variant mb-3" />
                      <p className="font-[var(--font-body)] text-sm text-m3-on-surface-variant">
                        Adjust filters and click <strong>&quot;Generate Alternatives&quot;</strong>{" "}
                        to find similar tactical players.
                      </p>
                    </div>
                  )}
                </div>

                {/* View More / Show Less Button */}
                {!isLoading && filteredAlternatives.length > 3 && (
                  <div className="flex gap-2 mt-3 w-full flex-shrink-0">
                    {/* Show Less Button: Only appears if we are showing more than the initial 3 */}
                    {visibleCount > 3 && (
                      <button 
                        onClick={() => setVisibleCount(prev => Math.max(3, prev - 10))}
                        className="flex-1 py-2 text-sm font-semibold text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-colors"
                      >
                        Show Less
                      </button>
                    )}
                    
                    {/* View More Button: Only appears if there are still more players to show */}
                    {visibleCount < filteredAlternatives.length && (
                      <button 
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="flex-1 py-2 text-sm font-semibold text-cyan-400 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-lg transition-colors"
                      >
                        View More
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
