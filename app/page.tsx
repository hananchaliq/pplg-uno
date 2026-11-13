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
  AnnouncementItem,
  GuestbookEntry,
  KasTransaction,
} from '@/lib/class-data';
import {
  db,
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
import { DevDeskHeroCanvas } from '@/components/three/dev-desk-canvas';
import { ClassMembersSection } from '@/components/sections/class-members-section';
import { DreamGardenStudioSection } from '@/components/sections/dream-garden-studio';
import {
  LiveScheduleBanner,
  AboutClassSection,
  ScheduleAndPiketSection,
  AnnouncementsAndEventsSection,
  AssignmentsAndResourcesSection,
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
  Sprout,
  Shield,
  Github,
  Instagram,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const { theme, setTheme } = useTheme();

  // Interactive states
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);

  // Live collections backed by initial deterministic class seed + Firestore sync
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [guestbook, setGuestbook] = React.useState<GuestbookEntry[]>(INITIAL_GUESTBOOK);
  const [kasList, setKasList] = React.useState<KasTransaction[]>(INITIAL_KAS);

  React.useEffect(() => {
    validateFirestoreConnection();

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
      unsubGuestbook();
    };
  }, []);

  // Handlers
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
    <div className="min-h-screen">
      {/* Strict 3-Zone Top Navigation Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#EEF0F8]/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0C16]/80">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="text-lg font-extrabold tracking-tight text-[#0B0D14] whitespace-nowrap shrink-0 dark:text-white"
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
              className="hover:text-[#0B0D14] hover:underline whitespace-nowrap shrink-0 transition dark:hover:text-white"
            >
              Anggota
            </a>
            <a
              href="#taman-impian"
              className="hover:text-[#0B0D14] hover:underline whitespace-nowrap shrink-0 transition dark:hover:text-white"
            >
              Taman Impian
            </a>
            <a
              href="#jadwal-kelas"
              className="hover:text-[#0B0D14] hover:underline whitespace-nowrap shrink-0 transition dark:hover:text-white"
            >
              Jadwal
            </a>
            <a
              href="#kas-kelas"
              className="hover:text-[#0B0D14] hover:underline whitespace-nowrap shrink-0 transition dark:hover:text-white"
            >
              Kas Kelas
            </a>
            <a
              href="#buku-tamu"
              className="hover:text-[#0B0D14] hover:underline whitespace-nowrap shrink-0 transition dark:hover:text-white"
            >
              Buku Tamu
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0B0D14] px-4 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition hover:opacity-90 dark:bg-white dark:text-[#0B0D14]"
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
          <div className="glass-panel p-6 sm:p-8 lg:p-10">
            {/* Workspace Toolbar Row inside Hero (Theme & Admin access) */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                <span>Pengembangan Perangkat Lunak dan Gim</span>
                <span aria-hidden="true">·</span>
                <span>22 Siswa Aktif</span>
                <span aria-hidden="true">·</span>
                <span>Tahun Ajaran {INITIAL_CLASS_INFO.school_year}</span>
              </div>

              <div className="flex items-center gap-2">
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
                  <span>Admin Kelas</span>
                </button>
              </div>
            </div>

            {/* 2-Column Balanced Hero Split */}
            <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
              {/* Left Column: Typography, Info & Dual Pill Buttons (6 cols) */}
              <div className="flex flex-col justify-between lg:col-span-6">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#6E78E8]">
                    01 · Rumah Digital &amp; Studio Kreatif
                  </p>
                  <h1
                    id="hero-heading"
                    className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.1]"
                  >
                    Kelas {INITIAL_CLASS_INFO.name} — Merakit Kode, Gim 3D &amp; Taman Impian.
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
                    {INITIAL_CLASS_INFO.tagline} Akses direktori lanyard 22 teman sekelas, pantau jadwal praktikum waktu nyata WIB, hingga rancang tata letak tanaman untuk sudut hijau laboratorium kita.
                  </p>

                  {/* 2 Pill Buttons: 1 Solid Ink, 1 Outline */}
                  <div className="mt-7 flex flex-wrap items-center gap-3.5">
                    <a
                      href="#anggota-kelas"
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0B0D14] px-6 text-xs font-semibold text-white whitespace-nowrap transition hover:opacity-90 active:scale-97 dark:bg-white dark:text-[#0B0D14]"
                    >
                      <span>Kenali 22 Anggota Kelas</span>
                      <ArrowRight className="size-4" />
                    </a>
                    <a
                      href="#taman-impian"
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-[#0B0D14] bg-transparent px-6 text-xs font-semibold text-[#0B0D14] whitespace-nowrap transition hover:bg-black/5 active:scale-97 dark:border-white dark:text-white dark:hover:bg-white/10"
                    >
                      <Sprout className="size-4 text-[#3FB8A5]" />
                      <span>Desain Taman Impian AI</span>
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
                        22 Siswa · 3 Rel Lanyard
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
            <LiveScheduleBanner schedules={INITIAL_SCHEDULES} />
          </div>
        </section>

        {/* SECTION 2: ANGGOTA KELAS (Mandatory Second Section using TeamLanyardRail) */}
        <ClassMembersSection
          students={INITIAL_STUDENTS}
          selectedStudentId={selectedStudentId}
          onClearSelectedStudent={() => setSelectedStudentId(null)}
        />

        {/* SECTION 3: DREAM GARDEN & BOTANICAL VISUAL STUDIO */}
        <DreamGardenStudioSection />

        {/* SECTION 4: TENTANG KELAS */}
        <AboutClassSection info={INITIAL_CLASS_INFO} />

        {/* SECTION 5: JADWAL PELAJARAN & PIKET */}
        <ScheduleAndPiketSection
          schedules={INITIAL_SCHEDULES}
          piket={INITIAL_PIKET}
          students={INITIAL_STUDENTS}
        />

        {/* SECTION 6 & 7: PENGUMUMAN & AGENDA */}
        <AnnouncementsAndEventsSection
          announcements={announcements}
          events={INITIAL_EVENTS}
          onReact={handleReaction}
        />

        {/* SECTION 8 & 9: TUGAS & RESOURCE HUB */}
        <AssignmentsAndResourcesSection
          assignments={INITIAL_ASSIGNMENTS}
          resources={INITIAL_RESOURCES}
        />

        {/* SECTION 10: GALERI KELAS */}
        <GallerySection photos={INITIAL_GALLERY} />

        {/* SECTION 11: KAS KELAS */}
        <KasKelasSection transactions={kasList} />

        {/* SECTION 12: BUKU TAMU REALTIME */}
        <GuestbookSection
          entries={guestbook}
          onSubmitEntry={handleGuestbookSubmit}
        />
      </main>

      {/* SECTION 13: FOOTER */}
      <footer className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-panel flex flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <div>
            <p className="text-sm font-bold">
              {INITIAL_CLASS_INFO.name} · Pengembangan Perangkat Lunak dan Gim
            </p>
            <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">
              Rumah digital 22 siswa · Tahun Ajaran {INITIAL_CLASS_INFO.school_year}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
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
        students={INITIAL_STUDENTS}
        announcements={announcements}
        onSelectStudent={(id) => setSelectedStudentId(id)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Admin Single-Account Moderation Modal */}
      <AdminDrawerModal
        open={adminOpen}
        onOpenChange={setAdminOpen}
        announcements={announcements}
        guestbook={guestbook}
        kasTransactions={kasList}
        onAddAnnouncement={handleAddAnnouncement}
        onDeleteAnnouncement={handleDeleteAnnouncement}
        onModerateGuestbook={handleModerateGuestbook}
        onAddKasTransaction={handleAddKasTransaction}
      />
    </div>
  );
}
