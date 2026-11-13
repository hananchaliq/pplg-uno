import {
  StudentRecord,
  ScheduleSlot,
  KasTransaction,
  GardenLayoutPlan,
  GardenPlantNode,
} from './class-data';

export interface ActiveScheduleStatus {
  state: 'ongoing' | 'upcoming' | 'finished' | 'holiday';
  weekday: number;
  dayName: string;
  currentTimeWIB: string;
  currentSlot: ScheduleSlot | null;
  nextSlot: ScheduleSlot | null;
  minutesRemaining: number;
  summaryText: string;
}

const DAY_NAMES: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

export function getActiveScheduleWIB(
  schedules: ScheduleSlot[],
  referenceDate: Date = new Date()
): ActiveScheduleStatus {
  // Convert to WIB (UTC+7)
  const utcMs = referenceDate.getTime() + referenceDate.getTimezoneOffset() * 60000;
  const wibDate = new Date(utcMs + 7 * 3600000);
  const weekday = wibDate.getDay(); // 0 = Sun, 1..6 = Mon..Sat
  const hours = wibDate.getHours();
  const minutes = wibDate.getMinutes();
  const currentTotalMin = hours * 60 + minutes;
  const currentTimeWIB = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;
  const dayName = DAY_NAMES[weekday] ?? 'Senin';

  if (weekday === 0) {
    const mondaySlots = schedules
      .filter((s) => s.weekday === 1)
      .sort((a, b) => parseMinutes(a.start_time) - parseMinutes(b.start_time));
    return {
      state: 'holiday',
      weekday,
      dayName,
      currentTimeWIB,
      currentSlot: null,
      nextSlot: mondaySlots[0] ?? null,
      minutesRemaining: 0,
      summaryText: 'Hari Minggu — Libur akhir pekan. Siapkan energi buat praktikum Senin pagi.',
    };
  }

  const todaySlots = schedules
    .filter((s) => s.weekday === weekday)
    .sort((a, b) => parseMinutes(a.start_time) - parseMinutes(b.start_time));

  for (let i = 0; i < todaySlots.length; i++) {
    const slot = todaySlots[i];
    const startMin = parseMinutes(slot.start_time);
    const endMin = parseMinutes(slot.end_time);

    if (currentTotalMin >= startMin && currentTotalMin < endMin) {
      const rem = endMin - currentTotalMin;
      return {
        state: 'ongoing',
        weekday,
        dayName,
        currentTimeWIB,
        currentSlot: slot,
        nextSlot: todaySlots[i + 1] ?? null,
        minutesRemaining: rem,
        summaryText: `Sedang berlangsung: ${slot.subject} di ${slot.room} (${rem} menit tersisa)`,
      };
    }

    if (currentTotalMin < startMin) {
      const wait = startMin - currentTotalMin;
      return {
        state: 'upcoming',
        weekday,
        dayName,
        currentTimeWIB,
        currentSlot: null,
        nextSlot: slot,
        minutesRemaining: wait,
        summaryText: `Berikutnya: ${slot.subject} mulai pukul ${slot.start_time} WIB (dalam ${wait} menit)`,
      };
    }
  }

  return {
    state: 'finished',
    weekday,
    dayName,
    currentTimeWIB,
    currentSlot: null,
    nextSlot: null,
    minutesRemaining: 0,
    summaryText: 'Jam pelajaran hari ini sudah selesai. Waktunya ngoding santai atau menyiram taman kelas.',
  };
}

export function filterStudents(
  students: StudentRecord[],
  query: string,
  tagFilter: string
): StudentRecord[] {
  const q = query.trim().toLowerCase();
  const tag = tagFilter.trim().toLowerCase();

  return students.filter((student) => {
    if (!student.is_published) return false;
    const matchesTag =
      !tag ||
      tag === 'semua' ||
      student.tags.some((t) => t.toLowerCase().includes(tag)) ||
      student.role.toLowerCase().includes(tag);

    if (!matchesTag) return false;
    if (!q) return true;

    const inName = student.name.toLowerCase().includes(q);
    const inRole = student.role.toLowerCase().includes(q);
    const inRoll = String(student.roll_no).padStart(2, '0').includes(q);
    const inTags = student.tags.some((t) => t.toLowerCase().includes(q));
    return inName || inRole || inRoll || inTags;
  });
}

export interface MonthlyKasSummary {
  monthKey: string; // YYYY-MM
  monthLabel: string;
  masuk: number;
  keluar: number;
  net: number;
}

export interface KasReport {
  totalMasuk: number;
  totalKeluar: number;
  saldoAkhir: number;
  monthly: MonthlyKasSummary[];
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'Mei',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Agu',
  '09': 'Sep',
  '10': 'Okt',
  '11': 'Nov',
  '12': 'Des',
};

export function summarizeKas(transactions: KasTransaction[]): KasReport {
  let totalMasuk = 0;
  let totalKeluar = 0;
  const map = new Map<string, { masuk: number; keluar: number }>();

  for (const tx of transactions) {
    const amt = Math.max(0, Number(tx.amount) || 0);
    if (tx.type === 'masuk') totalMasuk += amt;
    else if (tx.type === 'keluar') totalKeluar += amt;

    const monthKey = tx.occurred_on.slice(0, 7);
    const prev = map.get(monthKey) ?? { masuk: 0, keluar: 0 };
    if (tx.type === 'masuk') prev.masuk += amt;
    else prev.keluar += amt;
    map.set(monthKey, prev);
  }

  const monthly: MonthlyKasSummary[] = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, val]) => {
      const mm = monthKey.slice(5, 7);
      return {
        monthKey,
        monthLabel: MONTH_LABELS[mm] ?? monthKey,
        masuk: val.masuk,
        keluar: val.keluar,
        net: val.masuk - val.keluar,
      };
    });

  return {
    totalMasuk,
    totalKeluar,
    saldoAkhir: totalMasuk - totalKeluar,
    monthly,
  };
}

export function validateGuestbookSubmission(input: {
  sender_name: string;
  message: string;
  honeypot?: string;
}): { valid: boolean; error?: string; sanitized?: { sender_name: string; message: string } } {
  if (input.honeypot && input.honeypot.trim().length > 0) {
    return { valid: false, error: 'Deteksi spam aktif.' };
  }
  const cleanName = input.sender_name.replace(/[<>]/g, '').trim();
  const cleanMessage = input.message.replace(/[<>]/g, '').trim();

  if (cleanName.length < 2) {
    return { valid: false, error: 'Nama pengirim minimal 2 karakter.' };
  }
  if (cleanName.length > 40) {
    return { valid: false, error: 'Nama pengirim maksimal 40 karakter.' };
  }
  if (cleanMessage.length < 4) {
    return { valid: false, error: 'Pesan terlalu pendek (minimal 4 karakter).' };
  }
  if (cleanMessage.length > 280) {
    return { valid: false, error: 'Pesan maksimal 280 karakter.' };
  }
  return {
    valid: true,
    sanitized: {
      sender_name: cleanName,
      message: cleanMessage,
    },
  };
}

export interface GardenPreferencesInput {
  style: 'Tropis Rindang' | 'Zen Minimalis' | 'Polinator Berbunga' | 'Edible & Herbal';
  sunlight: 'Teduh' | 'Semi-Teduh' | 'Penuh';
  soilType: 'Lempung Subur' | 'Berpasir Drainase Cepat' | 'Humus Organik';
  widthMeters: number;
  lengthMeters: number;
  customPrompt?: string;
}

export function buildGardenBlueprint(prefs: GardenPreferencesInput): GardenLayoutPlan {
  const widthMeters = Math.max(2, Math.min(20, Math.round(prefs.widthMeters || 6)));
  const lengthMeters = Math.max(2, Math.min(20, Math.round(prefs.lengthMeters || 4)));

  const catalogs: Record<GardenPreferencesInput['style'], GardenPlantNode[]> = {
    'Tropis Rindang': [
      {
        id: 'pl-1',
        name: 'Monstera Deliciosa',
        latinName: 'Monstera deliciosa',
        layer: 'Semak',
        sunNeed: 'Semi-Teduh',
        moisture: 'Lembap',
        colorHex: '#3FB8A5',
        xPercent: 22,
        yPercent: 28,
        radiusMeters: 1.1,
        careTip: 'Siram 2–3 kali seminggu dan bersihkan daun agar fotosintesis optimal.',
      },
      {
        id: 'pl-2',
        name: 'Calathea Orbifolia',
        latinName: 'Goeppertia orbifolia',
        layer: 'Penutup Tanah',
        sunNeed: 'Teduh',
        moisture: 'Lembap',
        colorHex: '#6E78E8',
        xPercent: 52,
        yPercent: 68,
        radiusMeters: 0.75,
        careTip: 'Jaga kelembapan tanah dan hindari sinar matahari siang langsung.',
      },
      {
        id: 'pl-3',
        name: 'Palem Kuning',
        latinName: 'Dypsis lutescens',
        layer: 'Kanopi',
        sunNeed: 'Semi-Teduh',
        moisture: 'Sedang',
        colorHex: '#4FA3E0',
        xPercent: 78,
        yPercent: 26,
        radiusMeters: 1.4,
        careTip: 'Pangkas pelepah tua sebulan sekali untuk menjaga sirkulasi udara.',
      },
      {
        id: 'pl-4',
        name: 'Pakis Boston',
        latinName: 'Nephrolepis exaltata',
        layer: 'Semak',
        sunNeed: 'Teduh',
        moisture: 'Lembap',
        colorHex: '#3FB8A5',
        xPercent: 28,
        yPercent: 72,
        radiusMeters: 0.9,
        careTip: 'Semprot kabut air halus saat cuaca siang sedang terik.',
      },
      {
        id: 'pl-5',
        name: 'Kolam Batu & Lumut Air',
        latinName: 'Taxiphyllum barbieri',
        layer: 'Aksen Air/Batu',
        sunNeed: 'Semi-Teduh',
        moisture: 'Lembap',
        colorHex: '#F0A04B',
        xPercent: 72,
        yPercent: 66,
        radiusMeters: 1.0,
        careTip: 'Gunakan pompa sirkulasi kecil agar air tetap jernih dan bebas jentik.',
      },
    ],
    'Zen Minimalis': [
      {
        id: 'zn-1',
        name: 'Bambu Jepang Mini',
        latinName: 'Pleioblastus fortunei',
        layer: 'Kanopi',
        sunNeed: 'Semi-Teduh',
        moisture: 'Sedang',
        colorHex: '#3FB8A5',
        xPercent: 18,
        yPercent: 24,
        radiusMeters: 1.2,
        careTip: 'Batasi akar dengan pembatas pot tanam agar rapi.',
      },
      {
        id: 'zn-2',
        name: 'Bonsai Serut & Batu Kali',
        latinName: 'Streblus asper',
        layer: 'Semak',
        sunNeed: 'Penuh',
        moisture: 'Sedang',
        colorHex: '#6E78E8',
        xPercent: 54,
        yPercent: 45,
        radiusMeters: 1.15,
        careTip: 'Pangkas pucuk ranting tiap 3 minggu untuk mempertahankan siluet.',
      },
      {
        id: 'zn-3',
        name: 'Lumut Karpet Kyoto',
        latinName: 'Leucobryum glaucum',
        layer: 'Penutup Tanah',
        sunNeed: 'Teduh',
        moisture: 'Lembap',
        colorHex: '#4FA3E0',
        xPercent: 34,
        yPercent: 74,
        radiusMeters: 0.95,
        careTip: 'Pertahankan permukaan tetap lembap dengan penyiraman lembut.',
      },
      {
        id: 'zn-4',
        name: 'Lentera Batu & Koral Putih',
        latinName: 'Yukimi Doro Hardscape',
        layer: 'Aksen Air/Batu',
        sunNeed: 'Penuh',
        moisture: 'Kering',
        colorHex: '#F0A04B',
        xPercent: 80,
        yPercent: 68,
        radiusMeters: 0.9,
        careTip: 'Bersihkan batu koral setiap akhir bulan agar bebas lumut liar.',
      },
    ],
    'Polinator Berbunga': [
      {
        id: 'fl-1',
        name: 'Lavender Tropis',
        latinName: 'Lavandula angustifolia',
        layer: 'Semak',
        sunNeed: 'Penuh',
        moisture: 'Kering',
        colorHex: '#6E78E8',
        xPercent: 26,
        yPercent: 32,
        radiusMeters: 0.95,
        careTip: 'Pastikan media tanam berpori dan mendapat sinar pagi.',
      },
      {
        id: 'fl-2',
        name: 'Pentas Lanceolata Pink',
        latinName: 'Pentas lanceolata',
        layer: 'Semak',
        sunNeed: 'Penuh',
        moisture: 'Sedang',
        colorHex: '#E0709A',
        xPercent: 64,
        yPercent: 30,
        radiusMeters: 1.05,
        careTip: 'Bunga mekar sepanjang tahun dan mengundang kupu-kupu.',
      },
      {
        id: 'fl-3',
        name: 'Marigold Emas',
        latinName: 'Tagetes erecta',
        layer: 'Penutup Tanah',
        sunNeed: 'Penuh',
        moisture: 'Sedang',
        colorHex: '#F0A04B',
        xPercent: 42,
        yPercent: 70,
        radiusMeters: 0.85,
        careTip: 'Potong kuntum yang layu untuk memicu tunas bunga baru.',
      },
      {
        id: 'fl-4',
        name: 'Tabebuya Mini Pot',
        latinName: 'Handroanthus chrysotrichus',
        layer: 'Kanopi',
        sunNeed: 'Penuh',
        moisture: 'Sedang',
        colorHex: '#3FB8A5',
        xPercent: 80,
        yPercent: 64,
        radiusMeters: 1.3,
        careTip: 'Berikan pupuk NPK rendah nitrogen menjelang musim kemarau.',
      },
    ],
    'Edible & Herbal': [
      {
        id: 'ed-1',
        name: 'Rosemary & Mint Bed',
        latinName: 'Salvia rosmarinus',
        layer: 'Semak',
        sunNeed: 'Penuh',
        moisture: 'Sedang',
        colorHex: '#3FB8A5',
        xPercent: 25,
        yPercent: 34,
        radiusMeters: 0.9,
        careTip: 'Panen pucuk daun secara berkala agar batang bercabang rimbun.',
      },
      {
        id: 'ed-2',
        name: 'Tomat Ceri Rambat',
        latinName: 'Solanum lycopersicum',
        layer: 'Kanopi',
        sunNeed: 'Penuh',
        moisture: 'Lembap',
        colorHex: '#E0709A',
        xPercent: 72,
        yPercent: 28,
        radiusMeters: 1.15,
        careTip: 'Pasang ajir bambu dan siram pangkal akar tiap pagi.',
      },
      {
        id: 'ed-3',
        name: 'Kemangi & Selada Hidro-Pot',
        latinName: 'Ocimum basilicum',
        layer: 'Penutup Tanah',
        sunNeed: 'Semi-Teduh',
        moisture: 'Lembap',
        colorHex: '#4FA3E0',
        xPercent: 46,
        yPercent: 72,
        radiusMeters: 0.85,
        careTip: 'Cocok dipanen untuk bekal makan siang bersama di kelas.',
      },
      {
        id: 'ed-4',
        name: 'Bangku Kayu & Kompos Mini',
        latinName: 'Bio-Compost Station',
        layer: 'Aksen Air/Batu',
        sunNeed: 'Teduh',
        moisture: 'Sedang',
        colorHex: '#F0A04B',
        xPercent: 82,
        yPercent: 70,
        radiusMeters: 0.95,
        careTip: 'Olah daun kering taman menjadi humus organik setiap 4 minggu.',
      },
    ],
  };

  const selectedPlants = catalogs[prefs.style] ?? catalogs['Tropis Rindang'];

  return {
    title: `Denah Taman ${prefs.style} (${widthMeters}m × ${lengthMeters}m)`,
    styleName: prefs.style,
    summary:
      prefs.customPrompt && prefs.customPrompt.trim().length > 0
        ? `Dirancang khusus untuk preferensi "${prefs.customPrompt.trim()}" dengan pencahayaan ${prefs.sunlight.toLowerCase()} dan media ${prefs.soilType.toLowerCase()}.`
        : `Tata letak berlapis (kanopi, semak, penutup tanah) untuk pencahayaan ${prefs.sunlight.toLowerCase()} dengan media tanam ${prefs.soilType.toLowerCase()}.`,
    widthMeters,
    lengthMeters,
    sunlight: prefs.sunlight,
    soilType: prefs.soilType,
    hardscapeElements: [
      'Jalur Pijakan Batu Andesit Anti-Slip',
      'Bangku Diskusi Kayu Ulin Tahan Cuaca',
      'Sensor Kelembapan Tanah IoT Kelas PPLG',
    ],
    plants: selectedPlants,
  };
}
