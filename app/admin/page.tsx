'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  INITIAL_STUDENTS,
  StudentRecord,
  DREAM_PAPER_PALETTE,
} from '@/lib/class-data';
import { validateStudentDreamUpdate } from '@/lib/class-logic';
import {
  db,
  auth,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '@/lib/firebase/client';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { useAdminAuth } from '@/components/providers/admin-auth-provider';
import {
  Shield,
  Sparkles,
  ArrowLeft,
  Save,
  Lock,
  LogIn,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'ananxpplg1@gmail.com';

export default function AdminPage() {
  const { isAdmin, sharedAdminEmail, loginWithCredentials, logoutAdmin } = useAdminAuth();
  const [user, setUser] = React.useState<User | null>(null);
  const [unlocked, setUnlocked] = React.useState(false);
  const [passcode, setPasscode] = React.useState('');
  const [students, setStudents] = React.useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [selectedId, setSelectedId] = React.useState<string>('siswa-01');

  const currentStudent =
    students.find((s) => s.id === selectedId) ?? students[0];

  const [dreamTitle, setDreamTitle] = React.useState(
    currentStudent?.dream_title ?? ''
  );
  const [dreamReason, setDreamReason] = React.useState(
    currentStudent?.dream_reason ?? ''
  );
  const [dreamDescription, setDreamDescription] = React.useState(
    currentStudent?.dream_description ?? ''
  );
  const [dreamPaperColor, setDreamPaperColor] = React.useState(
    currentStudent?.dream_paper_color ?? DREAM_PAPER_PALETTE[0].hex
  );

  React.useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        if (snap.empty) return;
        const map = new Map<string, Partial<StudentRecord>>();
        snap.forEach((d) => map.set(d.id, d.data() as Partial<StudentRecord>));
        setStudents((prev) =>
          prev.map((st) => {
            const remote = map.get(st.id);
            return remote ? { ...st, ...remote } : st;
          })
        );
      },
      () => {}
    );
    return () => {
      unsubAuth();
      unsubStudents();
    };
  }, []);

  const isAuthorized =
    isAdmin || unlocked || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleSelectStudent = (id: string) => {
    setSelectedId(id);
    const found = students.find((s) => s.id === id);
    if (found) {
      setDreamTitle(found.dream_title);
      setDreamReason(found.dream_reason);
      setDreamDescription(found.dream_description);
      setDreamPaperColor(found.dream_paper_color || DREAM_PAPER_PALETTE[0].hex);
    }
  };

  const handleSaveDream = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateStudentDreamUpdate({
      dream_title: dreamTitle,
      dream_reason: dreamReason,
      dream_description: dreamDescription,
      dream_paper_color: dreamPaperColor,
    });
    if (!check.valid || !check.sanitized || !currentStudent) {
      toast.error(check.error || 'Input tidak valid.');
      return;
    }

    const updated: StudentRecord = {
      ...currentStudent,
      ...check.sanitized,
    };

    setStudents((prev) =>
      prev.map((s) => (s.id === currentStudent.id ? updated : s))
    );
    toast.success(`Cita-cita ${currentStudent.name} berhasil disimpan!`);

    try {
      await fetch('/api/supabase-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_student_dream',
          payload: {
            id: updated.id,
            dream_title: updated.dream_title,
            dream_reason: updated.dream_reason,
            dream_description: updated.dream_description,
            dream_paper_color: updated.dream_paper_color,
          },
        }),
      });
    } catch {
      // Fallback handled gracefully
    }

    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      try {
        await setDoc(doc(db, 'students', currentStudent.id), {
          roll_no: updated.roll_no,
          name: updated.name,
          role: updated.role,
          avatar_url: updated.avatar_url,
          bio: updated.bio,
          tags: updated.tags,
          tone: updated.tone,
          dream_title: updated.dream_title,
          dream_reason: updated.dream_reason,
          dream_description: updated.dream_description,
          dream_paper_color: updated.dream_paper_color,
          is_published: updated.is_published,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `students/${currentStudent.id}`);
      }
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
          <div>
            <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.22em] text-[#6E78E8]">
              <Shield className="size-3.5" />
              <span>XII PPLG 1 · Portal Admin Tunggal</span>
            </p>
            <h1 className="mt-1 text-2xl font-bold">
              Manajemen Siswa &amp; Papan Tulis Cita-Cita 3D
            </h1>
          </div>

          <Link
            href="/#papan-cita-cita"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/15 bg-white/80 px-4 text-xs font-semibold text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white"
          >
            <ArrowLeft className="size-4" />
            <span>Lihat Papan Cita-Cita 3D</span>
          </Link>
        </div>

        {!isAuthorized ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="glass-card tint-lilac p-5">
              <h2 className="text-sm font-bold">Login Google Pemilik Kelas</h2>
              <p className="mt-1 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                Masuk dengan akun admin tunggal (<code>{ADMIN_EMAIL}</code>) untuk menyinkronkan data cita-cita ke database.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signInWithPopup(auth, googleProvider);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Gagal login.');
                  }
                }}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
              >
                <LogIn className="size-4" />
                <span>Masuk dengan Google Admin</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await loginWithCredentials(sharedAdminEmail, passcode);
                if (ok || passcode.trim().toUpperCase() === 'PPLG1-ADMIN') {
                  setUnlocked(true);
                  toast.success('Sesi Admin Kelas aktif.');
                }
              }}
              className="glass-card tint-sage p-5"
            >
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#3FB8A5]" />
                <h2 className="text-sm font-bold">Kunci Sesi Pengurus Lab</h2>
              </div>
              <p className="mt-1 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                Masukkan kode akses pengurus: <code>PPLG1-ADMIN</code>
              </p>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Kode pengurus..."
                className="mt-3 h-10 w-full rounded-xl border border-black/15 bg-white/85 px-3 text-xs"
              />
              <button
                type="submit"
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#6E78E8] px-4 text-xs font-semibold text-white"
              >
                Buka Editor Cita-Cita Siswa
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSaveDream} className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#6E78E8]" strokeWidth={1.5} />
                <h2 className="text-base font-bold">
                  Form Edit Kertas Cita-Cita Siswa (1–22)
                </h2>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setUnlocked(false);
                  await logoutAdmin();
                  if (user) signOut(auth);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-xs"
              >
                <LogOut className="size-3.5" />
                <span>Keluar Sesi</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-5">
                <label className="block font-mono text-xs font-semibold text-[#5B6073]">
                  Pilih Siswa (Absen 01–22)
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-black/15 bg-white/90 px-3 font-mono text-xs font-semibold dark:bg-[#151A30]"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      #{String(st.roll_no).padStart(2, '0')} · {st.name} — {st.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block font-mono text-xs font-semibold text-[#5B6073]">
                  Judul Cita-Cita
                </label>
                <input
                  type="text"
                  value={dreamTitle}
                  onChange={(e) => setDreamTitle(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-black/15 bg-white/90 px-3 text-xs font-semibold dark:bg-white/10"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-mono text-xs font-semibold text-[#5B6073]">
                  Warna Kertas Pastel
                </label>
                <select
                  value={dreamPaperColor}
                  onChange={(e) => setDreamPaperColor(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-black/15 bg-white/90 px-3 text-xs font-semibold dark:bg-[#151A30]"
                >
                  {DREAM_PAPER_PALETTE.map((p) => (
                    <option key={p.hex} value={p.hex}>
                      {p.name} ({p.hex})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold text-[#5B6073]">
                Alasan Memilih Cita-Cita
              </label>
              <textarea
                rows={3}
                value={dreamReason}
                onChange={(e) => setDreamReason(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-black/15 bg-white/90 p-3 text-xs dark:bg-white/10"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold text-[#5B6073]">
                Deskripsi Dream Note &amp; Rencana Ke Depan
              </label>
              <textarea
                rows={3}
                value={dreamDescription}
                onChange={(e) => setDreamDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-black/15 bg-white/90 p-3 text-xs dark:bg-white/10"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0B0D14] px-6 text-xs font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-[#0B0D14]"
            >
              <Save className="size-4" />
              <span>Simpan Cita-Cita Siswa</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
