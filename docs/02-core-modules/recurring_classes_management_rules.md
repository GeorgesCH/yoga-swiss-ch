# Recurring Classes — Management Rules (Classes & Schedule)

A concise, implementation‑ready guide to creating, editing, and canceling recurring classes while preserving data integrity and a great client experience.

---

## Core model
- A **Series (master)** stores the recurrence rule (RRULE) and defaults.
- **Occurrences** are generated instances (single dates). Each can become an **exception**.
- Edit scope options on every change:
  1) **Only this occurrence**
  2) **This and following** (splits the series at the cutover)
  3) **Entire series (all future)**
- **Past occurrences are never deleted.** Future ones are canceled (kept for audit) or hard‑deleted only if **no registrations** and **no payments**.

---

## Cancel scenarios
- **Single date** → set status `canceled`, notify attendees, apply **studio‑initiated** policy (no penalties).
- **Date range** (e.g., sick week) → bulk select dates → cancel all in range; same notifications & policy.
- **Cancel rest of series** → shorten series **end date**:
  - No registrations → hard‑delete generated future occurrences.
  - With registrations → mark canceled, auto‑notify, auto‑refund/credit per policy.

---

## Edit scenarios
- **Time / room / teacher change**
  - *Only this* → update just that occurrence.
  - *This and following* → **split series** at cutover; old series retains history, new series carries new settings.
  - *Entire series (all future)* →
    - Unbooked occurrences: update directly.
    - Booked occurrences: choose per occurrence or in bulk:
      1) **Move attendees** to the new time (capacity check; overflow → waitlist or credit)
      2) **Keep & cancel** those dates (notify + refund/credit)
      3) **Convert to exception** (keep original time only for those specific dates)

- **Capacity change**
  - Increase → immediate.
  - Decrease → if overbooked, show affected bookings (latest first) and choose: **auto‑move**, **compensate**, or **preserve higher capacity for those dates only**.

---

## Change recurrence days (e.g., Mon+Tue → Mon only)
- Stop generating removed weekdays going forward.
- For already generated future **Tuesdays**:
  - 0 registrations → hard‑delete.
  - Has registrations → mark canceled, notify, and choose default resolution:
    - **Move to Monday** same week if seats exist (preserve seats when spot selection enabled)
    - **Credit/refund**
    - **Let client choose** via rebook link
- **Past** dates are never modified.

---

## Clients already registered
- **Studio‑initiated change policy (default)**
  - No client penalties (ignore late/no‑show fees).
  - Offer one‑click **rebook**, **wallet credit**, or **refund to original** (credit preferred if enabled).
  - On move: send updated calendar invite + push/email.
  - If no response by deadline → auto‑credit.

---

## Waitlist handling
- When canceling/moving, process waitlist on the **target** occurrence (if moving) or release seats to inventory and run auto‑promote rules.
- If target lacks capacity, remaining clients stay **waitlisted** and receive credit.

---

## Communications & safety rails
- **Impact Preview** shown before bulk changes: occurrences affected, attendees impacted, revenue at risk.
- Messages:
  - **Cancellation** notice with reason + chosen resolution
  - **Move** notice with new time/location and refreshed ICS
  - **Push** notification on mobile
- Safety:
  - Never delete an occurrence with payments; **cancel** instead.
  - When applying *This and following*, always **split the series** to preserve audit/reporting.
  - With **spot selection**, preserve seat assignments when auto‑moving; otherwise prompt for reseat.

---

## UI quick actions
- Calendar/roster • **Edit**: This occurrence / This and following / Entire series.
- **Change days** panel: uncheck weekday(s) → select cutover date → see counts → choose move/credit/refund behavior.
- **Bulk cancel**: date range + reason + resolution.
- **Export**: CSV of affected clients before commit.

---

## Edge cases
- **Teacher only** change → keep bookings, just notify.
- **Hybrid** classes → in‑person and online legs updated independently; links/timezones handled.
- **Holidays** → add **skip dates**; generator omits them.
- **Shorten series** → same rules as “cancel rest of series”.

---

## Acceptance criteria
- Any bulk change shows an impact preview **before** saving.
- Past data remains untouched; future unaffected dates update instantly.
- Attendee state (booked/waitlist/paid) remains consistent across web, mobile, and calendar invites.
- Waitlist auto‑promotion runs within **60 seconds** when seats are freed.
- Moves respect capacity and seat maps (when enabled).

