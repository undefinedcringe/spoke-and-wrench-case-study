# 5. Tools used

## How the work was divided

I used **Claude Code**, an AI coding agent, throughout this project. It read the code, proposed and made the edits, ran browser tests and built the Make scenario through its integration.

My part was directing the work: handling the client conversation, setting scope, choosing what to fix or skip, deciding what was acceptable to ship, and requesting further rounds of testing. For example, I chose to leave CAPTCHA out of this test project and asked for security testing before calling the work done.

## Website

| Tool | What it is | How it was used |
|---|---|---|
| **HTML, CSS, JavaScript** | The site's original stack | All fixes stayed in the single file, with no framework or rewrite |
| **Intl.DateTimeFormat** | Built-in browser date API | Gets the current time in Toronto, including daylight saving, with no library |
| **Content Security Policy** | Browser security policy | Restricts what the page can load, run and contact |
| **ARIA attributes** | Accessibility markup | Tells screen readers about labels and open or closed state |
| **Chromium** | Browser | Reproduced the bugs and verified the fixes |
| **agent-browser** | Browser automation CLI | Drove the page during the original debugging sessions |

## Automation

| Tool | What it is | How it was used |
|---|---|---|
| **Make** | Visual workflow platform | Runs the scenario without a custom server |
| **Make webhook** | A URL that starts a scenario | Receives form submissions |
| **Make Data Store** | Small built-in database | Tracks hourly and daily email limits |
| **Make AI Tools** | Structured AI extraction | Maps a customer's description to a service, price, flag and note |
| **Google Sheets** | Spreadsheet | The owner's existing booking record |
| **Telegram Bot API** | Messaging bot | Sends instant alerts to the owner's phone |
| **Gmail** | Email | Sends customer confirmations |

### Why Make rather than a custom backend?

The client has a tight budget, no developer and a static website. A hosted workflow avoids running a server, and he can see each step visually. The trade-offs are per-operation cost, vendor lock-in and less convenient automated testing.

## Testing and project tools

| Tool | What it is | How it was used |
|---|---|---|
| **Playwright (`playwright-core`)** | Browser testing library | Runs the before/after regression suite |
| **Node.js** | JavaScript runtime | Runs the tests and setup script |
| **Git** | Version control | Records each fix as a separate commit, with tags for each stage |
| **Mermaid** | Text-based diagrams | Draws the flowcharts, which GitHub renders directly |

## Concepts practiced

- Root-cause debugging from non-technical bug reports
- Time zones and date handling
- Requirements gathering before building
- Webhooks and third-party integrations
- Constraining AI output and defending against prompt injection
- Input validation, rate limiting and failure handling
- XSS, CSV/formula injection, CSRF-style requests and CSP
- Regression testing and honest reporting of limits

Next: [Limits and lessons](06-limits-and-lessons.md)
