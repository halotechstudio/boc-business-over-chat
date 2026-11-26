# Business coverage + admin console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Beasy web simulation so eight Indian business archetypes, B2B trade terms, a public web page, plans and ads all work end to end over chat, and add a desktop admin console sharing state with the app.

**Architecture:** `prototype/index.html` stays one file (state object `S`, full re-render via `render()`, delegated `data-act` handlers, `GUIDE[]` flows, `renderSheet()`/`submitSheet()` switch on `S.sheet.type`, `cardHTML()`/`docState(d,side)` per doc kind). A new shared module `prototype/shared.js` owns persistence, seed businesses and plans; both `index.html` and new `prototype/admin.html` load it. Tests are plain JS assertion suites in `prototype/tests/*.test.js`, run by opening `index.html?test=<suite>` (or `admin.html?test=<suite>`) in the browser pane; the runner logs `TESTS PASS n/n` or `TESTS FAIL <name>: <msg>` to the console.

**Tech Stack:** Static HTML/CSS/vanilla JS, no build step. Published as Claude Artifacts. Verified with the built-in browser pane (`mcp__Claude_Browser__*`).

**Spec:** `docs/superpowers/specs/2026-11-26-business-coverage-and-admin-design.md`

## Global Constraints

- Follow `DESIGN.md` Shade Card rules: turmeric (`--wait` #E8A317) only when the viewer must act; indigo #2B3A8C the only interactive tint; flat colour only; codes in Barlow Condensed with a space (`BKG 0231`); amounts in Roboto Mono with Indian grouping via existing `money()`.
- New doc kinds and code prefixes exactly: `BKG` booking, `SUB` subscription, `RNT` rental, `CN` credit note, `EWB` e-way bill, `LR` transport receipt, `MS` milestone.
- All data synthetic and labelled; all prices shown with the label "Example pricing".
- Plans (monthly): Free ₹0 — 1 user, 50 items, 100 broadcast msgs; Pro ₹299 — 5 users, unlimited items, web shop, khata, GST reports, 1,000 msgs; Business ₹999 — 25 users, credit terms, price lists, e-invoice/e-way bill, purchasing, contracts, multi-location, 5,000 msgs.
- Add-ons: AI ₹149/month; broadcasts ₹0.20/msg; e-sign ₹25/contract. Fees: UPI 0%, cards/net banking 1.5%, Beasy Protect +0.5% (seller). Ads: ₹5/click or ₹199/day per slot; verified businesses only; never inside chats.
- e-way bill required when consignment value > ₹50,000; e-invoice IRN toggle only for turnover > ₹5 crore.
- Persistence key `beasy.demo.v3`; every `localStorage` access in try/catch; pages render from seed when storage is empty or throws.
- All 12 existing guided flows must still complete; new options default to today's behaviour.
- Admin roles exactly: Super admin, Support agent, Verification officer, Finance, Marketing. Maker-checker on every refund, split and suspension; approver must differ from requester; Super admin may approve anything except own request.
- Not a git repo: instead of commits, each task ends with a snapshot copy `prototype/archive/<file>-T<N>.html` only where noted; artifact versions are the release history.

## Review Focus

1. Storage blocked/private window → both pages must still load from seed with no console error (test in Task 1).
2. Admin and app open in two tabs at once → a change in one appears in the other without reload (test in Task 10).
3. Suspended business opened from the app or its web page → buyer cannot pay or order, sees a suspended banner (test in Task 11).
4. Credit limit exceeded by a new order → order is blocked with a madder warning, not silently accepted (test in Task 3).
5. Plan limit hit (51st product on Free) after an admin override raised the limit → override wins, no upgrade prompt (test in Task 11).

---

### Task 0: Backup and test runner

**Files:**
- Create: `prototype/archive/index-v2.html` (exact copy of current `prototype/index.html`)
- Create: `prototype/tests/runner.js`
- Modify: `prototype/index.html` (load runner when `?test=` present, at end of body)

**Interfaces:**
- Produces: `test(name: string, fn: () => void|Promise<void>)`, `eq(a, b, msg?)`, `ok(cond, msg?)`, `runTests(): Promise<void>` logging `TESTS PASS n/n` / `TESTS FAIL name: msg`; `?test=<suite>` loads `tests/<suite>.test.js`.

- [ ] **Step 1:** Copy `prototype/index.html` to `prototype/archive/index-v2.html`; confirm byte sizes match (`(Get-Item ...).Length`).
- [ ] **Step 2:** Write `tests/smoke.test.js`: `test("all 12 guide flows run", ...)` that calls each `GUIDE[i].run()` after a reset and asserts no thrown error and `GUIDE.length===12`.
- [ ] **Step 3:** Open `index.html?test=smoke` in the browser pane; expect FAIL (runner missing).
- [ ] **Step 4:** Implement `runner.js` and the loader.
- [ ] **Step 5:** Reload; expect `TESTS PASS 1/1`.

### Task 1: Shared state and persistence

**Files:**
- Create: `prototype/shared.js`
- Modify: `prototype/index.html` (load `shared.js` before the app script; wrap `render()` to persist; Reset demo clears)
- Test: `prototype/tests/persist.test.js`

**Interfaces:**
- Produces (on `window.BeasyStore`): `load(): object|null`, `save(state: object): void`, `reset(): void`, `subscribe(fn: (state) => void): void` (fires on `storage` events), `KEY = "beasy.demo.v3"`. Persisted slice: everything in `S` except `stack, sheet, toast, typing, q`.
- Produces: `shared.js` also exports `window.SEED = { businesses, plans, users, tickets, ads, flags }` used by later tasks.

- [ ] **Step 1:** Tests: `"saves and restores"` — change `S.payout.held`, call `BeasyStore.save(S)`, reload state via `load()`, `eq(held)`; `"storage throws"` — stub `localStorage.getItem` to throw, assert `load()===null` and app renders `.chatrow` count > 0; `"reset clears"` — `reset()` then `load()===null`.
- [ ] **Step 2:** Run `?test=persist`; expect FAIL.
- [ ] **Step 3:** Implement `shared.js`; in app boot, `Object.assign(S, BeasyStore.load() ?? {})`; call `save(S)` at end of `render()`; Reset demo calls `reset()` then reloads.
- [ ] **Step 4:** Run `?test=persist` and `?test=smoke`; expect PASS both.

### Task 2: Business archetype seeds

**Files:**
- Modify: `prototype/shared.js` (`SEED.businesses`), `prototype/index.html` (`BIZ` reads from seed; new chats seeded)
- Test: `prototype/tests/archetypes.test.js`

**Interfaces:**
- Produces: `SEED.businesses[key] = {name, color, cat, city, kind, plan, terms?, priceLists?, services?, ...existing BIZ fields}` where `kind ∈ "retail"|"wholesale"|"manufacturer"|"service"|"project"|"subscription"|"rental"|"batch"`. Keys: existing `st, qd, am, ms, kc` plus `ld` (wholesale distributor, Ludhiana), `pm` (manufacturer, Rajkot), `gs` (salon, Pune), `ix` (interiors, Bengaluru), `dm` (dairy subscription, Anand), `tt` (tent house rental, Jaipur). `am` gains `kind:"batch"`.

- [ ] **Step 1:** Test `"eight kinds seeded"` — set of `kind` values across businesses has size 8; each has a chat in `S.chats` (as owner view of its counterpart or customer view).
- [ ] **Step 2:** Run; FAIL. **Step 3:** Implement seeds with party colours from `DESIGN.md`. **Step 4:** Run archetypes + smoke; PASS.

### Task 3: B2B terms — credit, partial pay, price lists, MOQ

**Files:**
- Modify: `prototype/index.html` (quote/order/invoice sheets, `docState`, `cardHTML`, khata view, new `recordPayment`)
- Test: `prototype/tests/b2b.test.js`

**Interfaces:**
- Produces: buyer record `S.buyers[cid] = {list: "distributor"|"retailer"|"public", terms: "advance"|"delivery"|"net15"|"net30"|"net60", limit: number, used: number}`; `priceFor(product, cid): number` (list price then quantity slab: ≥10 units −3%, ≥50 −6%); `recordPayment(docId: string, amount: number): void` sets `d.paid` and status `"Part paid"` / `"Paid"`; `dueDate(d): string`; invoices past due show madder `"Overdue N days"`.
- Consumes: `totals()`, `addDoc()`, `docState()`.

- [ ] **Step 1:** Tests: `"distributor price"` — `priceFor(P("p2"), ldChat)` equals `whole` × slab; `"MOQ blocks"` — wholesale order under `/moq` minimum (5 rolls) shows error, no doc; `"part payment"` — invoice ₹10,000, `recordPayment(id, 4000)` → status `"Part paid"`, balance ₹6,000; `"net30 due"` — invoice with `terms:"net30"` has due 30 days out; `"credit limit"` (Review Focus 4) — order pushing `used` over `limit` is blocked with madder text `"Over credit limit"`.
- [ ] **Step 2:** Run; FAIL. **Step 3:** Implement; quote sheet gains "Terms" select defaulting to the buyer's terms (defaults to `advance` = today's behaviour). **Step 4:** Run b2b + smoke; PASS.

### Task 4: Tax paperwork — e-invoice, e-way bill, CN/DN, TDS

**Files:**
- Modify: `prototype/index.html`
- Test: `prototype/tests/tax.test.js`

**Interfaces:**
- Produces: doc kinds `cn` (credit note), `ewb`; `needsEwb(d): boolean` (`docTotal(d) > 50000` and goods); invoice field `irn` shown only when business `turnover > 50000000`; invoice `tds` line (default 0.1% when buyer is B2B and toggle on); `issueCreditNote(invId, amount, reason): Doc`.

- [ ] **Step 1:** Tests: `"ewb required over 50k"` — ₹50,001 shipment requires `EWB` before ship action enables; ₹50,000 does not; `"irn only large"` — `st` (turnover below) has no IRN row, `pm` has one; `"credit note"` — `issueCreditNote` reduces invoice balance and chip reads `CN 0xxx`.
- [ ] **Step 2–4:** FAIL → implement → PASS (tax + smoke).

### Task 5: Delivery options — transporter LR, own staff OTP, pickup

**Files:**
- Modify: `prototype/index.html` (`COURIERS`, ship sheet, `bizShip`, track sheet)
- Test: `prototype/tests/delivery.test.js`

**Interfaces:**
- Produces: ship options `courier` (existing), `transport` (needs transporter name + `LR` number, creates `LR` doc), `staff` (assign team member; handover needs 4-digit OTP the buyer sees), `pickup` (ready-for-pickup message, buyer shows OTP at counter). `bizShip(o, opt)` keeps existing signature; `opt.mode` added, default `"courier"`.

- [ ] **Step 1:** Tests per mode: final status `Delivered` reached; `staff` wrong OTP keeps status `Out for delivery`; buyer `cpConfirm` still releases held money.
- [ ] **Step 2–4:** FAIL → implement → PASS (delivery + smoke).

### Task 6: Services, projects, subscriptions, rentals, batches

**Files:**
- Modify: `prototype/index.html` (new sheets `booking`, `milestones`, `subscribe`, `rental`; new doc kinds `bkg`, `ms`, `sub`, `rnt`; product `batches`)
- Test: `prototype/tests/kinds.test.js`

**Interfaces:**
- Produces:
  - `book(cid, serviceId, slot: string, deposit: number): Doc` (BKG; reminder sys message; `markDone` → invoice for balance).
  - `milestoneQuote(cid, stages: {name, pct}[]): Doc` (MS; pct sums to 100; each stage payable when previous done).
  - `subscribe(cid, planId, freq: "daily"|"weekly"): Doc` (SUB; delivery log entries; month-end invoice = delivered count × rate).
  - `rent(cid, itemId, from, to, deposit): Doc` (RNT; return step refunds deposit minus damage).
  - Product `batches: {no, exp, qty}[]`; sale picks earliest-expiry batch; expired batches can't be sold.
- Consumes: `addDoc`, `recordPayment`, `docState`.

- [ ] **Step 1:** Tests: one per kind asserting the end state (`BKG` Done+Paid; MS rejects stages not summing to 100; SUB invoice for 26 deliveries × ₹60 = ₹1,560; RNT refund = deposit − damage; batch FEFO picks earliest expiry and blocks expired).
- [ ] **Step 2–4:** FAIL → implement → PASS (kinds + smoke).
- [ ] **Step 5:** Add 8 guide flows (one per archetype) to `GUIDE[]`; extend smoke test to `GUIDE.length===20`; PASS.

### Task 7: Public web page ("just a number")

**Files:**
- Modify: `prototype/index.html` (third frame mode `web` next to Android/iPhone; `webView(bizKey)`)
- Test: `prototype/tests/web.test.js`

**Interfaces:**
- Produces: `S.frame ∈ "android"|"ios"|"web"` (existing `S.os` still drives phone chrome); `webView(key)` renders trust profile, public-price catalog/services, "Chat on Beasy", "Order"; order → phone + OTP → creates personal account → switches to phone frame in that business's chat with the order card.

- [ ] **Step 1:** Tests: public page hides `vis:"Wholesale buyers"` and `"Hidden"` products; order path ends with chat open and an order doc; unverified business shows madder banner.
- [ ] **Step 2–4:** FAIL → implement → PASS (web + smoke). Guide flow "Buyer finds you from a number" added.

### Task 8: Plans, billing, upgrade prompts, promote

**Files:**
- Modify: `prototype/shared.js` (`SEED.plans` from Global Constraints), `prototype/index.html` (More → "Plan & billing", `limitFor()`, upgrade sheet, payout fee lines, "Promote" sheet)
- Test: `prototype/tests/plans.test.js`

**Interfaces:**
- Produces: `limitFor(bizKey, key: "users"|"items"|"msgs"): number` — reads plan, then `SEED.flags` override (Task 11 writes overrides); `feeFor(method, protect: boolean): number`; ad record `{id, biz, slot: "explore"|"search", model: "cpc"|"day", budget, status: "pending"|"live"|"rejected"}`.

- [ ] **Step 1:** Tests: Free + 50 items → adding 51st opens upgrade sheet; Pro → allowed; card ₹10,000 with Protect → fee ₹200; unverified business → Promote disabled; new ad starts `pending`.
- [ ] **Step 2–4:** FAIL → implement → PASS (plans + smoke).

### Task 9: Admin console shell, roles, audit log

**Files:**
- Create: `prototype/admin.html` (loads `shared.js`, `tests/runner.js` on `?test=`)
- Test: `prototype/tests/admin-core.test.js`

**Interfaces:**
- Produces: `A = {role, section, sel}`; `ROLES = {"Super admin": [all], "Support agent": ["users","support","disputes"], "Verification officer": ["users","verify","moderation"], "Finance": ["money","billing","disputes"], "Marketing": ["ads","broadcast","reports","features"]}`; `act(kind, target, payload): Action` appends `{id, kind, target, by: role, at, status}` to `state.audit`; `needsApproval(kind)` true for `refund|split|suspend`; `approve(actionId, role)` refuses when `role === action.by` (Super admin included: never approves its own request); otherwise sets `status:"done"` and appends an audit entry.
- Layout: left nav of sections, header role switcher, dense tables; Shade Card tokens; works at desktop and phone width (nav collapses).

- [ ] **Step 1:** Tests: Marketing role nav shows exactly its 4 sections; `act("suspend")` creates `status:"awaiting approval"`; approving with same role throws/refuses; Super admin approves another's request → `"done"` and audit has 2 entries.
- [ ] **Step 2–4:** FAIL → implement → PASS.

### Task 10: Admin sections

**Files:**
- Modify: `prototype/admin.html`
- Test: `prototype/tests/admin-sections.test.js`

**Interfaces:**
- Consumes: `BeasyStore`, `SEED`, `act`, `approve`.
- Produces sections: Users (search phone/GSTIN/name; detail; suspend/unsuspend/re-verify), Verify queue, Support tickets (chat view gated by `ticket.access === true`), Disputes (release/refund/split), Features (override plan limits/flags for a segment or picked list), Billing (subscriptions, failed renewals, coupons), Ads (approve/reject, slot prices), Broadcast (segment AND-filters city/category/plan/B2B-D2C/verified, in-app or push, schedule, delivery report), Money (escrow, payouts, fees by source), Fraud flags, Moderation queue, Reports (sign-ups, active businesses, GMV by city/category), Legal/data requests.

- [ ] **Step 1:** Tests: GSTIN search finds `st`; segment `city=Ludhiana AND plan=Free` count matches seed; ticket without access hides chat; dispute split 60/40 on ₹10,000 → buyer ₹4,000, seller ₹6,000; two-tab sync (Review Focus 2): writing via `BeasyStore.save` fires `subscribe` handler and re-renders.
- [ ] **Step 2–4:** FAIL → implement → PASS. Cut order if over time: Legal/data requests, Reports charts.

### Task 11: App ↔ admin wiring

**Files:**
- Modify: `prototype/index.html`, `prototype/admin.html`
- Test: `prototype/tests/wiring.test.js`

**Interfaces:**
- Consumes: `BeasyStore.subscribe`, `limitFor`, ticket and flag records.

- [ ] **Step 1:** Tests: admin suspends `qd` → app chat shows suspended banner, pay/order buttons disabled, web page order disabled (Review Focus 3); feature override `items: 200` for Free business → 51st product allowed, no upgrade prompt (Review Focus 5); app "Report a problem" → ticket appears in admin Support; admin approves ad → it shows in app Explore, never in chats; admin broadcast to a segment → message appears in matching users' Beasy updates chat only.
- [ ] **Step 2–4:** FAIL → implement → PASS (all suites).

### Task 12: Full verification and publish

- [ ] **Step 1:** Run every suite on both files; expect all `TESTS PASS`.
- [ ] **Step 2:** In the browser pane, walk all 21 guide flows on Android and iPhone frames, light and dark; admin at 1440 px and 375 px. Screenshot any defect, fix, re-run.
- [ ] **Step 3:** Run the impeccable detector on both files; resolve real findings.
- [ ] **Step 4:** Update `DESIGN.md` components (new chips, admin layout) and `.impeccable/design.json`.
- [ ] **Step 5:** Publish to the existing artifact URL `https://claude.ai/artifact/1jdim9VkvVyWJC6NUkT1T5` with `files: {"admin.html": "prototype/admin.html", "shared.js": "prototype/shared.js"}`; open the published admin page and confirm shared state works across the two pages; if not, apply the spec fallback (`index.html#admin`).
