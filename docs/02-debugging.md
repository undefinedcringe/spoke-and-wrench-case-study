# 2. Debugging the site

Every fix followed the same loop: **reproduce it, find the root cause, make the smallest correct change, and test it again.**

To view the code for a fix, run `git log --oneline` and then `git show <commit>`.

## Round 1: the reported bugs

### Mondays refused, Sundays accepted

**Cause:** JavaScript reads a date-only string as midnight UTC. Toronto is behind UTC, so `getDay()` returned the previous day.

```js
// Before: in Toronto, Monday becomes Sunday
const selectedDay = new Date(dateInput.value).getDay();

// After: the weekday comes from the date itself, in any time zone
function dayValue(dateString) {
  const [year, month, date] = dateString.split('-').map(Number);
  return Date.UTC(year, month - 1, date);
}
new Date(dayValue(dateString)).getUTCDay();
```

### "Open now" after closing

There were three separate bugs on two lines:

```js
// Before
if (day >= 1 && day <= 6) {          // Saturday gets weekday hours
  isOpen = hour >= 9 && hour <= 18;  // 18:59 still counts as open
}                                    // and it uses the visitor's clock

// After
const hours = hoursFor(now.date);    // per-day hours, in Toronto time
const isOpen = !!hours && now.hour >= hours[0] && now.hour < hours[1];
```

The badge also refreshes every minute, so a page left open doesn't go stale.

### Menu disappears on a laptop

**Cause:** the burger button wrote `display: none` directly on the element. Inline styles beat stylesheet rules, so the desktop layout couldn't bring the menu back after resizing.

**Fix:** the button now toggles an `.open` class, and CSS decides what each screen size shows.

### Wrong prices

- Discounts were added together, so 15% + 10% became 25%. The code now uses `Math.max`.
- The promo check was case-sensitive. Input is now trimmed and uppercased first.

### FAQ

**Cause:** `querySelector` returns only the first match, so only one question got a click handler.

**Fix:** use `querySelectorAll`, and open each question's own answer with `nextElementSibling`.

### A bonus security bug

The confirmation message put the customer's name into `innerHTML`, so HTML typed into the name field would run in the page. It now uses `textContent`.

## Round 2: bugs nobody reported

Passing the client's list doesn't mean the site works, so I tested edge cases: blank input, extreme values, narrow screens and holidays.

| Finding | Fix |
|---|---|
| Holidays showed "Open" and could be booked | Blocked Dec 25, Dec 26 and Jan 1 after confirming them with Mike |
| Saturday defaulted to 9:00, before opening | The time list offers only valid slots for that day |
| Past dates could be picked | The date picker has a minimum date |
| A mistyped year such as 2062 was accepted | Bookings are limited to one year ahead |
| A 400-character name stretched the page to about 6,000 px | 80-character limit and text wrapping |
| Menu links hid section titles under the sticky header | `scroll-margin` based on real header height |
| The phone menu stayed open after tapping a link | It closes on navigation |
| The footer said "Training project, level 3" | Removed from the customer-facing page |
| The promo field had no label for screen readers | Added `aria-label` |
| Menu and FAQ didn't announce their state | Added `aria-expanded` |
| Button contrast was 3.0:1 | Darkened to 4.68:1, above the WCAG AA minimum of 4.5:1 |

## A mistake worth recording

I first told the client that bookings never reached him, because this file contains no sending code. Mike then said he gets an email for each booking. The live site must have had something this copy lacked, so **replacing it could have silently stopped his bookings.** The lesson: a local file is not proof of how production works.

Next: [Building the automation](03-automation.md)
