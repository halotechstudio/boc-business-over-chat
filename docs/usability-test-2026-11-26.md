# BOC usability test: Indian SMB personas

Date: 2026-11-26. Build: live prototype (halotechstudio.github.io/boc-business-over-chat), phone size 375×812.
Method: persona walkthroughs in a real browser, every finding seen on screen or measured in the page.

## Personas

| Persona | Who | Phone and habits | Main jobs |
|---|---|---|---|
| Ramesh, 52 | Textile shop owner, Coimbatore | Budget Android, WhatsApp only, Tamil first, reads English slowly | Reply to walk-in leads, send a bill, get paid |
| Sunil, 45 | Hosiery wholesaler, Ludhiana | Uses Tally, Hindi first, sells on credit | Chase dues, take bulk orders, give credit carefully |
| Priya, 29 | Instagram skincare seller | iPhone, fast, impatient | Add products, post statuses, broadcast |
| Meera, 34 | Shopper, Kochi | Scam-wary, pays by UPI | Buy safely, know who she's paying |

## Results

| Task | Persona | Result |
|---|---|---|
| Understand the home screen | Ramesh | Partial: chats pushed below the fold, unlabelled icons |
| Message an unsaved number | Ramesh | Partial: leading 0 rejected, Enter does nothing |
| Send a bill from a chat | Ramesh | **Failed**: Invoice does nothing from the paperclip menu |
| Find who owes money | Sunil | Passed |
| Chase an overdue buyer | Sunil | Passed: reminder, part payment, credit note in the card |
| Turn a chat request into an order | Sunil | Failed: no way, re-enter by hand |
| Add a product | Priya | Partial: sample prices look real, textile-only categories |
| Buy from a status | Meera | Passed, but final price is a surprise |

## Critical (blocks the job)

1. **Bills, quotes and payment requests can't be sent from a chat.** The paperclip's "Quote, invoice, order" opens the document menu without the chat, so Invoice, Quote, Payment request, Purchase order and Contract do nothing. Fix: pass the chat id when opening the menu.
2. **Only English.** No Hindi, Tamil, Telugu, Marathi, Bengali or Gujarati. For Ramesh and Sunil this alone stops adoption. Fix: language choice at sign-up and in More, with Indian-language number and date formats; voice notes already exist, so voice-to-text in Indian languages is the next lever.
3. **Shopper prices exclude GST.** The product says ₹18,500, the Pay button says ₹19,503. Consumer prices in India must be MRP inclusive of taxes. Fix: show tax-inclusive prices to shoppers and a price breakdown above the Pay button.

## Major (high frustration)

4. **Leading 0 or spaces rejected in phone numbers.** "098430 12345" fails. Fix: strip a leading 0 and +91, accept spaces and dashes; let people pick from their phone contacts.
5. **Chats are below the fold.** Statuses, "Waiting on you" and filters push the list down to two visible chats. WhatsApp users expect chats first. Fix: collapse "Waiting on you" into one line ("8 things need you ›"), keep statuses to one slim row.
6. **The bill is buried two menus deep** under the 8th tile. Fix: put "Bill" as the first tile in the paperclip menu and add a "Bill" quick action above the keyboard; call it Bill, not Invoice, in the shopper-facing UI.
7. **The invoice builder doesn't fit real shops.** No search, no custom line ("Stitching ₹450"), no typing a quantity, no editing price after bargaining. Fix: search box, "Add item by hand", tap a number to type it, editable line price.
8. **No "make this an order" from a chat message.** Sunil's buyer typed "60 dupattas and 12 kurta sets". Fix: long-press a message → "Create order", with the assistant pre-filling items from the text.
9. **Text too small and tap targets too small.** 15 text elements are 9.6–11px on Chats; filter chips are 34px tall. Fix: 13px minimum for secondary text, 15–16px body, 44–48px targets; respect the phone's font size.
10. **Unlabelled header icons.** The green sparkle and the people icon say nothing; the people icon sits on its own row below. Fix: label them ("Ask", "Contacts") or move Contacts into the filter row.

## Minor

11. Names in chat headers truncate ("Lakshmi Sil…", "+91 98430 1…") because of three icon buttons; move call buttons into the menu on narrow screens.
12. The "Not in your contacts" banner says "messages come straight in" even when you started the chat, and stays after a sale; shrink it to one line after the first message.
13. The message dots cover card statuses ("Payment rece…").
14. Customer chats offer "Purchase order" and "Ask suppliers"; show only what fits the chat type.
15. Add product: sample prices look like real values; categories are fixed to textiles; HSN needs a one-line explanation or auto-pick.
16. Pending lists the overdue payment fourth; sort by urgency and add a one-tap "Remind" on each row.
17. Shoppers can't change the delivery address in the order sheet.
18. "Advance / Net 15 / Net 30" is jargon at a shop counter; say "Pay now", "Pay in 15 days", "Pay in 30 days".

## What works well

- "Waiting on you" and Pending make the day's work obvious.
- Credit tools on the invoice card (reminder, part payment, cash, credit note) match how wholesale works.
- Labels like "Pays late" and the CRM record fit how owners remember customers.
- Buying from a status is fast, and the order sheet is clear about delivery and payment options.
- Payment copy is honest now: money goes straight to the seller.

## Gaps for the Indian SMB reality (not tested on screen)

- **Offline and patchy 4G:** no offline drafts or queued sends visible.
- **Low-end phones:** heavy shadows and many layers; measure on a ₹8,000 Android.
- **Shared phones and staff:** no PIN or app lock for the owner's money screens.
- **Printing:** no thermal-printer or PDF share for counter bills.
- **Cash and UPI at the counter:** no quick "cash received" bill without a customer chat.

## Fix order

| Priority | Fix | Personas |
|---|---|---|
| P0 | Send bill/quote/payment request from the paperclip | All sellers |
| P0 | GST-inclusive shopper prices with a breakdown | Meera |
| P0 | Indian languages | Ramesh, Sunil |
| P1 | Phone number formats and contact picker | Ramesh |
| P1 | Chats above the fold; "Bill" first in the menu | Ramesh |
| P1 | Invoice builder: search, custom line, typed qty, edit price | Ramesh, Sunil |
| P1 | Bigger text and targets | Ramesh |
| P2 | Create order from a message | Sunil |
| P2 | Header labels and truncation | All |
| P3 | Minor items 12–18 | Various |
