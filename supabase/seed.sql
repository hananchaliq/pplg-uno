-- Seed Data untuk Kelas XII PPLG 1 (22 Siswa + Data Kelas)
insert into class_info (id, name, tagline, description, homeroom_teacher, school_year, socials)
values (
  1,
  'XII PPLG 1',
  'Merakit baris kode, gim interaktif, dan kenangan tahun terakhir di bangku SMK.',
  'Rumah digital resmi kelas XII Pengembangan Perangkat Lunak dan Gim 1. Tempat kumpul 22 engineer muda: dari jadwal praktikum lab, antrean deadline, laporan kas transparan, sampai eksperimen visual & taman digital.',
  'Bpk. Hendra Wijaya, S.Kom., M.T.',
  '2026 / 2027',
  '{"instagram": "https://instagram.com/xiipplg1.official", "github": "https://github.com/xii-pplg-1", "discord": "https://discord.gg/xiipplg1"}'::jsonb
) on conflict (id) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  homeroom_teacher = excluded.homeroom_teacher,
  school_year = excluded.school_year;

insert into students (roll_no, name, role, bio, tags, tone, sort_order) values
(1, 'Siswa 01', 'Ketua Kelas', 'Koordinator utama kelas dan arsitek sistem backend. Kalau server lab down, orang pertama yang dicari.', ARRAY['Backend', 'DevOps', 'Next.js'], 1, 1),
(2, 'Siswa 02', 'Wakil Ketua', 'Menjaga ritme kelas tetap kondusif dan hobi bikin prototipe mekanik gim 3D di waktu luang.', ARRAY['Game Dev', 'Three.js', 'C#'], 2, 2),
(3, 'Siswa 03', 'Sekretaris I', 'Dokumentasi rapi dari presensi harian sampai notulensi rapat projek pameran akhir tahun.', ARRAY['UI/UX', 'Technical Writer', 'Figma'], 3, 3),
(4, 'Siswa 04', 'Sekretaris II', 'Pengatur jadwal piket dan pengingat deadline tugas produktif sebelum jam 23:59.', ARRAY['Frontend', 'Motion', 'Tailwind'], 4, 4),
(5, 'Siswa 05', 'Bendahara I', 'Penjaga transparansi kas kelas sampai rupiah terakhir. Anti selisih di spreadsheet.', ARRAY['Data Analytics', 'PostgreSQL', 'FinTech'], 5, 5),
(6, 'Siswa 06', 'Bendahara II', 'Partner audit kas bulanan dan kolektor dana konsumsi saat praktikum panjang.', ARRAY['Fullstack', 'Supabase', 'TypeScript'], 1, 6),
(7, 'Siswa 07', 'Koordinator Lab & Peralatan', 'Memastikan proyektor, kabel LAN, dan PC lab selalu siap sebelum bel masuk berbunyi.', ARRAY['IoT', 'Networking', 'Linux'], 2, 7),
(8, 'Siswa 08', 'Koordinator Kreatif & Media', 'Pengarah visual galeri kelas, dokumentasi kegiatan, dan desain merchandise angkatan.', ARRAY['Creative Dev', 'WebGL', 'Shader'], 3, 8),
(9, 'Siswa 09', 'Anggota', 'Spesialis optimasi query database dan arsitektur REST API untuk aplikasi sekolah.', ARRAY['Backend', 'Go', 'Docker'], 4, 9),
(10, 'Siswa 10', 'Anggota', 'Pecinta pixel art dan perancang level untuk projek gim platformer 2D kelas.', ARRAY['Game Art', 'Godot', 'Pixel Art'], 5, 10),
(11, 'Siswa 11', 'Anggota', 'Eksplorator animasi antarmuka dan micro-interaction yang bikin web terasa hidup.', ARRAY['Frontend', 'GSAP', 'React'], 1, 11),
(12, 'Siswa 12', 'Anggota', 'Fokus di pengembangan aplikasi mobile lintas platform dan integrasi sensor.', ARRAY['Mobile Dev', 'Flutter', 'Kotlin'], 2, 12),
(13, 'Siswa 13', 'Anggota', 'Suka mengulik keamanan aplikasi web, CTF, dan audit autentikasi sebelum rilis.', ARRAY['Cybersecurity', 'Pentest', 'Auth'], 3, 13),
(14, 'Siswa 14', 'Anggota', 'Perancang karakter 3D low-poly dan environment artist untuk pameran karya PPLG.', ARRAY['3D Modeling', 'Blender', 'Shader'], 4, 14),
(15, 'Siswa 15', 'Anggota', 'Pengembang bot otomasi pengingat jadwal dan integrasi webhook kelas.', ARRAY['Automation', 'Node.js', 'API'], 5, 15),
(16, 'Siswa 16', 'Anggota', 'Peneliti aksesibilitas web dan performa Lighthouse agar aplikasi nyaman di semua perangkat.', ARRAY['Web Perf', 'A11y', 'Testing'], 1, 16),
(17, 'Siswa 17', 'Anggota', 'Peracik audio sintetis dan sound effect prosedural untuk projek gim kelas.', ARRAY['Audio Dev', 'WebAudio', 'Game Dev'], 2, 17),
(18, 'Siswa 18', 'Anggota', 'Antusias machine learning terapan dan eksperimen computer vision di browser.', ARRAY['AI Engineering', 'Python', 'WebGPU'], 3, 18),
(19, 'Siswa 19', 'Anggota', 'Desainer sistem komponen glassmorphism dan kurator tipografi projek kelas.', ARRAY['Design System', 'UI/UX', 'CSS'], 4, 19),
(20, 'Siswa 20', 'Anggota', 'Penyusun algoritma fisika dan sistem partikel di engine gim berbasis web.', ARRAY['Physics Sim', 'Three.js', 'Math'], 5, 20),
(21, 'Siswa 21', 'Anggota', 'Pengelola repositori Git kelas, tukang beresin merge conflict menjelang presentasi.', ARRAY['Git Ops', 'CI/CD', 'Fullstack'], 1, 21),
(22, 'Siswa 22', 'Anggota', 'Eksplorator desain generatif, tata letak taman digital, dan visualisasi data interaktif.', ARRAY['Creative Coding', 'Botanical AI', 'Data Viz'], 2, 22)
on conflict (roll_no) do nothing;
