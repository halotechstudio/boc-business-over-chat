# Beasy prototype: full business coverage + admin console

Date: 2026-11-26. Status: draft for approval.

## Intent and why

Beasy's promise: an Indian business of any type and size can run its whole trade over chat, with no other app. The founder built this because juggling many apps, installs, accounts and trackers is painful for SMBs. The current web prototype (`prototype/index.html`, artifact https://claude.ai/artifact/1jdim9VkvVyWJC6NUkT1T5) proves the core chat-commerce loop, but it assumes a product seller paying upfront and shipping by courier. This round makes the simulation cover how trade actually happens across Indian business types and scales, from both the D2C and B2B owner's seat, and adds an admin console for the Beasy team.

The prototype stays a throwaway simulation (synthetic, labelled data). Its job is to show every flow so the Flutter build can be planned from it.

## Goals

1. **Every business type can transact end to end over chat.** Covered archetypes, each with a seeded example business and a guided flow:
   - Retail product seller (existing: Meera buying from the shop).
   - Wholesaler / distributor selling to retailers on credit (B2B).
   - Manufacturer buying raw material and selling in bulk by truck (B2B, purchase side exists).
   - Service business with appointments (salon or clinic): slots, deposit, reminder, mark done, pay.
   - Project / made-to-order work (e.g. interior, printing, caterer): quote with milestones, staged payments.
   - Subscription business (milk, tiffin, laundry): recurring plan, daily/weekly delivery log, monthly bill.
   - Rental (equipment, tent house): dates, security deposit, return and deposit refund.
   - Food / pharma style stock with batch and expiry.
2. **"Just a number" works for a buyer without the app.** A business's number or QR opens a public web page (simulated as a separate "Web page" view inside the guide): trust profile, catalog/services, prices for public buyers, "Chat on Beasy" and "Order" buttons. Ordering from the web page asks only for phone + OTP and creates a personal account.
3. **B2B trade terms work as Indian B2B actually runs:**
   - Credit terms per buyer (advance, on delivery, Net 15/30/60), credit limit, overdue reminders, ageing in khata.
   - Partial payments and advance against order; payment recorded against invoice(s).
   - Buyer-specific price lists (distributor / retailer / public), quantity slabs, minimum order quantity.
   - Tax paperwork: GST invoice (exists), e-invoice IRN toggle for businesses over ₹5 crore turnover, e-way bill for consignments over ₹50,000, credit note / debit note for returns and rate differences, TDS line on B2B invoices.
   - Delivery options: courier (exists), transporter with LR (lorry receipt) number for bulk, own delivery staff with OTP on handover, buyer pickup from shop.
4. **Plans and monetisation visible in the app:** Free / Pro ₹299 / Business ₹999 plans, add-ons (AI assistant ₹149, broadcast credits, e-sign per contract), transaction fees shown on payouts, an upgrade prompt on limits (e.g. 51st product on Free), a "Plan & billing" screen, and a "Promote" flow for verified businesses to buy Explore/search ads.
5. **Admin console (new file `prototype/admin.html`, desktop layout) for the Beasy team:**
   - Users: search by phone / GSTIN / name; profile, verification, orders, disputes; suspend, unsuspend, re-verify.
   - Verification queue for failed automatic checks (GST, Aadhaar, bank).
   - Admin roles and privileges: Super admin, Support agent, Verification officer, Finance, Marketing; each sees only its sections. Audit log of every admin action. Refunds and suspensions need a second approver (maker-checker).
   - Support: ticket inbox from "Report a problem"; agent can view the linked chat only after the user grants access.
   - Disputes on held payments: release / refund / split.
   - Feature controls: per-business or per-segment overrides of plan limits and beta features (e.g. credit terms on for a segment, free Pro trial for a group).
   - Billing: subscriptions, renewals, failed payments, coupons.
   - Ads: review and approve ads, set slot prices, see spend and clicks.
   - Broadcasting: Beasy-to-user announcements by segment (city, category, plan, B2B/D2C) as in-app message or push, scheduling, delivery report.
   - Money: escrow balance, payouts, fee revenue by source.
   - Fraud flags and catalog moderation queue (restricted items such as licensed medicines, alcohol).
   - Reports: sign-ups, active businesses, GMV, by city and category.
   - Legal / data-deletion requests.
6. **The two files share state.** Admin actions show up in the app simulation and vice versa (e.g. suspending a business shows a suspended banner in its chats; switching on credit terms for a business makes them appear in its quote sheet; a "Report a problem" in the app creates a ticket in admin).

## Non-goals

- No real backend, payments, KYC, messaging or logins. Everything is simulated.
- No code reuse into Flutter; this is reference only.
- Not every Indian tax edge case (composition scheme, reverse charge, exports) — mention-only where relevant.
- No marketplace-style browsing as the main experience; Explore stays secondary to chat.

## Anti-goals (would make this a failure even if it works)

- A business type can't finish its deal inside chat and has to "go elsewhere" in the flow.
- Admin feels like a phone app squeezed onto desktop, or the app gets an admin mode.
- Ads appearing inside one-to-one chats.
- Turmeric used for anything other than "you must act" (DESIGN.md rule).
- Data shown as real; every example must read as example data.

## Constraints

- Follow `DESIGN.md` (Shade Card) and `PRODUCT.md`. New document kinds get chips and codes in the same system: e.g. `BKG` booking, `SUB` subscription, `RNT` rental, `CN` credit note, `EWB` e-way bill, `LR` transport receipt, `MS` milestone.
- Admin console uses the same tokens and type, adapted to a dense desktop layout (tables, queues, filters); it does not need OS adaptation.
- Static files only, no build step; published as Artifacts. App keeps its existing URL; admin gets its own.
- Must keep all 12 existing guided flows working.

## Approaches considered

1. Everything in `index.html`, admin as a fourth "View as". One link, but admin cramped in phone frame and file unwieldy.
2. **Chosen:** keep the phone app in `index.html`, add `admin.html` as a desktop console; share state between them in the browser. Proper admin layout; two links.
3. Rebuild into modules first. Cleanest, but a day of rework on throwaway code.

The founder picked 2.

## Decided

- Admin sections, roles, maker-checker and audit log as listed in Goal 5 (founder asked for users, privileges, support, extending services to specific users, ads, broadcasting, "what all things required"; the rest were proposed and accepted).
- Revenue mix: plans + usage add-ons + transaction fees + ads, with the prices above (proposed, founder said "Yes add them").
- Ads only for verified businesses, never inside chats.

## Settled after builder check (my calls, founder to confirm while reading)

1. **State layer.** Today `index.html` keeps state in memory only. Refactor so the state object persists to `localStorage` key `beasy.demo.v3` (try/catch; seed data when empty). Persist everything a user or admin changed; UI-only state (open sheet, scroll) stays in memory. "Reset demo" clears the key in both files.
2. **Origin fallback.** Publish `admin.html` as a second file of the same artifact so both share one origin. If sharing still fails, fall back to one file with a hash route (`index.html#admin`) that renders the desktop console full-window.
3. **Existing flows.** All 12 must still complete. New options (credit terms, delivery types, partial pay) are added with today's behaviour as the default, so old flow steps stay the same unless the viewer picks a new option.
4. **Admin roles in the demo.** A role switcher in the console header (no logins). Maker-checker applies to every refund, split and suspension: one role requests, a different admin must approve; Super admin can approve anything but not its own request.
5. **Pricing.** All prices are monthly and marked "Example pricing" in the UI. Limits: Free 1 user, 50 items, 100 broadcast msgs/month; Pro 5 users, unlimited items, web shop, khata, GST reports, 1,000 msgs; Business 25 users, credit terms, price lists, e-invoice/e-way bill, purchasing, contracts, multi-location, 5,000 msgs. Add-ons: AI ₹149/month, extra broadcasts ₹0.20/msg, e-sign ₹25/contract. Fees: UPI 0%, cards/net banking 1.5%, Beasy Protect +0.5% (seller). Ads: ₹5 per click or ₹199/day per slot.
6. **Phasing.** Build in three passes, each tested before the next: (A) the eight business archetypes and B2B terms in the app; (B) public web page, plans, billing, promote; (C) admin console and shared state. Everything ships together at the end. If time runs short, cut in this order: rental flow detail, legal/data requests section, reports charts.
7. **Web-page order.** After phone + OTP, the order continues in the phone frame as a normal chat with the business (pay, ship, track as today).
8. **Targeting.** Segment filters (city, category, plan, B2B/D2C, verified) combine with AND. A feature override or broadcast targets either a segment or a hand-picked list of businesses.
9. **Backup.** Copy the current file to `prototype/archive/index-v2.html` before any edit; artifact version history is the second backup.

## Left to the builder

- How state is shared (my call: `localStorage` with a `storage` event listener, wrapped in try/catch; both pages render fine without it from seed data). Note: artifacts each have their own origin, so cross-artifact sharing may not work when published separately — publish `admin.html` as a second file of the same artifact so both share one origin, and link between them.
- Exact seed businesses, names and cities (Indian, synthetic, labelled).
- Which archetypes get a full guided flow vs a seeded chat only (my call: all eight listed in Goal 1 get a guided flow).
- Exact layout of admin screens, within the design system.
- How the "Web page" (public profile) is shown in the guide — a third frame mode alongside Android/iPhone.
- Verification: re-run all old and new flows in the browser, both themes, both OS frames, plus admin at desktop width and phone width.
