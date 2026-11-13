import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-12">
      <div className="glass-panel w-full p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#6E78E8]">
          XII PPLG 1 · Admin Portal
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          Manajemen Konten &amp; Moderasi Buku Tamu
        </h1>
        <p className="mt-2 text-sm text-[#5B6073] dark:text-[#A4AAC0]">
          Sesuai kebijakan keamanan kelas, hanya 1 akun admin yang diizinkan mengelola data (tanpa halaman registrasi publik). Buka panel admin langsung dari beranda untuk memoderasi buku tamu, menerbitkan pengumuman, dan mencatat mutasi kas.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-[#0B0D14] px-6 text-xs font-semibold text-white dark:bg-white dark:text-[#0B0D14]"
          >
            Kembali ke Beranda &amp; Buka Panel Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
