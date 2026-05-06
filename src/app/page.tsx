"use client";

import { ArrowRight, Network, Users, Server } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

/* ─── Dashboard (Home Page) ─── */
export default function DashboardPage() {
  const [isServerOnline, setIsServerOnline] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const res = await fetch("https://pratamuy-efhub-backend-api.hf.space/", { cache: "no-store" });
        setIsServerOnline(res.ok);
      } catch (error) {
        setIsServerOnline(false);
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ════════════════════════════════════════════════
          Hero Section
          ════════════════════════════════════════════════ */}
      <section className="relative rounded-xl overflow-hidden mb-6 border border-white/10 bg-efhub-navy min-h-[400px] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDo6-Swh_gT0BCaZFVB-u0lHoHsRs2FymTRGw1b1RdyTOkLDaeWRwhxIkrs5l4Q5_whDva2SII4iH6mHMcdj4Wa5XzL3M32MIS9wlj4kvUmgWRr-PGpxHOcA3H6jm0czhEllE-wr2BB23SJOp6dDACvuCKmRHegUAI3ObN8ntHmakxYOtBlC1W7uZ8jqzdEHI_jGsOFOhp63G2EPOc7HHfHuu_WWdDlvV_BG81ZtyKkwDhXds-VKoYUTVbeZrowqNWyVW9HNfXrgG4')`,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-efhub-midnight via-efhub-midnight/80 to-transparent" />

        {/* Content */}
        <div className="relative z-10 px-10 py-16 max-w-3xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-efhub-cyan/10 border border-efhub-cyan/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-efhub-cyan" />
            <span className="font-[var(--font-label)] text-xs font-bold tracking-[0.08em] text-efhub-cyan uppercase">
              SYSTEM ACTIVE v2.4
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-[var(--font-display)] text-5xl font-bold leading-[1.1] tracking-tight text-m3-on-surface mb-3">
            Master the Meta.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-efhub-amber to-amber-200">
              Elevate Your Squad.
            </span>
          </h1>

          {/* Description */}
          <p className="font-[var(--font-body)] text-lg leading-relaxed text-m3-on-surface-variant mb-16 max-w-2xl">
            AI-powered player recommendations based on elite eFootball tactical
            data. Outsmart your opponents with predictive analytics and real-time
            meta adjustments.
          </p>

          {/* CTA Button */}
          <Link
            href="/recommender"
            className="inline-flex items-center gap-3 bg-efhub-gold text-efhub-gold-dark font-[var(--font-label)] text-xs font-bold tracking-[0.08em] uppercase px-10 py-4 rounded-sm hover:opacity-90 transition-all group shadow-[0_0_20px_rgba(255,193,7,0.3)]"
          >
            FIND YOUR META PLAYERS
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          Quick Stats Row (Bento Grid)
          ════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Stat Card 1: Models Trained */}
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
            <Network className="w-9 h-9 text-efhub-cyan" />
          </div>
          <h3 className="font-[var(--font-label)] text-xs font-bold tracking-[0.08em] text-slate-400 uppercase">
            MODELS TRAINED
          </h3>
          <div className="flex items-end gap-3">
            <span className="font-[var(--font-display)] text-[32px] font-semibold leading-tight text-m3-on-surface">
              12
            </span>
            <span className="font-[var(--font-body)] text-sm text-efhub-cyan mb-1">
              +2 this week
            </span>
          </div>
        </div>

        {/* Stat Card 2: Players Analyzed */}
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
            <Users className="w-9 h-9 text-efhub-amber" />
          </div>
          <h3 className="font-[var(--font-label)] text-xs font-bold tracking-[0.08em] text-slate-400 uppercase">
            PLAYERS ANALYZED
          </h3>
          <div className="flex items-end gap-3">
            <span className="font-[var(--font-display)] text-[32px] font-semibold leading-tight text-m3-on-surface">
              18,451
            </span>
            <span className="font-[var(--font-body)] text-sm text-efhub-amber mb-1">
              Global DB
            </span>
          </div>
        </div>

        {/* Stat Card 3: Server Status */}
        <div className={`glass-panel rounded-xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group ${isServerOnline ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isServerOnline ? 'bg-green-500/5' : 'bg-red-500/5'}`} />
          <div className="absolute top-0 right-0 p-3">
            <Server className={`w-9 h-9 opacity-20 ${isServerOnline ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <h3 className="font-[var(--font-label)] text-xs font-bold tracking-[0.08em] text-slate-400 uppercase">
            SERVER STATUS
          </h3>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isServerOnline ? 'bg-green-500 pulse-dot' : 'bg-red-500'}`} />
            <span className={`font-[var(--font-display)] text-2xl font-semibold ${isServerOnline ? 'text-green-400' : 'text-slate-500'}`}>
              {isServerOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          Tactical Modules Canvas (Placeholder)
          ════════════════════════════════════════════════ */}
      <div className="h-64 rounded-xl border border-white/5 border-dashed flex items-center justify-center text-slate-600 font-[var(--font-label)] text-xs font-bold tracking-[0.08em] uppercase">
        TACTICAL MODULES CANVAS
      </div>
    </>
  );
}
