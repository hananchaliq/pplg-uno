'use client';

import * as React from 'react';
import {
  AnnouncementItem,
  AssignmentItem,
  FarewellLetter,
  GalleryPhoto,
  GuestbookEntry,
  KasTransaction,
  ScheduleSlot,
  StudentRecord,
  DREAM_PAPER_PALETTE,
} from '@/lib/class-data';
import {
  validateStudentDreamUpdate,
  validateFarewellLetter,
} from '@/lib/class-logic';
import { useAdminAuth } from '@/components/providers/admin-auth-provider';
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
  BookOpen,
  Camera,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminDrawerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentRecord[];
  announcements: AnnouncementItem[];
  guestbook: GuestbookEntry[];
  kasTransactions: KasTransaction[];
  farewellLetters?: FarewellLetter[];
  galleryPhotos?: GalleryPhoto[];
  schedules?: ScheduleSlot[];
  assignments?: AssignmentItem[];
  onUpdateStudentDream: (
    studentId: string,
    payload: {
      dream_title: string;
      dream_reason: string;
      dream_description: string;
      dream_paper_color: string;
      capsule_message?: string;
    }
  ) => Promise<void>;
  onResetStudentDream?: (studentId: string) => Promise<void>;
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
  onAddFarewellLetter?: (payload: Omit<FarewellLetter, 'id' | 'created_at'>) => Promise<void>;
  onDeleteFarewellLetter?: (id: string) => Promise<void>;
  onAddGalleryPhoto?: (payload: Omit<GalleryPhoto, 'id'>) => Promise<void>;
  onDeleteGalleryPhoto?: (id: string) => Promise<void>;
  onAddAssignment?: (payload: Omit<AssignmentItem, 'id'>) => Promise<void>;
  onDeleteAssignment?: (id: string) => Promise<void>;
  onAddScheduleSlot?: (payload: Omit<ScheduleSlot, 'id'>) => Promise<void>;
  onDeleteScheduleSlot?: (id: string) => Promise<void>;
}

export function AdminDrawerModal({
  open,
  onOpenChange,
  students,
  announcements,
  guestbook,
  kasTransactions,
  farewellLetters = [],
  galleryPhotos = [],
  schedules = [],
  assignments = [],
  onUpdateStudentDream,
  onResetStudentDream,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onModerateGuestbook,
  onAddKasTransaction,
  onAddFarewellLetter,
  onDeleteFarewellLetter,
  onAddGalleryPhoto,
  onDeleteGalleryPhoto,
  onAddAssignment,
  onDeleteAssignment,
  onAddScheduleSlot,
  onDeleteScheduleSlot,
}: AdminDrawerModalProps) {
  const {
    isAdmin,
    adminEmail,
    authProvider,
    sharedAdminEmail,
    loginWithCredentials,
    loginWithGoogle,
    logoutAdmin,
  } = useAdminAuth();

  const [emailInput, setEmailInput] = React.useState(sharedAdminEmail);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [submittingAuth, setSubmittingAuth] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState<
    'dreams' | 'farewell' | 'gallery' | 'academic' | 'guestbook' | 'announcements' | 'kas'
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
  const [capsuleMessage, setCapsuleMessage] = React.useState(
    () => currentStudent?.capsule_message ?? ''
  );

  // Farewell Letter state
  const [letterName, setLetterName] = React.useState('');
  const [letterRole, setLetterRole] = React.useState('Siswa XII PPLG 1');
  const [letterQuote, setLetterQuote] = React.useState('');
  const [letterMessage, setLetterMessage] = React.useState('');

  // Gallery state
  const [photoTitle, setPhotoTitle] = React.useState('');
  const [photoUrl, setPhotoUrl] = React.useState('git commit -m "feat(pplg1): class of 2026 memory"');
  const [photoAlbum, setPhotoAlbum] = React.useState('tint-sky');
  const [photoCaption, setPhotoCaption] = React.useState('');

  // Academic (Assignment + Schedule) state
  const [taskTitle, setTaskTitle] = React.useState('');
  const [taskCourse, setTaskCourse] = React.useState('Pemrograman Web & Perangkat Bergerak');
  const [taskDue, setTaskDue] = React.useState('2026-12-01');
  const [taskLink, setTaskLink] = React.useState('https://github.com/xii-pplg-1');

  const [schedDay, setSchedDay] = React.useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [schedSubject, setSchedSubject] = React.useState('');
  const [schedStart, setSchedStart] = React.useState('07:00');
  const [schedEnd, setSchedEnd] = React.useState('09:15');
  const [schedTeacher, setSchedTeacher] = React.useState('Bpk. Hendra Wijaya, S.Kom.');
  const [schedRoom, setSchedRoom] = React.useState('Lab RPL 1');

  // Announcement & Kas Form states
  const [annTitle, setAnnTitle] = React.useState('');
  const [annBody, setAnnBody] = React.useState('');
  const [annCategory, setAnnCategory] =
    React.useState<AnnouncementItem['category']>('Praktikum');

  const [kasType, setKasType] = React.useState<'masuk' | 'keluar'>('masuk');
  const [kasAmount, setKasAmount] = React.useState('50000');
  const [kasNote, setKasNote] = React.useState('');

  if (!open) return null;

  const handleSelectStudentForEdit = (id: string) => {
    setSelectedStudentId(id);
    const st = students.find((s) => s.id === id);
    if (st) {
      setDreamTitle(st.dream_title);
      setDreamReason(st.dream_reason);
      setDreamDescription(st.dream_description);
      setDreamPaperColor(st.dream_paper_color || DREAM_PAPER_PALETTE[0].hex);
      setCapsuleMessage(st.capsule_message || '');
    }
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAuth(true);
    try {
      const ok = await loginWithCredentials(emailInput, passwordInput);
      if (ok) {
        setPasswordInput('');
      }
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleGoogleLoginClick = async () => {
    setSubmittingAuth(true);
    try {
      await loginWithGoogle();
    } finally {
      setSubmittingAuth(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panel Admin Tunggal XII PPLG 1"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-md sm:p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="glass-panel max-h-[90vh] w-full max-w-4xl overflow-y-auto p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Shield className="size-5 text-[#6E78E8]" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold sm:text-lg">
                  Panel Admin Kelas · XII PPLG 1 (Class of 2026)
                </h2>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3FB8A5]/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#268C7C] dark:text-[#6EE7B7]">
                    <span className="size-1.5 rounded-full bg-[#3FB8A5]" />
                    ADMIN MODE ACTIVE
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                {isAdmin
                  ? `Terautentikasi (${adminEmail} · ${authProvider.toUpperCase()}) — Real-Time Database CRUD`
                  : '1 Akun Admin Bersama Pengurus Kelas (Supabase Auth & PostgreSQL RLS)'}
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

        {!isAdmin ? (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-12">
            {/* Shared Class Admin Login Form (Supabase Auth + Fallback) */}
            <form
              onSubmit={handleCredentialLogin}
              className="glass-card tint-sage space-y-3.5 p-5 md:col-span-7"
            >
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#3FB8A5]" />
                <h3 className="text-sm font-bold">
                  Login Akun Admin Kelas Bersama (Supabase Auth)
                </h3>
              </div>
              <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                Gunakan 1 akun bersama pengurus kelas XII PPLG 1 (<code>{sharedAdminEmail}</code>) dan kode sandi kelas (<code>PPLG1-ADMIN</code>).
              </p>

              <div>
                <label className="block font-mono text-[10px] font-semibold uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                  Email Admin Kelas
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@xiipplg1.sch.id"
                  aria-label="Email admin kelas"
                  className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-white/90 px-3 font-mono text-xs text-[#0B0D14] outline-none dark:border-white/15 dark:bg-white/10 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-semibold uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                  Password / Kunci Pengurus
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan kode pengurus (PPLG1-ADMIN)..."
                  aria-label="Kode pengurus admin"
                  className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-white/90 px-3 text-xs text-[#0B0D14] outline-none dark:border-white/15 dark:bg-white/10 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#6E78E8] px-4 text-xs font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
              >
                <LogIn className="size-3.5" />
                <span>{submittingAuth ? 'Memverifikasi Sesi...' : 'Buka Panel Moderasi'}</span>
              </button>
            </form>

            {/* Option 2: Google Sign-In */}
            <div className="glass-card tint-lilac flex flex-col justify-between p-5 md:col-span-5">
              <div>
                <h3 className="text-sm font-bold">SSO Google Pemilik Kelas</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
                  Alternatif masuk menggunakan akun Google pemilik (<code>ananxpplg1@gmail.com</code>) untuk sinkronisasi cloud ganda.
                </p>
              </div>
              <button
                type="button"
                disabled={submittingAuth}
                onClick={handleGoogleLoginClick}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
              >
                <LogIn className="size-4" />
                <span>Masuk dengan Google</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            {/* Admin Sub-nav */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('dreams')}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition ${
                    activeTab === 'dreams'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  <Sparkles className="size-3.5" strokeWidth={1.5} />
                  <span>22 Siswa &amp; Papan 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('farewell')}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition ${
                    activeTab === 'farewell'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  <BookOpen className="size-3.5" />
                  <span>Surat ({farewellLetters.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gallery')}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition ${
                    activeTab === 'gallery'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  <Camera className="size-3.5" />
                  <span>Galeri ({galleryPhotos.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('academic')}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition ${
                    activeTab === 'academic'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  <Calendar className="size-3.5" />
                  <span>Jadwal &amp; Tugas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('guestbook')}
                  className={`h-8 rounded-full px-3.5 text-xs font-semibold transition ${
                    activeTab === 'guestbook'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  Buku Tamu ({guestbook.filter((g) => g.status === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('announcements')}
                  className={`h-8 rounded-full px-3.5 text-xs font-semibold transition ${
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
                  className={`h-8 rounded-full px-3.5 text-xs font-semibold transition ${
                    activeTab === 'kas'
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  Kas Kelas
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await logoutAdmin();
                  toast.success('Sesi Admin Kelas berhasil diakhiri.');
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/20"
              >
                <LogOut className="size-3.5" />
                Keluar Sesi
              </button>
            </div>

            {/* Tab 0: Student Dream Notes & Capsule CRUD (Papan Cita-Cita 3D) */}
            {activeTab === 'dreams' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const check = validateStudentDreamUpdate({
                    dream_title: dreamTitle,
                    dream_reason: dreamReason,
                    dream_description: dreamDescription,
                    dream_paper_color: dreamPaperColor,
                    capsule_message: capsuleMessage,
                  });
                  if (!check.valid || !check.sanitized) {
                    toast.error(check.error || 'Data cita-cita belum lengkap.');
                    return;
                  }
                  await onUpdateStudentDream(selectedStudentId, check.sanitized);
                  toast.success(
                    `Kertas cita-cita & kapsul ${currentStudent?.name} di Papan 3D berhasil diperbarui!`
                  );
                }}
                className="glass-card tint-lilac mt-5 space-y-4 p-5"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-sm font-bold">
                      Edit Catatan Mimpi &amp; Kapsul Waktu 22 Siswa (Papan Tulis 3D)
                    </h3>
                    <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                      Perubahan langsung menyinkronkan database dan me-render ulang kanvas kertas 3D.
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
                        #{String(s.roll_no).padStart(2, '0')} · {s.name} ({s.nis || `202310${String(s.roll_no).padStart(2, '0')}`})
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

                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                    Pesan Kapsul Waktu Kelulusan 2026 (capsule_message)
                  </label>
                  <textarea
                    rows={2}
                    value={capsuleMessage}
                    onChange={(e) => setCapsuleMessage(e.target.value)}
                    placeholder="Pesan kenangan atau janji masa depan untuk rekan XII PPLG 1..."
                    className="mt-1 w-full rounded-xl border border-black/15 bg-white/90 p-3 text-xs text-[#0B0D14] dark:border-white/15 dark:bg-white/10 dark:text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0B0D14] px-5 text-xs font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-[#0B0D14]"
                  >
                    <Save className="size-3.5" />
                    <span>Simpan Perubahan Cita-Cita Siswa</span>
                  </button>

                  {onResetStudentDream && (
                    <button
                      type="button"
                      onClick={async () => {
                        await onResetStudentDream(selectedStudentId);
                        toast.success(`Catatan mimpi ${currentStudent?.name} di-reset ke awal.`);
                      }}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#E11D48]/30 px-4 text-xs font-semibold text-[#E11D48] hover:bg-[#E11D48]/10"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Reset Catatan Default</span>
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Tab 1: Farewell Letters CRUD */}
            {activeTab === 'farewell' && (
              <div className="mt-5 space-y-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const check = validateFarewellLetter({
                      author_name: letterName,
                      author_role: letterRole,
                      title: letterQuote,
                      body: letterMessage,
                    });
                    if (!check.valid || !check.sanitized) {
                      toast.error(check.error || 'Data surat belum lengkap.');
                      return;
                    }
                    await onAddFarewellLetter?.(check.sanitized);
                    setLetterName('');
                    setLetterQuote('');
                    setLetterMessage('');
                    toast.success('Surat perpisahan berhasil ditambahkan!');
                  }}
                  className="glass-card tint-peach space-y-3 p-4"
                >
                  <h3 className="text-sm font-bold">Tambah Surat Perpisahan &amp; Pesan Wali Kelas</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={letterName}
                      onChange={(e) => setLetterName(e.target.value)}
                      placeholder="Nama penulis surat..."
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                    />
                    <input
                      type="text"
                      value={letterRole}
                      onChange={(e) => setLetterRole(e.target.value)}
                      placeholder="Jabatan / Peran (mis. Wali Kelas / Ketua Kelas)..."
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                    />
                  </div>
                  <input
                    type="text"
                    value={letterQuote}
                    onChange={(e) => setLetterQuote(e.target.value)}
                    placeholder="Judul surat perpisahan..."
                    className="h-9 w-full rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                  />
                  <textarea
                    rows={2}
                    value={letterMessage}
                    onChange={(e) => setLetterMessage(e.target.value)}
                    placeholder="Isi pesan perpisahan lengkap..."
                    className="w-full rounded-xl border border-black/15 bg-white/85 p-3 text-xs dark:bg-white/10"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
                  >
                    <Plus className="size-3.5" />
                    Simpan Surat Perpisahan
                  </button>
                </form>

                <div className="space-y-2">
                  {farewellLetters.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white/75 px-4 py-2.5 text-xs dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-bold">{item.author_name} · <span className="font-normal text-[#5B6073]">{item.author_role}</span></p>
                        <p className="truncate text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">&ldquo;{item.title}&rdquo;</p>
                      </div>
                      {onDeleteFarewellLetter && (
                        <button
                          type="button"
                          onClick={() => onDeleteFarewellLetter(item.id)}
                          className="shrink-0 text-[#E11D48] hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Gallery Photos CRUD */}
            {activeTab === 'gallery' && (
              <div className="mt-5 space-y-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!photoTitle.trim()) return;
                    await onAddGalleryPhoto?.({
                      albumTitle: photoTitle.trim(),
                      caption: photoCaption.trim() || 'Dokumentasi kegiatan XII PPLG 1.',
                      taken_on: new Date().toISOString().slice(0, 10),
                      tint: photoAlbum,
                      accent: '#6E78E8',
                      aspect: 'landscape',
                      codeSnippet: photoUrl.trim() || 'git commit -m "feat(pplg1): class memory"',
                    });
                    setPhotoTitle('');
                    setPhotoCaption('');
                    toast.success('Foto dokumentasi berhasil ditambahkan ke Galeri!');
                  }}
                  className="glass-card tint-sky space-y-3 p-4"
                >
                  <h3 className="text-sm font-bold">Tambah Album Dokumentasi Galeri</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      placeholder="Judul album dokumentasi..."
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-3 text-xs sm:col-span-2 dark:bg-white/10"
                    />
                    <select
                      value={photoAlbum}
                      onChange={(e) => setPhotoAlbum(e.target.value)}
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-[#151A30]"
                    >
                      <option value="tint-sky">Tint Sky</option>
                      <option value="tint-lilac">Tint Lilac</option>
                      <option value="tint-sage">Tint Sage</option>
                      <option value="tint-peach">Tint Peach</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Potongan kode / perintah terminal momen..."
                    className="h-9 w-full rounded-xl border border-black/15 bg-white/85 px-3 font-mono text-xs dark:bg-white/10"
                  />
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="Keterangan singkat dokumentasi..."
                    className="h-9 w-full rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
                  >
                    <Plus className="size-3.5" />
                    Tambah ke Galeri
                  </button>
                </form>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {galleryPhotos.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white/75 px-3.5 py-2 text-xs dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.albumTitle}</p>
                        <p className="font-mono text-[10px] text-[#5B6073]">[{p.taken_on}]</p>
                      </div>
                      {onDeleteGalleryPhoto && (
                        <button
                          type="button"
                          onClick={() => onDeleteGalleryPhoto(p.id)}
                          className="shrink-0 text-[#E11D48] hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Academic (Assignments + Schedules) CRUD */}
            {activeTab === 'academic' && (
              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!taskTitle.trim()) return;
                    await onAddAssignment?.({
                      title: taskTitle.trim(),
                      subject: taskCourse.trim(),
                      description: 'Tugas praktikum & proyek portofolio XII PPLG 1.',
                      deadline: taskDue,
                      link: taskLink,
                    });
                    setTaskTitle('');
                    toast.success('Tugas kelas baru berhasil ditambahkan!');
                  }}
                  className="glass-card tint-periwinkle space-y-3 p-4"
                >
                  <h3 className="text-sm font-bold">Tambah Tugas &amp; Proyek Kelas</h3>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Judul tugas / proyek..."
                    className="h-9 w-full rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                  />
                  <input
                    type="text"
                    value={taskCourse}
                    onChange={(e) => setTaskCourse(e.target.value)}
                    placeholder="Mata pelajaran..."
                    className="h-9 w-full rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                  />
                  <input
                    type="text"
                    value={taskLink}
                    onChange={(e) => setTaskLink(e.target.value)}
                    placeholder="Tautan panduan..."
                    className="h-9 w-full rounded-xl border border-black/15 bg-white/85 px-3 font-mono text-xs dark:bg-white/10"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
                  >
                    <Plus className="size-3.5" />
                    Tambah Tugas ({assignments.length})
                  </button>
                </form>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!schedSubject.trim()) return;
                    await onAddScheduleSlot?.({
                      weekday: schedDay,
                      subject: schedSubject.trim(),
                      start_time: schedStart,
                      end_time: schedEnd,
                      teacher: schedTeacher.trim(),
                      room: schedRoom.trim(),
                    });
                    setSchedSubject('');
                    toast.success('Jadwal pelajaran baru berhasil ditambahkan!');
                  }}
                  className="glass-card tint-sage space-y-3 p-4"
                >
                  <h3 className="text-sm font-bold">Tambah Slot Jadwal Mapel</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={schedDay}
                      onChange={(e) =>
                        setSchedDay(Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6)
                      }
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-2.5 text-xs dark:bg-[#151A30]"
                    >
                      <option value={1}>Senin</option>
                      <option value={2}>Selasa</option>
                      <option value={3}>Rabu</option>
                      <option value={4}>Kamis</option>
                      <option value={5}>Jumat</option>
                    </select>
                    <input
                      type="text"
                      value={schedStart}
                      onChange={(e) => setSchedStart(e.target.value)}
                      placeholder="07:00"
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-2.5 font-mono text-xs dark:bg-white/10"
                    />
                    <input
                      type="text"
                      value={schedEnd}
                      onChange={(e) => setSchedEnd(e.target.value)}
                      placeholder="09:15"
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-2.5 font-mono text-xs dark:bg-white/10"
                    />
                  </div>
                  <input
                    type="text"
                    value={schedSubject}
                    onChange={(e) => setSchedSubject(e.target.value)}
                    placeholder="Nama mata pelajaran..."
                    className="h-9 w-full rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={schedTeacher}
                      onChange={(e) => setSchedTeacher(e.target.value)}
                      placeholder="Pengajar..."
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                    />
                    <input
                      type="text"
                      value={schedRoom}
                      onChange={(e) => setSchedRoom(e.target.value)}
                      placeholder="Ruangan..."
                      className="h-9 rounded-xl border border-black/15 bg-white/85 px-3 text-xs dark:bg-white/10"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
                  >
                    <Plus className="size-3.5" />
                    Tambah Jadwal ({schedules.length})
                  </button>
                </form>
              </div>
            )}

            {/* Tab 4: Guestbook Moderation */}
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

            {/* Tab 5: Announcements CRUD */}
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

            {/* Tab 6: Kas Kelas Entry */}
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
