import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AdminAuthProvider } from '@/components/providers/admin-auth-provider';
import { Toaster } from 'sonner';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'XII PPLG 1 — Class of 2026 · Rumah Digital & Kapsul Kelulusan',
  description:
    'Rumah digital & kapsul kelulusan resmi kelas XII PPLG 1 — Class of 2026 (22 siswa): Papan Tulis Cita-Cita 3D statis dengan 22 catatan interaktif, Lanyard Rail, Kapsul Kelulusan 3D, jadwal live WIB, kas kelas, dan admin realtime.',
  openGraph: {
    title: 'XII PPLG 1 — Class of 2026 · Rumah Digital & Kapsul Kelulusan',
    description:
      'Rumah digital & kapsul kelulusan resmi kelas XII PPLG 1 — Class of 2026 (22 siswa): Papan Tulis Cita-Cita 3D statis dengan 22 catatan interaktif, Lanyard Rail, Kapsul Kelulusan 3D, jadwal live WIB, kas kelas, dan admin realtime.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XII PPLG 1 — Class of 2026 · Rumah Digital & Kapsul Kelulusan',
    description:
      'Rumah digital & kapsul kelulusan resmi kelas XII PPLG 1 — Class of 2026 (22 siswa): Papan Tulis Cita-Cita 3D statis dengan 22 catatan interaktif, Lanyard Rail, Kapsul Kelulusan 3D, jadwal live WIB, kas kelas, dan admin realtime.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning className="overflow-x-hidden antialiased selection:bg-[#6E78E8]/25">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AdminAuthProvider>
            {/* Ambient soft pastel mesh background */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
            >
              <div
                className="mesh-blob absolute -top-28 -left-24 h-[460px] w-[460px] rounded-full opacity-60 blur-[96px]"
                style={{ background: 'var(--mesh-lavender)' }}
              />
              <div
                className="mesh-blob absolute top-1/4 -right-24 h-[420px] w-[420px] rounded-full opacity-55 blur-[96px]"
                style={{ background: 'var(--mesh-mint)', animationDelay: '-18s' }}
              />
              <div
                className="mesh-blob absolute bottom-0 left-1/4 h-[380px] w-[380px] rounded-full opacity-50 blur-[96px]"
                style={{ background: 'var(--mesh-peach)', animationDelay: '-34s' }}
              />
              <div
                className="mesh-blob absolute top-2/3 right-1/3 h-[340px] w-[340px] rounded-full opacity-35 blur-[96px]"
                style={{ background: 'var(--mesh-periwinkle)', animationDelay: '-48s' }}
              />
            </div>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </AdminAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
