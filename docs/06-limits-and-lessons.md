# 6. Limits and lessons

## What this project is not

- **It was never launched.** It ran on test accounts, and the final page stayed local.
- **It had no real customers.** The client is simulated and all data is synthetic.
- **It wasn't tested on real phones.** Mobile checks used browser viewport emulation.
- **Message appearance is not part of the automated evidence.** Make run logs confirmed that the steps succeeded, but the suite doesn't inspect the delivered Telegram or Gmail messages.

## Known gaps

| Gap | Risk | What I would do for a real launch |
|---|---|---|
| No CAPTCHA | Someone using many addresses could fill the sheet and burn credits | Add Cloudflare Turnstile and verify it in Make |
| Public webhook URL | Anyone can post to it, although it validates and rate-limits | Put a small edge function in front of it |
| Open CORS on the response | Any site can read the `ok` result | Restrict it to the production domain |
| Holidays are hardcoded | New closures need a code and scenario change | Move closed dates to the sheet |
| Rules live in two places | The form and Make could drift apart | Keep one shared validation definition |
| Discounts rely on trust | Anyone can claim a student discount | Check ID at the counter |
| CSP hash is tied to the code | Editing the script breaks the page until it is regenerated | Generate it in a build step |
| Retention isn't defined | Customer details stay in the sheet indefinitely | Agree on a retention period for PIPEDA |

## What I learned

1. **Ask for specifics.** "Prices are wrong" hid a business rule that wasn't in the code.
2. **Fixing the list isn't the same as finishing.** Retesting found holiday, layout and accessibility bugs nobody had reported.
3. **A working demo can still be unsafe.** The first automation worked, and could also have been used to send email from the client's address.
4. **Never trust the browser.** Anything enforced only on the page can be bypassed.
5. **Keep AI on a short leash.** Fixed options, output checks and a human reviewer made a wrong guess cheap.
6. **Design around the client's real fear.** Mike's screenshot dispute led to removing the public calculator, a better fix than making it more accurate.
7. **Report the true state.** "Built and tested" and "live" are different claims.

Back to the [README](../README.md)
