# 4. Security and testing

Once the form was connected, its webhook URL became public in the page source. So I treated the webhook as an internet-facing API and tried to abuse it.

## What the first attack round found

| Severity | Problem | Impact |
|---|---|---|
| High | Anyone could choose the email recipient, with no limit | Mike's Gmail could send phishing text to strangers |
| High | The webhook accepted GET requests | A hidden image on any website could create bookings |
| High | One oversized field stopped the run halfway | Row saved, but no alert or customer email |
| High | The server barely validated input | Blank or malformed values passed |
| Medium | Failed runs weren't handled | Half-finished bookings and duplicates on retry |
| Medium | AI labelled a cracked fork "not a bicycle" | A safety issue got no warning |
| Medium | AI rejected a flat tire on an e-bike | Lost a job the shop can do |
| Low | Public calculator showed totals | The screenshot dispute Mike wanted to avoid |
| Low | No privacy notice | Customers weren't told who processes their data |

Injection through the name field, spreadsheet formulas, email header injection and five AI manipulation attempts were all blocked at this stage.

## The fixes

### Stop the workflow being used to send spam

- The confirmation contains **no customer-written text**, so an attacker can't place a message in it.
- Each address gets at most one email per hour, and the scenario sends at most 60 a day.
- If a limit is hit, the booking is still saved and Mike is told no email went out.

### Validate on the server

The Make filter accepts only POST and checks every field by type, length and format. It also confirms that the date is real, the shop is open and the time is in range. The form uses the same patterns, so customers get immediate feedback.

Values starting with `=`, `+`, `-` or `@` are neutralized before reaching the sheet, which prevents **spreadsheet formula injection**.

### Keep going when a service fails

Each external step has its own error handler. If Telegram fails, the email can still send. If the sheet fails, Mike's alert begins with `NOT SAVED TO SHEET`. Customers are asked to retry only if nothing was saved, which avoids duplicates.

### Lock down the page

The page uses a strict **Content Security Policy**:

- `default-src 'none'` blocks everything unless it's explicitly allowed.
- Script and style are allowed only by their exact SHA-256 hash.
- Network requests can go only to the Make webhook domain.

Because of those hashes, any edit to the inline JavaScript requires a new hash. `scripts/set-webhook.mjs` handles this when the webhook changes.

## How it was tested

| Layer | Method | Result | Can you rerun it? |
|---|---|---|---|
| Page behaviour | Browser tests with a simulated clock and mocked webhook | 12/12 bugs reproduced on the old page, 17/17 checks pass on the new one | **Yes**, `npm test` |
| Layouts | Browser runs at 320, 375, 768 and 1280 px, in Toronto and European time zones | Passed | Not included |
| Webhook abuse | 28 hostile requests sent to the scenario | All rejected | Needs a live scenario |
| Failure handling | Forced each outside service to fail in a temporary copy | Handled | Needs a live scenario |
| AI behaviour | Mike's samples, previously failed cases and manipulation attempts | Passed after prompt fixes | Needs a live scenario |
| End to end | A real browser submission through to the sheet | Passed | Needs your own accounts |

The live-scenario results come from the original working session. Those scripts targeted a private webhook, so they aren't included in this repository.

Hostile traffic was sent to a temporary dry-run copy where it could otherwise have emailed someone, and all emails went to test inboxes.

Next: [Tools](05-tools.md)
