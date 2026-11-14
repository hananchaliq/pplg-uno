'use client';

import * as React from 'react';
import { formatBootProgress } from '@/lib/class-logic';
import { Terminal, CheckCircle2, Sparkles } from 'lucide-react';

const BOOT_LOGS = [
  '[SYS] Initializing WebGL Context & 60fps Render Pipeline...',
  '[3D] Mounting Lanyard & Capsule Physics (22 Student Nodes)...',
  '[DB] Syncing Supabase Class Archive & Static 3D Blackboard...',
  '[UI] Ready — XII PPLG 1 Class of 2026',
] as const;

export function ClassBootLoader() {
  const [progress, setProgress] = React.useState(0);
  const [dismissed, setDismissed] = React.useState(false);
  const [fadingOut, setFadingOut] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (
      params.get('autostart') === '1' ||
      window.sessionStorage.getItem('pplg1_boot_completed') === '1'
    ) {
      queueMicrotask(() => {
        setProgress(100);
        setDismissed(true);
      });
      return;
    }

    let current = 0;
    const interval = window.setInterval(() => {
      current = Math.min(100, current + 8);
      setProgress(current);
      if (current >= 100) {
        window.clearInterval(interval);
        window.sessionStorage.setItem('pplg1_boot_completed', '1');
        setFadingOut(true);
        window.setTimeout(() => {
          setDismissed(true);
        }, 280);
      }
    }, 35);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        window.clearInterval(interval);
        window.sessionStorage.setItem('pplg1_boot_completed', '1');
        setProgress(100);
        setDismissed(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  if (dismissed) return null;

  const { formattedPct, activeStageIndex } = formatBootProgress(progress);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Preloader Sistem XII PPLG 1 Class of 2026"
      data-testid="class-boot-loader"
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#0A0C16]/96 px-4 text-white transition-opacity duration-300 ${
        fadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#121629] p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="size-4 text-[#6E78E8]" />
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#A4AAC0]">
              XII PPLG 1 · CLASS OF 2026 BOOTLOADER
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#3FB8A5]/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#54CEBA]">
            <Sparkles className="size-3" />
            60FPS WEBGL
          </span>
        </div>

        <div className="mt-6 flex items-baseline justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#A4AAC0]">
              Pre-Mounting 3D Scenes &amp; Archive
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-white sm:text-xl">
              Kapsul Kelulusan &amp; Dream Board 3D
            </h2>
          </div>
          <span
            data-testid="boot-progress-counter"
            className="font-mono text-4xl font-extrabold tabular-nums tracking-tight text-[#6E78E8] sm:text-5xl"
          >
            {formattedPct}
          </span>
        </div>

        {/* Precision Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6E78E8] via-[#3FB8A5] to-[#F0A04B] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Real-time Module Boot Log */}
        <ul className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-[#0B0D14]/90 p-4 font-mono text-xs">
          {BOOT_LOGS.map((logLine, idx) => {
            const done = idx <= activeStageIndex;
            return (
              <li
                key={logLine}
                className={`flex items-center gap-2 transition-opacity ${
                  done ? 'text-[#EEF0F8] opacity-100' : 'text-[#5B6073] opacity-45'
                }`}
              >
                <CheckCircle2
                  className={`size-3.5 shrink-0 ${
                    done ? 'text-[#54CEBA]' : 'text-[#5B6073]'
                  }`}
                />
                <span className="truncate">{logLine}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-[#A4AAC0]">
          <span>CLS = 0 · Pre-rendered Canvas</span>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.sessionStorage.setItem('pplg1_boot_completed', '1');
              }
              setDismissed(true);
            }}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-white/20"
          >
            Masuk Sekarang (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
