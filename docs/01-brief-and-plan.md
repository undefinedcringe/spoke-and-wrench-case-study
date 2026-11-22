# 1. The brief and the plan

## The first request

The simulated client, Mike, runs a small bike repair shop in Toronto. A relative built the site and is no longer available. His first message was short:

> Customers say the booking form is acting weird with days, some can't book when we're open.
> Prices are wrong for some customers.
> The site sometimes says we're open when we're closed.
> Sometimes the menu at the top just disappears on my laptop.
> The FAQ is broken.

This is what real bug reports often look like. Each line describes a symptom, with no steps to reproduce it.

## Turning symptoms into testable facts

A first pass fixed what could be inferred from the code. Mike's follow-up then supplied the facts that decide what "correct" means:

| Vague complaint | Fact from the client | Testable rule |
|---|---|---|
| "Weird with days" | Monday the 23rd was refused as a Sunday | A Monday must be bookable in Toronto |
| "Prices are wrong" | A student with the code got 25% off | Use the larger discount, never the sum |
| "Prices are wrong" | One customer typed the code in lowercase | Promo codes ignore letter case |
| "Says we're open" | Open at 5pm Saturday and 6:30pm on a weekday | Mon–Fri 9–18, Sat 10–15, Sun closed |
| "Menu disappears" | Happens after shrinking, toggling, then enlarging | The menu must return without a refresh |
| "FAQ is broken" | Only the first question opens | All three must open |

**The key lesson:** one of these requirements could not have come from the code. The stacked discount looked intentional until Mike said it was losing him money.

## The second request

With the site working, Mike asked for automation. He spent about an hour every evening reading requests, copying them to a spreadsheet, working out the service, texting himself and emailing the customer.

He wanted each request to:

1. Be saved in a Google Sheet.
2. Send a Telegram message to his phone.
3. Send the customer a confirmation email.
4. Use AI to suggest a service and rough price.

## Clarifying before building

I sent seven questions before building. The answers changed the design:

| Question | Answer | Design decision |
|---|---|---|
| Where do requests come from? | Mostly the website form | Scope is the form only |
| What are the prices? | Eight services | AI may choose only from this list |
| Should customers see estimates? | No, after a past screenshot dispute | Estimates go only to Mike |
| How are times confirmed? | Mike calls within 1 business day | The site must never say "booked" |
| Which address sends confirmations? | His regular Gmail | Gmail module, tested on a separate test account |
| What does the sheet look like? | Eight fixed columns | Keep his columns exactly |
| What is the volume? | 5–10 a day, up to 30 at peak | A paid Make plan would be needed |

I also asked for real examples, and his six old messages became the AI test set.

The form had a gap too: Mike always phones customers back, but it **never asked for a phone number**. Without that question, the automation would have worked perfectly and been useless to him.

## The plan

1. Fix the reported bugs and verify them against Mike's scenarios.
2. Retest for problems nobody reported.
3. Build the workflow and test it directly.
4. Connect the form.
5. Try to break everything.
6. Fix what broke and retest.

Next: [Debugging the site](02-debugging.md)
