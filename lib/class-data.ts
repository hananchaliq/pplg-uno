export interface ClassInfo {
  name: string;
  tagline: string;
  description: string;
  homeroom_teacher: string;
  school_year: string;
  socials: {
    instagram: string;
    github: string;
    discord: string;
  };
}

export interface StudentRecord {
  id: string;
  roll_no: number;
  name: string;
  role: string;
  avatar_url: string;
  bio: string;
  tags: string[];
  links: { label: string; href: string }[];
  tone: 1 | 2 | 3 | 4 | 5;
  drop?: number;
  is_published: boolean;
}

export interface ScheduleSlot {
  id: string;
  weekday: 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  subject: string;
  teacher: string;
  room: string;
}

export interface PiketDay {
  weekday: 1 | 2 | 3 | 4 | 5 | 6;
  dayName: string;
  studentRollNos: number[];
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  category: 'Praktikum' | 'Akademik' | 'Event' | 'Kas' | 'Umum';
  is_pinned: boolean;
  published_at: string;
  reactions: Record<string, number>;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
}

export interface AssignmentItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  deadline: string;
  link: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: 'Modul' | 'Repo' | 'Design' | 'Tools';
  url: string;
  file_type: string;
}

export interface GalleryPhoto {
  id: string;
  albumTitle: string;
  caption: string;
  taken_on: string;
  tint: string;
  accent: string;
  aspect: string;
  codeSnippet: string;
}

export interface KasTransaction {
  id: string;
  occurred_on: string;
  type: 'masuk' | 'keluar';
  amount: number;
  note: string;
}

export interface GuestbookEntry {
  id: string;
  sender_name: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface GardenPlantNode {
  id: string;
  name: string;
  latinName: string;
  layer: 'Kanopi' | 'Semak' | 'Penutup Tanah' | 'Aksen Air/Batu';
  sunNeed: 'Teduh' | 'Semi-Teduh' | 'Penuh';
  moisture: 'Lembap' | 'Sedang' | 'Kering';
  colorHex: string;
  xPercent: number;
  yPercent: number;
  radiusMeters: number;
  careTip: string;
}

export interface GardenLayoutPlan {
  title: string;
  styleName: string;
  summary: string;
  widthMeters: number;
  lengthMeters: number;
  sunlight: string;
  soilType: string;
  hardscapeElements: string[];
  plants: GardenPlantNode[];
  visualUrl?: string;
}

export function generatePastelAvatarDataUri(
  rollNo: number,
  name: string,
  tone: 1 | 2 | 3 | 4 | 5
): string {
  const palettes: Record<1 | 2 | 3 | 4 | 5, [string, string, string]> = {
    1: ['#DDE0FA', '#6E78E8', '#1F2456'],
    2: ['#D3F2EC', '#3FB8A5', '#13443C'],
    3: ['#FCE8D2', '#F0A04B', '#54320F'],
    4: ['#F9DCE8', '#E0709A', '#561B33'],
    5: ['#D6ECFA', '#4FA3E0', '#163D5C'],
  };
  const [bgStart, bgEnd, fg] = palettes[tone] || palettes[1];
  const label = `S${String(rollNo).padStart(2, '0')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="g${rollNo}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}" />
        <stop offset="100%" stop-color="${bgEnd}" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#g${rollNo})" />
    <circle cx="60" cy="44" r="18" fill="${fg}" fill-opacity="0.16" />
    <path d="M28 104c5-18 17-26 32-26s27 8 32 26" fill="${fg}" fill-opacity="0.16" />
    <text x="60" y="67" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-weight="700" font-size="28" fill="${fg}">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_CLASS_INFO: ClassInfo = {
  name: 'XII PPLG 1',
  tagline: 'Merakit baris kode, gim interaktif, dan kenangan tahun terakhir di bangku SMK.',
  description:
    'Rumah digital resmi kelas XII Pengembangan Perangkat Lunak dan Gim 1. Tempat kumpul 22 siswa: dari jadwal praktikum lab, antrean deadline, laporan kas transparan, sampai studio desain taman & aset visual.',
  homeroom_teacher: 'Bpk. Hendra Wijaya, S.Kom., M.T.',
  school_year: '2026 / 2027',
  socials: {
    instagram: 'https://instagram.com/xiipplg1.official',
    github: 'https://github.com/xii-pplg-1',
    discord: 'https://discord.gg/xiipplg1',
  },
};

const STUDENT_SPECS: Array<{
  roll_no: number;
  role: string;
  bio: string;
  tags: string[];
  tone: 1 | 2 | 3 | 4 | 5;
  drop: number;
}> = [
  {
    roll_no: 1,
    role: 'Ketua Kelas',
    bio: 'Koordinator utama kelas dan arsitek sistem backend. Kalau server lab down, orang pertama yang dicari.',
    tags: ['Backend', 'DevOps', 'Next.js'],
    tone: 1,
    drop: 8,
  },
  {
    roll_no: 2,
    role: 'Wakil Ketua',
    bio: 'Menjaga ritme kelas tetap kondusif dan hobi bikin prototipe mekanik gim 3D di waktu luang.',
    tags: ['Game Dev', 'Three.js', 'C#'],
    tone: 2,
    drop: 18,
  },
  {
    roll_no: 3,
    role: 'Sekretaris I',
    bio: 'Dokumentasi rapi dari presensi harian sampai notulensi rapat projek pameran akhir tahun.',
    tags: ['UI/UX', 'Figma', 'Docs'],
    tone: 3,
    drop: 4,
  },
  {
    roll_no: 4,
    role: 'Sekretaris II',
    bio: 'Pengatur jadwal piket dan pengingat deadline tugas produktif sebelum jam 23:59.',
    tags: ['Frontend', 'Motion', 'Tailwind'],
    tone: 4,
    drop: 14,
  },
  {
    roll_no: 5,
    role: 'Bendahara I',
    bio: 'Penjaga transparansi kas kelas sampai rupiah terakhir. Anti selisih di spreadsheet.',
    tags: ['Data', 'PostgreSQL', 'FinTech'],
    tone: 5,
    drop: 22,
  },
  {
    roll_no: 6,
    role: 'Bendahara II',
    bio: 'Partner audit kas bulanan dan kolektor dana konsumsi saat praktikum panjang.',
    tags: ['Fullstack', 'Supabase', 'TypeScript'],
    tone: 1,
    drop: 6,
  },
  {
    roll_no: 7,
    role: 'Koordinator Lab',
    bio: 'Memastikan proyektor, kabel LAN, dan PC lab selalu siap sebelum bel masuk berbunyi.',
    tags: ['IoT', 'Networking', 'Linux'],
    tone: 2,
    drop: 16,
  },
  {
    roll_no: 8,
    role: 'Koordinator Kreatif',
    bio: 'Pengarah visual galeri kelas, dokumentasi kegiatan, dan desain merchandise angkatan.',
    tags: ['Creative Dev', 'WebGL', 'Shader'],
    tone: 3,
    drop: 10,
  },
  {
    roll_no: 9,
    role: 'Anggota',
    bio: 'Spesialis optimasi query database dan arsitektur REST API untuk aplikasi sekolah.',
    tags: ['Backend', 'Go', 'Docker'],
    tone: 4,
    drop: 12,
  },
  {
    roll_no: 10,
    role: 'Anggota',
    bio: 'Pecinta pixel art dan perancang level untuk projek gim platformer 2D kelas.',
    tags: ['Game Dev', 'Godot', 'Pixel Art'],
    tone: 5,
    drop: 20,
  },
  {
    roll_no: 11,
    role: 'Anggota',
    bio: 'Eksplorator animasi antarmuka dan micro-interaction yang bikin web terasa hidup.',
    tags: ['Frontend', 'GSAP', 'React'],
    tone: 1,
    drop: 5,
  },
  {
    roll_no: 12,
    role: 'Anggota',
    bio: 'Fokus di pengembangan aplikasi mobile lintas platform dan integrasi sensor.',
    tags: ['Mobile Dev', 'Flutter', 'Kotlin'],
    tone: 2,
    drop: 15,
  },
  {
    roll_no: 13,
    role: 'Anggota',
    bio: 'Suka mengulik keamanan aplikasi web, CTF, dan audit autentikasi sebelum rilis.',
    tags: ['Security', 'Pentest', 'Auth'],
    tone: 3,
    drop: 9,
  },
  {
    roll_no: 14,
    role: 'Anggota',
    bio: 'Perancang karakter 3D low-poly dan environment artist untuk pameran karya PPLG.',
    tags: ['3D Art', 'Blender', 'Shader'],
    tone: 4,
    drop: 19,
  },
  {
    roll_no: 15,
    role: 'Anggota',
    bio: 'Pengembang bot otomasi pengingat jadwal dan integrasi webhook kelas.',
    tags: ['Backend', 'Node.js', 'API'],
    tone: 5,
    drop: 7,
  },
  {
    roll_no: 16,
    role: 'Anggota',
    bio: 'Peneliti aksesibilitas web dan performa Lighthouse agar aplikasi nyaman di semua perangkat.',
    tags: ['Frontend', 'A11y', 'Testing'],
    tone: 1,
    drop: 17,
  },
  {
    roll_no: 17,
    role: 'Anggota',
    bio: 'Peracik audio sintetis dan sound effect prosedural untuk projek gim kelas.',
    tags: ['Game Dev', 'WebAudio', 'SFX'],
    tone: 2,
    drop: 11,
  },
  {
    roll_no: 18,
    role: 'Anggota',
    bio: 'Antusias machine learning terapan dan eksperimen computer vision di browser.',
    tags: ['AI', 'Python', 'WebGPU'],
    tone: 3,
    drop: 21,
  },
  {
    roll_no: 19,
    role: 'Anggota',
    bio: 'Desainer sistem komponen glassmorphism dan kurator tipografi projek kelas.',
    tags: ['UI/UX', 'Design System', 'CSS'],
    tone: 4,
    drop: 6,
  },
  {
    roll_no: 20,
    role: 'Anggota',
    bio: 'Penyusun algoritma fisika dan sistem partikel di engine gim berbasis web.',
    tags: ['Game Dev', 'Three.js', 'Math'],
    tone: 5,
    drop: 14,
  },
  {
    roll_no: 21,
    role: 'Anggota',
    bio: 'Pengelola repositori Git kelas, tukang beresin merge conflict menjelang presentasi.',
    tags: ['DevOps', 'CI/CD', 'Fullstack'],
    tone: 1,
    drop: 8,
  },
  {
    roll_no: 22,
    role: 'Anggota',
    bio: 'Eksplorator desain generatif, tata letak taman digital, dan visualisasi data interaktif.',
    tags: ['Creative Dev', 'Botanical AI', 'UI/UX'],
    tone: 2,
    drop: 16,
  },
];

export const INITIAL_STUDENTS: StudentRecord[] = STUDENT_SPECS.map((s) => {
  const padded = String(s.roll_no).padStart(2, '0');
  const name = `Siswa ${padded}`;
  return {
    id: `siswa-${padded}`,
    roll_no: s.roll_no,
    name,
    role: s.role,
    avatar_url: generatePastelAvatarDataUri(s.roll_no, name, s.tone),
    bio: s.bio,
    tags: s.tags,
    links: [
      { label: 'GitHub', href: `https://github.com/xii-pplg-1/siswa-${padded}` },
      { label: `siswa${padded}@xiipplg1.sch.id`, href: `mailto:siswa${padded}@xiipplg1.sch.id` },
    ],
    tone: s.tone,
    drop: s.drop,
    is_published: true,
  };
});

export const INITIAL_SCHEDULES: ScheduleSlot[] = [
  // Senin (1)
  { id: 'mon-1', weekday: 1, start_time: '07:00', end_time: '09:15', subject: 'Pemrograman Web & Perangkat Bergerak', teacher: 'Bpk. Hendra Wijaya', room: 'Lab RPL 1' },
  { id: 'mon-2', weekday: 1, start_time: '09:30', end_time: '11:45', subject: 'Basis Data Terapan (PostgreSQL)', teacher: 'Ibu Ratna Sari', room: 'Lab RPL 2' },
  { id: 'mon-3', weekday: 1, start_time: '12:30', end_time: '15:00', subject: 'Bahasa Inggris Teknis', teacher: 'Ms. Nadia Putri', room: 'R. Teori 12' },
  // Selasa (2)
  { id: 'tue-1', weekday: 2, start_time: '07:00', end_time: '10:15', subject: 'Pengembangan Gim Interaktif (3D & WebGL)', teacher: 'Bpk. Arif Rahman', room: 'Lab Gim & Multimedia' },
  { id: 'tue-2', weekday: 2, start_time: '10:30', end_time: '12:00', subject: 'Matematika Diskrit & Logika', teacher: 'Bpk. Dedi Kurniawan', room: 'R. Teori 12' },
  { id: 'tue-3', weekday: 2, start_time: '12:45', end_time: '15:15', subject: 'Produk Kreatif & Kewirausahaan', teacher: 'Ibu Sinta Dewi', room: 'Workshop PPLG' },
  // Rabu (3)
  { id: 'wed-1', weekday: 3, start_time: '07:00', end_time: '09:30', subject: 'Arsitektur Cloud & DevOps Dasar', teacher: 'Bpk. Hendra Wijaya', room: 'Lab Server' },
  { id: 'wed-2', weekday: 3, start_time: '09:45', end_time: '12:00', subject: 'Desain Antarmuka & Sistem Komponen', teacher: 'Ibu Maya Lestari', room: 'Lab RPL 1' },
  { id: 'wed-3', weekday: 3, start_time: '12:45', end_time: '15:00', subject: 'Bahasa Indonesia & Dokumentasi Sistem', teacher: 'Bpk. Bambang S.', room: 'R. Teori 12' },
  // Kamis (4)
  { id: 'thu-1', weekday: 4, start_time: '07:00', end_time: '10:15', subject: 'Praktikum Fullstack Next.js & Supabase', teacher: 'Bpk. Hendra Wijaya', room: 'Lab RPL 1' },
  { id: 'thu-2', weekday: 4, start_time: '10:30', end_time: '12:00', subject: 'Keamanan Aplikasi & Audit RLS', teacher: 'Bpk. Arif Rahman', room: 'Lab Server' },
  { id: 'thu-3', weekday: 4, start_time: '12:45', end_time: '15:15', subject: 'Studio Projek Akhir (Capstone)', teacher: 'Tim Produktif PPLG', room: 'Lab Kolaborasi' },
  // Jumat (5)
  { id: 'fri-1', weekday: 5, start_time: '07:00', end_time: '09:00', subject: 'Review Kode & Demo Mingguan', teacher: 'Bpk. Hendra Wijaya', room: 'Lab RPL 1' },
  { id: 'fri-2', weekday: 5, start_time: '09:15', end_time: '11:15', subject: 'Olahraga & Kebugaran', teacher: 'Bpk. Рико Pratama', room: 'Lapangan Utama' },
  // Sabtu (6)
  { id: 'sat-1', weekday: 6, start_time: '08:00', end_time: '11:30', subject: 'Ekstrakurikuler Game Jam & Taman Kampus', teacher: 'Komunitas PPLG', room: 'Taman Tengah & Lab' },
];

export const INITIAL_PIKET: PiketDay[] = [
  { weekday: 1, dayName: 'Senin', studentRollNos: [1, 2, 3, 4] },
  { weekday: 2, dayName: 'Selasa', studentRollNos: [5, 6, 7, 8] },
  { weekday: 3, dayName: 'Rabu', studentRollNos: [9, 10, 11, 12] },
  { weekday: 4, dayName: 'Kamis', studentRollNos: [13, 14, 15, 16] },
  { weekday: 5, dayName: 'Jumat', studentRollNos: [17, 18, 19] },
  { weekday: 6, dayName: 'Sabtu', studentRollNos: [20, 21, 22] },
];

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-01',
    title: 'Freeze Repo Projek Pameran Akhir Tahun Hari Jumat Pukul 16:00 WIB',
    body: 'Pastikan seluruh branch fitur sudah di-merge ke main dan lolos `npm run build` tanpa error TypeScript. Jangan lupa cek variabel `.env.example` sebelum sesi demo dengan penguji industri.',
    category: 'Praktikum',
    is_pinned: true,
    published_at: '2026-11-12T08:30:00+07:00',
    reactions: { '🚀': 14, '🔥': 9, '👍': 18 },
  },
  {
    id: 'ann-02',
    title: 'Rancang Tata Letak Taman Kelas & Sudut Hijau Lab PPLG',
    body: 'Kelas kita dapat giliran mendesain area hijau di depan Lab RPL 1. Gunakan fitur Studio Desain Taman Impian di bawah buat nyusun layout tanaman, jalur batu, dan render visualnya sebelum dikumpulkan ke wali kelas.',
    category: 'Event',
    is_pinned: true,
    published_at: '2026-11-11T13:15:00+07:00',
    reactions: { '🌿': 16, '✨': 11, '👍': 12 },
  },
  {
    id: 'ann-03',
    title: 'Rekap Kas Bulan November Sudah Diunggah Bendahara',
    body: 'Iuran kas mingguan Rp10.000 berjalan lancar. Dana keluar minggu ini dipakai untuk perpanjangan domain kelas, kabel HDMI cadangan lab, dan bibit tanaman sudut teras.',
    category: 'Kas',
    is_pinned: false,
    published_at: '2026-11-09T10:00:00+07:00',
    reactions: { '💎': 8, '👍': 15 },
  },
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-01',
    title: 'Pameran Karya & Uji Kompetensi Keahlian (UKK) PPLG',
    description: 'Presentasi langsung aplikasi fullstack, gim 3D interaktif, dan tata ruang hijau digital di hadapan penguji eksternal serta adik kelas.',
    location: 'Aula Utama & Lab RPL 1',
    starts_at: '2026-11-28T08:00:00+07:00',
    ends_at: '2026-11-28T15:30:00+07:00',
  },
  {
    id: 'evt-02',
    title: 'Sesi Foto Buku Tahunan & Penataan Taman Teras Lab',
    description: 'Dresscode jaket angkatan XII PPLG 1. Bawa properti lanyard kelas dan alat berkebun ringan.',
    location: 'Taman Tengah SMK & Studio Mini',
    starts_at: '2026-12-05T07:30:00+07:00',
    ends_at: '2026-12-05T13:00:00+07:00',
  },
  {
    id: 'evt-03',
    title: 'Internal Game Jam 24 Jam: Tema "Botanical Cyber"',
    description: 'Eksperimen bikin mini-game WebGL atau simulasi ekosistem tanaman dalam waktu 24 jam bersama tim lintas meja.',
    location: 'Discord Kelas & Lab Gim',
    starts_at: '2026-12-14T09:00:00+07:00',
    ends_at: '2026-12-15T09:00:00+07:00',
  },
];

export const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-01',
    subject: 'Praktikum Fullstack Next.js & Supabase',
    title: 'Implementasi Row Level Security (RLS) & Server Actions',
    description: 'Kumpulkan skema SQL beserta bukti pengujian policy anon vs admin pada repositori masing-masing.',
    deadline: '2026-11-16T23:59:00+07:00',
    link: 'https://github.com/xii-pplg-1/modul-rls-supabase',
  },
  {
    id: 'asg-02',
    subject: 'Pengembangan Gim Interaktif (3D & WebGL)',
    title: 'Optimasi InstancedMesh & Prosedural Geometri 60fps',
    description: 'Buat objek 3D multi-part tanpa aset GLB eksternal dan pastikan disposal memori bersih saat komponen unmount.',
    deadline: '2026-11-19T17:00:00+07:00',
    link: 'https://github.com/xii-pplg-1/webgl-instanced-lab',
  },
  {
    id: 'asg-03',
    subject: 'Desain Antarmuka & Sistem Komponen',
    title: 'Eksplorasi Denah & Visual Taman Impian Kelas',
    description: 'Gunakan AI Botanical Studio untuk merancang tata letak tanaman yang cocok dengan pencahayaan teras Lab RPL.',
    deadline: '2026-11-23T21:00:00+07:00',
    link: '#taman-impian',
  },
];

export const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'res-01',
    title: 'Panduan Arsitektur Next.js App Router & Server Actions',
    category: 'Modul',
    url: 'https://nextjs.org/docs',
    file_type: 'Dokumentasi',
  },
  {
    id: 'res-02',
    title: 'Cheatsheet PostgreSQL RLS & Supabase Auth SSR',
    category: 'Modul',
    url: 'https://supabase.com/docs/guides/auth/server-side',
    file_type: 'SQL & Panduan',
  },
  {
    id: 'res-03',
    title: 'Design System Pastel Glassmorphism XII PPLG 1',
    category: 'Design',
    url: 'https://github.com/xii-pplg-1/design-tokens',
    file_type: 'Token CSS',
  },
  {
    id: 'res-04',
    title: 'Starter Kit Three.js Procedural Geometry & Instancing',
    category: 'Repo',
    url: 'https://threejs.org/docs/',
    file_type: 'TypeScript',
  },
  {
    id: 'res-05',
    title: 'Katalog Tanaman Tropis Tahan Teduh untuk Teras Lab',
    category: 'Tools',
    url: '#taman-impian',
    file_type: 'Botanical Preset',
  },
  {
    id: 'res-06',
    title: 'Template Pengujian Unit Node:Test untuk Logika Bisnis',
    category: 'Repo',
    url: 'https://nodejs.org/api/test.html',
    file_type: 'Test Suite',
  },
];

export const INITIAL_GALLERY: GalleryPhoto[] = [
  {
    id: 'gal-01',
    albumTitle: 'Hackathon Internal Semester Ganjil',
    caption: 'Sesi debugging bareng jam 8 malam ditemani kopi susu dan monitor dual-screen di Lab RPL 1.',
    taken_on: '2026-09-14',
    tint: 'tint-lilac',
    accent: '#6E78E8',
    aspect: '16:10',
    codeSnippet: 'git commit -m "feat: ship realtime sync before deadline"',
  },
  {
    id: 'gal-02',
    albumTitle: 'Eksperimen Taman & Sudut Hijau Lab',
    caption: 'Penataan pot Monstera, pakis Boston, dan jalur batu koral di teras samping ruang praktikum.',
    taken_on: '2026-10-02',
    tint: 'tint-sage',
    accent: '#3FB8A5',
    aspect: '4:3',
    codeSnippet: 'garden.layout({ style: "Tropical Zen", canopy: 4 })',
  },
  {
    id: 'gal-03',
    albumTitle: 'Playtesting Prototipe Gim 3D Kelas',
    caption: '22 siswa bergantian menguji kontrol gamepad dan frame-rate shader air di PC laboratorium.',
    taken_on: '2026-10-19',
    tint: 'tint-peach',
    accent: '#F0A04B',
    aspect: '16:10',
    codeSnippet: 'renderer.toneMapping = THREE.ACESFilmicToneMapping;',
  },
  {
    id: 'gal-04',
    albumTitle: 'Kunjungan Industri & Tech Talk Alumni',
    caption: 'Diskusi santai bareng kakak tingkat PPLG tentang karier software engineer dan game artist.',
    taken_on: '2026-10-28',
    tint: 'tint-orchid',
    accent: '#E0709A',
    aspect: '4:3',
    codeSnippet: 'SELECT * FROM alumni_insights WHERE batch = 2026;',
  },
  {
    id: 'gal-05',
    albumTitle: 'Persiapan UKK & Review Design System',
    caption: 'Menyelaraskan komponen kartu kaca pastel dan audit kontras aksesibilitas WCAG AA.',
    taken_on: '2026-11-05',
    tint: 'tint-sky',
    accent: '#4FA3E0',
    aspect: '16:10',
    codeSnippet: '--glass-shadow: 0 24px 60px -24px rgba(60,70,140,.28);',
  },
  {
    id: 'gal-06',
    albumTitle: 'Jumat Bersih & Piket Kolaboratif',
    caption: 'Merapikan manajemen kabel meja server sekaligus menyiram tanaman teras kelas.',
    taken_on: '2026-11-08',
    tint: 'tint-aqua',
    accent: '#3FB8A5',
    aspect: '4:3',
    codeSnippet: 'piket.verify({ cables: "tidy", plants: "watered" });',
  },
];

export const INITIAL_KAS: KasTransaction[] = [
  { id: 'kas-01', occurred_on: '2026-07-15', type: 'masuk', amount: 880000, note: 'Iuran kas awal semester (22 siswa)' },
  { id: 'kas-02', occurred_on: '2026-07-24', type: 'keluar', amount: 165000, note: 'Pembelian alat kebersihan lab & spidol whiteboard' },
  { id: 'kas-03', occurred_on: '2026-08-10', type: 'masuk', amount: 660000, note: 'Iuran kas bulan Agustus' },
  { id: 'kas-04', occurred_on: '2026-08-21', type: 'keluar', amount: 210000, note: 'Dekorasi lomba 17 Agustus & kabel ekstensi lab' },
  { id: 'kas-05', occurred_on: '2026-09-08', type: 'masuk', amount: 880000, note: 'Iuran kas bulan September' },
  { id: 'kas-06', occurred_on: '2026-09-25', type: 'keluar', amount: 240000, note: 'Konsumsi sesi coding bersama & stiker kelas' },
  { id: 'kas-07', occurred_on: '2026-10-09', type: 'masuk', amount: 880000, note: 'Iuran kas bulan Oktober' },
  { id: 'kas-08', occurred_on: '2026-10-27', type: 'keluar', amount: 310000, note: 'Bibit tanaman teras lab, pot terakota & media tanam' },
  { id: 'kas-09', occurred_on: '2026-11-05', type: 'masuk', amount: 880000, note: 'Iuran kas bulan November' },
  { id: 'kas-10', occurred_on: '2026-11-10', type: 'keluar', amount: 185000, note: 'Perpanjangan domain kelas & adaptor HDMI cadangan' },
];

export const INITIAL_GUESTBOOK: GuestbookEntry[] = [
  {
    id: 'gb-01',
    sender_name: 'Siswa 01 (Ketua)',
    message: 'Selamat datang di rumah digital XII PPLG 1! Jangan lupa cek jadwal piket dan deadline tugas minggu ini ya teman-teman.',
    status: 'approved',
    created_at: '2026-11-10T09:00:00+07:00',
  },
  {
    id: 'gb-02',
    sender_name: 'Bpk. Hendra Wijaya',
    message: 'Bangga melihat inisiatif kelas membangun portal informasi sekaligus studio visual sendiri. Pertahankan semangat kolaborasinya sampai lulus!',
    status: 'approved',
    created_at: '2026-11-11T11:20:00+07:00',
  },
  {
    id: 'gb-03',
    sender_name: 'Siswa 08 (Kreatif)',
    message: 'Coba tekan tombol di keyboard fisik kalian waktu lihat Hero 3D di atas, keycap-nya ikut membal! Desain taman teras juga sudah bisa dicoba.',
    status: 'approved',
    created_at: '2026-11-12T15:40:00+07:00',
  },
];
