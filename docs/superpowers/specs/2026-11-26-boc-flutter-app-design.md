# BOC Flutter app: design

Date: 2026-11-26. Status: draft for approval.

## Intent and why

BOC (Business Over Chat) is one app where Indian small businesses run their whole trade inside chats: talk to customers and suppliers (saved or not), send bills, get paid straight into their own account, ship, track who owes what, and keep the relationship history in one place. The founder built it because juggling many apps, installs and accounts was painful. The web prototype (`prototype/`, live at halotechstudio.github.io/boc-business-over-chat) proved the flows with simulated data and a usability test with Indian SMB personas. This project turns it into a real app on Google Play and the App Store, backed by real accounts, messages and money records.

Product context: `PRODUCT.md`. Design system: `DESIGN.md` (Ledger layer wins). Usability findings to honour: `docs/usability-test-2026-11-26.md`.

## Goals (Release 1)

1. **Phone sign-up and login** with OTP. Personal accounts for buyers; business accounts for sellers, with owner + staff.
2. **Chats like WhatsApp Business:** one-to-one chats with any phone number, saved or not; groups; text, photo, document, location, contact card, voice note, poll; reply, react, forward, star, edit (15 min), delete for me / everyone (1 h); read ticks; search in chat; mute, pin (3), archive, mark unread; block and report. Real-time delivery and push notifications.
3. **Business documents in chat:** product cards, quotes, bills (GST invoices), payment requests, orders, with the bill builder from the prototype (search, typed quantity, editable price, hand-typed items, counter bill for walk-ins, share as PDF).
4. **Payments straight to the seller:** UPI intent / UPI QR to the seller's own UPI ID, cash and part payments recorded, reminders. BOC never holds money and takes no cut.
5. **Catalog:** products with photos, categories (own categories allowed), shopper price shown GST-inclusive, wholesale price for business buyers.
6. **Contacts and CRM:** labels, stages, follow-ups, notes, dues per contact, filters by label.
7. **Statuses** that buyers can order or book from, visible 24 hours.
8. **Reviews** from verified buyers only, moderated by BOC before they show; business rating on profiles.
9. **Languages:** English, Hindi, Tamil for the whole app UI (not only buttons).
10. **App lock** with PIN/biometrics for money screens; offline reading and queued sending.
11. **BOC admin console (web)** for the BOC team: business verification queue, reported chats, review moderation, user suspension with a second approver, audit log.
12. **Plans and billing screens** with the Shopify-style plans in `PRODUCT.md` (Thela ₹99, Dukaan ₹399, Showroom ₹999, Mandi ₹2,499, Empire custom), 14-day trial; plan limits enforced (staff seats, broadcasts, AI replies, locations).

## Later releases (not Release 1)

- **Release 2:** connections to payment gateways (Razorpay, Cashfree, PhonePe PG via partner OAuth), couriers (Shiprocket, Delhivery), accounting (Tally, Zoho Books); credit terms with limits and ageing; purchasing (RFQ, compare, purchase orders, supplier bills); contracts with e-sign; AI assistant (Claude via a server function) and "make a bill from this message"; broadcasts; automated GSTIN and bank verification; ads in Explore.
- **Release 3:** e-invoice IRN and e-way bills; services, subscriptions, rentals, batch/expiry stock; multiple locations; Empire dealer networks; API and webhooks; web shop page per business; app store revenue share.

## Non-goals

- No escrow: BOC never holds or moves buyers' money.
- No marketplace-first experience; Explore stays secondary to chats.
- No end-to-end encryption for business documents (the server must read bills to compute dues and reports). Personal-only chats may get E2E later.
- Not a replacement for full accounting software; BOC syncs with it (Release 2).

## Anti-goals (would make it a failure even if it works)

- A seller can't send a bill and get paid within two minutes of first opening the app.
- Messages are slow or unreliable on patchy 4G and ₹8,000 Android phones.
- Older shop owners can't use it because text is small, English-only, or jargon-heavy.
- Monthly cloud cost grows faster than paying businesses.

## Constraints

- **Platforms:** Android first (most Indian SMBs), iOS in the same codebase. iOS builds and App Store uploads need macOS: use a cloud Mac CI (Codemagic or GitHub Actions macOS runners). The founder's machine is Windows.
- **Flutter 3.47** (installed at `D:\flutter`). Minimum Android 8 (API 26); iOS 15.
- **Backend: Supabase** (decided by the founder), region Mumbai (ap-south-1). Free tier for development; Pro (~$25/month) at launch.
- **India rules:** phone OTP via an Indian SMS provider registered on DLT (MSG91 or similar); GST invoice fields (GSTIN, HSN, place of supply, CGST/SGST vs IGST); prices to consumers shown tax-inclusive; DPDP Act 2023 consent and data deletion.
- **Design:** `DESIGN.md` Ledger tokens (Urbanist, #111214 active, #7DF18A action, white 16px cards on #EFEFF1), light theme only, Material on Android and Cupertino conventions on iOS, 48dp/44pt targets, 13px minimum secondary text, respect system font size.

## Approaches considered (backend)

1. **Supabase — chosen.** Postgres suits bills, ledgers and reports; Realtime, Auth, Storage and Edge Functions built in; Mumbai region; flat pricing. Trade-off: very large chat scale would later move delivery to a dedicated service.
2. Firebase: easiest chat and offline, but reports and ledgers are awkward and per-read billing is risky for a chat app.
3. Own server: full control, months slower, needs a backend developer.

## Decided (by the founder)

- Supabase backend.
- No escrow; payments go to the seller's own UPI/gateway; BOC takes no cut.
- Plans and pricing as in `PRODUCT.md`.
- Reviews: verified buyers only, BOC moderates, low ratings go to the seller first.
- Light theme only; Ledger look; English, Hindi, Tamil.
- Chat with unsaved numbers; full WhatsApp Business chat features.

## The how (builder's calls, stated so they can be corrected)

- **Repo layout:** `app/` (Flutter app, Android + iOS), `admin/` (Flutter web admin console), `supabase/` (SQL migrations, RLS policies, Edge Functions, seed), existing `prototype/` kept as reference.
- **App architecture:** feature-first folders (`auth`, `chats`, `documents`, `catalog`, `contacts`, `status`, `reviews`, `settings`); Riverpod for state; go_router for navigation; `supabase_flutter` client; a local SQLite cache (drift) for chats, messages, drafts and an outbox so the app opens instantly and sends when back online.
- **Data model (Postgres):** `profiles`, `businesses`, `business_members` (role), `contacts` (per business: phone, optional name, labels, stage, follow-up, notes), `chats` + `chat_members` (direct and group), `messages` (type, payload jsonb, reply_to, edited_at, deleted_for_all, reactions table, receipts table), `documents` (kind, items jsonb, totals, tax split, status, due), `payments` (method, amount, reference/UTR, recorded_by), `products`, `statuses` (expires_at), `reviews` (status: pending, with_seller, seller_replied, published, rejected), `reports`, `admin_actions` (maker-checker), `plans`/`subscriptions`.
- **Security:** Row Level Security on every table; a business member sees only their business's chats and documents; buyers see only chats they're in; admin access via a separate role checked server-side.
- **Real-time and push:** Supabase Realtime on `messages`, `receipts`, `documents`; Firebase Cloud Messaging for push on Android and iOS (APNs through FCM), sent by an Edge Function on new messages.
- **Payments (Release 1):** UPI intent link / QR generated from the seller's verified UPI ID and amount; the buyer pays in their UPI app; the seller confirms receipt (or the buyer enters the UTR). Cash and part payments recorded on the bill.
- **PDF bills:** generated on device (`pdf` package), shared through the system share sheet; Bluetooth thermal printing via ESC/POS in a later minor release.
- **i18n:** Flutter `gen_l10n` with ARB files for en, hi, ta; Indian number grouping via `intl`.
- **Testing:** unit tests for money, tax and parsing logic; widget tests for key screens; integration tests against a local Supabase (CLI + Docker) for RLS and chat flows; manual pass on a budget Android phone before each release.
- **Release:** Android internal testing track first, then closed testing with 20+ real shops (Play requires it for new personal developer accounts), then production; iOS TestFlight via cloud Mac CI.

## Keep it small (ponytail pass)

Release 1 uses what Supabase and Flutter already give before writing anything new:

- **Admin console:** Release 1 uses Supabase Studio (table editor, saved SQL queries and views) for verification, reports and review moderation, plus two SQL functions for maker-checker actions. A custom admin web app moves to Release 2. Saves a whole second app.
- **Offline:** no drift database. `supabase_flutter` keeps the session; the last 50 messages per chat and the outbox are cached as JSON with `shared_preferences`. `shortcut: small cache, move to drift when chats exceed a few hundred per business.`
- **Plan billing:** Release 1 runs everyone on the 14-day trial plus a manual "paid" flag set in Studio; limits (staff seats, broadcasts) are enforced from that flag. Automated subscription charging (Razorpay Subscriptions) moves to Release 2.
- **PDF bills:** the `printing` package's share sheet only; no custom renderer.
- **Push:** one Edge Function on message insert calling FCM; no notification preferences screen beyond mute.
- **Search in chat:** Postgres `ilike` on the open chat's messages; no full-text index until it's slow.
- **Polls, location, contact cards:** stored as `messages.payload` JSON; no extra tables.
- **Not built at all in Release 1:** explore ads, AI assistant, broadcasts, credit limits, purchasing, contracts, statuses' "seen by" list.

## Settled after the builder check (builder's calls unless noted)

- **"Keep it small" wins over the goal list** where they differ: Studio instead of an admin app, JSON outbox instead of drift, and only staff seats enforced among plan limits in Release 1.
- **Accounts (from the prototype):** one phone number holds a personal account and any businesses its owner runs, with a switcher. Owners invite staff by phone number; roles are Owner and Staff (Staff can't change prices beyond discount rules, see money screens, or edit the business). A business's customer chats are a shared inbox; each chat can be assigned to one staff member. Customers see the business name, with the staff member's first name on their messages.
- **Verified means:** a *verified buyer* holds a bill from that seller marked paid (or an order marked delivered); a *verified business* has been approved by the BOC team in Studio after checking the GSTIN or Udyam number and a cancelled cheque or bank statement; a *UPI ID* is accepted as entered, and payment QR codes show the business's verification state next to them.
- **Payments ledger:** the seller's confirmation is the source of truth for dues; a buyer's UTR is shown to the seller as a claim to confirm. `payments` rows are append-only; mistakes are fixed with a reversal row, never by editing; the same UTR can't be recorded twice for one business.
- **GST:** businesses without a GSTIN or on the composition scheme issue a *bill of supply* (no tax lines); registered businesses issue tax invoices with CGST+SGST or IGST by place of supply. Numbering is automatic per business per financial year (`INV/2026-27/0001`). A sent bill can't be edited; it is cancelled with a credit note and reissued.
- **Store billing:** BOC plans are sold on the BOC website, not in the app (as Shopify does); the app shows the current plan and limits but has no purchase buttons, which keeps it outside Play Billing and Apple in-app purchase rules for Release 1.
- **Data deletion (DPDP):** on account deletion, profile, chat text and media are erased; bills, payments and their parties' names are kept for 8 years as GST law requires, then purged.
- **Media:** photos compressed to 1600px JPEG, voice notes up to 5 minutes, documents up to 10 MB, 2 GB of storage per business before older media is moved to cold storage; stickers and video calls are out of Release 1.

## Decided by the founder after the builder check

- **Unregistered numbers get an SMS invite.** Messages to a number not on BOC are stored against that phone number. The recipient gets one SMS per sender ("<Business> sent you a message on BOC: boc.in/c/<token>"), sent through a DLT-registered Indian SMS provider. The link opens a lightweight web reply page (part of Release 1) where they read and reply without installing; when that number signs up, the chat moves to their account. `chat_members` therefore keys on user id **or** phone number. Cost: about ₹0.15–0.25 per first message to a new number.
- **The first shop trial waits for all of Release 1.** All 12 goals ship before the 20-shop closed test, including Hindi and Tamil, statuses, groups, polls and reviews. Build order stays: login → bill and get paid in two minutes → chats → catalog and CRM → languages → statuses, groups, polls, reviews.

## Open (left to the builder)

- Exact table columns, indexes and RLS policy text.
- Choice of SMS provider and push payload shape.
- Screen-level layouts beyond the prototype and `DESIGN.md`.
- Cache eviction and media compression settings.
