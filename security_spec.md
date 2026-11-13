# Security Specification — XII PPLG 1 Digital Hub

## 1. Data Invariants
1. **Public Read-Only Invariant**: Public visitors (`anon`) may read published class data (`class_info`, `students`, `announcements`, `assignments`, `kas_transactions`), and may only read `guestbook` documents where `status == 'approved'`.
2. **Guestbook Creation Invariant**: Unauthenticated or standard visitors may only `create` a `guestbook` entry if `status == 'pending'`, `sender_name` is 1–40 chars, `message` is 1–280 chars, and no extra shadow keys exist.
3. **Admin Exclusive Mutation Invariant**: Only the verified admin (`ananxpplg1@gmail.com` with `email_verified == true` or document in `/admins/{uid}`) may create, update, or delete class records (`class_info`, `students`, `announcements`, `assignments`, `kas_transactions`) or moderate `guestbook` status (`approved` / `rejected`).
4. **ID & Boundary Guard**: Every document ID must match `^[a-zA-Z0-9_\-]+$` with length `<= 128`. All strings and lists have strict upper length bounds.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on Guestbook**: `{ "sender_name": "Budi", "message": "Halo", "status": "pending", "created_at": "2026-11-13", "isAdmin": true }` -> Rejected by `hasOnly()`.
2. **Self-Approved Guestbook Bypass**: `{ "sender_name": "Budi", "message": "Spam link", "status": "approved", "created_at": "2026-11-13" }` -> Rejected because non-admin create requires `status == 'pending'`.
3. **Oversized Guestbook Message (Denial of Wallet)**: `{ "sender_name": "Budi", "message": "<1000 chars>", "status": "pending", "created_at": "2026-11-13" }` -> Rejected by `message.size() <= 280`.
4. **Empty Sender Name**: `{ "sender_name": "", "message": "Halo", "status": "pending", "created_at": "2026-11-13" }` -> Rejected by `sender_name.size() >= 1`.
5. **Unverified Admin Email Spoof**: Auth token with `email == 'ananxpplg1@gmail.com'` and `email_verified == false` attempting to delete an announcement -> Rejected by `email_verified == true`.
6. **Unauthorized Student Modification**: Non-admin user attempting `update` on `/students/siswa-01` -> Rejected by `isAdmin()`.
7. **Invalid Kas Transaction Type**: Admin or user sending `type: "hutang"` instead of `'masuk'` or `'keluar'` -> Rejected by `data.type in ['masuk', 'keluar']`.
8. **Negative Kas Amount**: `{ "occurred_on": "2026-11-13", "type": "masuk", "amount": -50000, "note": "Kas" }` -> Rejected by `data.amount > 0`.
9. **ID Poisoning**: Creating document with 500-char ID or special path characters -> Rejected by `isValidId(id)`.
10. **Pending Guestbook Scraping**: Anonymous user querying `guestbook` where `status == 'pending'` -> Rejected by `resource.data.status == 'approved' || isAdmin()`.
11. **Value Poisoning on Announcement**: Updating `is_pinned` with a string `"yes"` instead of boolean -> Rejected by `isValidAnnouncement(incoming())`.
12. **Unbounded Tag Array on Student**: Creating student with 25 tags -> Rejected by `data.tags.size() <= 10`.
