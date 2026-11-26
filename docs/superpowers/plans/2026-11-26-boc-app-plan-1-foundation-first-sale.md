# BOC app, Plan 1 of 5: foundation and the first sale

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A shop owner installs BOC on Android, logs in by phone OTP, sets up the business, opens a chat with a registered buyer, sends a GST-correct bill, and records the UPI payment, all against a real Supabase backend.

**Architecture:** Flutter app in `app/` (Riverpod + go_router + supabase_flutter), Postgres schema with Row Level Security in `supabase/migrations/`, pure Dart money/tax/UPI logic in `app/lib/core/` with unit tests. SQL is applied and tested on a hosted Supabase dev project (Mumbai) through the Supabase connection, because Docker and the Supabase CLI aren't installed.

**Tech Stack:** Flutter 3.47, Dart 3, flutter_riverpod, go_router, supabase_flutter, url_launcher, intl, flutter_localizations (gen_l10n), google_fonts (Urbanist bundled), Supabase Postgres 15 with RLS.

**Spec:** `docs/superpowers/specs/2026-11-26-boc-flutter-app-design.md`

## The five plans

1. **This plan:** foundation and the first sale (auth, business setup, registered-user chat with text, bill, UPI payment).
2. Full chats: attachments, message actions, groups and polls, unregistered numbers with SMS invite and web reply page, push, offline outbox, search, mute/pin/archive/block/report.
3. Catalog, contacts and CRM, bill builder extras (search, hand-typed lines, counter bill), PDF share, shopper GST-inclusive prices.
4. Statuses, reviews, plans and staff seats, app lock, complete Hindi and Tamil, staff invites and shared inbox.
5. Studio admin (views + maker-checker SQL functions), Codemagic Android + iOS builds, Play closed test with 20 shops.

## Global Constraints

- Supabase region `ap-south-1` (Mumbai); RLS enabled on every table, no table readable without a policy.
- Android minSdk 26; iOS 15.0; light theme only.
- Tokens from `DESIGN.md` Ledger layer: ground `#EFEFF1`, card `#FFFFFF`, ink `#111214`, ink2 `#75767C`, active `#111214`, action `#7DF18A`, bad `#E5484D`, good `#1E9E45`; Urbanist; card radius 16; minimum secondary text 13sp; tap targets 48dp.
- Money as integer paise (`int`), never `double`; display with Indian grouping (`₹1,14,975`).
- GST: registered seller → tax invoice, CGST+SGST when buyer state == seller state else IGST; seller without GSTIN or `composition = true` → bill of supply, no tax lines.
- Bill numbers `INV/<FY>/<0001>` per business per financial year (FY starts 1 April, written `2026-27`); bills of supply `BOS/<FY>/<0001>`.
- Sent bills are never updated; payments are append-only; the same UTR can't be recorded twice per business.
- Phone numbers stored as E.164 `+91XXXXXXXXXX`.
- User-facing strings come from ARB files (en, hi, ta); English filled now, hi/ta keys mirrored with English until Plan 4.
- Every shortcut carries `// shortcut: <limit>, <when to upgrade>`.

## Review Focus

1. Phone typed as `098430 12345`, `+91-98430-12345` or `9843012345` → one E.164 number (test in Task 2).
2. A staff member or another business tries to read a business's documents → denied by RLS (test in Task 3).
3. Two bills created at the same moment → distinct, gapless numbers (test in Task 3).
4. Buyer in another state → IGST, not CGST+SGST; unregistered seller → no tax lines (test in Task 2).
5. UTR recorded twice, or payment above the bill's balance → rejected with a message the seller understands (tests in Tasks 3 and 8).

---

### Task 1: Repo, Supabase dev project, Flutter app shell

**Files:**
- Create: `app/` via `flutter create --org in.boc --project-name boc --platforms android,ios app`
- Create: `app/lib/main.dart`, `app/lib/app.dart`, `app/lib/core/theme.dart`, `app/lib/core/router.dart`, `app/lib/core/env.dart`
- Create: `app/l10n.yaml`, `app/lib/l10n/app_en.arb`, `app_hi.arb`, `app_ta.arb`
- Create: `app/assets/fonts/Urbanist-*.ttf` (400, 500, 600, 700)
- Create: `.gitignore` entries `app/.dart_tool/`, `app/build/`, `app/lib/core/env.dart`; commit `app/lib/core/env.example.dart`
- Test: `app/test/theme_test.dart`

**Interfaces:**
- Produces: `ThemeData bocTheme()`; `GoRouter appRouter(Ref ref)`; `class Env { static const supabaseUrl, supabaseAnonKey }`.

- [ ] **Step 1:** Create the Supabase project `boc-dev` in `ap-south-1` on the free plan via the Supabase connection (show the cost confirmation to the founder first). Put URL and anon key in `app/lib/core/env.dart` (git-ignored).
- [ ] **Step 2:** `flutter create` as above; add packages: `flutter pub add flutter_riverpod go_router supabase_flutter url_launcher intl google_fonts flutter_localizations --sdk=flutter`; set `minSdkVersion 26`, iOS `15.0`.
- [ ] **Step 3: Write the failing test** `theme_test.dart`:
```dart
test('ledger tokens', () {
  final t = bocTheme();
  expect(t.scaffoldBackgroundColor, const Color(0xFFEFEFF1));
  expect(t.colorScheme.primary, const Color(0xFF111214));
  expect(t.colorScheme.secondary, const Color(0xFF7DF18A));
  expect(t.textTheme.bodySmall!.fontSize, greaterThanOrEqualTo(13));
});
```
- [ ] **Step 4:** Run `cd app && flutter test test/theme_test.dart` → FAIL (`bocTheme` undefined).
- [ ] **Step 5:** Implement `bocTheme()` in `theme.dart` (Material 3, Urbanist, tokens above, `cardTheme` radius 16, `filledButtonTheme` green with ink text, min tap 48); `main.dart` initialises Supabase and runs `ProviderScope(child: BocApp())`; `router.dart` has `/login`, `/setup`, `/chats`, `/chat/:id` with a redirect to `/login` when there's no session.
- [ ] **Step 6:** Run `flutter test` → PASS; `flutter build apk --debug` → builds.
- [ ] **Step 7:** Commit `feat(app): Flutter shell with Ledger theme and routes`.

### Task 2: Pure money, tax, phone and UPI logic

**Files:**
- Create: `app/lib/core/money.dart`, `app/lib/core/gst.dart`, `app/lib/core/phone.dart`, `app/lib/core/upi.dart`, `app/lib/core/fy.dart`
- Test: `app/test/core_test.dart`

**Interfaces:**
- Produces:
  - `String formatInr(int paise)` → `₹1,14,975` (no decimals when whole rupees, else `₹1,14,975.50`)
  - `class Line { String name; int qty; int unitPaise; String? hsn; int gstRateBp; }` (rate in basis points, 500 = 5%)
  - `class Totals { int subtotal, cgst, sgst, igst, total; bool billOfSupply; }`
  - `Totals computeTotals(List<Line> lines, {required String sellerState, required String buyerState, required bool sellerRegistered, int discountBp = 0})`
  - `String? normalizeIndianPhone(String raw)` → `+91XXXXXXXXXX` or `null`
  - `Uri upiPayUri({required String vpa, required String payeeName, required int paise, required String note})`
  - `String financialYear(DateTime d)` → `2026-27`

- [ ] **Step 1: Write the failing tests:**
```dart
test('inr', () { expect(formatInr(11497500), '₹1,14,975'); expect(formatInr(5050), '₹50.50'); });
test('intra-state splits CGST+SGST', () {
  final t = computeTotals([Line('Dupatta', 2, 240000, '5007', 500)], sellerState: 'TN', buyerState: 'TN', sellerRegistered: true);
  expect([t.subtotal, t.cgst, t.sgst, t.igst, t.total], [480000, 12000, 12000, 0, 504000]);
});
test('inter-state is IGST', () {
  final t = computeTotals([Line('Dupatta', 2, 240000, '5007', 500)], sellerState: 'TN', buyerState: 'KA', sellerRegistered: true);
  expect([t.cgst, t.sgst, t.igst], [0, 0, 24000]);
});
test('unregistered seller issues bill of supply', () {
  final t = computeTotals([Line('Stitching', 1, 45000, null, 0)], sellerState: 'TN', buyerState: 'TN', sellerRegistered: false);
  expect(t.billOfSupply, true); expect(t.total, 45000);
});
test('discount before tax', () {
  final t = computeTotals([Line('Saree', 1, 1850000, '5007', 500)], sellerState: 'TN', buyerState: 'TN', sellerRegistered: true, discountBp: 1000);
  expect(t.subtotal, 1665000); expect(t.total, 1748250);
});
test('phone formats', () {
  for (final s in ['098430 12345', '+91-98430-12345', '9843012345', '919843012345']) {
    expect(normalizeIndianPhone(s), '+919843012345');
  }
  expect(normalizeIndianPhone('12345'), isNull);
  expect(normalizeIndianPhone('5843012345'), isNull); // must start 6-9
});
test('upi uri', () {
  final u = upiPayUri(vpa: 'shreetextiles@kbank', payeeName: 'Shree Textiles', paise: 504000, note: 'INV/2026-27/0001');
  expect(u.scheme, 'upi'); expect(u.queryParameters['am'], '5040.00'); expect(u.queryParameters['cu'], 'INR');
});
test('financial year', () { expect(financialYear(DateTime(2026, 3, 31)), '2025-26'); expect(financialYear(DateTime(2026, 4, 1)), '2026-27'); });
```
- [ ] **Step 2:** `flutter test test/core_test.dart` → FAIL.
- [ ] **Step 3:** Implement the five files. Tax per line `round(lineTaxable * rateBp / 10000)`, CGST = tax ~/ 2 and SGST = tax − CGST so odd paise never vanish; discount applies to the subtotal proportionally before tax. UPI: `upi://pay?pa=&pn=&am=<rupees with 2 decimals>&cu=INR&tn=<note>`.
- [ ] **Step 4:** `flutter test test/core_test.dart` → PASS.
- [ ] **Step 5:** Commit `feat(core): money, GST, phone, UPI and FY helpers`.

### Task 3: Database schema, numbering and RLS

**Files:**
- Create: `supabase/migrations/20261126000001_core.sql`
- Create: `supabase/tests/core_test.sql` (plain SQL with `DO $$ … ASSERT … $$` blocks, run through the Supabase connection)

**Interfaces:**
- Produces tables (all with `id uuid default gen_random_uuid() primary key`, `created_at timestamptz default now()`):
  - `profiles(id = auth.users.id, phone text unique, name text, lang text default 'en')`
  - `businesses(name, phone, gstin text null, composition bool default false, state_code text, upi_vpa text, verified bool default false, plan text default 'trial', trial_ends date)`
  - `business_members(business_id, user_id, role text check in ('owner','staff'), unique(business_id,user_id))`
  - `chats(kind text check in ('direct','group'), business_id uuid null, title text null)`
  - `chat_members(chat_id, user_id uuid null, phone text null, check (user_id is not null or phone is not null))`
  - `messages(chat_id, sender_user_id, sender_business_id null, type text, body text null, payload jsonb default '{}', reply_to uuid null, edited_at null, deleted_for_all bool default false)`
  - `documents(business_id, chat_id, kind text check in ('invoice','bill_of_supply','quote','paylink'), number text, fy text, lines jsonb, totals jsonb, buyer_state text, status text default 'sent', cancelled_by uuid null, unique(business_id, kind, fy, number))`
  - `payments(document_id, business_id, amount_paise int check > 0, method text check in ('upi','cash','bank'), utr text null, reverses uuid null, recorded_by uuid, unique(business_id, utr))`
  - `doc_counters(business_id, prefix, fy, last int, primary key(business_id, prefix, fy))`
- Produces functions:
  - `next_doc_number(p_business uuid, p_prefix text, p_fy text) returns text` → `INV/2026-27/0001`, using `insert … on conflict do update set last = last + 1 returning last`
  - `document_balance(p_document uuid) returns int` = total − sum(payments incl. reversals as negatives)
  - `is_member(p_business uuid) returns bool` (security definer)
- RLS: members of a business read/write its documents and payments; chat members read/write messages of their chats; `profiles` readable by self and by co-members of a chat; no `update`/`delete` policy on `documents` lines/totals or on `payments`.

- [ ] **Step 1: Write the failing tests** in `core_test.sql`: numbering returns `INV/2026-27/0001` then `0002`; 20 concurrent calls (looped in one transaction) give 20 distinct numbers; `document_balance` after a ₹5,040 bill and ₹2,000 payment = 304000; inserting a second payment with the same UTR for the same business raises `unique_violation`; with `set local role authenticated` and a JWT for a non-member, `select count(*) from documents` returns 0; an `update documents set totals=…` as a member affects 0 rows.
- [ ] **Step 2:** Run the test SQL through the Supabase connection → FAIL (tables missing).
- [ ] **Step 3:** Write the migration; apply it with the Supabase connection's migration tool.
- [ ] **Step 4:** Re-run `core_test.sql` → all ASSERTs pass; run the security advisor → no "RLS disabled" findings.
- [ ] **Step 5:** Commit `feat(db): core schema, numbering, balances and RLS`.

### Task 4: Phone OTP login

**Files:**
- Create: `app/lib/auth/login_screen.dart`, `app/lib/auth/otp_screen.dart`, `app/lib/auth/auth_repo.dart`
- Test: `app/test/auth/login_screen_test.dart`

**Interfaces:**
- Consumes: `normalizeIndianPhone` (Task 2).
- Produces: `class AuthRepo { Future<void> sendOtp(String e164); Future<void> verify(String e164, String code); }` provided by `authRepoProvider`.

- [ ] **Step 1:** In the Supabase dashboard enable Phone auth; add test numbers `+919999900001` → OTP `123456` and `+919999900002` → `123456` for development (real SMS provider is set in Plan 2).
- [ ] **Step 2: Write the failing widget test:** entering `098430 12345` and tapping Continue calls `sendOtp('+919843012345')` on a fake repo; entering `12345` shows the text `Enter a 10-digit mobile number` and doesn't call it; the Continue button is at least 48dp tall.
- [ ] **Step 3:** `flutter test test/auth` → FAIL.
- [ ] **Step 4:** Implement the screens (language picker en/hi/ta at the top of the login screen, saved to `profiles.lang` after login); `verify` creates the `profiles` row if missing.
- [ ] **Step 5:** `flutter test` → PASS; log in on the emulator with `+919999900001`.
- [ ] **Step 6:** Commit `feat(auth): phone OTP login`.

### Task 5: Business setup

**Files:**
- Create: `app/lib/business/setup_screen.dart`, `app/lib/business/business_repo.dart`
- Test: `app/test/business/setup_test.dart`

**Interfaces:**
- Produces: `Future<String> createBusiness({required String name, String? gstin, required bool composition, required String stateCode, required String upiVpa})` → business id; inserts `businesses` + `business_members(role:'owner')` in one RPC `create_business(...)` added to a new migration `20261126000002_create_business.sql`.
- Produces: `currentBusinessProvider` (the signed-in user's first business, null for personal accounts).

- [ ] **Step 1: Write the failing tests:** GSTIN `33ABHFS4821K1Z6` accepted and its first two digits set state `33` (Tamil Nadu); GSTIN `33ABC` rejected with `GSTIN is 15 characters`; empty GSTIN allowed and shows `You'll issue bills of supply (no GST)`; UPI `shreetextiles@kbank` accepted, `shreetextiles` rejected with `UPI ID looks like name@bank`.
- [ ] **Step 2:** `flutter test test/business` → FAIL.
- [ ] **Step 3:** Implement the screen and `create_business` RPC (security definer, owner = `auth.uid()`); a "Just me, I'm buying" option skips setup for personal accounts.
- [ ] **Step 4:** `flutter test` → PASS; create Shree Textiles on the emulator; check rows in Studio.
- [ ] **Step 5:** Commit `feat(business): create a business with GST and UPI`.

### Task 6: Chats with registered users (text, real-time)

**Files:**
- Create: `app/lib/chats/chat_list_screen.dart`, `app/lib/chats/chat_screen.dart`, `app/lib/chats/chat_repo.dart`, `app/lib/chats/new_chat_sheet.dart`
- Create: `supabase/migrations/20261126000003_start_chat.sql` (`start_direct_chat(p_phone text, p_business uuid) returns uuid`: finds or creates the direct chat between the business and the user with that phone; for a phone with no account it stores the member by `phone` (delivery to them is Plan 2))
- Test: `app/test/chats/chat_repo_test.dart`, `supabase/tests/chat_test.sql`

**Interfaces:**
- Consumes: `normalizeIndianPhone`, `currentBusinessProvider`.
- Produces: `Stream<List<Message>> watchMessages(String chatId)`; `Future<void> sendText(String chatId, String text)`; `Future<String> startChat(String e164)`; `class Message { String id; String type; String? body; Map payload; DateTime createdAt; bool mine; }`.

- [ ] **Step 1: Write the failing tests:** SQL — calling `start_direct_chat('+919999900002', biz)` twice returns the same id; a third user can't select its messages. Dart — `sendText` trims and refuses empty text; `startChat` normalises `098430 12345`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement: chat list (latest message, unread dot), chat screen with Realtime subscription on `messages` filtered by `chat_id`, composer, new-chat sheet with number field (Enter submits).
- [ ] **Step 4:** Run tests → PASS; two emulators (or emulator + Chrome via `flutter run -d chrome`) logged in as the two test numbers exchange messages in under 2 seconds.
- [ ] **Step 5:** Commit `feat(chats): direct chats with real-time text`.

### Task 7: Send a bill in the chat

**Files:**
- Create: `app/lib/documents/bill_sheet.dart`, `app/lib/documents/document_card.dart`, `app/lib/documents/document_repo.dart`
- Create: `supabase/migrations/20261126000004_send_bill.sql` (`send_bill(p_chat uuid, p_lines jsonb, p_buyer_state text, p_discount_bp int) returns uuid`: computes totals in SQL with the same rules as `computeTotals`, picks `INV` or `BOS`, numbers it, inserts `documents` and a `messages` row of type `document` with `payload.document_id`)
- Test: `app/test/documents/bill_sheet_test.dart`, `supabase/tests/bill_test.sql`

**Interfaces:**
- Consumes: `computeTotals`, `formatInr`, `next_doc_number`.
- Produces: `Future<String> sendBill(String chatId, List<Line> lines, {required String buyerState, int discountBp = 0})`; `DocumentCard(documentId)` widget showing number, lines, tax split, total, balance, and actions by viewer (seller: Record payment, Send reminder; buyer: Pay by UPI).

- [ ] **Step 1: Write the failing tests:** SQL — `send_bill` for 2 × ₹2,400 @5% intra-state returns a document whose totals equal `{subtotal:480000,cgst:12000,sgst:12000,igst:0,total:504000}` and number `INV/2026-27/0001`; for a business with null GSTIN the number starts `BOS/`; a staff member of another business calling it gets `permission denied`. Widget — bill sheet with no lines has Send disabled; typing quantity `40` sets 40 without tapping; the total line shows `₹5,040`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement the sheet (from the chat's paperclip; lines typed by hand in this plan, catalog picking is Plan 3) and the card.
- [ ] **Step 4:** Run → PASS; client `computeTotals` and server totals match for the 5 cases in Task 2's tests (add a Dart test that calls `send_bill` on the dev project and compares).
- [ ] **Step 5:** Commit `feat(documents): send GST bills in chat`.

### Task 8: Get paid by UPI, record payments

**Files:**
- Create: `app/lib/payments/pay_button.dart`, `app/lib/payments/record_payment_sheet.dart`, `app/lib/payments/payment_repo.dart`
- Create: `supabase/migrations/20261126000005_payments.sql` (`record_payment(p_document uuid, p_paise int, p_method text, p_utr text) returns int` new balance; rejects `p_paise > document_balance` with `Amount is more than what's due`; duplicate UTR raises `This UTR is already recorded`; `claim_payment(p_document uuid, p_utr text)` for the buyer, stored on the document as a pending claim shown to the seller)
- Test: `app/test/payments/payment_test.dart`, `supabase/tests/payment_test.sql`

**Interfaces:**
- Consumes: `upiPayUri`, `document_balance`, `DocumentCard`.
- Produces: `Future<int> recordPayment(String documentId, int paise, String method, {String? utr})`.

- [ ] **Step 1: Write the failing tests:** SQL — paying ₹2,000 then ₹3,040 on a ₹5,040 bill leaves 0 and status `paid`; ₹6,000 on a ₹5,040 bill fails with `Amount is more than what's due`; the same UTR twice fails with `This UTR is already recorded`; the buyer can call `claim_payment` but not `record_payment`. Widget — the buyer's Pay button launches `upi://pay?...am=5040.00...` (fake launcher); if no UPI app is installed it shows the seller's UPI ID with a Copy button.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement: buyer "Pay ₹5,040 by UPI" → `url_launcher` with `upiPayUri`; after returning, "I've paid" asks for the UTR (optional) → `claim_payment`; seller sees "Meera says she paid · UTR 412233…" with Confirm / Not received; Record payment sheet for cash, UPI or bank with amount pre-filled to the balance.
- [ ] **Step 4:** Run → PASS; on a real Android phone with a UPI app, the intent opens with amount and payee pre-filled.
- [ ] **Step 5:** Commit `feat(payments): UPI pay, claims and append-only payments`.

### Task 9: End-to-end check of the first sale

**Files:**
- Create: `app/integration_test/first_sale_test.dart`

- [ ] **Step 1: Write the test:** log in as `+919999900001`, create business (Task 5 values), start chat with `+919999900002`, send a bill of 2 × ₹2,400, record ₹5,040 cash, expect the card to show `Paid` and Studio to show one `documents` row and one `payments` row.
- [ ] **Step 2:** Run `flutter test integration_test/first_sale_test.dart -d emulator-5554` → PASS within 2 minutes of app start (the anti-goal).
- [ ] **Step 3:** Commit `test: first sale end to end`; tag `plan-1-done`.
