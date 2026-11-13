# Website Kelas XII PPLG 1 & Studio Desain Taman Impian

Rumah digital resmi untuk **22 siswa Kelas XII PPLG 1 (Pengembangan Perangkat Lunak dan Gim)** dengan estetika **Soft Pastel Glassmorphism**, sistem **3D Dev Desk Floating Assembly**, komponen interaktif **TeamLanyardRail**, serta **Studio Desain Taman Impian & Visual AI (`gemini-nano-banana-2.1`)**.

## Urutan Section Utama
1. **Hero Section**: Tagline kelas, chip informasi wali kelas & tahun ajaran, tombol navigasi, widget live **Sekarang di Kelas (WIB)**, dan kanvas 3D interaktif (`DevDeskHeroCanvas`).
2. **Anggota Kelas (`TeamLanyardRail`)**: 22 siswa (`Siswa 01` – `Siswa 22`) terbagi dalam 3 rel lanyard dengan fisika pegas, fitur pencarian, dan filter minat.
3. **Studio Desain Taman Impian**: Perancang tata letak tanaman berdasarkan preferensi gaya, cahaya, media tanam, dan ukuran lahan, dilengkapi pembuatan & penyuntingan visual taman berbasis prompt (`gemini-nano-banana-2.1`).
4. **Tentang Kelas, Jadwal Pelajaran & Piket, Pengumuman, Agenda, Tugas, Resource Hub, Galeri Lightbox, Kas Kelas 3D, dan Buku Tamu Realtime**.

## Panduan Setup Supabase / Database
1. Buka SQL Editor pada dashboard Supabase Anda, lalu jalankan isi file `supabase/schema.sql` untuk membuat seluruh tabel, fungsi `is_admin()`, fungsi RPC `react()`, dan kebijakan Row Level Security (RLS).
2. Jalankan `supabase/seed.sql` untuk mengisi data awal 22 siswa (`Siswa 01`–`Siswa 22`) dan informasi kelas.
3. Buat Storage Bucket publik: `avatars`, `gallery`, dan `branding`.
4. **Autentikasi Admin Tunggal**:
   - Matikan pendaftaran publik (*Disable public sign-ups*) di pengaturan Auth.
   - Buat 1 akun admin secara manual di dashboard Auth, lalu masukkan `user_id` akun tersebut ke dalam tabel `admin_profile`:
     ```sql
     insert into admin_profile (user_id) values ('UUID-USER-ADMIN-ANDA');
     ```
5. Di lingkungan AI Studio, database telah terhubung otomatis dengan Firestore (`firebase-applet-config.json`) dan aturan keamanan `firestore.rules` yang ketat.
