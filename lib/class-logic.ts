import {
  StudentRecord,
  ScheduleSlot,
  KasTransaction,
  DREAM_PAPER_PALETTE,
  PIN_CHART_COLORS,
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
  const [h = 0, m = 0] = hhmm.split(':').map((n) => parseInt(n, 10));
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
    if (!slot) continue;
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
    summaryText: 'Jam pelajaran hari ini sudah selesai. Waktunya ngoding santai atau mengecek papan cita-cita kelas.',
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
    const inDream = student.dream_title.toLowerCase().includes(q);
    return inName || inRole || inRoll || inTags || inDream;
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

export interface DreamNoteBoardPose {
  studentId: string;
  rollNo: number;
  col: number;
  row: number;
  x: number;
  y: number;
  z: number;
  rotZRad: number;
  rotZDeg: number;
  paperColorHex: string;
  paperColorName: string;
  pinColorHex: string;
  swayPhase: number;
}

export function getSeededPaperColor(rollNo: number, customHex?: string): {
  name: string;
  hex: string;
} {
  if (customHex) {
    const found = DREAM_PAPER_PALETTE.find(
      (p) => p.hex.toLowerCase() === customHex.toLowerCase()
    );
    if (found) return found;
  }
  const idx = Math.abs((rollNo * 7 + 3) % DREAM_PAPER_PALETTE.length);
  return DREAM_PAPER_PALETTE[idx] ?? DREAM_PAPER_PALETTE[0];
}

/**
 * Computes deterministic 3D board coordinates and organic hand-pinned Z-rotations
 * (±2° to ±5°) for all 22 students on the Classroom Dream Board.
 */
export function computeDreamBoardLayout(students: StudentRecord[]): DreamNoteBoardPose[] {
  const published = students.filter((s) => s.is_published);
  // 4 rows: 6, 6, 5, 5 notes across the board for organic balance
  const rowCounts = [6, 6, 5, 5];
  const poses: DreamNoteBoardPose[] = [];

  let cursor = 0;
  for (let row = 0; row < rowCounts.length; row++) {
    const colsInRow = rowCounts[row] ?? 5;
    for (let col = 0; col < colsInRow; col++) {
      if (cursor >= published.length) break;
      const st = published[cursor];
      cursor++;
      if (!st) continue;

      // Normalized horizontal & vertical distribution on a 13.2 x 7.4 board surface
      const spanX = colsInRow === 6 ? 10.6 : 8.8;
      const baseX = colsInRow === 1 ? 0 : -spanX / 2 + (col / (colsInRow - 1)) * spanX;
      const baseY = 2.25 - row * 1.48;

      // Seeded organic offsets from roll_no
      const seedA = Math.sin(st.roll_no * 12.9898) * 43758.5453;
      const fracA = seedA - Math.floor(seedA);
      const seedB = Math.cos(st.roll_no * 78.233) * 29451.135;
      const fracB = seedB - Math.floor(seedB);

      const jitterX = (fracA - 0.5) * 0.16;
      const jitterY = (fracB - 0.5) * 0.12;

      // Rotation between ±2° and ±5°, alternating sign naturally
      const sign = st.roll_no % 2 === 0 ? 1 : -1;
      const deg = sign * (2 + fracA * 3); // ±2.0° .. ±5.0°
      const rotZRad = (deg * Math.PI) / 180;

      const paperColor = getSeededPaperColor(st.roll_no, st.dream_paper_color);
      const pinColorHex =
        PIN_CHART_COLORS[(st.roll_no - 1) % PIN_CHART_COLORS.length] ?? '#6E78E8';

      poses.push({
        studentId: st.id,
        rollNo: st.roll_no,
        col,
        row,
        x: Number((baseX + jitterX).toFixed(3)),
        y: Number((baseY + jitterY).toFixed(3)),
        z: 0.14,
        rotZRad: Number(rotZRad.toFixed(4)),
        rotZDeg: Number(deg.toFixed(2)),
        paperColorHex: paperColor.hex,
        paperColorName: paperColor.name,
        pinColorHex,
        swayPhase: Number((st.roll_no * 0.65).toFixed(2)),
      });
    }
  }

  return poses;
}

export function validateStudentDreamUpdate(input: {
  dream_title: string;
  dream_reason: string;
  dream_description: string;
  dream_paper_color?: string;
  capsule_message?: string;
}): {
  valid: boolean;
  error?: string;
  sanitized?: {
    dream_title: string;
    dream_reason: string;
    dream_description: string;
    dream_paper_color: string;
    capsule_message?: string;
  };
} {
  const title = input.dream_title.replace(/[<>]/g, '').trim();
  const reason = input.dream_reason.replace(/[<>]/g, '').trim();
  const description = input.dream_description.replace(/[<>]/g, '').trim();
  const color = (input.dream_paper_color || '#DDEBD6').trim();
  const capsule = input.capsule_message
    ? input.capsule_message.replace(/[<>]/g, '').trim()
    : undefined;

  if (title.length < 3 || title.length > 120) {
    return { valid: false, error: 'Judul cita-cita wajib 3–120 karakter.' };
  }
  if (reason.length < 6 || reason.length > 500) {
    return { valid: false, error: 'Alasan memilih cita-cita wajib 6–500 karakter.' };
  }
  if (description.length < 6 || description.length > 600) {
    return { valid: false, error: 'Deskripsi rencana cita-cita wajib 6–600 karakter.' };
  }

  return {
    valid: true,
    sanitized: {
      dream_title: title,
      dream_reason: reason,
      dream_description: description,
      dream_paper_color: color,
      ...(capsule ? { capsule_message: capsule } : {}),
    },
  };
}

export function validateFarewellLetter(input: {
  author_name: string;
  author_role: string;
  title: string;
  body: string;
  memory_highlight?: string;
}): {
  valid: boolean;
  error?: string;
  sanitized?: {
    author_name: string;
    author_role: string;
    title: string;
    body: string;
    memory_highlight: string;
  };
} {
  const author_name = input.author_name.replace(/[<>]/g, '').trim();
  const author_role = input.author_role.replace(/[<>]/g, '').trim() || 'Siswa XII PPLG 1';
  const title = input.title.replace(/[<>]/g, '').trim();
  const body = input.body.replace(/[<>]/g, '').trim();
  const memory_highlight =
    (input.memory_highlight || 'Kenangan Manis XII PPLG 1').replace(/[<>]/g, '').trim();

  if (author_name.length < 2 || author_name.length > 80) {
    return { valid: false, error: 'Nama penulis wajib 2–80 karakter.' };
  }
  if (title.length < 3 || title.length > 120) {
    return { valid: false, error: 'Judul surat wajib 3–120 karakter.' };
  }
  if (body.length < 10 || body.length > 1000) {
    return { valid: false, error: 'Isi surat perpisahan wajib 10–1000 karakter.' };
  }

  return {
    valid: true,
    sanitized: {
      author_name,
      author_role,
      title,
      body,
      memory_highlight,
    },
  };
}

export function formatBootProgress(pct: number): {
  formattedPct: string;
  activeStageIndex: number;
} {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const formattedPct = `${String(clamped).padStart(2, '0')}%`;
  const activeStageIndex =
    clamped < 28 ? 0 : clamped < 58 ? 1 : clamped < 88 ? 2 : 3;
  return { formattedPct, activeStageIndex };
}
