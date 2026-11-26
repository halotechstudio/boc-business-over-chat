# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

- Production app: Flutter, shipped to Google Play and the Apple App Store, adapting conventions per OS (Material on Android, iOS conventions on iPhone).
- Current artifact: a static HTML/CSS/JS web simulation (`prototype/index.html`) that shows every feature and flow before the Flutter build starts. Throwaway by design.

## Users

Indian small and medium businesses: shop owners, wholesalers, small D2C brands and their teams of roughly 2–10 staff (sales, accounts, warehouse). They run the business from a phone, in between serving customers, calling suppliers and moving stock. Both sides of a trade use it: businesses selling to consumers (D2C) and businesses buying and selling with each other (B2B).

## Product Purpose

Beasy replaces the pile of separate apps a small business juggles (chat, billing, payments, stock, contracts, supplier ordering) with one chat-based app. One account, one place, one history: every quote, order, invoice, payment, purchase order and contract lives as a card inside the conversation with that customer or supplier. Success is an owner who no longer switches apps, creates accounts per tool, or loses track of what was agreed where.

## Positioning

The conversation is the business record. Unlike WhatsApp Business (chat plus a catalog) or separate billing/ERP apps, Beasy turns each chat into the live ledger of the relationship: documents are created, approved, signed, paid and fulfilled inside the thread, and a single Pending view gathers everything waiting on the owner across all chats.

## Operating Context

- Money in Indian rupees with lakh grouping; GST invoices with GSTIN and HSN codes; UPI and bank transfer payments; khata (running party balances); credit terms such as Net 15 / Net 30.
- Sell flow: product → order → invoice → payment → courier pickup → delivery.
- Wholesale flow: quote with discount and credit terms → acceptance → order + invoice.
- Buy flow: low stock → request for quotes to several suppliers → compare → purchase order → goods received (stock up) → supplier bill → pay.
- Contracts from templates, signed by both parties in the chat, with a document fingerprint.
- Team: shared inbox, chat assignment, roles, approval rules (e.g. discounts above 10%, purchase orders above ₹50,000 need the owner).
- Automations: greeting, away message, quick replies (`/`), AI-drafted replies the owner approves, payment reminders, low-stock reorder suggestions; opt-in broadcasts with results; a directory of GST-verified businesses.
- Demo business in the prototype: Shree Textiles, a Coimbatore fabric wholesaler that also sells sarees to shoppers (synthetic data).

## Capabilities and Constraints

- The web prototype simulates the counterparty (customers, buyers, suppliers reply automatically); payments, signatures and the server are simulated.
- Reverse-engineering notes on WhatsApp Business internals exist for reference (memory: wa-business-re-findings); Beasy must not copy WhatsApp's name, branding or look.
- Undecided: logo, final visual identity, languages beyond English (Hindi/regional likely later), backend architecture, payment and e-sign providers.

## Brand Commitments

- Name: **Beasy** (replaces the working name "Kaarobar").
- No logo, colours or typefaces are fixed yet.

## Evidence on Hand

- No real customers, testimonials, metrics or pricing exist. All business data in the prototype is synthetic and must stay labelled as example data.

## Product Principles

1. The chat is the record: every business action produces a card in the thread it belongs to.
2. One app, one account: no feature should send the user to another app or sign-up.
3. Show what is waiting: anything needing the owner surfaces in Pending without hunting.
4. Built for a busy phone user: one-handed, interruptible, fast to scan.
5. Indian business reality first: GST, UPI, khata, credit terms are native, not bolted on.


## Payments model (decided 2026-11-26)

BOC does not hold money or sit between buyer and seller. Buyers pay the business directly through the business's own UPI ID or payment gateway (Razorpay, Cashfree, PhonePe PG, Paytm, PayU), connected under Connections. BOC takes no cut of sales. Complaints are mediated by BOC; refunds come from the seller. Revenue model (Shopify-style, decided 2026-11-26): every plan has everything needed to sell; tiers scale by staff, locations and volume. Starter ₹99/month (sell in chats and statuses), Basic ₹399 (web shop page, CRM, all apps, 2 staff), Grow ₹999 (5 staff, credit and purchasing, 2 locations), Advanced ₹2,499 (15 staff, 5 locations, e-invoice, API), Plus from ₹15,000 (brands and distributors with dealer networks). Yearly saves 25%. 14-day free trial, then ₹49/month for the first 3 months. Add-ons: staff seats, broadcasts, AI replies, e-sign. Other income: an app store for third-party connections (revenue share on app subscriptions), ads in Explore and search, partner referrals. BOC takes no cut of sales. Customers (buyers) never pay.
