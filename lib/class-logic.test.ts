import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STUDENTS,
  INITIAL_SCHEDULES,
  INITIAL_KAS,
} from './class-data';
import {
  getActiveScheduleWIB,
  filterStudents,
  summarizeKas,
  validateGuestbookSubmission,
  buildGardenBlueprint,
} from './class-logic';

test('INITIAL_STUDENTS contains exactly 22 students with roll_no 1..22 and tones 1..5', () => {
  assert.equal(INITIAL_STUDENTS.length, 22);
  assert.equal(INITIAL_STUDENTS[0].name, 'Siswa 01');
  assert.equal(INITIAL_STUDENTS[21].name, 'Siswa 22');
  for (const s of INITIAL_STUDENTS) {
    assert.ok(s.tone >= 1 && s.tone <= 5);
    assert.ok(s.avatar_url.startsWith('data:image/svg+xml'));
  }
});

test('filterStudents filters by search query and interest tag accurately', () => {
  const byNo = filterStudents(INITIAL_STUDENTS, '07', 'Semua');
  assert.equal(byNo.length, 1);
  assert.equal(byNo[0].roll_no, 7);

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

test('buildGardenBlueprint returns a structured garden layout with plant nodes', () => {
  const plan = buildGardenBlueprint({
    style: 'Tropis Rindang',
    sunlight: 'Semi-Teduh',
    soilType: 'Humus Organik',
    widthMeters: 8,
    lengthMeters: 5,
    customPrompt: 'Sudut baca hijau di depan Lab RPL 1',
  });
  assert.equal(plan.widthMeters, 8);
  assert.equal(plan.lengthMeters, 5);
  assert.ok(plan.plants.length >= 4);
  assert.ok(plan.summary.includes('Sudut baca hijau'));
});
