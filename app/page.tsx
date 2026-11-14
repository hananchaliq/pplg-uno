'use client';

import * as React from 'react';
import {
  INITIAL_CLASS_INFO,
  INITIAL_STUDENTS,
  INITIAL_SCHEDULES,
  INITIAL_PIKET,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_RESOURCES,
  INITIAL_GALLERY,
  INITIAL_KAS,
  INITIAL_GUESTBOOK,
  INITIAL_FAREWELL_LETTERS,
  AnnouncementItem,
  AssignmentItem,
  FarewellLetter,
  GalleryPhoto,
  GuestbookEntry,
  KasTransaction,
  ScheduleSlot,
  StudentRecord,
} from '@/lib/class-data';
import {
  db,
  auth,
  validateFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from '@/lib/firebase/client';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/browser';
import { useAdminAuth } from '@/components/providers/admin-auth-provider';
import { ClassBootLoader } from '@/components/ui/class-boot-loader';
import { DevDeskHeroCanvas } from '@/components/three/dev-desk-canvas';
import { ClassMembersSection } from '@/components/sections/class-members-section';
import { DreamBoardSection } from '@/components/three/dream-board-section';
import {
  LiveScheduleBanner,
  AboutClassSection,
  ScheduleAndPiketSection,
  AnnouncementsAndEventsSection,
  AssignmentsAndResourcesSection,
  FarewellLettersSection,
  GallerySection,
} from '@/components/sections/academic-hub-sections';
import {
  KasKelasSection,
  GuestbookSection,
} from '@/components/sections/kas-and-guestbook-sections';
import { CommandPaletteModal } from '@/components/sections/command-palette-modal';
import { AdminDrawerModal } from '@/components/sections/admin-drawer-modal';
import { useTheme } from 'next-themes';
import {
  Search,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Shield,
  LogOut,
  Github,
  Instagram,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'ananxpplg1@gmail.com';

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { isAdmin, logoutAdmin } = useAdminAuth();

  // Interactive states
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);

  // Live collections backed by initial deterministic class seed + Supabase / Firestore sync
  const [students, setStudents] = React.useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [schedules, setSchedules] = React.useState<ScheduleSlot[]>(INITIAL_SCHEDULES);
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [assignments, setAssignments] = React.useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [farewellLetters, setFarewellLetters] = React.useState<FarewellLetter[]>(INITIAL_FAREWELL_LETTERS);
  const [galleryPhotos, setGalleryPhotos] = React.useState<GalleryPhoto[]>(INITIAL_GALLERY);
  const [guestbook, setGuestbook] = React.useState<GuestbookEntry[]>(INITIAL_GUESTBOOK);
  const [kasList, setKasList] = React.useState<KasTransaction[]>(INITIAL_KAS);

  React.useEffect(() => {
    validateFirestoreConnection();

    // Optional Supabase initial fetch via server route (prevents browser 404 noise if schema.sql is not yet applied)
    if (isSupabaseConfigured()) {
      void (async () => {
        try {
          const res = await fetch('/api/supabase-archive', { cache: 'no-store' });
          if (!res.ok) return;
          const json = (await res.json()) as {
            synced?: boolean;
            students?: Array<Record<string, unknown>>;
            farewellLetters?: FarewellLetter[];
          };
          if (json.students && json.students.length > 0) {
            const sbMap = new Map<number, Partial<StudentRecord>>();
            json.students.forEach((row) => {
              if (typeof row.roll_no === 'number') {
                sbMap.set(row.roll_no, row as Partial<StudentRecord>);
              }
            });
            setStudents((prev) =>
              prev.map((st) => {
                const remote = sbMap.get(st.roll_no);
                return remote ? { ...st, ...remote } : st;
              })
            );
          }
          if (json.farewellLetters && json.farewellLetters.length > 0) {
            setFarewellLetters(json.farewellLetters);
          }
        } catch {
          // Graceful fallback to initial seed + Firestore
        }
      })();
    }

    // Sync any updated student dream notes from Firestore
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        if (snap.empty) return;
        const remoteMap = new Map<string, Partial<StudentRecord>>();
        snap.forEach((docSnap) => {
          remoteMap.set(docSnap.id, docSnap.data() as Partial<StudentRecord>);
        });
        setStudents((prev) =>
          prev.map((st) => {
            const remote = remoteMap.get(st.id);
            return remote ? { ...st, ...remote } : st;
          })
        );
      },
      () => {
        // Fallback to local seed
      }
    );

    // Listen to approved guestbook notes in Firestore if any are added
    const unsubGuestbook = onSnapshot(
      collection(db, 'guestbook'),
      (snap) => {
        if (snap.empty) return;
        const remoteEntries: GuestbookEntry[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.sender_name && data.message) {
            remoteEntries.push({
              id: docSnap.id,
              sender_name: String(data.sender_name),
              message: String(data.message),
              status: (data.status as GuestbookEntry['status']) || 'approved',
              created_at: String(data.created_at || new Date().toISOString()),
            });
          }
        });
        if (remoteEntries.length > 0) {
          setGuestbook((prev) => {
            const map = new Map<string, GuestbookEntry>();
            prev.forEach((p) => map.set(p.id, p));
            remoteEntries.forEach((r) => map.set(r.id, r));
            return Array.from(map.values());
          });
        }
      },
      () => {
        // Public query requires status == 'approved' on restricted rules, fallback gracefully to local state
      }
    );

    return () => {
      unsubStudents();
      unsubGuestbook();
    };
  }, []);

  // Handlers
  const handleUpdateStudentDream = async (
    studentId: string,
    payload: {
      dream_title: string;
      dream_reason: string;
      dream_description: string;
      dream_paper_color: string;
      capsule_message?: string | undefined;
    }
  ) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;

    const updated: StudentRecord = {
      ...target,
      ...payload,
      capsule_message: payload.capsule_message ?? target.capsule_message,
    };

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? updated : s))
    );

    // Persist to Supabase if configured
    const supabase = createSupabaseBrowserClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase
          .from('students')
          .update({
            dream_title: updated.dream_title,
            dream_reason: updated.dream_reason,
            dream_description: updated.dream_description,
            dream_paper_color: updated.dream_paper_color,
            capsule_message: updated.capsule_message,
          })
          .eq('roll_no', updated.roll_no);
      } catch {
        // Fallback to local state
      }
    }

    if (auth.currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      try {
        await setDoc(doc(db, 'students', studentId), {
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
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `students/${studentId}`);
      }
    }
  };

  const handleResetStudentDream = async (studentId: string) => {
    const seed = INITIAL_STUDENTS.find((s) => s.id === studentId);
    if (!seed) return;
    await handleUpdateStudentDream(studentId, {
      dream_title: seed.dream_title,
      dream_reason: seed.dream_reason,
      dream_description: seed.dream_description,
      dream_paper_color: seed.dream_paper_color || '#FFFBEB',
      capsule_message: seed.capsule_message,
    });
  };

  const handleAddFarewellLetter = async (
    payload: Omit<FarewellLetter, 'id' | 'created_at'>
  ) => {
    const newItem: FarewellLetter = {
      ...payload,
      id: `fw-${Date.now()}`,
      created_at: new Date().toISOString().slice(0, 10),
    };
    setFarewellLetters((prev) => [newItem, ...prev]);

    const supabase = createSupabaseBrowserClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('farewell_letters').insert([
          {
            author_name: newItem.author_name,
            author_role: newItem.author_role,
            title: newItem.title,
            body: newItem.body,
            memory_highlight: newItem.memory_highlight,
          },
        ]);
      } catch {
        // Local fallback
      }
    }
  };

  const handleDeleteFarewellLetter = async (id: string) => {
    setFarewellLetters((prev) => prev.filter((item) => item.id !== id));
    const supabase = createSupabaseBrowserClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('farewell_letters').delete().eq('id', id);
      } catch {
        // Local fallback
      }
    }
    toast.success('Surat perpisahan dihapus.');
  };

  const handleAddGalleryPhoto = async (payload: Omit<GalleryPhoto, 'id'>) => {
    const newPhoto: GalleryPhoto = {
      ...payload,
      id: `gal-${Date.now()}`,
    };
    setGalleryPhotos((prev) => [newPhoto, ...prev]);

    const supabase = createSupabaseBrowserClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('gallery_photos').insert([payload]);
      } catch {
        // Local fallback
      }
    }
  };

  const handleDeleteGalleryPhoto = async (id: string) => {
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== id));
    const supabase = createSupabaseBrowserClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('gallery_photos').delete().eq('id', id);
      } catch {
        // Local fallback
      }
    }
    toast.success('Foto dokumentasi dihapus dari galeri.');
  };

  const handleAddAssignment = async (payload: Omit<AssignmentItem, 'id'>) => {
    const newTask: AssignmentItem = {
      ...payload,
      id: `tgs-${Date.now()}`,
    };
    setAssignments((prev) => [newTask, ...prev]);
  };

  const handleDeleteAssignment = async (id: string) => {
    setAssignments((prev) => prev.filter((t) => t.id !== id));
    toast.success('Tugas berhasil dihapus.');
  };

  const handleAddScheduleSlot = async (payload: Omit<ScheduleSlot, 'id'>) => {
    const newSlot: ScheduleSlot = {
      ...payload,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, newSlot]);
  };

  const handleDeleteScheduleSlot = async (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleReaction = async (announcementId: string, emoji: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id !== announcementId) return a;
        const current = a.reactions[emoji] ?? 0;
        return {
          ...a,
          reactions: {
            ...a.reactions,
            [emoji]: current + 1,
          },
        };
      })
    );
    toast.success(`Reaksi ${emoji} tercatat!`);
  };

  const handleGuestbookSubmit = async (sender_name: string, message: string) => {
    const newId = `gb-${Date.now()}`;
    const newEntry: GuestbookEntry = {
      id: newId,
      sender_name,
      message,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setGuestbook((prev) => [newEntry, ...prev]);

    try {
      await setDoc(doc(db, 'guestbook', newId), {
        sender_name: newEntry.sender_name,
        message: newEntry.message,
        status: 'pending',
        created_at: newEntry.created_at,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `guestbook/${newId}`);
    }
  };

  const handleAddAnnouncement = async (
    title: string,
    body: string,
    category: AnnouncementItem['category']
  ) => {
    const newId = `ann-${Date.now()}`;
    const item: AnnouncementItem = {
      id: newId,
      title,
      body,
      category,
      is_pinned: false,
      published_at: new Date().toISOString(),
      reactions: { '🚀': 1 },
    };
    setAnnouncements((prev) => [item, ...prev]);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch {
      // Local state already updated
    }
  };

  const handleModerateGuestbook = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    setGuestbook((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status } : g))
    );
    toast.success(
      status === 'approved'
        ? 'Pesan buku tamu disetujui dan tampil di papan publik!'
        : 'Pesan buku tamu ditolak.'
    );
    try {
      const target = guestbook.find((g) => g.id === id);
      if (target) {
        await updateDoc(doc(db, 'guestbook', id), {
          status,
          sender_name: target.sender_name,
          message: target.message,
        });
      }
    } catch {
      // Local state already updated for demo/passcode mode
    }
  };

  const handleAddKasTransaction = async (
    type: 'masuk' | 'keluar',
    amount: number,
    note: string
  ) => {
    const newTx: KasTransaction = {
      id: `kas-${Date.now()}`,
      occurred_on: new Date().toISOString().slice(0, 10),
      type,
      amount,
      note,
    };
    setKasList((prev) => [newTx, ...prev]);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* 60FPS Pre-mount ClassBootLoader (JetBrains Mono 00%–100% + Module Boot Logs, CLS = 0) */}
      <ClassBootLoader />

      {/* Strict 3-Zone Top Navigation Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#EEF0F8]/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0C16]/80">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-3.5 sm:gap-8 sm:px-6 lg:px-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="shrink-0 whitespace-nowrap text-base font-extrabold tracking-tight text-[#0B0D14] sm:text-lg dark:text-white"
          >
            XII PPLG 1
          </a>

          {/* Zone 2: 5 concise single-line text links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden items-center gap-6 text-sm font-medium text-[#5B6073] md:flex dark:text-[#A4AAC0]"
          >
            <a
              href="#anggota-kelas"
              className="shrink-0 whitespace-nowrap transition hover:text-[#0B0D14] hover:underline dark:hover:text-white"
            >
              Anggota
            </a>
            <a
              href="#papan-cita-cita"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap transition hover:text-[#0B0D14] hover:underline dark:hover:text-white"
            >
              <Sparkles className="size-3.5 text-[#6E78E8]" strokeWidth={1.5} />
              <span>Papan Cita-Cita</span>
            </a>
            <a
              href="#jadwal-kelas"
              className="shrink-0 whitespace-nowrap transition hover:text-[#0B0D14] hover:underline dark:hover:text-white"
            >
              Jadwal
            </a>
            <a
              href="#kas-kelas"
              className="shrink-0 whitespace-nowrap transition hover:text-[#0B0D14] hover:underline dark:hover:text-white"
            >
              Kas Kelas
            </a>
            <a
              href="#buku-tamu"
              className="shrink-0 whitespace-nowrap transition hover:text-[#0B0D14] hover:underline dark:hover:text-white"
            >
              Buku Tamu
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#0B0D14] px-3.5 text-xs font-semibold text-white transition hover:opacity-90 sm:px-4 dark:bg-white dark:text-[#0B0D14]"
            >
              <Search className="size-3.5" />
              <span>Cari &amp; Pintasan (⌘K)</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* SECTION 1: HERO (First Section per strict ordering rule) */}
        <section
          id="hero"
          aria-labelledby="hero-heading"
          className="mx-auto max-w-[1320px] px-4 pt-8 pb-10 sm:px-6 lg:px-8"
        >
          <div className="glass-panel p-5 sm:p-8 lg:p-10">
            {/* Workspace Toolbar Row inside Hero (Theme & Admin access + ADMIN MODE ACTIVE indicator) */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                <span>Pengembangan Perangkat Lunak dan Gim</span>
                <span aria-hidden="true">·</span>
                <span>22 Siswa Aktif</span>
                <span aria-hidden="true">·</span>
                <span>Class of 2026 ({INITIAL_CLASS_INFO.school_year})</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                  <span
                    data-testid="admin-mode-badge"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#3FB8A5]/40 bg-[#3FB8A5]/15 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-[#1F7A6C] dark:text-[#6EE7B7]"
                  >
                    <span className="size-2 rounded-full bg-[#3FB8A5]" />
                    ADMIN MODE ACTIVE
                  </span>
                )}

                <button
                  type="button"
                  aria-label="Ganti tema terang atau gelap"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/15 bg-white/75 px-3.5 text-xs font-medium text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="size-3.5 text-[#F0A04B]" />
                      <span>Mode Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="size-3.5 text-[#6E78E8]" />
                      <span>Mode Gelap</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAdminOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/15 bg-white/75 px-3.5 text-xs font-medium text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white"
                >
                  <Shield className="size-3.5 text-[#6E78E8]" />
                  <span>{isAdmin ? 'Panel Admin' : 'Admin Kelas'}</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={async () => {
                      await logoutAdmin();
                      toast.success('Sesi Admin Kelas berhasil diakhiri.');
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E11D48]/30 bg-[#E11D48]/10 px-3 text-xs font-semibold text-[#E11D48] transition hover:bg-[#E11D48]/20"
                  >
                    <LogOut className="size-3.5" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2-Column Balanced Hero Split */}
            <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
              {/* Left Column: Typography, Info & Dual Pill Buttons (6 cols) */}
              <div className="flex flex-col justify-between lg:col-span-6">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#6E78E8]">
                    01 · Rumah Digital &amp; Kapsul Kelulusan Class of 2026
                  </p>
                  <h1
                    id="hero-heading"
                    className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.1]"
                  >
                    Kelas {INITIAL_CLASS_INFO.name} — Merakit Kode, Gim 3D &amp; Masa Depan Impian.
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
                    {INITIAL_CLASS_INFO.tagline} Akses direktori lanyard 22 teman sekelas, baca tempelan kertas cita-cita 3D interaktif di papan tulis kelas, jelajahi artefak kapsul kelulusan 3D, hingga pantau jadwal praktikum waktu nyata WIB.
                  </p>

                  {/* 2 Pill Buttons: 1 Solid Ink, 1 Outline */}
                  <div className="mt-7 flex flex-wrap items-center gap-3.5">
                    <a
                      href="#anggota-kelas"
                      className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-[#0B0D14] px-6 text-xs font-semibold text-white transition hover:opacity-90 active:scale-97 dark:bg-white dark:text-[#0B0D14]"
                    >
                      <span>Kenali 22 Anggota Kelas</span>
                      <ArrowRight className="size-4" />
                    </a>
                    <a
                      href="#papan-cita-cita"
                      className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-[#0B0D14] bg-transparent px-6 text-xs font-semibold text-[#0B0D14] transition hover:bg-black/5 active:scale-97 dark:border-white dark:text-white dark:hover:bg-white/10"
                    >
                      <Sparkles className="size-4 text-[#6E78E8]" strokeWidth={1.5} />
                      <span>Papan Cita-Cita 3D</span>
                    </a>
                  </div>
                </div>

                {/* Unboxed Metadata Fact Row */}
                <div className="mt-8 border-t border-black/10 pt-5 dark:border-white/10">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <span className="font-mono text-[11px] uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                        Wali Kelas
                      </span>
                      <p className="mt-0.5 text-sm font-bold">
                        {INITIAL_CLASS_INFO.homeroom_teacher}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                        Komposisi Kelas
                      </span>
                      <p className="mt-0.5 font-mono text-sm font-bold tabular-nums">
                        22 Siswa · 22 Dream Notes
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase text-[#5B6073] dark:text-[#A4AAC0]">
                        Laboratorium Utama
                      </span>
                      <p className="mt-0.5 text-sm font-bold">
                        Lab RPL 1 &amp; Studio Gim
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive 3D Dev Desk Assembly (6 cols) */}
              <div className="lg:col-span-6">
                <DevDeskHeroCanvas />
              </div>
            </div>

            {/* Live WIB Schedule Status Banner */}
            <LiveScheduleBanner schedules={schedules} />
          </div>
        </section>

        {/* SECTION 2: ANGGOTA KELAS (Mandatory Second Section using TeamLanyardRail) */}
        <ClassMembersSection
          students={students}
          selectedStudentId={selectedStudentId}
          onClearSelectedStudent={() => setSelectedStudentId(null)}
        />

        {/* SECTION 3: PAPAN TULIS CITA-CITA 3D STATIS & 22 KERTAS INTERAKTIF (ClassDreamBoard3D) */}
        <DreamBoardSection
          students={students}
          isAdmin={isAdmin}
          onUpdateStudentDream={handleUpdateStudentDream}
          onResetStudentDream={handleResetStudentDream}
        />

        {/* SECTION 4: TENTANG KELAS & 3D GRADUATION CAPSULE ARTIFACTS */}
        <AboutClassSection info={INITIAL_CLASS_INFO} />

        {/* SECTION 5: JADWAL PELAJARAN & PIKET (2-Column Mobile Card Grid) */}
        <ScheduleAndPiketSection
          schedules={schedules}
          piket={INITIAL_PIKET}
          students={students}
        />

        {/* SECTION 6 & 7: PENGUMUMAN & AGENDA */}
        <AnnouncementsAndEventsSection
          announcements={announcements}
          events={INITIAL_EVENTS}
          onReact={handleReaction}
        />

        {/* SECTION 8 & 9: TUGAS & RESOURCE HUB (2-Column Mobile Card Grid) */}
        <AssignmentsAndResourcesSection
          assignments={assignments}
          resources={INITIAL_RESOURCES}
          isAdmin={isAdmin}
          onDeleteAssignment={handleDeleteAssignment}
        />

        {/* SECTION 10: SURAT PERPISAHAN & PESAN WALI KELAS (2-Column Mobile Card Grid) */}
        <FarewellLettersSection
          letters={farewellLetters}
          isAdmin={isAdmin}
          onDeleteLetter={handleDeleteFarewellLetter}
        />

        {/* SECTION 11: GALERI KELAS (2-Column Mobile Card Grid) */}
        <GallerySection
          photos={galleryPhotos}
          isAdmin={isAdmin}
          onDeletePhoto={handleDeleteGalleryPhoto}
        />

        {/* SECTION 12: KAS KELAS (2-Column Mobile Card Grid) */}
        <KasKelasSection transactions={kasList} />

        {/* SECTION 13: BUKU TAMU REALTIME */}
        <GuestbookSection
          entries={guestbook}
          onSubmitEntry={handleGuestbookSubmit}
        />
      </main>

      {/* SECTION 14: FOOTER */}
      <footer className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-panel flex flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <div>
            <p className="text-sm font-bold">
              {INITIAL_CLASS_INFO.name} — Class of 2026 · Pengembangan Perangkat Lunak dan Gim
            </p>
            <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">
              Rumah digital &amp; kapsul kelulusan 22 siswa · Tahun Ajaran {INITIAL_CLASS_INFO.school_year}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <a
              href={INITIAL_CLASS_INFO.socials.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <Github className="size-4" />
              GitHub Kelas
            </a>
            <a
              href={INITIAL_CLASS_INFO.socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <Instagram className="size-4" />
              Instagram
            </a>
            <a
              href={INITIAL_CLASS_INFO.socials.discord}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <MessageCircle className="size-4" />
              Discord Server
            </a>
          </div>
        </div>
      </footer>

      {/* Command Palette Modal */}
      <CommandPaletteModal
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        students={students}
        announcements={announcements}
        onSelectStudent={(id) => setSelectedStudentId(id)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Admin Single-Account Moderation & Full CRUD Modal */}
      <AdminDrawerModal
        open={adminOpen}
        onOpenChange={setAdminOpen}
        students={students}
        announcements={announcements}
        guestbook={guestbook}
        kasTransactions={kasList}
        farewellLetters={farewellLetters}
        galleryPhotos={galleryPhotos}
        schedules={schedules}
        assignments={assignments}
        onUpdateStudentDream={handleUpdateStudentDream}
        onResetStudentDream={handleResetStudentDream}
        onAddAnnouncement={handleAddAnnouncement}
        onDeleteAnnouncement={handleDeleteAnnouncement}
        onModerateGuestbook={handleModerateGuestbook}
        onAddKasTransaction={handleAddKasTransaction}
        onAddFarewellLetter={handleAddFarewellLetter}
        onDeleteFarewellLetter={handleDeleteFarewellLetter}
        onAddGalleryPhoto={handleAddGalleryPhoto}
        onDeleteGalleryPhoto={handleDeleteGalleryPhoto}
        onAddAssignment={handleAddAssignment}
        onDeleteAssignment={handleDeleteAssignment}
        onAddScheduleSlot={handleAddScheduleSlot}
        onDeleteScheduleSlot={handleDeleteScheduleSlot}
      />
    </div>
  );
}
