"use client";

import * as React from "react";
import { ClassInfo, StudentRecord, ScheduleSlot, PiketDay, AnnouncementItem, EventItem, AssignmentItem, ResourceItem, GalleryPhoto, FarewellLetter } from "@/lib/class-data";
import { getActiveScheduleWIB } from "@/lib/class-logic";
import { ResponsiveDataGrid } from "@/components/ui/responsive-data-grid";
import { GraduationCapsuleShowcase3D } from "@/components/three/graduation-capsule-models";
import { Clock, Calendar, BookOpen, Sparkles, ExternalLink, Pin, MapPin, FolderGit2, Maximize2, X, RotateCw, Trash2, HeartHandshake } from "lucide-react";

const WEEKDAY_NAMES: Array<{ day: 1 | 2 | 3 | 4 | 5 | 6; label: string }> = [
   { day: 1, label: "Senin" },
   { day: 2, label: "Selasa" },
   { day: 3, label: "Rabu" },
   { day: 4, label: "Kamis" },
   { day: 5, label: "Jumat" },
   { day: 6, label: "Sabtu" },
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
         title: "Rekayasa Perangkat Lunak Fullstack",
         tint: "tint-lilac",
         code: "01 · Engineering",
         desc: "Membangun aplikasi web modern dengan Next.js App Router, TypeScript strict, dan skema PostgreSQL berkeamanan Row Level Security.",
      },
      {
         title: "Pengembangan Gim & Simulasi 3D",
         tint: "tint-aqua",
         code: "02 · Interactive 3D",
         desc: "Merancang geometri prosedural Three.js, shader interaktif, dan sistem fisika waktu nyata yang berjalan mulus di browser.",
      },
      {
         title: "Budaya Kolaborasi & Transparansi",
         tint: "tint-peach",
         code: "03 · Culture",
         desc: "22 siswa saling bantu dari review pull request, piket kebersihan laboratorium, papan cita-cita 3D, hingga kas terbuka.",
      },
   ];

   return (
      <section id="tentang-kelas" aria-labelledby="heading-tentang-kelas" className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
         <div className="glass-panel p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10 lg:flex-row lg:items-end">
               <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">04 · Profil & Identitas Jurusan</p>
                  <h2 id="heading-tentang-kelas" className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                     Tentang Kelas {info.name}
                  </h2>
               </div>
               <p className="max-w-xl text-sm text-[#5B6073] dark:text-[#A4AAC0]">{info.description}</p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
               {highlights.map(card => (
                  <article key={card.title} className={`glass-card ${card.tint} p-6`}>
                     <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">{card.code}</span>
                     <h3 className="mt-2 text-lg font-bold">{card.title}</h3>
                     <p className="mt-2 text-sm leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">{card.desc}</p>
                  </article>
               ))}
            </div>

            {/* Additive 3D Graduation Capsule Artifacts Showcase */}
            <GraduationCapsuleShowcase3D />
         </div>
      </section>
   );
}

export function ScheduleAndPiketSection({ schedules, piket, students }: { schedules: ScheduleSlot[]; piket: PiketDay[]; students: StudentRecord[] }) {
   const [flippedDays, setFlippedDays] = React.useState<Record<number, boolean>>({});

   const toggleDayFlip = (day: number) => {
      setFlippedDays(prev => ({ ...prev, [day]: !prev[day] }));
   };

   return (
      <section id="jadwal-kelas" aria-labelledby="heading-jadwal-kelas" className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
         <div className="glass-panel p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10 sm:flex-row sm:items-end">
               <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">05 · Jadwal Pelajaran & Piket Harian</p>
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
                  const daySchedules = schedules.filter(s => s.weekday === day);
                  const dayPiket = piket.find(p => p.weekday === day);
                  const isFlipped = !!flippedDays[day];
                  const tints = ["tint-lilac", "tint-sky", "tint-sage", "tint-peach", "tint-orchid", "tint-aqua"];
                  const tintClass = tints[idx % tints.length];

                  return (
                     <div key={day} className={`glass-card ${tintClass} flex flex-col justify-between p-6 transition-all`}>
                        <div>
                           <div className="flex items-center justify-between border-b border-black/10 pb-3 dark:border-white/10">
                              <div>
                                 <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">Hari 0{day}</span>
                                 <h3 className="text-xl font-bold">{label}</h3>
                              </div>
                              <button type="button" onClick={() => toggleDayFlip(day)} className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white/75 px-3 py-1.5 font-mono text-[11px] font-medium text-[#0B0D14] transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white">
                                 <RotateCw className="size-3" />
                                 {isFlipped ? "Lihat Mapel" : "Lihat Piket"}
                              </button>
                           </div>

                           {!isFlipped ? (
                              <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-1">
                                 {daySchedules.map(slot => (
                                    <li key={slot.id} className="min-w-0 rounded-xl border border-black/5 bg-white/65 p-2.5 sm:p-3 dark:border-white/10 dark:bg-white/5">
                                       <div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[10px] text-[#5B6073] sm:text-[11px] dark:text-[#A4AAC0]">
                                          <span className="tabular-nums">
                                             {slot.start_time}–{slot.end_time}
                                          </span>
                                          <span className="truncate">{slot.room}</span>
                                       </div>
                                       <p className="mt-1 line-clamp-2 text-xs font-semibold sm:text-sm">{slot.subject}</p>
                                       <p className="truncate text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">{slot.teacher}</p>
                                    </li>
                                 ))}
                              </ul>
                           ) : (
                              <div className="mt-4">
                                 <p className="font-mono text-xs uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">Petugas Piket Hari {label}:</p>
                                 <ul className="mt-3 grid grid-cols-2 gap-2.5">
                                    {(dayPiket?.studentRollNos ?? []).map(rollNo => {
                                       const st = students.find(s => s.roll_no === rollNo);
                                       return (
                                          <li key={rollNo} className="flex min-w-0 flex-col justify-between rounded-xl border border-black/5 bg-white/70 px-3 py-2 text-xs font-medium dark:border-white/10 dark:bg-white/10">
                                             <span className="truncate font-bold">{st ? st.name : `Siswa ${String(rollNo).padStart(2, "0")}`}</span>
                                             <span className="font-mono text-[10px] text-[#5B6073] dark:text-[#A4AAC0]">Absen #{String(rollNo).padStart(2, "0")}</span>
                                          </li>
                                       );
                                    })}
                                 </ul>
                                 <p className="mt-3 text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">Tugas: Merapikan kursi lab, mematikan proyektor, dan membersihkan papan tulis.</p>
                              </div>
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>

            {/* Master Structured Schedule Overview using ResponsiveDataGrid (2-Column Card Grid on Mobile < md, Table on Desktop md+) */}
            <div className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
               <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">Rekap Terstruktur Jadwal Mapel &amp; Ruang Praktikum (Senin – Sabtu)</h3>
                  <span className="font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">Otomatis 2-Kolom Card di Mobile · Tabel di Desktop</span>
               </div>
               <ResponsiveDataGrid
                  items={schedules}
                  getRowKey={s => s.id}
                  ariaLabel="Tabel Rekap Jadwal Mata Pelajaran XII PPLG 1"
                  testId="schedule-responsive-grid"
                  columns={[
                     {
                        key: "day",
                        header: "Hari & Jam",
                        render: s => {
                           const dayLabel = WEEKDAY_NAMES.find(w => w.day === s.weekday)?.label ?? `Hari ${s.weekday}`;
                           return (
                              <span className="font-mono text-[11px] font-semibold tabular-nums">
                                 {dayLabel} · {s.start_time}–{s.end_time}
                              </span>
                           );
                        },
                     },
                     {
                        key: "subject",
                        header: "Mata Pelajaran",
                        render: s => <span className="font-semibold">{s.subject}</span>,
                     },
                     {
                        key: "teacher",
                        header: "Pengajar",
                        render: s => <span className="text-[#5B6073] dark:text-[#A4AAC0]">{s.teacher}</span>,
                     },
                     {
                        key: "room",
                        header: "Ruang Lab",
                        align: "right",
                        render: s => <span className="rounded-full bg-[#6E78E8]/12 px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#4750C7] dark:bg-[#6E78E8]/25 dark:text-[#C5CAFF]">{s.room}</span>,
                     },
                  ]}
                  renderMobileCard={s => {
                     const dayLabel = WEEKDAY_NAMES.find(w => w.day === s.weekday)?.label ?? `Hari ${s.weekday}`;
                     return (
                        <div className="flex h-full flex-col justify-between gap-1.5">
                           <div>
                              <div className="flex items-center justify-between gap-1 font-mono text-[10px] text-[#6E78E8]">
                                 <span className="font-bold uppercase">{dayLabel}</span>
                                 <span className="tabular-nums">
                                    {s.start_time}–{s.end_time}
                                 </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug">{s.subject}</p>
                           </div>
                           <div className="border-t border-black/5 pt-1.5 text-[10px] text-[#5B6073] dark:border-white/10 dark:text-[#A4AAC0]">
                              <p className="truncate">{s.teacher}</p>
                              <p className="font-mono font-semibold text-[#0B0D14] dark:text-white">{s.room}</p>
                           </div>
                        </div>
                     );
                  }}
               />
            </div>
         </div>
      </section>
   );
}

export function AnnouncementsAndEventsSection({ announcements, events, onReact }: { announcements: AnnouncementItem[]; events: EventItem[]; onReact: (announcementId: string, emoji: string) => void }) {
   const [nowMs, setNowMs] = React.useState<number>(() => new Date("2026-04-13T10:00:00+07:00").getTime());

   React.useEffect(() => {
      const timer = window.setInterval(() => {
         setNowMs(Date.now());
      }, 60_000);
      return () => window.clearInterval(timer);
   }, []);

   return (
      <section id="pengumuman-agenda" aria-labelledby="heading-pengumuman" className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Announcements (7 cols) */}
            <div className="glass-panel p-6 sm:p-8 lg:col-span-7">
               <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">06 · Papan Informasi Kelas</p>
               <h2 id="heading-pengumuman" className="mt-1.5 text-2xl font-bold tracking-tight">
                  Pengumuman & Pin Penting
               </h2>

               {announcements.length === 0 ? (
                  <p className="mt-6 text-sm text-[#5B6073]">Belum ada pengumuman. Tenang, nggak ada PR dadakan.</p>
               ) : (
                  <div className="mt-6 space-y-4">
                     {announcements.map(item => (
                        <article key={item.id} className="glass-card tint-sky p-5">
                           <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                              <div className="flex items-center gap-2">
                                 {item.is_pinned && <Pin className="size-3.5 text-[#6E78E8]" />}
                                 <span className="font-mono uppercase">{item.category}</span>
                                 <span aria-hidden="true">·</span>
                                 <span className="tabular-nums">
                                    {new Date(item.published_at).toLocaleDateString("id-ID", {
                                       day: "numeric",
                                       month: "short",
                                       year: "numeric",
                                    })}
                                 </span>
                              </div>
                           </div>

                           <h3 className="mt-2 text-base font-bold">{item.title}</h3>
                           <p className="mt-1.5 text-sm leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">{item.body}</p>

                           {/* Reaction Bar */}
                           <div className="mt-4 flex flex-wrap items-center gap-2">
                              {["🔥", "🚀", "👏", "💡", "❤️"].map(emoji => {
                                 const count = item.reactions[emoji] ?? 0;
                                 return (
                                    <button key={emoji} type="button" onClick={() => onReact(item.id, emoji)} aria-label={`Beri reaksi ${emoji} pada ${item.title}`} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/10 bg-white/75 px-3 font-mono text-xs transition hover:border-[#6E78E8] hover:bg-white active:scale-95 dark:border-white/15 dark:bg-white/10">
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
               <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">07 · Agenda Mendatang</p>
               <h2 className="mt-1.5 text-2xl font-bold tracking-tight">Kalender & Hitung Mundur</h2>

               <div className="mt-6 space-y-4">
                  {events.map(evt => {
                     const diffMs = Math.max(0, new Date(evt.starts_at).getTime() - nowMs);
                     const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                     return (
                        <article key={evt.id} className="glass-card tint-orchid p-5">
                           <div className="flex items-center justify-between font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                              <span className="inline-flex items-center gap-1">
                                 <Calendar className="size-3.5 text-[#E0709A]" />
                                 {new Date(evt.starts_at).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                 })}
                              </span>
                              <span className="font-semibold tabular-nums text-[#0B0D14] dark:text-white">H-{daysLeft} Hari</span>
                           </div>
                           <h3 className="mt-2 text-base font-bold">{evt.title}</h3>
                           <p className="mt-1 text-xs leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">{evt.description}</p>
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

export function AssignmentsAndResourcesSection({ assignments, resources, isAdmin = false, onDeleteAssignment }: { assignments: AssignmentItem[]; resources: ResourceItem[]; isAdmin?: boolean; onDeleteAssignment?: (id: string) => void }) {
   const [resourceFilter, setResourceFilter] = React.useState<string>("Semua");

   const filteredResources = React.useMemo(() => {
      if (resourceFilter === "Semua") return resources;
      return resources.filter(r => r.category === resourceFilter);
   }, [resources, resourceFilter]);

   return (
      <section id="tugas-materi" aria-labelledby="heading-tugas" className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Assignments & Deadlines (6 cols — 2-Column Card Grid on Mobile < md) */}
            <div className="glass-panel p-6 sm:p-8 lg:col-span-6">
               <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">08 · Antrean Tugas Produktif</p>
               <h2 id="heading-tugas" className="mt-1.5 text-2xl font-bold tracking-tight">
                  Tugas &amp; Proyek Kelas
               </h2>

               <div className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-1 md:gap-4">
                  {assignments.map(asg => (
                     <article key={asg.id} className="glass-card tint-peach flex min-w-0 flex-col justify-between p-3.5 sm:p-5">
                        <div>
                           <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono text-[10px] text-[#5B6073] sm:text-xs dark:text-[#A4AAC0]">
                              <span className="truncate font-semibold">{asg.subject}</span>
                              <span className="font-semibold tabular-nums text-[#0B0D14] dark:text-white">
                                 {new Date(asg.deadline).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                 })}
                              </span>
                           </div>
                           <h3 className="mt-1.5 line-clamp-2 text-xs font-bold sm:text-base">{asg.title}</h3>
                           <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-[#5B6073] sm:text-xs dark:text-[#A4AAC0]">{asg.description}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                           <a href={asg.link} className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#6E78E8] hover:underline sm:text-xs">
                              <FolderGit2 className="size-3.5 shrink-0" />
                              <span className="truncate">Instruksi</span>
                           </a>
                           {isAdmin && onDeleteAssignment && (
                              <button type="button" onClick={() => onDeleteAssignment(asg.id)} className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#E11D48] hover:underline">
                                 <Trash2 className="size-3" />
                                 <span>Hapus</span>
                              </button>
                           )}
                        </div>
                     </article>
                  ))}
               </div>
            </div>

            {/* Resource Hub (6 cols — 2-Column Card Grid on Mobile & Desktop) */}
            <div className="glass-panel p-6 sm:p-8 lg:col-span-6">
               <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                     <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">09 · Gudang Modul &amp; Referensi</p>
                     <h2 className="mt-1.5 text-2xl font-bold tracking-tight">Resource Hub PPLG</h2>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                     {["Semua", "Modul", "Repo", "Design", "Tools"].map(cat => (
                        <button key={cat} type="button" onClick={() => setResourceFilter(cat)} className={`h-8 rounded-full px-3 text-xs font-medium transition ${resourceFilter === cat ? "bg-[#0B0D14] text-white dark:bg-white dark:text-[#0B0D14]" : "bg-white/60 text-[#5B6073] hover:bg-white dark:bg-white/10 dark:text-[#A4AAC0]"}`}>
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {filteredResources.map(res => (
                     <a key={res.id} href={res.url} className="glass-card tint-sage group flex min-w-0 flex-col justify-between p-3.5 transition sm:p-4">
                        <div>
                           <div className="flex items-center justify-between gap-1 font-mono text-[10px] text-[#5B6073] sm:text-[11px] dark:text-[#A4AAC0]">
                              <span className="truncate">{res.category}</span>
                              <span className="truncate">{res.file_type}</span>
                           </div>
                           <h3 className="mt-2 line-clamp-2 text-xs font-bold group-hover:text-[#6E78E8] sm:text-sm">{res.title}</h3>
                        </div>
                        <div className="mt-3 flex items-center gap-1 font-mono text-[10px] font-medium text-[#0B0D14] sm:mt-4 sm:text-[11px] dark:text-white">
                           <BookOpen className="size-3.5 shrink-0" />
                           <span className="truncate">Akses Materi</span>
                           <ExternalLink className="ml-auto size-3 shrink-0 opacity-60" />
                        </div>
                     </a>
                  ))}
               </div>
            </div>
         </div>
      </section>
   );
}

export function FarewellLettersSection({ letters, isAdmin = false, onDeleteLetter }: { letters: FarewellLetter[]; isAdmin?: boolean; onDeleteLetter?: (id: string) => void }) {
   return (
      <section id="surat-perpisahan" aria-labelledby="heading-surat-perpisahan" className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
         <div className="glass-panel p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10 sm:flex-row sm:items-end">
               <div>
                  <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.22em] text-[#6E78E8]">
                     <HeartHandshake className="size-3.5" />
                     <span>10 · Arsip Kapsul Waktu &amp; Perpisahan</span>
                  </p>
                  <h2 id="heading-surat-perpisahan" className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                     Surat Perpisahan XII PPLG 1 — Class of 2026
                  </h2>
               </div>
               <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">Catatan hati wali kelas, pengurus, dan 22 siswa menjelang kelulusan SMK.</p>
            </div>

            {/* 2-Column Card Grid on Mobile (< md), 2-Column Spacious Cards on Desktop */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-2 md:gap-5">
               {letters.map((letter, idx) => {
                  const tints = ["tint-lilac", "tint-peach", "tint-sage", "tint-sky"];
                  const tint = tints[idx % tints.length];
                  return (
                     <article key={letter.id} className={`glass-card ${tint} flex min-w-0 flex-col justify-between p-3.5 sm:p-6`}>
                        <div>
                           <div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[10px] text-[#5B6073] sm:text-xs dark:text-[#A4AAC0]">
                              <span className="truncate font-bold text-[#0B0D14] dark:text-white">{letter.author_name}</span>
                              <span className="truncate">{letter.author_role}</span>
                           </div>
                           <h3 className="mt-2 line-clamp-2 text-xs font-extrabold sm:text-lg">{letter.title}</h3>
                           <p className="mt-1.5 line-clamp-4 text-[11px] leading-relaxed text-[#5B6073] sm:line-clamp-none sm:text-sm dark:text-[#A4AAC0]">&ldquo;{letter.body}&rdquo;</p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-2.5 font-mono text-[10px] text-[#5B6073] sm:mt-4 sm:pt-3 dark:border-white/10 dark:text-[#A4AAC0]">
                           <span className="truncate">✦ Momen: {letter.memory_highlight}</span>
                           {isAdmin && onDeleteLetter && (
                              <button type="button" onClick={() => onDeleteLetter(letter.id)} className="inline-flex items-center gap-1 font-semibold text-[#E11D48] hover:underline">
                                 <Trash2 className="size-3" />
                                 <span>Hapus</span>
                              </button>
                           )}
                        </div>
                     </article>
                  );
               })}
            </div>
         </div>
      </section>
   );
}

export function GallerySection({ photos, isAdmin = false, onDeletePhoto }: { photos: GalleryPhoto[]; isAdmin?: boolean; onDeletePhoto?: (id: string) => void }) {
   const [selectedPhoto, setSelectedPhoto] = React.useState<GalleryPhoto | null>(null);

   return (
      <section id="galeri-kelas" aria-labelledby="heading-galeri" className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
         <div className="glass-panel p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10 sm:flex-row sm:items-end">
               <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">11 · Arsip Visual &amp; Dokumentasi</p>
                  <h2 id="heading-galeri" className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                     Galeri Momen XII PPLG 1
                  </h2>
               </div>
               <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">Klik salah satu album untuk membuka tampilan Lightbox Kaca penuh.</p>
            </div>

            {/* 2-Column Card Grid on Mobile (< md), 3-Column on Desktop */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-3">
               {photos.map((photo, idx) => (
                  <div key={photo.id} className={`glass-card ${photo.tint} group flex min-w-0 flex-col justify-between p-3.5 text-left sm:p-5`}>
                     <button type="button" onClick={() => setSelectedPhoto(photo)} className="w-full text-left">
                        {/* Stylized Procedural Artwork Frame */}
                        <div
                           className="relative flex h-28 w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/60 p-2.5 sm:h-44 sm:p-4 dark:border-white/15"
                           style={{
                              background: `radial-gradient(circle at 80% 20%, ${photo.accent}44, transparent 65%), linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))`,
                           }}>
                           <div className="flex items-center justify-between gap-1 font-mono text-[9px] sm:text-[11px]">
                              <span className="truncate tabular-nums text-[#0B0D14] dark:text-white">
                                 ALBUM 0{idx + 1} · {photo.taken_on}
                              </span>
                              <Maximize2 className="size-3.5 shrink-0 opacity-60 transition group-hover:scale-110 group-hover:opacity-100" />
                           </div>

                           <div className="truncate rounded-xl bg-[#0B0D14]/85 px-2.5 py-1.5 font-mono text-[9px] text-white sm:px-3 sm:py-2 sm:text-[11px]">
                              <code>{photo.codeSnippet}</code>
                           </div>
                        </div>

                        <div className="mt-3 sm:mt-4">
                           <h3 className="line-clamp-1 text-xs font-bold sm:text-base">{photo.albumTitle}</h3>
                           <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#5B6073] sm:text-xs dark:text-[#A4AAC0]">{photo.caption}</p>
                        </div>
                     </button>

                     {isAdmin && onDeletePhoto && (
                        <div className="mt-2.5 flex justify-end border-t border-black/10 pt-2 dark:border-white/10">
                           <button type="button" onClick={() => onDeletePhoto(photo.id)} className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#E11D48] hover:underline">
                              <Trash2 className="size-3" />
                              <span>Hapus Album</span>
                           </button>
                        </div>
                     )}
                  </div>
               ))}
            </div>

            {/* Lightbox Modal */}
            {selectedPhoto && (
               <div role="dialog" aria-modal="true" aria-label={selectedPhoto.albumTitle} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" onClick={() => setSelectedPhoto(null)}>
                  <div className="glass-panel w-full max-w-xl p-6 sm:p-8" onClick={e => e.stopPropagation()}>
                     <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">{selectedPhoto.taken_on}</span>
                        <button type="button" aria-label="Tutup lightbox" onClick={() => setSelectedPhoto(null)} className="rounded-full border border-black/15 p-2 hover:bg-black/5 dark:border-white/20">
                           <X className="size-4" />
                        </button>
                     </div>
                     <h3 className="mt-3 text-xl font-bold">{selectedPhoto.albumTitle}</h3>
                     <p className="mt-2 text-sm text-[#5B6073] dark:text-[#A4AAC0]">{selectedPhoto.caption}</p>
                     <div className="mt-4 overflow-x-auto rounded-2xl bg-[#0B0D14] p-4 font-mono text-xs text-[#54CEBA]">{selectedPhoto.codeSnippet}</div>
                  </div>
               </div>
            )}
         </div>
      </section>
   );
}
