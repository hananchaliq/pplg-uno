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

export const DREAM_PAPER_PALETTE = [
  { name: 'Sage', hex: '#DDEBD6' },
  { name: 'Sky', hex: '#D3E6F3' },
  { name: 'Lilac', hex: '#DDD6F2' },
  { name: 'Orchid', hex: '#E6DAF0' },
  { name: 'Peach', hex: '#F9E3CB' },
  { name: 'Aqua', hex: '#CFEBE2' },
] as const;

export const PIN_CHART_COLORS = [
  '#6E78E8', // --chart-1 (iris)
  '#3FB8A5', // --chart-2 (mint)
  '#F0A04B', // --chart-3 (amber)
  '#E0709A', // --chart-4 (rose)
  '#4FA3E0', // --chart-5 (sky)
] as const;

export interface StudentRecord {
  id: string;
  roll_no: number;
  nis?: string;
  name: string;
  role: string;
  avatar_url: string;
  bio: string;
  tags: string[];
  links: { label: string; href: string }[];
  tone: 1 | 2 | 3 | 4 | 5;
  drop?: number;
  dream_title: string;
  dream_reason: string;
  dream_description: string;
  dream_paper_color?: string;
  capsule_message?: string;
  is_published: boolean;
}

export interface FarewellLetter {
  id: string;
  author_name: string;
  author_role: string;
  title: string;
  body: string;
  memory_highlight: string;
  created_at: string;
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
  tagline: 'Merakit baris kode, gim interaktif, dan masa depan impian dari bangku SMK.',
  description:
    'Rumah digital resmi kelas XII Pengembangan Perangkat Lunak dan Gim 1. Tempat kumpul 22 siswa: dari jadwal praktikum lab, papan tulis cita-cita 3D, antrean deadline, laporan kas transparan, sampai buku tamu.',
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
  dream_title: string;
  dream_reason: string;
  dream_description: string;
  dream_paper_color: string;
}> = [
  {
    roll_no: 1,
    role: 'Ketua Kelas',
    bio: 'Koordinator utama kelas dan arsitek sistem backend. Kalau server lab down, orang pertama yang dicari.',
    tags: ['Backend', 'DevOps', 'Next.js'],
    tone: 1,
    drop: 8,
    dream_title: 'Cloud & Distributed Architect',
    dream_reason: 'Sering lihat layanan sekolah tumbang waktu trafik ujian naik, jadi tertantang bikin infrastruktur yang tahan banting.',
    dream_description: 'Mendalami Kubernetes, Go, dan arsitektur multi-region sambil membangun platform cloud mandiri untuk laboratorium SMK.',
    dream_paper_color: '#D3E6F3',
  },
  {
    roll_no: 2,
    role: 'Wakil Ketua',
    bio: 'Menjaga ritme kelas tetap kondusif dan hobi bikin prototipe mekanik gim 3D di waktu luang.',
    tags: ['Game Dev', 'Three.js', 'C#'],
    tone: 2,
    drop: 18,
    dream_title: 'Lead Gameplay & Physics Dev',
    dream_reason: 'Dari kecil penasaran gimana mekanik ayunan, suspensi, dan tabrakan di gim 3D bisa terasa sangat hidup.',
    dream_description: 'Merilis gim indie 3D bersama teman sekelas di Steam serta mendalami C++ dan simulasi fisika waktu nyata.',
    dream_paper_color: '#DDEBD6',
  },
  {
    roll_no: 3,
    role: 'Sekretaris I',
    bio: 'Dokumentasi rapi dari presensi harian sampai notulensi rapat projek pameran akhir tahun.',
    tags: ['UI/UX', 'Figma', 'Docs'],
    tone: 3,
    drop: 4,
    dream_title: 'Staff Product Designer',
    dream_reason: 'Banyak aplikasi canggih yang gagal membantu pengguna hanya karena alur antarmukanya membingungkan.',
    dream_description: 'Membangun sistem desain yang inklusif, ramah aksesibilitas, dan punya dokumentasi produk yang jernih.',
    dream_paper_color: '#DDD6F2',
  },
  {
    roll_no: 4,
    role: 'Sekretaris II',
    bio: 'Pengatur jadwal piket dan pengingat deadline tugas produktif sebelum jam 23:59.',
    tags: ['Frontend', 'Motion', 'Tailwind'],
    tone: 4,
    drop: 14,
    dream_title: 'Creative Design Engineer',
    dream_reason: 'Suka banget sama perpaduan antara kode presisi dan animasi mikro yang bikin pengguna betah berinteraksi.',
    dream_description: 'Menguasai WebGL, fisika pegas interaktif, dan berkontribusi ke pustaka komponen UI open-source global.',
    dream_paper_color: '#E6DAF0',
  },
  {
    roll_no: 5,
    role: 'Bendahara I',
    bio: 'Penjaga transparansi kas kelas sampai rupiah terakhir. Anti selisih di spreadsheet.',
    tags: ['Data', 'PostgreSQL', 'FinTech'],
    tone: 5,
    drop: 22,
    dream_title: 'FinTech Data Engineer',
    dream_reason: 'Ngurus kas kelas bikin sadar betapa pentingnya pencatatan keuangan yang akurat, cepat, dan transparan.',
    dream_description: 'Merancang sistem buku besar (ledger) terdistribusi yang aman dari duplikasi transaksi dan mudah diaudit.',
    dream_paper_color: '#F9E3CB',
  },
  {
    roll_no: 6,
    role: 'Bendahara II',
    bio: 'Partner audit kas bulanan dan kolektor dana konsumsi saat praktikum panjang.',
    tags: ['Fullstack', 'Supabase', 'TypeScript'],
    tone: 1,
    drop: 6,
    dream_title: 'Fullstack SaaS Founder',
    dream_reason: 'Ingin membantu UMKM di sekitar kota supaya punya sistem kasir dan inventaris yang semudah aplikasi pesan instan.',
    dream_description: 'Membangun produk SaaS mandiri selepas lulus SMK dengan stack Next.js, PostgreSQL, dan analitik waktu nyata.',
    dream_paper_color: '#CFEBE2',
  },
  {
    roll_no: 7,
    role: 'Koordinator Lab',
    bio: 'Memastikan proyektor, kabel LAN, dan PC lab selalu siap sebelum bel masuk berbunyi.',
    tags: ['IoT', 'Networking', 'Linux'],
    tone: 2,
    drop: 16,
    dream_title: 'Embedded & IoT Engineer',
    dream_reason: 'Paling senang kalau baris kode yang ditulis bisa langsung menggerakkan perangkat keras nyata di dunia fisik.',
    dream_description: 'Mengembangkan sensor pintar hemat daya berbasis Rust dan ESP32 untuk otomasi ruang laboratorium.',
    dream_paper_color: '#DDEBD6',
  },
  {
    roll_no: 8,
    role: 'Koordinator Kreatif',
    bio: 'Pengarah visual galeri kelas, dokumentasi kegiatan, dan desain merchandise angkatan.',
    tags: ['Creative Dev', 'WebGL', 'Shader'],
    tone: 3,
    drop: 10,
    dream_title: 'Technical Artist & Shader Dev',
    dream_reason: 'Kagum sama cara rumus matematika dan trigonometri bisa berubah jadi efek cahaya, air, dan kaca di layar.',
    dream_description: 'Berkarier di studio gim atau agensi digital sebagai jembatan kreatif antara 3D artist dan engine programmer.',
    dream_paper_color: '#D3E6F3',
  },
  {
    roll_no: 9,
    role: 'Anggota',
    bio: 'Spesialis optimasi query database dan arsitektur REST API untuk aplikasi sekolah.',
    tags: ['Backend', 'Go', 'Docker'],
    tone: 4,
    drop: 12,
    dream_title: 'Database Internals Engineer',
    dream_reason: 'Merasa puas luar biasa setiap kali berhasil memangkas waktu eksekusi query dari 2 detik menjadi 8 milidetik.',
    dream_description: 'Mempelajari struktur penyimpanan B-Tree, indexing lanjutan, dan merancang API berkecepatan tinggi.',
    dream_paper_color: '#DDD6F2',
  },
  {
    roll_no: 10,
    role: 'Anggota',
    bio: 'Pecinta pixel art dan perancang level untuk projek gim platformer 2D kelas.',
    tags: ['Game Dev', 'Godot', 'Pixel Art'],
    tone: 5,
    drop: 20,
    dream_title: 'Indie Game Director',
    dream_reason: 'Ingin menyampaikan cerita petualangan khas Nusantara lewat desain level gim yang menantang tapi adil.',
    dream_description: 'Menyelesaikan gim platformer pixel-art di Godot Engine dan membawanya ke pameran gim Asia Tenggara.',
    dream_paper_color: '#F9E3CB',
  },
  {
    roll_no: 11,
    role: 'Anggota',
    bio: 'Eksplorator animasi antarmuka dan micro-interaction yang bikin web terasa hidup.',
    tags: ['Frontend', 'GSAP', 'React'],
    tone: 1,
    drop: 5,
    dream_title: 'Interactive WebGL Architect',
    dream_reason: 'Website yang berkesan itu seperti ruang pameran interaktif, bukan sekadar halaman teks kaku yang digulir.',
    dream_description: 'Menciptakan pengalaman web 3D pemenang penghargaan yang tetap ringan dijalankan di perangkat standar.',
    dream_paper_color: '#E6DAF0',
  },
  {
    roll_no: 12,
    role: 'Anggota',
    bio: 'Fokus di pengembangan aplikasi mobile lintas platform dan integrasi sensor.',
    tags: ['Mobile Dev', 'Flutter', 'Kotlin'],
    tone: 2,
    drop: 15,
    dream_title: 'Lead Mobile Platform Engineer',
    dream_reason: 'Hampir semua orang mengakses layanan digital dari ponsel, jadi aplikasi mobile harus gesit dan hemat baterai.',
    dream_description: 'Mendalami Kotlin & Flutter serta membangun aplikasi edukasi offline-first untuk sekolah di daerah pelosok.',
    dream_paper_color: '#CFEBE2',
  },
  {
    roll_no: 13,
    role: 'Anggota',
    bio: 'Suka mengulik keamanan aplikasi web, CTF, dan audit autentikasi sebelum rilis.',
    tags: ['Security', 'Pentest', 'Auth'],
    tone: 3,
    drop: 9,
    dream_title: 'Cyber Security Analyst',
    dream_reason: 'Sering ikut kompetisi Capture The Flag (CTF) dan sadar banyak sistem publik yang masih punya celah keamanan dasar.',
    dream_description: 'Menjadi peneliti keamanan aplikasi (AppSec) dan bug hunter yang melindungi privasi data jutaan pengguna.',
    dream_paper_color: '#DDEBD6',
  },
  {
    roll_no: 14,
    role: 'Anggota',
    bio: 'Perancang karakter 3D low-poly dan environment artist untuk pameran karya PPLG.',
    tags: ['3D Art', 'Blender', 'Shader'],
    tone: 4,
    drop: 19,
    dream_title: '3D Environment Artist',
    dream_reason: 'Dari hobi bikin sketsa gedung di buku tulis, sekarang ketagihan menghidupkan dunia 3D utuh di Blender.',
    dream_description: 'Merancang aset lingkungan 3D bergaya stylized yang dioptimalkan untuk gim konsol dan ruang WebXR.',
    dream_paper_color: '#D3E6F3',
  },
  {
    roll_no: 15,
    role: 'Anggota',
    bio: 'Pengembang bot otomasi pengingat jadwal dan integrasi webhook kelas.',
    tags: ['Backend', 'Node.js', 'API'],
    tone: 5,
    drop: 7,
    dream_title: 'Platform Automation Engineer',
    dream_reason: 'Enggan melakukan pekerjaan repetitif dua kali kalau bisa diotomasi dengan skrip dalam waktu lima menit.',
    dream_description: 'Membangun ekosistem bot dan pipeline integrasi API yang menghemat ribuan jam kerja tim rekayasa.',
    dream_paper_color: '#DDD6F2',
  },
  {
    roll_no: 16,
    role: 'Anggota',
    bio: 'Peneliti aksesibilitas web dan performa Lighthouse agar aplikasi nyaman di semua perangkat.',
    tags: ['Frontend', 'A11y', 'Testing'],
    tone: 1,
    drop: 17,
    dream_title: 'Web Performance & A11y Lead',
    dream_reason: 'Teknologi yang baik harus bisa diakses siapa saja, termasuk pengguna pembaca layar dan jaringan lambat.',
    dream_description: 'Menjadi spesialis optimasi Core Web Vitals dan standar aksesibilitas WCAG di ekosistem web modern.',
    dream_paper_color: '#E6DAF0',
  },
  {
    roll_no: 17,
    role: 'Anggota',
    bio: 'Peracik audio sintetis dan sound effect prosedural untuk projek gim kelas.',
    tags: ['Game Dev', 'WebAudio', 'SFX'],
    tone: 2,
    drop: 11,
    dream_title: 'Interactive Audio Programmer',
    dream_reason: 'Suara langkah kaki, denting tombol, dan musik adaptif yang pas bikin dunia gim terasa sepuluh kali lebih hidup.',
    dream_description: 'Mengembangkan engine audio prosedural berbasis WebAudio dan C++ yang merespons aksi pemain secara dinamis.',
    dream_paper_color: '#F9E3CB',
  },
  {
    roll_no: 18,
    role: 'Anggota',
    bio: 'Antusias machine learning terapan dan eksperimen computer vision di browser.',
    tags: ['AI', 'Python', 'WebGPU'],
    tone: 3,
    drop: 21,
    dream_title: 'Applied AI & Edge Engineer',
    dream_reason: 'Terpukau melihat model visi komputer bisa berjalan langsung di peramban tanpa harus mengirim data ke server.',
    dream_description: 'Riset optimasi model AI ringan berbasis WebGPU untuk alat bantu belajar interaktif dan asisten kode lokal.',
    dream_paper_color: '#CFEBE2',
  },
  {
    roll_no: 19,
    role: 'Anggota',
    bio: 'Desainer sistem komponen glassmorphism dan kurator tipografi projek kelas.',
    tags: ['UI/UX', 'Design System', 'CSS'],
    tone: 4,
    drop: 6,
    dream_title: 'Design Systems Architect',
    dream_reason: 'Kekacauan warna dan spasi waktu kerja kelompok bikin aku jatuh cinta pada keteraturan design token.',
    dream_description: 'Memimpin tim Design System yang menyatukan bahasa visual antara desainer Figma dan engineer produksi.',
    dream_paper_color: '#DDEBD6',
  },
  {
    roll_no: 20,
    role: 'Anggota',
    bio: 'Penyusun algoritma fisika dan sistem partikel di engine gim berbasis web.',
    tags: ['Game Dev', 'Three.js', 'Math'],
    tone: 5,
    drop: 14,
    dream_title: 'Graphics & Simulation Engineer',
    dream_reason: 'Rumus fisika dan aljabar linear di kelas jadi jauh lebih seru waktu langsung dipraktekkan ke simulasi partikel 3D.',
    dream_description: 'Merancang engine simulasi visual real-time untuk laboratorium sains virtual dan gim sandbox.',
    dream_paper_color: '#D3E6F3',
  },
  {
    roll_no: 21,
    role: 'Anggota',
    bio: 'Pengelola repositori Git kelas, tukang beresin merge conflict menjelang presentasi.',
    tags: ['DevOps', 'CI/CD', 'Fullstack'],
    tone: 1,
    drop: 8,
    dream_title: 'Site Reliability & DevSecOps',
    dream_reason: 'Senang luar biasa saat melihat pipeline deployment hijau semua dan rilis berjalan mulus tanpa downtime.',
    dream_description: 'Membangun infrastruktur CI/CD otomatis yang aman dan terukur untuk tim pengembang lintas negara.',
    dream_paper_color: '#DDD6F2',
  },
  {
    roll_no: 22,
    role: 'Anggota',
    bio: 'Eksplorator desain generatif, seni algoritmik, dan visualisasi data interaktif.',
    tags: ['Creative Dev', 'Generative Art', 'UI/UX'],
    tone: 2,
    drop: 16,
    dream_title: 'Creative Technologist',
    dream_reason: 'Ingin menggabungkan logika pemrograman dengan instalasi seni visual interaktif di ruang pameran.',
    dream_description: 'Mendirikan studio kreatif yang memproduksi instalasi 3D interaktif, proyeksi pemetaan, dan museum digital.',
    dream_paper_color: '#F9E3CB',
  },
];

export const INITIAL_STUDENTS: StudentRecord[] = STUDENT_SPECS.map((s) => {
  const padded = String(s.roll_no).padStart(2, '0');
  const name = `Siswa ${padded}`;
  const nis = `202310${padded}`;
  return {
    id: `siswa-${padded}`,
    roll_no: s.roll_no,
    nis,
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
    dream_title: s.dream_title,
    dream_reason: s.dream_reason,
    dream_description: s.dream_description,
    dream_paper_color: s.dream_paper_color,
    capsule_message: `Kapsul Waktu 2026 — Terima kasih teman-teman XII PPLG 1 atas 3 tahun debug kode, praktikum lab, dan tawa bersama. Sampai bertemu lagi sebagai ${s.dream_title}!`,
    is_published: true,
  };
});

export const INITIAL_FAREWELL_LETTERS: FarewellLetter[] = [
  {
    id: 'fw-01',
    author_name: 'Bpk. Hendra Wijaya, S.Kom., M.T.',
    author_role: 'Wali Kelas XII PPLG 1',
    title: 'Teruslah Menulis Baris Kode yang Bermakna',
    body: 'Tiga tahun melihat kalian tumbuh dari baris HTML pertama hingga merakit arsitektur fullstack dan simulasi 3D adalah kebanggaan terbesar Bapak. Jangan pernah takut menghadapi error di dunia nyata — setiap bug adalah pelajaran menuju kematangan.',
    memory_highlight: 'Sesi lembur persiapan UKK & pameran karya di Lab RPL 1',
    created_at: '2026-11-01T08:00:00+07:00',
  },
  {
    id: 'fw-02',
    author_name: 'Siswa 01 & Siswa 02',
    author_role: 'Ketua & Wakil Ketua Kelas',
    title: 'Untuk 22 Engineer Hebat di Ruangan Ini',
    body: 'Terima kasih sudah jadi keluarga kedua yang selalu kompak, mulai dari saling bantu beresin merge conflict lima menit sebelum presentasi sampai patungan kas kelas tanpa drama. Semoga semua mimpi di papan tulis kelas kita terwujud satu per satu!',
    memory_highlight: 'Hackathon internal & rilis website kapsul kelulusan XII PPLG 1',
    created_at: '2026-11-05T14:20:00+07:00',
  },
  {
    id: 'fw-03',
    author_name: 'Siswa 03 & Siswa 04',
    author_role: 'Tim Sekretaris Kelas',
    title: 'Catatan Terakhir di Buku Presensi XII PPLG 1',
    body: 'Sebentar lagi tidak ada lagi teriakan pengingat deadline tugas pukul 23:59 atau giliran menyapu lab setiap sore. Simpan halaman arsip ini baik-baik supaya kapan pun kita rindu masa SMK, kita punya rumah digital untuk pulang.',
    memory_highlight: 'Menempel 22 kertas cita-cita di papan tulis kelas',
    created_at: '2026-11-08T16:45:00+07:00',
  },
  {
    id: 'fw-04',
    author_name: 'Seluruh Anggota XII PPLG 1',
    author_role: 'Class of 2026 · 22 Siswa',
    title: 'Janji Reuni 5 Tahun Lagi',
    body: 'Ke mana pun langkah kita setelah lulus — kuliah, membangun startup, bekerja di studio gim, atau merantau — jangan lupa asal kita dari bangku Lab RPL 1. Sampai jumpa di reuni akbar dengan cerita sukses masing-masing!',
    memory_highlight: 'Foto angkatan berjaket XII PPLG 1 — Class of 2026',
    created_at: '2026-11-12T19:00:00+07:00',
  },
];

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
  { id: 'fri-2', weekday: 5, start_time: '09:15', end_time: '11:15', subject: 'Olahraga & Kebugaran', teacher: 'Bpk. Riko Pratama', room: 'Lapangan Utama' },
  // Sabtu (6)
  { id: 'sat-1', weekday: 6, start_time: '08:00', end_time: '11:30', subject: 'Ekstrakurikuler Game Jam & Open Source', teacher: 'Komunitas PPLG', room: 'Lab Gim & Multimedia' },
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
    title: 'Papan Tulis Cita-Cita 3D Sudah Aktif — Cek & Perbarui Impianmu!',
    body: 'Seluruh 22 kertas catatan cita-cita siswa XII PPLG 1 kini terpampang di Papan Tulis Cita-Cita 3D. Arahkan kursor untuk melihat kertas bergerak hidup dan klik kertas untuk membaca alasan serta rencana karier teman sekelasmu.',
    category: 'Event',
    is_pinned: true,
    published_at: '2026-11-11T13:15:00+07:00',
    reactions: { '✨': 19, '🚀': 15, '👍': 12 },
  },
  {
    id: 'ann-03',
    title: 'Rekap Kas Bulan November Sudah Diunggah Bendahara',
    body: 'Iuran kas mingguan Rp10.000 berjalan lancar. Dana keluar minggu ini dipakai untuk perpanjangan domain kelas, kabel HDMI cadangan lab, dan spidol papan tulis baru.',
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
    description: 'Presentasi langsung aplikasi fullstack, gim 3D interaktif, dan portofolio rekayasa perangkat lunak di hadapan penguji eksternal serta adik kelas.',
    location: 'Aula Utama & Lab RPL 1',
    starts_at: '2026-11-28T08:00:00+07:00',
    ends_at: '2026-11-28T15:30:00+07:00',
  },
  {
    id: 'evt-02',
    title: 'Sesi Foto Buku Tahunan & Tempel Kertas Cita-Cita Angkatan',
    description: 'Dresscode jaket angkatan XII PPLG 1. Bawa properti lanyard kelas dan perangkat kebanggaan masing-masing.',
    location: 'Lab Kolaborasi & Studio Mini SMK',
    starts_at: '2026-12-05T07:30:00+07:00',
    ends_at: '2026-12-05T13:00:00+07:00',
  },
  {
    id: 'evt-03',
    title: 'Internal Game Jam 24 Jam: Tema "Future Engineers"',
    description: 'Eksperimen bikin mini-game WebGL atau simulasi fisika interaktif dalam waktu 24 jam bersama tim lintas meja.',
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
    subject: 'Produk Kreatif & Perencanaan Karier',
    title: 'Rencana Peta Jalan Karier & Dream Note Tahun Terakhir',
    description: 'Pastikan judul cita-cita, alasan memilih, dan deskripsi rencana belajarmu sudah diperbarui di Papan Tulis Cita-Cita 3D.',
    deadline: '2026-11-23T21:00:00+07:00',
    link: '#papan-cita-cita',
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
    title: 'Starter Kit Three.js Procedural Geometry & Vertex Curl',
    category: 'Repo',
    url: 'https://threejs.org/docs/',
    file_type: 'TypeScript',
  },
  {
    id: 'res-05',
    title: 'Peta Jalan Karier Software & Game Engineer Lulusan SMK',
    category: 'Tools',
    url: '#papan-cita-cita',
    file_type: 'Career Guide',
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
    albumTitle: 'Sesi Menempel Kertas Cita-Cita di Papan Kelas',
    caption: 'Momen 22 siswa menuliskan target karier impian mereka selepas lulus dari jurusan PPLG.',
    taken_on: '2026-10-02',
    tint: 'tint-sage',
    accent: '#3FB8A5',
    aspect: '4:3',
    codeSnippet: 'dreamBoard.pin({ student: "Siswa 01..22", state: "zoom" })',
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
    caption: 'Merapikan manajemen kabel meja server sekaligus membersihkan papan tulis laboratorium.',
    taken_on: '2026-11-08',
    tint: 'tint-aqua',
    accent: '#3FB8A5',
    aspect: '4:3',
    codeSnippet: 'piket.verify({ cables: "tidy", board: "clean" });',
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
  { id: 'kas-08', occurred_on: '2026-10-27', type: 'keluar', amount: 310000, note: 'Perlengkapan pameran UKK, kertas catatan & pin papan kelas' },
  { id: 'kas-09', occurred_on: '2026-11-05', type: 'masuk', amount: 880000, note: 'Iuran kas bulan November' },
  { id: 'kas-10', occurred_on: '2026-11-10', type: 'keluar', amount: 185000, note: 'Perpanjangan domain kelas & adaptor HDMI cadangan' },
];

export const INITIAL_GUESTBOOK: GuestbookEntry[] = [
  {
    id: 'gb-01',
    sender_name: 'Siswa 01 (Ketua)',
    message: 'Selamat datang di rumah digital XII PPLG 1! Jangan lupa cek jadwal piket, papan cita-cita 3D, dan deadline tugas minggu ini ya teman-teman.',
    status: 'approved',
    created_at: '2026-11-10T09:00:00+07:00',
  },
  {
    id: 'gb-02',
    sender_name: 'Bpk. Hendra Wijaya',
    message: 'Bangga melihat inisiatif kelas membangun portal informasi sekaligus Papan Tulis Cita-Cita 3D sendiri. Semoga seluruh impian kalian tercapai!',
    status: 'approved',
    created_at: '2026-11-11T11:20:00+07:00',
  },
  {
    id: 'gb-03',
    sender_name: 'Siswa 08 (Kreatif)',
    message: 'Coba arahkan kursor ke kertas di Papan Tulis Cita-Cita 3D dan klik salah satu kertasnya, efek kertas melengkung dan zoom 3D-nya mulus banget!',
    status: 'approved',
    created_at: '2026-11-12T15:40:00+07:00',
  },
];
