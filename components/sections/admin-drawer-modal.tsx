'use client';

import * as React from 'react';
import {
  AnnouncementItem,
  GuestbookEntry,
  KasTransaction,
  StudentRecord,
  DREAM_PAPER_PALETTE,
} from '@/lib/class-data';
import { validateStudentDreamUpdate } from '@/lib/class-logic';
import { auth, googleProvider } from '@/lib/firebase/client';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  Shield,
  LogIn,
  LogOut,
  Check,
  Trash2,
  Plus,
  X,
  Lock,
  Sparkles,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminDrawerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentRecord[];
  announcements: AnnouncementItem[];
  guestbook: GuestbookEntry[];
  kasTransactions: KasTransaction[];
  onUpdateStudentDream: (
    studentId: string,
    payload: {
      dream_title: string;
      dream_reason: string;
      dream_description: string;
      dream_paper_color: string;
    }
  ) => Promise<void>;
  onAddAnnouncement: (
    title: string,
    body: string,
    category: AnnouncementItem['category']
  ) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  onModerateGuestbook: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  onAddKasTransaction: (
    type: 'masuk' | 'keluar',
    amount: number,
    note: string
  ) => Promise<void>;
}

const ADMIN_EMAIL = 'ananxpplg1@gmail.com';

export function AdminDrawerModal({
  open,
  onOpenChange,
  students,
  announcements,
  guestbook,
  kasTransactions,
  onUpdateStudentDream,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onModerateGuestbook,
  onAddKasTransaction,
}: AdminDrawerModalProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [demoAdminUnlocked, setDemoAdminUnlocked] = React.useState(false);
  const [passcode, setPasscode] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<
    'dreams' | 'guestbook' | 'announcements' | 'kas'
  >('dreams');

  // Student Dream Note Editor state
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>(
    () => students[0]?.id ?? 'siswa-01'
  );
  const currentStudent =
    students.find((s) => s.id === selectedStudentId) ?? students[0];

  const [dreamTitle, setDreamTitle] = React.useState(
    () => currentStudent?.dream_title ?? ''
  );
  const [dreamReason, setDreamReason] = React.useState(
    () => currentStudent?.dream_reason ?? ''
  );
  const [dreamDescription, setDreamDescription] = React.useState(
    () => currentStudent?.dream_description ?? ''
  );
  const [dreamPaperColor, setDreamPaperColor] = React.useState(
    () => currentStudent?.dream_paper_color ?? DREAM_PAPER_PALETTE[0].hex
  );

  // Announcement & Kas Form states
  const [annTitle, setAnnTitle] = React.useState('');
  const [annBody, setAnnBody] = React.useState('');
  const [annCategory, setAnnCategory] =
    React.useState<AnnouncementItem['category']>('Praktikum');

  const [kasType, setKasType] = React.useState<'masuk' | 'keluar'>('masuk');
  const [kasAmount, setKasAmount] = React.useState('50000');
  const [kasNote, setKasNote] = React.useState('');

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  if (!open) return null;

  const isAuthorizedAdmin =
    demoAdminUnlocked || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleSelectStudentForEdit = (id: string) => {
    setSelectedStudentId(id);
    const st = students.find((s) => s.id === id);
    if (st) {
      setDreamTitle(st.dream_title);
      setDreamReason(st.dream_reason);
      setDreamDescription(st.dream_description);
      setDreamPaperColor(st.dream_paper_color || DREAM_PAPER_PALETTE[0].hex);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Berhasil masuk dengan akun Google.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal login Google.');
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toUpperCase() === 'PPLG1-ADMIN') {
      setDemoAdminUnlocked(true);
      toast.success('Mode Admin Tunggal XII PPLG 1 aktif.');
    } else {
      toast.error(
        'Kode akses salah. Gunakan PPLG1-ADMIN atau Google Sign-In pemilik.'
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panel Admin Tunggal XII PPLG 1"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="glass-panel max-h-[88vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Shield className="size-5 text-[#6E78E8]" />
            <div>
              <h2 className="text-lg font-bold">
                Panel Admin Tunggal · XII PPLG 1
              </h2>
              <p className="font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                Proteksi Akses: Hanya 1 Akun Pengelola Kelas (Tanpa Registrasi Publik)
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup Panel Admin"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-black/15 p-2 hover:bg-black/5 dark:border-white/20"
          >
            <X className="size-4" />
          </button>
        </div>

        {!isAuthorizedAdmin ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="glass-card tint-lilac p-5">
              <h3 className="text-sm font-bold">Opsi 1 · Autentikasi Pemilik</h3>
              <p className="mt-1 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                Login dengan akun admin kelas terdaftar (<code>{ADMIN_EMAIL}</code>) untuk menyinkronkan perubahan langsung ke Firestore / Supabase.
              </p>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
              >
                <LogIn className="size-4" />
                Masuk dengan Akun Admin
              </button>
            </div>

            <form
              onSubmit={handlePasscodeLogin}
              className="glass-card tint-sage p-5"
            >
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#3FB8A5]" />
                <h3 className="text-sm font-bold">Opsi 2 · Kunci Sesi Pengurus</h3>
              </div>
              <p className="mt-1 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                Untuk pengujian cepat di laboratorium, ketik kode pengurus:{' '}
                <code>PPLG1-ADMIN</code>
              </p>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Masukkan kode pengurus..."
                aria-label="Kode pengurus admin"
                className="mt-3 h-10 w-full rounded-xl border border-black/15 bg-white/85 px-3 text-xs text-[#0B0D14] outline-none dark:border-white/15 dark:bg-white/10 dark:text-white"
              />
              <button
                type="submit"
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#6E78E8] px-4 text-xs font-semibold text-white"
              >
                Buka Panel Moderasi
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-5">
            {/* Admin Sub-nav */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('dreams')}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition ${
                    activeTab === 'dreams'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  <Sparkles className="size-3.5" strokeWidth={1.5} />
                  <span>Cita-Cita Siswa (22)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('guestbook')}
                  className={`h-9 rounded-full px-4 text-xs font-semibold transition ${
                    activeTab === 'guestbook'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  Buku Tamu ({guestbook.filter((g) => g.status === 'pending').length}{' '}
                  Pending)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('announcements')}
                  className={`h-9 rounded-full px-4 text-xs font-semibold transition ${
                    activeTab === 'announcements'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  Pengumuman ({announcements.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('kas')}
                  className={`h-9 rounded-full px-4 text-xs font-semibold transition ${
                    activeTab === 'kas'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  Catat Kas
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDemoAdminUnlocked(false);
                  if (user) signOut(auth);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/20"
              >
                <LogOut className="size-3.5" />
                Keluar Sesi
              </button>
            </div>

            {/* Tab 0: Student Dream Notes CRUD (Papan Cita-Cita 3D) */}
            {activeTab === 'dreams' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const check = validateStudentDreamUpdate({
                    dream_title: dreamTitle,
                    dream_reason: dreamReason,
                    dream_description: dreamDescription,
                    dream_paper_color: dreamPaperColor,
                  });
                  if (!check.valid || !check.sanitized) {
                    toast.error(check.error || 'Data cita-cita belum lengkap.');
                    return;
                  }
                  await onUpdateStudentDream(selectedStudentId, check.sanitized);
                  toast.success(
                    `Kertas cita-cita ${currentStudent?.name} di Papan 3D berhasil diperbarui!`
                  );
                }}
                className="glass-card tint-lilac mt-5 space-y-4 p-5"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-sm font-bold">
                      Edit Kertas Cita-Cita Siswa (Papan Tulis 3D)
                    </h3>
                    <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                      Perubahan langsung memperbarui teks 3D di atas kertas dan Floating Detail Container.
                    </p>
                  </div>
                  <select
                    aria-label="Pilih Siswa untuk Edit Cita-Cita"
                    value={selectedStudentId}
                    onChange={(e) => handleSelectStudentForEdit(e.target.value)}
                    className="h-9 rounded-xl border border-black/15 bg-white/90 px-3 font-mono text-xs font-semibold text-[#0B0D14] dark:border-white/20 dark:bg-[#151A30] dark:text-white"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        #{String(s.roll_no).padStart(2, '0')} · {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-8">
                    <label className="block font-mono text-[11px] font-semibold uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                      Judul Cita-Cita (dream_title)
                    </label>
                    <input
                      type="text"
                      value={dreamTitle}
                      onChange={(e) => setDreamTitle(e.target.value)}
                      placeholder="Contoh: Game Developer / AI Engineer..."
                      className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-white/90 px-3 text-xs font-semibold text-[#0B0D14] dark:border-white/15 dark:bg-white/10 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block font-mono text-[11px] font-semibold uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                      Warna Kertas 3D (dream_paper_color)
                    </label>
                    <select
                      value={dreamPaperColor}
                      onChange={(e) => setDreamPaperColor(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-white/90 px-3 text-xs font-semibold text-[#0B0D14] dark:border-white/15 dark:bg-[#151A30] dark:text-white"
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
                  <label className="block font-mono text-[11px] font-semibold uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                    Alasan Memilih Cita-Cita (dream_reason)
                  </label>
                  <textarea
                    rows={2}
                    value={dreamReason}
                    onChange={(e) => setDreamReason(e.target.value)}
                    placeholder="Ceritakan alasan memilih cita-cita ini..."
                    className="mt-1 w-full rounded-xl border border-black/15 bg-white/90 p-3 text-xs text-[#0B0D14] dark:border-white/15 dark:bg-white/10 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                    Deskripsi &amp; Rencana Langkah (dream_description)
                  </label>
                  <textarea
                    rows={2}
                    value={dreamDescription}
                    onChange={(e) => setDreamDescription(e.target.value)}
                    placeholder="Langkah dan fokus belajar yang sedang ditempuh..."
                    className="mt-1 w-full rounded-xl border border-black/15 bg-white/90 p-3 text-xs text-[#0B0D14] dark:border-white/15 dark:bg-white/10 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0B0D14] px-5 text-xs font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-[#0B0D14]"
                >
                  <Save className="size-3.5" />
                  <span>Simpan Perubahan Cita-Cita Siswa</span>
                </button>
              </form>
            )}

            {/* Tab 1: Guestbook Moderation */}
            {activeTab === 'guestbook' && (
              <div className="mt-5 space-y-3">
                {guestbook.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-black/10 bg-white/75 p-4 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/5"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <strong>{item.sender_name}</strong>
                        <span>·</span>
                        <span className="uppercase">{item.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                        {item.message}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {item.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => onModerateGuestbook(item.id, 'approved')}
                          className="inline-flex items-center gap-1 rounded-full bg-[#3FB8A5] px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <Check className="size-3.5" />
                          Setujui
                        </button>
                      )}
                      {item.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => onModerateGuestbook(item.id, 'rejected')}
                          className="inline-flex items-center gap-1 rounded-full bg-[#E0709A] px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <Trash2 className="size-3.5" />
                          Tolak
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Announcements CRUD */}
            {activeTab === 'announcements' && (
              <div className="mt-5 space-y-5">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!annTitle.trim() || !annBody.trim()) return;
                    await onAddAnnouncement(
                      annTitle.trim(),
                      annBody.trim(),
                      annCategory
                    );
                    setAnnTitle('');
                    setAnnBody('');
                    toast.success('Pengumuman baru berhasil diterbitkan!');
                  }}
                  className="glass-card tint-sky space-y-3 p-4"
                >
                  <h3 className="text-sm font-bold">Tambah Pengumuman Baru</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="Judul pengumuman..."
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-3 text-xs sm:col-span-2 dark:bg-white/10"
                    />
                    <select
                      value={annCategory}
                      onChange={(e) =>
                        setAnnCategory(
                          e.target.value as AnnouncementItem['category']
                        )
                      }
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-[#151A30]"
                    >
                      <option value="Praktikum">Praktikum</option>
                      <option value="Akademik">Akademik</option>
                      <option value="Event">Event</option>
                      <option value="Kas">Kas</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    value={annBody}
                    onChange={(e) => setAnnBody(e.target.value)}
                    placeholder="Isi pengumuman lengkap..."
                    className="w-full rounded-xl border border-black/15 bg-white/85 p-3 text-xs dark:bg-white/10"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
                  >
                    <Plus className="size-3.5" />
                    Terbitkan Pengumuman
                  </button>
                </form>

                <div className="space-y-2">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-4 py-2.5 text-xs dark:border-white/10 dark:bg-white/5"
                    >
                      <div>
                        <span className="font-semibold">{a.title}</span>
                        <span className="ml-2 font-mono text-[10px] text-[#5B6073]">
                          [{a.category}]
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Hapus pengumuman ${a.title}`}
                        onClick={() => onDeleteAnnouncement(a.id)}
                        className="text-[#E11D48] hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Kas Kelas Entry */}
            {activeTab === 'kas' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const amt = Number(kasAmount);
                  if (!amt || amt <= 0 || !kasNote.trim()) return;
                  await onAddKasTransaction(kasType, amt, kasNote.trim());
                  setKasNote('');
                  toast.success('Mutasi kas berhasil ditambahkan.');
                }}
                className="glass-card tint-aqua mt-5 space-y-3 p-5"
              >
                <h3 className="text-sm font-bold">Catat Transaksi Kas Baru</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <select
                    value={kasType}
                    onChange={(e) =>
                      setKasType(e.target.value as 'masuk' | 'keluar')
                    }
                    className="h-10 rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-[#151A30]"
                  >
                    <option value="masuk">Pemasukan (+)</option>
                    <option value="keluar">Pengeluaran (-)</option>
                  </select>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={kasAmount}
                    onChange={(e) => setKasAmount(e.target.value)}
                    placeholder="Nominal (Rp)"
                    className="h-10 rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                  />
                  <input
                    type="text"
                    value={kasNote}
                    onChange={(e) => setKasNote(e.target.value)}
                    placeholder="Keterangan mutasi..."
                    className="h-10 rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B0D14] px-5 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
                >
                  <Plus className="size-3.5" />
                  Simpan Mutasi Kas ({kasTransactions.length} tercatat)
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
