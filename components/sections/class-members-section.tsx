'use client';

import * as React from 'react';
import TeamLanyardRail, { LanyardMember } from '@/components/ui/team-lanyard-rail';
import { StudentRecord } from '@/lib/class-data';
import { filterStudents } from '@/lib/class-logic';
import { Search, Users, RotateCcw } from 'lucide-react';

interface ClassMembersSectionProps {
  students: StudentRecord[];
  selectedStudentId?: string | null;
  onClearSelectedStudent?: () => void;
}

const INTEREST_FILTERS = [
  'Semua',
  'Game Dev',
  'Frontend',
  'Backend',
  'UI/UX',
  'Fullstack',
  'Creative Dev',
  'Data',
];

export function ClassMembersSection({
  students,
  selectedStudentId,
  onClearSelectedStudent,
}: ClassMembersSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('Semua');
  const [railGroup, setRailGroup] = React.useState<0 | 1 | 2>(0);
  const [activeBadge, setActiveBadge] = React.useState<number | null>(null);
  const [flippedBadge, setFlippedBadge] = React.useState<number | null>(null);

  // Split 22 students into 3 balanced rails (8 + 7 + 7) when viewing all, or show filtered list
  const isFiltering = searchQuery.trim().length > 0 || selectedTag !== 'Semua';

  const filteredStudents = React.useMemo(
    () => filterStudents(students, searchQuery, selectedTag),
    [students, searchQuery, selectedTag]
  );

  const railSlices = React.useMemo(() => {
    const published = students.filter((s) => s.is_published);
    return [
      published.slice(0, 8),
      published.slice(8, 15),
      published.slice(15, 22),
    ];
  }, [students]);

  const displayedStudents = isFiltering
    ? filteredStudents.slice(0, 8)
    : railSlices[railGroup] ?? railSlices[0];

  // Auto-open student when triggered from Command Palette or Search
  React.useEffect(() => {
    if (!selectedStudentId) return;
    const published = students.filter((s) => s.is_published);
    const fullIdx = published.findIndex((s) => s.id === selectedStudentId);
    if (fullIdx < 0) return;

    queueMicrotask(() => {
      setSearchQuery('');
      setSelectedTag('Semua');

      if (fullIdx < 8) {
        setRailGroup(0);
        setActiveBadge(fullIdx);
        setFlippedBadge(fullIdx);
      } else if (fullIdx < 15) {
        setRailGroup(1);
        setActiveBadge(fullIdx - 8);
        setFlippedBadge(fullIdx - 8);
      } else {
        setRailGroup(2);
        setActiveBadge(fullIdx - 15);
        setFlippedBadge(fullIdx - 15);
      }
      onClearSelectedStudent?.();
    });
  }, [selectedStudentId, students, onClearSelectedStudent]);

  const lanyardItems: LanyardMember[] = React.useMemo(
    () =>
      displayedStudents.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        team: `XII PPLG 1 · No. ${String(s.roll_no).padStart(2, '0')}`,
        image: s.avatar_url,
        bio: s.bio,
        tags: s.tags,
        links: s.links,
        tone: s.tone,
        drop: s.drop,
      })),
    [displayedStudents]
  );

  return (
    <section
      id="anggota-kelas"
      aria-labelledby="heading-anggota-kelas"
      className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="glass-panel p-6 sm:p-8 lg:p-10">
        {/* Section Header + Search & Interest Filter */}
        <div className="flex flex-col gap-6 border-b border-black/10 pb-6 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
              02 · Direktori Lanyard Interaktif
            </p>
            <h2
              id="heading-anggota-kelas"
              className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Anggota Kelas XII PPLG 1 (22 Siswa)
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-[#5B6073] dark:text-[#A4AAC0]">
              Tarik tali lanyard ke bawah, geser ke samping untuk membenturkan kartu, atau klik kartu untuk melihat bio, minat teknis, dan kontak masing-masing siswa.
            </p>
          </div>

          {/* Search input */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#5B6073]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim().length > 0) {
                    setActiveBadge(0);
                    setFlippedBadge(0);
                  } else {
                    setFlippedBadge(null);
                  }
                }}
                placeholder="Cari nomor absen, nama, atau minat..."
                aria-label="Cari anggota kelas XII PPLG 1"
                className="h-10 w-full rounded-full border border-black/15 bg-white/75 pl-10 pr-4 text-sm text-[#0B0D14] outline-none transition focus:border-[#6E78E8] focus:ring-2 focus:ring-[#6E78E8]/30 dark:border-white/15 dark:bg-white/10 dark:text-white"
              />
            </div>
            {(searchQuery || selectedTag !== 'Semua') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('Semua');
                  setActiveBadge(null);
                  setFlippedBadge(null);
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/15 px-4 text-xs font-medium transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar + Rail Group Switcher (8 + 7 + 7) */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="group"
            aria-label="Filter minat siswa"
            className="flex flex-wrap items-center gap-1.5"
          >
            {INTEREST_FILTERS.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`h-8 rounded-full px-3.5 text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/55 text-[#5B6073] hover:bg-white/85 dark:bg-white/10 dark:text-[#A4AAC0] dark:hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {!isFiltering && (
            <div
              role="tablist"
              aria-label="Pilih baris rel lanyard siswa"
              className="flex flex-wrap items-center gap-1 self-start rounded-2xl border border-black/10 bg-white/55 p-1 sm:rounded-full dark:border-white/15 dark:bg-white/5"
            >
              {[
                { idx: 0 as const, label: 'Rel 1 (01–08)' },
                { idx: 1 as const, label: 'Rel 2 (09–15)' },
                { idx: 2 as const, label: 'Rel 3 (16–22)' },
              ].map((tab) => (
                <button
                  key={tab.idx}
                  role="tab"
                  type="button"
                  aria-selected={railGroup === tab.idx}
                  onClick={() => {
                    setRailGroup(tab.idx);
                    setActiveBadge(null);
                    setFlippedBadge(null);
                  }}
                  className={`h-8 rounded-full px-3 font-mono text-[11px] font-medium whitespace-nowrap transition sm:px-3.5 sm:text-xs ${
                    railGroup === tab.idx
                      ? 'bg-[#6E78E8] text-white shadow-sm'
                      : 'text-[#5B6073] hover:text-[#0B0D14] dark:text-[#A4AAC0] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lanyard Rail Component */}
        {lanyardItems.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-3xl border border-white/60 bg-background/65 dark:border-white/10">
            <TeamLanyardRail
              items={lanyardItems}
              eyebrow={
                isFiltering
                  ? `Menampilkan ${lanyardItems.length} dari ${filteredStudents.length} siswa yang cocok`
                  : `Baris Rel ${railGroup + 1} dari 3 · Total 22 Siswa XII PPLG 1`
              }
              heading={
                isFiltering
                  ? 'Hasil Pencarian Anggota Kelas'
                  : railGroup === 0
                    ? 'Pengurus Kelas & Koordinator (Absen 01 – 08)'
                    : railGroup === 1
                      ? 'Tim Engineer & Game Developer (Absen 09 – 15)'
                      : 'Tim Creative, AI & DevOps (Absen 16 – 22)'
              }
              caption="Arahkan kursor, tarik lanyard ke bawah, atau klik kartu untuk membalik ID card."
              autoplay={false}
              active={activeBadge}
              onActiveChange={setActiveBadge}
              flipped={flippedBadge}
              onFlippedChange={setFlippedBadge}
              labels={{
                flip: 'Klik atau tekan Enter untuk membalik kartu',
                back: 'Klik lagi atau tekan Esc untuk mengembalikan',
                show: 'Lihat',
              }}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
            <Users className="mx-auto size-8 text-[#5B6073]" />
            <p className="mt-2 font-medium">
              Tidak ada siswa dengan kata kunci &ldquo;{searchQuery}&rdquo; pada filter {selectedTag}.
            </p>
            <p className="mt-1 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
              Coba ketik nomor absen (01 sampai 22) atau reset filter minat di atas.
            </p>
          </div>
        )}

        {/* Quick 22-Student Roster 2-Column Mobile Card Grid for Accessibility & Instant Inspection */}
        <div className="mt-6 border-t border-black/10 pt-5 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
              Direktori Cepat 22 Siswa (2-Kolom Card Mobile · Klik untuk buka Lanyard):
            </span>
            <span className="font-mono text-[11px] tabular-nums text-[#5B6073] dark:text-[#A4AAC0]">
              22 / 22 Siswa Aktif · Class of 2026
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
            {students
              .filter((s) => s.is_published)
              .map((student, idx) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag('Semua');
                    if (idx < 8) {
                      setRailGroup(0);
                      setActiveBadge(idx);
                      setFlippedBadge(idx);
                    } else if (idx < 15) {
                      setRailGroup(1);
                      setActiveBadge(idx - 8);
                      setFlippedBadge(idx - 8);
                    } else {
                      setRailGroup(2);
                      setActiveBadge(idx - 15);
                      setFlippedBadge(idx - 15);
                    }
                  }}
                  className="flex min-w-0 flex-col justify-between rounded-xl border border-black/10 bg-white/65 p-2.5 text-left text-xs transition hover:border-[#6E78E8] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/15"
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span className="truncate font-bold">{student.name}</span>
                    <span className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-[#6E78E8]">
                      #{String(student.roll_no).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="mt-1 flex w-full items-center justify-between gap-1 font-mono text-[9px] text-[#5B6073] dark:text-[#A4AAC0]">
                    <span className="truncate">{student.role}</span>
                    <span className="shrink-0 tabular-nums">{student.nis || `202310${String(student.roll_no).padStart(2, '0')}`}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
