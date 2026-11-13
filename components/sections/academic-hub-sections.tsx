'use client';

import * as React from 'react';
import {
  ClassInfo,
  StudentRecord,
  ScheduleSlot,
  PiketDay,
  AnnouncementItem,
  EventItem,
  AssignmentItem,
  ResourceItem,
  GalleryPhoto,
} from '@/lib/class-data';
import { getActiveScheduleWIB } from '@/lib/class-logic';
import {
  Clock,
  Calendar,
  BookOpen,
  Sparkles,
  ExternalLink,
  Pin,
  MapPin,
  FolderGit2,
  Maximize2,
  X,
  RotateCw,
} from 'lucide-react';

const WEEKDAY_NAMES: Array<{ day: 1 | 2 | 3 | 4 | 5 | 6; label: string }> = [
  { day: 1, label: 'Senin' },
  { day: 2, label: 'Selasa' },
  { day: 3, label: 'Rabu' },
  { day: 4, label: 'Kamis' },
  { day: 5, label: 'Jumat' },
  { day: 6, label: 'Sabtu' },
];

export function LiveScheduleBanner({ schedules }: { schedules: ScheduleSlot[] }) {
  const [status, setStatus] = React.useState(() => getActiveScheduleWIB(schedules));

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setStatus(getActiveScheduleWIB(schedules));
    }, 30000);
    return () => window.clearInterval(id);
  }, [schedules]);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/75 bg-white/65 px-5 py-3.5 shadow-sm dark:border-white/15 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6E78E8]/15 text-[#6E78E8]">
          <Clock className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
            <span>Sekarang di Kelas</span>
            <span aria-hidden="true">·</span>
            <span>{status.dayName}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{status.currentTimeWIB}</span>
          </div>
          <p className="mt-0.5 text-sm font-semibold">{status.summaryText}</p>
        </div>
      </div>

      {status.nextSlot && (
        <div className="font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">
          Selanjutnya: <strong className="text-[#0B0D14] dark:text-white">{status.nextSlot.subject}</strong> ({status.nextSlot.start_time})
        </div>
      )}
    </div>
  );
}

export function AboutClassSection({ info }: { info: ClassInfo }) {
  const highlights = [
    {
      title: 'Rekayasa Perangkat Lunak Fullstack',
      tint: 'tint-lilac',
      code: '01 · Engineering',
      desc: 'Membangun aplikasi web modern dengan Next.js App Router, TypeScript strict, dan skema PostgreSQL berkeamanan Row Level Security.',
    },
    {
      title: 'Pengembangan Gim & Simulasi 3D',
      tint: 'tint-aqua',
      code: '02 · Interactive 3D',
      desc: 'Merancang geometri prosedural Three.js, shader interaktif, dan sistem fisika waktu nyata yang berjalan mulus di browser.',
    },
    {
      title: 'Budaya Kolaborasi & Transparansi',
      tint: 'tint-peach',
      code: '03 · Culture',
      desc: '22 siswa saling bantu dari review pull request, piket kebersihan laboratorium, penataan taman kelas, hingga kas terbuka.',
    },
  ];

  return (
    <section
      id="tentang-kelas"
      aria-labelledby="heading-tentang-kelas"
      className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="glass-panel p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
              04 · Profil & Identitas Jurusan
            </p>
            <h2 id="heading-tentang-kelas" className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Tentang Kelas {info.name}
            </h2>
          </div>
          <p className="max-w-xl text-sm text-[#5B6073] dark:text-[#A4AAC0]">
            {info.description}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {highlights.map((card) => (
            <article key={card.title} className={`glass-card ${card.tint} p-6`}>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
                {card.code}
              </span>
              <h3 className="mt-2 text-lg font-bold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
                {card.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScheduleAndPiketSection({
  schedules,
  piket,
  students,
}: {
  schedules: ScheduleSlot[];
  piket: PiketDay[];
  students: StudentRecord[];
}) {
  const [flippedDays, setFlippedDays] = React.useState<Record<number, boolean>>({});

  const toggleDayFlip = (day: number) => {
    setFlippedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <section
      id="jadwal-kelas"
      aria-labelledby="heading-jadwal-kelas"
      className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="glass-panel p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
              05 · Jadwal Pelajaran & Piket Harian
            </p>
            <h2 id="heading-jadwal-kelas" className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Kartu Hari Interaktif (Senin – Sabtu)
            </h2>
          </div>
          <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">
            Klik tombol <strong>Balik Kartu Piket</strong> pada masing-masing hari untuk melihat daftar petugas piket kelas.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {WEEKDAY_NAMES.map(({ day, label }, idx) => {
            const daySchedules = schedules.filter((s) => s.weekday === day);
            const dayPiket = piket.find((p) => p.weekday === day);
            const isFlipped = !!flippedDays[day];
            const tints = ['tint-lilac', 'tint-sky', 'tint-sage', 'tint-peach', 'tint-orchid', 'tint-aqua'];
            const tintClass = tints[idx % tints.length];

            return (
              <div
                key={day}
                className={`glass-card ${tintClass} flex flex-col justify-between p-6 transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-black/10 pb-3 dark:border-white/10">
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
                        Hari 0{day}
                      </span>
                      <h3 className="text-xl font-bold">{label}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDayFlip(day)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/75 px-3 py-1.5 font-mono text-[11px] font-medium text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white"
                    >
                      <RotateCw className="size-3" />
                      {isFlipped ? 'Lihat Mapel' : 'Lihat Piket'}
                    </button>
                  </div>

                  {!isFlipped ? (
                    <ul className="mt-4 space-y-3">
                      {daySchedules.map((slot) => (
                        <li
                          key={slot.id}
                          className="rounded-xl border border-black/5 bg-white/65 p-3 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="flex items-center justify-between font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                            <span className="tabular-nums">
                              {slot.start_time} – {slot.end_time} WIB
                            </span>
                            <span>{slot.room}</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold">{slot.subject}</p>
                          <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">{slot.teacher}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-4">
                      <p className="font-mono text-xs uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
                        Petugas Piket Hari {label}:
                      </p>
                      <ul className="mt-3 space-y-2">
                        {(dayPiket?.studentRollNos ?? []).map((rollNo) => {
                          const st = students.find((s) => s.roll_no === rollNo);
                          return (
                            <li
                              key={rollNo}
                              className="flex items-center justify-between rounded-xl border border-black/5 bg-white/70 px-3.5 py-2 text-xs font-medium dark:border-white/10 dark:bg-white/10"
                            >
                              <span>{st ? st.name : `Siswa ${String(rollNo).padStart(2, '0')}`}</span>
                              <span className="font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                                Absen #{String(rollNo).padStart(2, '0')}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="mt-3 text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                        Tugas: Merapikan kursi lab, mematikan proyektor, dan menyiram tanaman teras kelas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AnnouncementsAndEventsSection({
  announcements,
  events,
  onReact,
}: {
  announcements: AnnouncementItem[];
  events: EventItem[];
  onReact: (announcementId: string, emoji: string) => void;
}) {
  const [nowMs, setNowMs] = React.useState<number>(() =>
    new Date('2026-04-13T10:00:00+07:00').getTime()
  );

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      id="pengumuman-agenda"
      aria-labelledby="heading-pengumuman"
      className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Announcements (7 cols) */}
        <div className="glass-panel p-6 sm:p-8 lg:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
            06 · Papan Informasi Kelas
          </p>
          <h2 id="heading-pengumuman" className="mt-1.5 text-2xl font-bold tracking-tight">
            Pengumuman & Pin Penting
          </h2>

          {announcements.length === 0 ? (
            <p className="mt-6 text-sm text-[#5B6073]">
              Belum ada pengumuman. Tenang, nggak ada PR dadakan.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {announcements.map((item) => (
                <article
                  key={item.id}
                  className="glass-card tint-sky p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                    <div className="flex items-center gap-2">
                      {item.is_pinned && <Pin className="size-3.5 text-[#6E78E8]" />}
                      <span className="font-mono uppercase">{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {new Date(item.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-2 text-base font-bold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
                    {item.body}
                  </p>

                  {/* Reaction Bar */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {['🚀', '🔥', '🌿', '👍', '✨'].map((emoji) => {
                      const count = item.reactions[emoji] ?? 0;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onReact(item.id, emoji)}
                          aria-label={`Beri reaksi ${emoji} pada ${item.title}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/10 bg-white/75 px-3 font-mono text-xs transition hover:border-[#6E78E8] hover:bg-white active:scale-95 dark:border-white/15 dark:bg-white/10"
                        >
                          <span>{emoji}</span>
                          <span className="tabular-nums">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events & Countdown (5 cols) */}
        <div className="glass-panel p-6 sm:p-8 lg:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
            07 · Agenda Mendatang
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight">
            Kalender & Hitung Mundur
          </h2>

          <div className="mt-6 space-y-4">
            {events.map((evt) => {
              const diffMs = Math.max(0, new Date(evt.starts_at).getTime() - nowMs);
              const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
              return (
                <article key={evt.id} className="glass-card tint-orchid p-5">
                  <div className="flex items-center justify-between font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5 text-[#E0709A]" />
                      {new Date(evt.starts_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="font-semibold tabular-nums text-[#0B0D14] dark:text-white">
                      H-{daysLeft} Hari
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-bold">{evt.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
                    {evt.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                    <MapPin className="size-3.5 shrink-0 text-[#6E78E8]" />
                    <span>{evt.location}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AssignmentsAndResourcesSection({
  assignments,
  resources,
}: {
  assignments: AssignmentItem[];
  resources: ResourceItem[];
}) {
  const [resourceFilter, setResourceFilter] = React.useState<string>('Semua');

  const filteredResources = React.useMemo(() => {
    if (resourceFilter === 'Semua') return resources;
    return resources.filter((r) => r.category === resourceFilter);
  }, [resources, resourceFilter]);

  return (
    <section
      id="tugas-materi"
      aria-labelledby="heading-tugas"
      className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Assignments & Deadlines (6 cols) */}
        <div className="glass-panel p-6 sm:p-8 lg:col-span-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
            08 · Antrean Tugas Produktif
          </p>
          <h2 id="heading-tugas" className="mt-1.5 text-2xl font-bold tracking-tight">
            Tugas & Deadline Kelas
          </h2>

          <div className="mt-6 space-y-4">
            {assignments.map((asg) => (
              <article key={asg.id} className="glass-card tint-peach p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                  <span>{asg.subject}</span>
                  <span className="font-semibold tabular-nums text-[#0B0D14] dark:text-white">
                    Tenggat:{' '}
                    {new Date(asg.deadline).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <h3 className="mt-1.5 text-base font-bold">{asg.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
                  {asg.description}
                </p>
                <div className="mt-3">
                  <a
                    href={asg.link}
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#6E78E8] hover:underline"
                  >
                    <FolderGit2 className="size-3.5" />
                    Buka Instruksi / Repositori
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Resource Hub (6 cols) */}
        <div className="glass-panel p-6 sm:p-8 lg:col-span-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
                09 · Gudang Modul & Referensi
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight">
                Resource Hub PPLG
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['Semua', 'Modul', 'Repo', 'Design', 'Tools'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setResourceFilter(cat)}
                  className={`h-8 rounded-full px-3 text-xs font-medium transition ${
                    resourceFilter === cat
                      ? 'bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]'
                      : 'bg-white/60 text-[#5B6073] hover:bg-white dark:bg-white/10 dark:text-[#A4AAC0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {filteredResources.map((res) => (
              <a
                key={res.id}
                href={res.url}
                className="glass-card tint-sage group flex flex-col justify-between p-4 transition"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                    <span>{res.category}</span>
                    <span>{res.file_type}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold group-hover:text-[#6E78E8]">
                    {res.title}
                  </h3>
                </div>
                <div className="mt-4 flex items-center gap-1 font-mono text-[11px] font-medium text-[#0B0D14] dark:text-white">
                  <BookOpen className="size-3.5" />
                  <span>Akses Materi</span>
                  <ExternalLink className="ml-auto size-3 opacity-60" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function GallerySection({ photos }: { photos: GalleryPhoto[] }) {
  const [selectedPhoto, setSelectedPhoto] = React.useState<GalleryPhoto | null>(null);

  return (
    <section
      id="galeri-kelas"
      aria-labelledby="heading-galeri"
      className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="glass-panel p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
              10 · Arsip Visual & Dokumentasi
            </p>
            <h2 id="heading-galeri" className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Galeri Momen XII PPLG 1
            </h2>
          </div>
          <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">
            Klik salah satu album untuk membuka tampilan Lightbox Kaca penuh.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className={`glass-card ${photo.tint} group flex flex-col justify-between p-5 text-left`}
            >
              {/* Stylized Procedural Artwork Frame */}
              <div
                className="relative flex h-44 w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/60 p-4 dark:border-white/15"
                style={{
                  background: `radial-gradient(circle at 80% 20%, ${photo.accent}44, transparent 65%), linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))`,
                }}
              >
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="tabular-nums text-[#0B0D14] dark:text-white">
                    ALBUM 0{idx + 1} · {photo.taken_on}
                  </span>
                  <Maximize2 className="size-3.5 opacity-60 transition group-hover:scale-110 group-hover:opacity-100" />
                </div>

                <div className="rounded-xl bg-[#0B0D14]/85 px-3 py-2 font-mono text-[11px] text-white">
                  <code>{photo.codeSnippet}</code>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold">{photo.albumTitle}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
                  {photo.caption}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedPhoto.albumTitle}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="glass-panel max-w-xl w-full p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                  {selectedPhoto.taken_on}
                </span>
                <button
                  type="button"
                  aria-label="Tutup lightbox"
                  onClick={() => setSelectedPhoto(null)}
                  className="rounded-full border border-black/15 p-2 hover:bg-black/5 dark:border-white/20"
                >
                  <X className="size-4" />
                </button>
              </div>
              <h3 className="mt-3 text-xl font-bold">{selectedPhoto.albumTitle}</h3>
              <p className="mt-2 text-sm text-[#5B6073] dark:text-[#A4AAC0]">
                {selectedPhoto.caption}
              </p>
              <div className="mt-4 rounded-2xl bg-[#0B0D14] p-4 font-mono text-xs text-[#54CEBA]">
                {selectedPhoto.codeSnippet}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
