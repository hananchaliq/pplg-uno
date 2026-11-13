'use client';

import * as React from 'react';
import { StudentRecord, AnnouncementItem } from '@/lib/class-data';
import {
  Search,
  Users,
  Calendar,
  Sparkles,
  Wallet,
  MessageSquare,
  Moon,
  Sun,
  Shield,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface CommandPaletteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentRecord[];
  announcements: AnnouncementItem[];
  onSelectStudent: (studentId: string) => void;
  onOpenAdmin: () => void;
}

export function CommandPaletteModal({
  open,
  onOpenChange,
  students,
  announcements,
  onSelectStudent,
  onOpenAdmin,
}: CommandPaletteModalProps) {
  const [query, setQuery] = React.useState('');
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const matchedStudents = students
    .filter(
      (s) =>
        s.is_published &&
        (s.name.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.dream_title.toLowerCase().includes(q) ||
          String(s.roll_no).padStart(2, '0').includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)))
    )
    .slice(0, 6);

  const jumpTo = (hash: string) => {
    onOpenChange(false);
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette XII PPLG 1"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="glass-panel w-full max-w-xl overflow-hidden p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-black/10 pb-3 dark:border-white/10">
          <Search className="size-4 text-[#6E78E8]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama siswa (Siswa 01..22), bagian halaman, atau perintah..."
            className="w-full bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            aria-label="Tutup Command Palette"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 max-h-80 space-y-4 overflow-y-auto pr-1 text-xs">
          {/* Quick Navigation */}
          <div>
            <p className="px-2 font-mono text-[10px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
              Navigasi Cepat
            </p>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => jumpTo('#anggota-kelas')}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-white/70 dark:hover:bg-white/10"
              >
                <Users className="size-3.5 text-[#6E78E8]" />
                <span>Anggota Kelas (22 Lanyard)</span>
              </button>
              <button
                type="button"
                onClick={() => jumpTo('#papan-cita-cita')}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-white/70 dark:hover:bg-white/10"
              >
                <Sparkles className="size-3.5 text-[#3FB8A5]" strokeWidth={1.5} />
                <span>Papan Cita-Cita 3D</span>
              </button>
              <button
                type="button"
                onClick={() => jumpTo('#jadwal-kelas')}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-white/70 dark:hover:bg-white/10"
              >
                <Calendar className="size-3.5 text-[#F0A04B]" />
                <span>Jadwal &amp; Piket Kelas</span>
              </button>
              <button
                type="button"
                onClick={() => jumpTo('#kas-kelas')}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-white/70 dark:hover:bg-white/10"
              >
                <Wallet className="size-3.5 text-[#E0709A]" />
                <span>Laporan Kas 3D</span>
              </button>
              <button
                type="button"
                onClick={() => jumpTo('#buku-tamu')}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-white/70 dark:hover:bg-white/10"
              >
                <MessageSquare className="size-3.5 text-[#4FA3E0]" />
                <span>Buku Tamu Realtime</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenAdmin();
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-white/70 dark:hover:bg-white/10"
              >
                <Shield className="size-3.5 text-[#6E78E8]" />
                <span>Panel Admin Kelas</span>
              </button>
            </div>
          </div>

          {/* Matched Students */}
          <div>
            <p className="px-2 font-mono text-[10px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
              Buka Kartu Lanyard Siswa ({matchedStudents.length})
            </p>
            <div className="mt-1.5 space-y-1">
              {matchedStudents.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onSelectStudent(st.id);
                    const el = document.querySelector('#anggota-kelas');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-white/75 dark:hover:bg-white/10"
                >
                  <div>
                    <span className="font-semibold">{st.name}</span>
                    <span className="ml-2 text-[#5B6073] dark:text-[#A4AAC0]">
                      · {st.dream_title}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#5B6073]">
                    Absen #{String(st.roll_no).padStart(2, '0')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="border-t border-black/10 pt-2 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                onOpenChange(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-white/75 dark:hover:bg-white/10"
            >
              <span className="flex items-center gap-2 font-medium">
                {theme === 'dark' ? <Sun className="size-4 text-[#F0A04B]" /> : <Moon className="size-4 text-[#6E78E8]" />}
                Ganti Tema Tampilan ({theme === 'dark' ? 'Ke Mode Terang' : 'Ke Mode Gelap'})
              </span>
              <span className="font-mono text-[10px] text-[#5B6073]">Enter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
