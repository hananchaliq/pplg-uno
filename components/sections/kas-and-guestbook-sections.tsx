'use client';

import * as React from 'react';
import { KasTransaction, GuestbookEntry } from '@/lib/class-data';
import { summarizeKas, validateGuestbookSubmission } from '@/lib/class-logic';
import { Wallet, ArrowUpRight, ArrowDownRight, MessageSquarePlus, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function KasKelasSection({ transactions }: { transactions: KasTransaction[] }) {
  const report = React.useMemo(() => summarizeKas(transactions), [transactions]);
  const [hoveredMonth, setHoveredMonth] = React.useState<string | null>(null);

  const maxMonthlyValue = React.useMemo(() => {
    return Math.max(100000, ...report.monthly.map((m) => Math.max(m.masuk, m.keluar)));
  }, [report.monthly]);

  return (
    <section
      id="kas-kelas"
      aria-labelledby="heading-kas"
      className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="glass-panel p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
              11 · Keuangan Kelas Terbuka
            </p>
            <h2 id="heading-kas" className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Laporan Kas Kelas XII PPLG 1
            </h2>
          </div>
          <p className="text-xs text-[#5B6073] dark:text-[#A4AAC0]">
            Dikelola oleh Bendahara I &amp; II · Tanpa menampilkan tunggakan pribadi per siswa di halaman publik.
          </p>
        </div>

        {/* Summary KPI Strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass-card tint-aqua p-5">
            <div className="flex items-center justify-between text-xs text-[#5B6073] dark:text-[#A4AAC0]">
              <span className="font-mono uppercase">Saldo Kas Aktif</span>
              <Wallet className="size-4 text-[#3FB8A5]" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold tabular-nums">
              {formatRupiah(report.saldoAkhir)}
            </p>
          </div>

          <div className="glass-card tint-sage p-5">
            <div className="flex items-center justify-between text-xs text-[#5B6073] dark:text-[#A4AAC0]">
              <span className="font-mono uppercase">Total Pemasukan</span>
              <ArrowUpRight className="size-4 text-[#3FB8A5]" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-[#166534] dark:text-[#54CEBA]">
              {formatRupiah(report.totalMasuk)}
            </p>
          </div>

          <div className="glass-card tint-peach p-5">
            <div className="flex items-center justify-between text-xs text-[#5B6073] dark:text-[#A4AAC0]">
              <span className="font-mono uppercase">Total Pengeluaran</span>
              <ArrowDownRight className="size-4 text-[#E0709A]" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-[#9F1239] dark:text-[#EC87AE]">
              {formatRupiah(report.totalKeluar)}
            </p>
          </div>
        </div>

        {/* 3D Glass Liquid Bar Chart + Recent Ledger */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 3D Isometric Glass Cylinders per Month (6 cols) */}
          <div className="glass-card tint-lilac flex flex-col justify-between p-6 lg:col-span-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
                Visualisasi Tabung Kaca Kas Bulanan
              </span>
              <h3 className="mt-1 text-lg font-bold">
                Pemasukan vs Pengeluaran (Jul – Nov 2026)
              </h3>
            </div>

            <div className="mt-8 grid grid-cols-5 items-end gap-4 pt-6">
              {report.monthly.map((m) => {
                const inPct = Math.round((m.masuk / maxMonthlyValue) * 100);
                const outPct = Math.round((m.keluar / maxMonthlyValue) * 100);
                const isHovered = hoveredMonth === m.monthKey;

                return (
                  <div
                    key={m.monthKey}
                    onMouseEnter={() => setHoveredMonth(m.monthKey)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="flex flex-col items-center"
                  >
                    <div className="relative flex h-44 w-full items-end justify-center gap-1.5 rounded-2xl border border-white/70 bg-white/40 p-2 shadow-inner dark:border-white/15 dark:bg-white/5">
                      {/* Pemasukan Liquid Column */}
                      <div
                        style={{ height: `${Math.max(12, inPct)}%` }}
                        title={`Masuk ${m.monthLabel}: ${formatRupiah(m.masuk)}`}
                        className="w-4 rounded-full bg-gradient-to-t from-[#3FB8A5] to-[#6E78E8] shadow-sm transition-all duration-300"
                      />
                      {/* Pengeluaran Liquid Column */}
                      <div
                        style={{ height: `${Math.max(8, outPct)}%` }}
                        title={`Keluar ${m.monthLabel}: ${formatRupiah(m.keluar)}`}
                        className="w-4 rounded-full bg-gradient-to-t from-[#E0709A] to-[#F0A04B] opacity-85 shadow-sm transition-all duration-300"
                      />
                    </div>
                    <span className="mt-2 font-mono text-xs font-semibold">
                      {m.monthLabel}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums text-[#5B6073] dark:text-[#A4AAC0]">
                      {isHovered
                        ? `+${Math.round(m.net / 1000)}rb`
                        : `${Math.round(m.masuk / 1000)}rb`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-3 font-mono text-[11px] text-[#5B6073] dark:border-white/10 dark:text-[#A4AAC0]">
              <span>Biru-Mint: Kas Masuk</span>
              <span>Pink-Amber: Kas Keluar</span>
            </div>
          </div>

          {/* Transparent Transaction History Table (6 cols) */}
          <div className="glass-card p-6 lg:col-span-6">
            <h3 className="text-lg font-bold">Riwayat Mutasi Transparan</h3>
            <div className="mt-4 max-h-[310px] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/10 font-mono text-[11px] uppercase text-[#5B6073] dark:border-white/10 dark:text-[#A4AAC0]">
                    <th className="pb-2.5">Tanggal</th>
                    <th className="pb-2.5">Keterangan</th>
                    <th className="pb-2.5 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-2.5 font-mono text-[11px] tabular-nums text-[#5B6073] dark:text-[#A4AAC0]">
                        {tx.occurred_on}
                      </td>
                      <td className="py-2.5 pr-2 font-medium">{tx.note}</td>
                      <td
                        className={`py-2.5 text-right font-mono font-semibold tabular-nums ${
                          tx.type === 'masuk'
                            ? 'text-[#166534] dark:text-[#54CEBA]'
                            : 'text-[#9F1239] dark:text-[#EC87AE]'
                        }`}
                      >
                        {tx.type === 'masuk' ? '+' : '-'}
                        {formatRupiah(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GuestbookSection({
  entries,
  onSubmitEntry,
}: {
  entries: GuestbookEntry[];
  onSubmitEntry: (sender_name: string, message: string) => Promise<void>;
}) {
  const [senderName, setSenderName] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [honeypot, setHoneypot] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const approvedEntries = React.useMemo(
    () => entries.filter((e) => e.status === 'approved'),
    [entries]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const check = validateGuestbookSubmission({
      sender_name: senderName,
      message,
      honeypot,
    });
    if (!check.valid || !check.sanitized) {
      setErrorMsg(check.error ?? 'Input tidak valid.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitEntry(check.sanitized.sender_name, check.sanitized.message);
      setSenderName('');
      setMessage('');
      toast.success(
        'Pesan berhasil dikirim ke antrean moderasi! Admin kelas akan meninjau sebelum tampil.'
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengirim pesan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="buku-tamu"
      aria-labelledby="heading-buku-tamu"
      className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="glass-panel p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Form Buku Tamu (5 cols) */}
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
              12 · Buku Tamu & Sticky Notes Kaca
            </p>
            <h2 id="heading-buku-tamu" className="mt-1.5 text-2xl font-bold tracking-tight">
              Tinggalkan Pesan untuk XII PPLG 1
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5B6073] dark:text-[#A4AAC0]">
              Kirim semangat buat ujian praktik, salam dari kelas tetangga, atau kesan pesan. Setiap kiriman masuk dengan status <code>pending</code> untuk dimoderasi admin.
            </p>

            <form onSubmit={handleSubmit} className="glass-card tint-sky mt-5 space-y-4 p-5">
              {/* Honeypot anti-spam field */}
              <input
                type="text"
                name="website_url_hp"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="sr-only"
                aria-hidden="true"
              />

              <div>
                <label
                  htmlFor="gb-sender"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]"
                >
                  Nama / Kelas (Maks 40 Karakter)
                </label>
                <input
                  id="gb-sender"
                  type="text"
                  maxLength={40}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Contoh: Raka · XII TKJ 2"
                  className="mt-1.5 h-10 w-full rounded-xl border border-black/15 bg-white/85 px-3.5 text-xs text-[#0B0D14] outline-none focus:border-[#6E78E8] dark:border-white/15 dark:bg-white/10 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="gb-message"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]"
                >
                  Pesan Singkat ({message.length}/280)
                </label>
                <textarea
                  id="gb-message"
                  rows={3}
                  maxLength={280}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan positif untuk teman-teman XII PPLG 1..."
                  className="mt-1.5 w-full rounded-xl border border-black/15 bg-white/85 p-3.5 text-xs text-[#0B0D14] outline-none focus:border-[#6E78E8] dark:border-white/15 dark:bg-white/10 dark:text-white"
                />
              </div>

              {errorMsg && (
                <p role="alert" className="text-xs font-medium text-[#E11D48]">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#0B0D14] px-5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-[#0B0D14]"
              >
                <Send className="size-3.5" />
                {submitting ? 'Mengirim...' : 'Kirim ke Papan Buku Tamu'}
              </button>
            </form>
          </div>

          {/* Right: Sticky Glass Notes Board (7 cols) */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
                Papan Sticky Notes Terverifikasi ({approvedEntries.length})
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#3FB8A5]">
                <ShieldCheck className="size-3.5" />
                Realtime Sync Aktif
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {approvedEntries.map((note, idx) => {
                const noteTints = ['tint-peach', 'tint-lilac', 'tint-sage', 'tint-orchid'];
                const rotation = idx % 2 === 0 ? '-rotate-1' : 'rotate-1';
                return (
                  <article
                    key={note.id}
                    className={`glass-card ${noteTints[idx % noteTints.length]} ${rotation} flex flex-col justify-between p-5 transition hover:rotate-0`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                        <span className="font-semibold text-[#0B0D14] dark:text-white">
                          {note.sender_name}
                        </span>
                        <MessageSquarePlus className="size-3.5 opacity-60" />
                      </div>
                      <p className="mt-2.5 text-sm leading-relaxed">
                        &ldquo;{note.message}&rdquo;
                      </p>
                    </div>
                    <p className="mt-4 font-mono text-[10px] tabular-nums text-[#5B6073] dark:text-[#A4AAC0]">
                      {new Date(note.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
