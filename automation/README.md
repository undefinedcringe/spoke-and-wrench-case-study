# Automation setup

`make-blueprint.sanitized.json` is an export of the Make scenario with private values replaced by `REPLACE_ME`. The webhook, connections, data stores, spreadsheet and Telegram chat must be set up again after import.

I haven't tested importing this sanitized copy into a fresh Make account, so expect to reselect each connection.

## What you need

- A Make account. Each booking uses about 11.4 credits.
- A Google account for Sheets and Gmail. **Use a test account**, because Make's Gmail connection has broad mailbox access.
- A Telegram bot from `@BotFather`, and your chat ID.

## Steps

1. Create a Google Sheet with these columns: `Date received`, `Name`, `Phone`, `Email`, `Bike issue`, `Service`, `Price`, `Status`.
2. In Make, create a new scenario and choose **Import Blueprint**.
3. Create two Data Stores:
   - Email limit, with a `last_sent` number field.
   - Daily count, with a `count` number field.
4. Open each module marked as needing setup and select your webhook, connection, data store, sheet or chat ID.
5. Copy the webhook URL and add it to a **private copy** of the page:

   ```bash
   cp site/index.html /tmp/my-site.html
   node scripts/set-webhook.mjs https://hook.eu1.make.com/YOUR_ID /tmp/my-site.html
   ```

   The script also updates the CSP hash. Without that, the browser would refuse to run the edited page.
6. Turn the scenario on and submit a test booking using your own email address.

## Before publishing a copy

- **Don't commit a real webhook URL.** Anyone who has it can trigger the scenario.
- Add a CAPTCHA, because the honeypot stops only simple bots.
- Turn the scenario off when you finish testing.
