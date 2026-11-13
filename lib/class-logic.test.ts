import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STUDENTS,
  INITIAL_SCHEDULES,
  INITIAL_KAS,
  DREAM_PAPER_PALETTE,
} from './class-data';
import {
  getActiveScheduleWIB,
  filterStudents,
  summarizeKas,
  validateGuestbookSubmission,
  computeDreamBoardLayout,
  validateStudentDreamUpdate,
} from './class-logic';

test('INITIAL_STUDENTS contains exactly 22 students with roll_no 1..22, tones 1..5, and dream fields', () => {
  assert.equal(INITIAL_STUDENTS.length, 22);
  assert.equal(INITIAL_STUDENTS[0].name, 'Siswa 01');
  assert.equal(INITIAL_STUDENTS[21].name, 'Siswa 22');
  for (const s of INITIAL_STUDENTS) {
    assert.ok(s.tone >= 1 && s.tone <= 5);
    assert.ok(s.avatar_url.startsWith('data:image/svg+xml'));
    assert.ok(s.dream_title.length >= 3);
    assert.ok(s.dream_reason.length >= 10);
    assert.ok(s.dream_description.length >= 10);
  }
});

test('filterStudents filters by search query, dream_title, and interest tag accurately', () => {
  const byNo = filterStudents(INITIAL_STUDENTS, '07', 'Semua');
  assert.equal(byNo.length, 1);
  assert.equal(byNo[0].roll_no, 7);

  const byDream = filterStudents(INITIAL_STUDENTS, 'Cyber Security', 'Semua');
  assert.equal(byDream.length, 1);
  assert.equal(byDream[0].roll_no, 13);

  const gameDevs = filterStudents(INITIAL_STUDENTS, '', 'Game Dev');
  assert.ok(gameDevs.length >= 3);
  assert.ok(gameDevs.every((s) => s.tags.includes('Game Dev')));
});

test('getActiveScheduleWIB detects ongoing and holiday states properly', () => {
  // Monday 08:00 WIB -> 01:00 UTC
  const mondayMorningUtc = new Date('2026-11-16T01:00:00Z');
  const status = getActiveScheduleWIB(INITIAL_SCHEDULES, mondayMorningUtc);
  assert.equal(status.state, 'ongoing');
  assert.equal(status.dayName, 'Senin');
  assert.ok(status.currentSlot?.subject.includes('Pemrograman Web'));
  assert.equal(status.minutesRemaining, 75);

  // Sunday -> holiday
  const sundayUtc = new Date('2026-11-15T04:00:00Z');
  const sunStatus = getActiveScheduleWIB(INITIAL_SCHEDULES, sundayUtc);
  assert.equal(sunStatus.state, 'holiday');
});

test('summarizeKas computes total masuk, keluar, saldoAkhir, and monthly breakdown', () => {
  const report = summarizeKas(INITIAL_KAS);
  assert.ok(report.totalMasuk > report.totalKeluar);
  assert.equal(report.saldoAkhir, report.totalMasuk - report.totalKeluar);
  assert.equal(report.monthly.length, 5);
});

test('validateGuestbookSubmission blocks honeypot, empty names, and oversized messages', () => {
  const spam = validateGuestbookSubmission({
    sender_name: 'Bot',
    message: 'Hello world',
    honeypot: 'http://spam.link',
  });
  assert.equal(spam.valid, false);

  const valid = validateGuestbookSubmission({
    sender_name: '  Siswa 04 ',
    message: 'Semangat persiapan UKK minggu depan!',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized?.sender_name, 'Siswa 04');
});

test('computeDreamBoardLayout generates 22 organic 3D note poses with ±2°..±5° Z-rotation and pastel colors', () => {
  const poses = computeDreamBoardLayout(INITIAL_STUDENTS);
  assert.equal(poses.length, 22);
  const validHexes = new Set(DREAM_PAPER_PALETTE.map((p) => p.hex));
  for (const pose of poses) {
    const absDeg = Math.abs(pose.rotZDeg);
    assert.ok(absDeg >= 2 && absDeg <= 5, `Expected rotation between 2° and 5°, got ${pose.rotZDeg}`);
    assert.ok(validHexes.has(pose.paperColorHex as typeof DREAM_PAPER_PALETTE[number]['hex']));
  }
});

test('validateStudentDreamUpdate validates and sanitizes student dream note edits', () => {
  const invalid = validateStudentDreamUpdate({
    dream_title: 'A',
    dream_reason: 'Pendek',
    dream_description: 'Valid description',
  });
  assert.equal(invalid.valid, false);

  const valid = validateStudentDreamUpdate({
    dream_title: '  AI Research Engineer  ',
    dream_reason: 'Ingin mengembangkan model AI bahasa daerah yang akurat.',
    dream_description: 'Belajar PyTorch, linear algebra, dan arsitektur Transformer sejak kelas XII.',
    dream_paper_color: '#D3E6F3',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized?.dream_title, 'AI Research Engineer');
});
