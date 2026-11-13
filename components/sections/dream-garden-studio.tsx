'use client';

import * as React from 'react';
import Image from 'next/image';
import { GardenLayoutPlan, GardenPlantNode } from '@/lib/class-data';
import { buildGardenBlueprint, GardenPreferencesInput } from '@/lib/class-logic';
import {
  Sprout,
  Sun,
  Droplets,
  Wand2,
  Sparkles,
  CheckCircle2,
  Compass,
  PenTool,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const STYLES: GardenPreferencesInput['style'][] = [
  'Tropis Rindang',
  'Zen Minimalis',
  'Polinator Berbunga',
  'Edible & Herbal',
];

const SUNLIGHT_OPTIONS: GardenPreferencesInput['sunlight'][] = [
  'Teduh',
  'Semi-Teduh',
  'Penuh',
];

const SOIL_OPTIONS: GardenPreferencesInput['soilType'][] = [
  'Humus Organik',
  'Lempung Subur',
  'Berpasir Drainase Cepat',
];

export function DreamGardenStudioSection() {
  const [style, setStyle] = React.useState<GardenPreferencesInput['style']>('Tropis Rindang');
  const [sunlight, setSunlight] = React.useState<GardenPreferencesInput['sunlight']>('Semi-Teduh');
  const [soilType, setSoilType] = React.useState<GardenPreferencesInput['soilType']>('Humus Organik');
  const [widthMeters, setWidthMeters] = React.useState<number>(6);
  const [lengthMeters, setLengthMeters] = React.useState<number>(4);
  const [customPrompt, setCustomPrompt] = React.useState<string>(
    'Sudut baca hijau di depan Lab RPL 1 dengan bangku kayu dan kolam batu kecil'
  );
  const [editInstruction, setEditInstruction] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [plan, setPlan] = React.useState<GardenLayoutPlan>(() =>
    buildGardenBlueprint({
      style: 'Tropis Rindang',
      sunlight: 'Semi-Teduh',
      soilType: 'Humus Organik',
      widthMeters: 6,
      lengthMeters: 4,
      customPrompt: 'Sudut baca hijau di depan Lab RPL 1 dengan bangku kayu dan kolam batu kecil',
    })
  );
  const [selectedPlant, setSelectedPlant] = React.useState<GardenPlantNode | null>(
    () => plan.plants[0] ?? null
  );

  const handleGenerate = async (isEdit = false) => {
    setLoading(true);
    try {
      const response = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style,
          sunlight,
          soilType,
          widthMeters,
          lengthMeters,
          customPrompt,
          editInstruction: isEdit ? editInstruction : '',
          sourceImageBase64: isEdit ? plan.visualUrl : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.blueprint) {
        throw new Error(data.error || 'Gagal merancang tata letak taman.');
      }
      setPlan(data.blueprint);
      setSelectedPlant(data.blueprint.plants?.[0] ?? null);
      if (isEdit) {
        toast.success('Visual & tata letak taman berhasil diperbarui sesuai instruksi!');
        setEditInstruction('');
      } else {
        toast.success(`Denah ${data.blueprint.title} berhasil dibuat!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat merancang taman.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="taman-impian"
      aria-labelledby="heading-taman-impian"
      className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="glass-panel p-6 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-black/10 pb-6 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#5B6073] dark:text-[#A4AAC0]">
              03 · Studio Desain Taman Impian & Visual AI
            </p>
            <h2
              id="heading-taman-impian"
              className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Rancang Denah Taman & Visual Tanaman Sesuai Preferensi
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-[#5B6073] dark:text-[#A4AAC0]">
              Pilih gaya lanskap, intensitas cahaya, dan ukuran lahan untuk menghasilkan tata letak tanaman berlapis sekaligus render visual taman (`gemini-nano-banana-2.1` + blueprint interaktif).
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">
            <span>Luas Area:</span>
            <strong className="tabular-nums text-[#0B0D14] dark:text-white">
              {widthMeters * lengthMeters} m² ({widthMeters}m × {lengthMeters}m)
            </strong>
          </div>
        </div>

        {/* Main Studio Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Preferences & Prompt Controls (5 cols) */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <div className="glass-card tint-sage p-5">
              <h3 className="text-base font-semibold">1. Preferensi Lahan & Gaya</h3>

              {/* Style Selector */}
              <div className="mt-4">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
                  Gaya Taman Impian
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                        style === s
                          ? 'border-[#0B0D14] bg-[#0B0D14] text-white dark:border-white dark:bg-white dark:text-[#0B0D14]'
                          : 'border-black/10 bg-white/70 text-[#0B0D14] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sunlight & Soil */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="select-sunlight"
                    className="block font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]"
                  >
                    Intensitas Cahaya
                  </label>
                  <select
                    id="select-sunlight"
                    value={sunlight}
                    onChange={(e) => setSunlight(e.target.value as GardenPreferencesInput['sunlight'])}
                    className="mt-1.5 h-10 w-full rounded-xl border border-black/15 bg-white/80 px-3 text-xs font-medium text-[#0B0D14] outline-none focus:border-[#6E78E8] dark:border-white/15 dark:bg-[#151A30] dark:text-white"
                  >
                    {SUNLIGHT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="select-soil"
                    className="block font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]"
                  >
                    Karakter Media Tanam
                  </label>
                  <select
                    id="select-soil"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value as GardenPreferencesInput['soilType'])}
                    className="mt-1.5 h-10 w-full rounded-xl border border-black/15 bg-white/80 px-3 text-xs font-medium text-[#0B0D14] outline-none focus:border-[#6E78E8] dark:border-white/15 dark:bg-[#151A30] dark:text-white"
                  >
                    {SOIL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dimensions */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="garden-width"
                    className="block font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]"
                  >
                    Lebar Lahan (m): {widthMeters}m
                  </label>
                  <input
                    id="garden-width"
                    type="range"
                    min={3}
                    max={16}
                    value={widthMeters}
                    onChange={(e) => setWidthMeters(Number(e.target.value))}
                    className="mt-2 w-full accent-[#3FB8A5]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="garden-length"
                    className="block font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]"
                  >
                    Panjang Lahan (m): {lengthMeters}m
                  </label>
                  <input
                    id="garden-length"
                    type="range"
                    min={3}
                    max={14}
                    value={lengthMeters}
                    onChange={(e) => setLengthMeters(Number(e.target.value))}
                    className="mt-2 w-full accent-[#6E78E8]"
                  />
                </div>
              </div>

              {/* Prompt Input */}
              <div className="mt-4">
                <label
                  htmlFor="garden-custom-prompt"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]"
                >
                  Deskripsi / Suasana Taman yang Diinginkan
                </label>
                <textarea
                  id="garden-custom-prompt"
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Contoh: Taman sudut baca dengan aroma lavender, jalur batu pijakan, dan kolam ikan kecil..."
                  className="mt-1.5 w-full rounded-xl border border-black/15 bg-white/80 p-3 text-xs text-[#0B0D14] outline-none focus:border-[#6E78E8] dark:border-white/15 dark:bg-white/10 dark:text-white"
                />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleGenerate(false)}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0B0D14] px-5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-[#0B0D14]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Merancang Denah & Visual Tanaman...
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4" />
                    Buat Denah & Visual Taman Impian
                  </>
                )}
              </button>
            </div>

            {/* Edit / Refine Visual Card */}
            <div className="glass-card tint-lilac p-5">
              <div className="flex items-center gap-2">
                <PenTool className="size-4 text-[#6E78E8]" />
                <h3 className="text-sm font-semibold">
                  2. Revisi / Edit Visual Taman dengan Prompt
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                Ingin menambahkan lampu taman sore hari, air mancur bambu, atau mengganti warna bunga? Ketik instruksi edit di bawah:
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  placeholder="Contoh: Tambahkan lentera hangat & kursi kayu di dekat kolam"
                  aria-label="Instruksi edit visual taman"
                  className="h-10 flex-1 rounded-full border border-black/15 bg-white/80 px-4 text-xs text-[#0B0D14] outline-none focus:border-[#6E78E8] dark:border-white/15 dark:bg-white/10 dark:text-white"
                />
                <button
                  type="button"
                  disabled={loading || !editInstruction.trim()}
                  onClick={() => handleGenerate(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#6E78E8] px-4 text-xs font-semibold text-white whitespace-nowrap transition hover:opacity-90 disabled:opacity-40"
                >
                  <Sparkles className="size-3.5" />
                  Edit Visual
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 2D Blueprint + Visual Preview + Plant Inspector (7 cols) */}
          <div className="flex flex-col gap-5 lg:col-span-7">
            <div className="glass-card tint-aqua p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
                    Denah Interaktif & Zonasi Tanaman
                  </span>
                  <h3 className="text-lg font-bold">{plan.title}</h3>
                </div>
                <div className="font-mono text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                  {plan.sunlight} · {plan.soilType}
                </div>
              </div>
              <p className="mt-1 text-xs text-[#5B6073] dark:text-[#A4AAC0]">{plan.summary}</p>

              {/* Interactive Top-Down Blueprint Map */}
              <div
                data-testid="garden-blueprint-canvas"
                className="relative mt-4 h-[270px] w-full overflow-hidden rounded-2xl border border-black/10 bg-[#E4F0E8]/90 dark:border-white/15 dark:bg-[#112224]"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(11,13,20,0.12) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              >
                {/* Stepping stone path SVG */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 600 270"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <path
                    d="M 40 230 Q 210 150 340 165 T 550 70"
                    fill="none"
                    stroke="rgba(255,255,255,0.65)"
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeDasharray="2 34"
                  />
                </svg>

                {/* Compass & Scale */}
                <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1 font-mono text-[10px] font-medium text-[#0B0D14] dark:bg-black/60 dark:text-white">
                  <Compass className="size-3.5 text-[#3FB8A5]" />
                  <span>UTARA · Skala {plan.widthMeters}m × {plan.lengthMeters}m</span>
                </div>

                {/* Plant Nodes on Map */}
                {plan.plants.map((plant) => {
                  const isSelected = selectedPlant?.id === plant.id;
                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => setSelectedPlant(plant)}
                      style={{
                        left: `${plant.xPercent}%`,
                        top: `${plant.yPercent}%`,
                      }}
                      className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1 transition focus:outline-none ${
                        isSelected ? 'z-20 scale-110' : 'z-10 hover:scale-105'
                      }`}
                    >
                      <span
                        className="flex size-12 items-center justify-center rounded-full border-2 shadow-md transition"
                        style={{
                          backgroundColor: `${plant.colorHex}33`,
                          borderColor: isSelected ? '#0B0D14' : plant.colorHex,
                        }}
                      >
                        <Sprout
                          className="size-5"
                          style={{ color: plant.colorHex }}
                        />
                      </span>
                      <span className="mt-1 block rounded-md bg-white/90 px-2 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap text-[#0B0D14] shadow-sm dark:bg-[#0B0D14]/90 dark:text-white">
                        {plant.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Plant Detail Bar */}
              {selectedPlant && (
                <div className="mt-4 flex flex-col justify-between gap-3 rounded-2xl border border-black/10 bg-white/75 p-4 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                      <span className="font-semibold text-[#0B0D14] dark:text-white">
                        {selectedPlant.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="italic">{selectedPlant.latinName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Lapisan {selectedPlant.layer}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#5B6073] dark:text-[#A4AAC0]">
                      <strong>Tips Perawatan:</strong> {selectedPlant.careTip}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 font-mono text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      <Sun className="size-3.5 text-[#F0A04B]" />
                      {selectedPlant.sunNeed}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Droplets className="size-3.5 text-[#4FA3E0]" />
                      {selectedPlant.moisture}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Generated Visual Preview & Hardscape */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="glass-card overflow-hidden p-4 sm:col-span-7">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
                    Render Visual Taman
                  </span>
                  <span className="font-mono text-[10px] text-[#3FB8A5]">
                    16:9 Landscape View
                  </span>
                </div>
                {plan.visualUrl ? (
                  <Image
                    src={plan.visualUrl}
                    alt={`Visualisasi ${plan.title}`}
                    width={640}
                    height={360}
                    referrerPolicy="no-referrer"
                    className="h-44 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-44 w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#DDEBD6] via-[#CFEBE2] to-[#D3E6F3] p-4 text-center dark:from-[#122B2A] dark:to-[#1A1F3C]">
                    <Sprout className="size-8 text-[#3FB8A5]" />
                    <p className="mt-2 text-xs font-semibold text-[#0B0D14] dark:text-white">
                      {plan.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#5B6073] dark:text-[#A4AAC0]">
                      Klik tombol &ldquo;Buat Denah &amp; Visual Taman Impian&rdquo; untuk me-render visual baru.
                    </p>
                  </div>
                )}
              </div>

              <div className="glass-card tint-peach p-4 sm:col-span-5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6073] dark:text-[#A4AAC0]">
                  Elemen Hardscape & IoT
                </span>
                <ul className="mt-3 space-y-2.5 text-xs">
                  {plan.hardscapeElements.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#3FB8A5]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
