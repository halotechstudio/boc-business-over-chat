---
name: BOC (Business Over Chat)
world: calm-ledger
platform: adaptive
reference: "Northpoint Insurance App Design (V. Alipov, Behance) — structure and palette adopted at the founder's request, 2026-11-26"
colors:
  light:
    jet: "#00262B"
    mint: "#ABFFAE"
    cyan: "#CDE3E6"
    ground: "#F2F1EE"
    card: "#FFFFFF"
    sunk: "#E9EAE6"
    line: "#DADCD6"
    ink: "#0B1F22"
    ink2: "#566366"
    good: "#1E7A47"
    amber: "#A86A12"
    bad: "#B3261E"
  data: ["#6FA3D6", "#F0D46A", "#C9B48F", "#7FCB8A", "#B9B1E8", "#E9A98B"]
typography:
  ui: "Inter 300/400/500, one family; tabular figures on"
  numbers: "Inter 300 at display sizes; money is the largest thing on a screen"
radius: { all: 3 }
---

# BOC design system: Calm Ledger

Replaces the earlier Shade Card world. The founder asked for the Northpoint reference's structure as-is; BOC keeps its own content, flows and name.

## Idea

Calm over clever. A deep teal-black brand colour, one mint accent, light type, and 1px hairlines instead of boxes and shadows. The business's money reads at a glance: a big light total, a category treemap, a health score, and a strip of what is due.

## Colour rules

- **Mint (`#ABFFAE`) means "the next action".** Primary buttons, the document head when the viewer must act (pay, sign, approve, ship, confirm), the active nav item, counts of things waiting. Nothing decorative is mint.
- **Jet (`#00262B`)** is the brand surface: bottom bar, admin sidebar, the health score card, selected filters, secondary-primary buttons.
- **Light cyan (`#CDE3E6`)** is the soft surface: own chat bubbles, verified banners, notes.
- **Status lives in text colour, not filled badges:** green done/paid/verified, amber in progress/waiting on the other side, red overdue/unverified/problem.
- **Data colours** (blue, yellow, sand, green, lilac, peach) appear only in the treemap and charts.
- No gradients, glass or glow. Shadows only on the phone frame in the demo page.

## Type

- Inter throughout. Hierarchy from size, not weight: titles 32px/300, money totals 40px/300, card amounts 20–22px/300, labels 12px grey above their value.
- Document codes in Inter 500 with a space (`INV 0148`). Indian digit grouping (`₹1,14,975`).

## Structure

- **Hairline grid:** rows, table cells, document card sections and tool tiles are separated by 1px lines; tiles share borders.
- **Corners:** 10px buttons and inputs, 14px cards and lists, 20px sheet tops, round avatars and counts, pill-shaped filters and labels. Hairline tiles inside a card stay square.
- **Business home:** large title + AI assistant pill → tabs (Sales, Purchases, Team) → year total → category treemap → Add product / My orders → health score card (grade, what's left, mint CTA) → Money due (date strip + list grouped by collect/pay) → analytics tiles → problems list → all tools.
- **Document card:** head row (code left, status right in text colour; mint fill when the viewer must act) → kind label → line items on hairlines → large light total → action row split by hairlines, primary action mint.
- **Bottom bar:** jet, five items, active item mint with a 2px top indicator.
- **Admin console:** jet sidebar with mint active marker, light title 32px, hairline tables with a dark header rule, KPI tiles with large light figures, status as coloured text.

## Light only

BOC ships one light theme. No dark mode (founder's call, 2026-11-26).

## Contacts, labels and CRM

- Labels are coloured pills (11% tint of the label colour, text in the colour) on chat rows, the chat header and the contact record. Users create, recolour and delete labels.
- Chat filters include every label in use plus Follow up.
- Contact record: stage (Lead, Talking, Quoted, Won, Repeat, Lost), labels, bought so far, owes you, credit terms, follow-up date, team notes, documents.
- Contacts board: stage counts, label filter, broadcast to a label.
- "Waiting on you" on Chats is a dark card with readable rows (action, party, code, amount), not cut-off chips.

## Platform adaptation

Android and iOS keep their own navigation conventions (Material bar vs iOS tab bar, back arrow vs chevron, snackbar vs top banner) inside the same colour and hairline system.

## Voice

Plain, short, specific. Controls name the action ("Pay balance ₹640", "Book pickup", "Open what's waiting"). Example data is labelled as example data.

## Ledger layer (2026-11-26, from the Ledgerix reference by Rondesignlab)

Applied on top of the structure above at the founder's request; where they differ, this wins.

- Tokens: ground #EFEFF1, cards #FFFFFF with 16px corners and a soft shadow instead of borders, ink #111214, secondary #75767C, active = near-black #111214, action/growth = neon green #7DF18A, red #E5484D.
- Type: Urbanist (geometric). Screen titles 28px/600; hero figures 36-40px/500, centred; card and group titles 11px uppercase, 0.08em tracking.
- Tabs: text with a black underline. Filters: white pills, black when on.
- Icons sit in 12px-radius grey squares; the main action's square is green.
- Bottom bar floats (white, 20px radius), icon in a square, active square black, small label kept for clarity (elevation over the reference's icon-only bar).
- Dark AI bar "Ask anything or search" with suggestion chips above the bottom bar on owner Chats, Pending and Business; answers come from the business's own chats, invoices and stock.
- Business home: centred year total, then a dense grey bar chart with a black trend line and a floating value card with a green growth pill.
- Score card stays black with a green gauge ring around the grade.
- Admin console: same tokens; sidebar on the ground colour with a black active pill.