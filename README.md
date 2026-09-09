# Digital Composite Kiosk — Local Setup

This is a self-contained, vanilla HTML/CSS/JS touchscreen kiosk app for the
University of Michigan College of Pharmacy "Digital Composite" directory.

## Contents
- `index.html` — page structure for all 6 screens
- `styles.css` — Michigan-branded styling (navy/maize, IBM Plex type)
- `app.js` — navigation, search, on-screen keyboard, form logic, email sending
- `photos-map.js` — maps each `PhotoFile` key from the CSV to an image in `/photos`
- `photos/` — resized, web-optimized composite images (originals were several MB each; these are compressed to ~200–270KB, max 1400px wide, for fast local loading)
- `EMAIL-SETUP.md` — how to wire up real email delivery (5-minute EmailJS setup, no backend needed)

## Directory data
The alumni directory (22 records, class years 2011–2015) is currently
hard-coded near the top of `app.js` in the `DIRECTORY` array, generated from
`DirectoryNamesYears.csv`. Each entry has:
```js
{ first: "Charlie", last: "Brown", year: "2011", photo: "composite_2011" }
```
`Degree` and `Email` are intentionally **not** part of this directory —
they're collected from the requester on the form screen, not looked up.

To update the roster, edit the `DIRECTORY` array directly, or replace it with
a `fetch()` call to a real CSV/API endpoint if you want this driven by a live
data source instead of a static list.

## Running locally
No build step or dependencies required. From this folder, start any static
file server, for example:

```bash
# Python 3
python3 -m http.server 8000

# Node (if you have it)
npx serve .
```

Then open **http://localhost:8000** in a browser (ideally in kiosk/fullscreen
mode: `chrome --kiosk http://localhost:8000` or F11 fullscreen).

Opening `index.html` directly via `file://` also works for a quick look, but
a local server is recommended so relative paths behave exactly as they would
in production.

## Behavior notes
- The on-screen keyboard only appears when a text field is tapped, and slides
  away when you tap outside the field/keyboard or navigate to another screen.
- Search matches on partial name and/or graduation year, and resolves to a
  **class year's photo** — not an individual record. A match against exactly
  one class year skips straight to that photo; an ambiguous search shows a
  grid of "Class of ####" photo tiles to pick from. No student names are
  looked up, matched, or displayed anywhere in this flow.
- "Email Composite" only pre-fills Class Year on the request form, since
  that's determined by the photo selected rather than by identity — anyone
  can request any class's composite as long as they know the name and year
  used to find it. First Name, Last Name, Degree, Email, and Phone are left
  blank for the visitor
  to fill in themselves.
- The kiosk auto-returns to the landing screen after 60s of inactivity, and
  8s after a successful form submission.
- Submitting the form sends a **real email** via EmailJS once configured —
  see `EMAIL-SETUP.md`. Until then it runs in demo mode (shows the
  confirmation screen, sends nothing, logs a console warning).
