# Riverstone — Fine Dine & Bar · Website

A working static site for **Riverstone Fine Dine & Bar**, 9th Floor, GSV Vertica,
Thite Nagar, Kharadi, Pune 411014.

Built to the "Forest & Sage" editorial spec: Anton display type, Inter utility type,
an earthy organic palette, a persistent SVG noise overlay, extreme corner rounding and
scroll-triggered reveals on a single `cubic-bezier(0.16, 1, 0.3, 1)` motion signature.

---

## Run it

No build step, no dependencies. Any static server works:

```bash
node serve.mjs          # http://127.0.0.1:5173
```

or

```bash
python3 -m http.server 5173
```

Opening `index.html` directly over `file://` also works, but a server is preferred so the
self-hosted fonts load with the right MIME type.

## Deploy

Upload the whole folder (minus `dev/`) to any static host — Netlify, Vercel, Cloudflare
Pages, GitHub Pages, S3, or ordinary shared hosting. There is no server-side code.

```
index.html
styles.css
script.js
assets/img/*.jpg
assets/fonts/*.woff2
```

---

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole page. Semantic sections, Schema.org `Restaurant` JSON-LD, OG tags. |
| `styles.css` | Design system (tokens → components → responsive → motion preferences). |
| `script.js` | Letter stagger, scroll reveals, parallax, header state, mobile menu, form. |
| `assets/img/` | Photography, pre-cropped to the aspect ratios the layout uses. |
| `assets/fonts/` | Anton + Inter, self-hosted (no Google Fonts request at runtime). |
| `serve.mjs` | Zero-dependency local preview server. |
| `dev/` | QA scripts used while building (need Playwright). Not part of the deploy. |

## Design tokens

Everything is driven by custom properties at the top of `styles.css`:

```
--forest #01472e   --sage #ccd5ae   --olive #e9edc9   --cream #fefae0   --moss #a3b18a
--r-section 5rem   --r-card 2.5rem  --r-float 3rem
--ease cubic-bezier(0.16, 1, 0.3, 1)   --dur 1.2s
```

Change the palette or the radii in one place and the whole site follows.

## Behaviour

- **Hero** — letters animate up with a 0.05s stagger; three floating cards use the
  `float` keyframe plus a scroll-depth parallax (`data-speed` on each figure).
- **Reveals** — any element with `.rv` slides up from `translateY(100px)` / `opacity: 0`
  when it enters the viewport. Add `.rv-2` … `.rv-6` to stagger siblings.
- **Cards** — hover scales the image to 1.1, fades in a blurred Forest overlay and lifts
  the pill button 32px. Also fires on keyboard focus (`:focus-within`).
- **Header** — gains a blurred background past 40px; the pill nav highlights the current
  section; below 1100px it becomes a full-screen menu (Escape and link clicks close it).
- **Reduced motion** — `prefers-reduced-motion: reduce` disables every animation and
  shows all content immediately.

## The newsletter form

It validates the address and confirms locally, but **there is no mailing-list backend
wired up**. To make it live, set `POST_URL` near the bottom of `script.js` to a form
endpoint (Formspree, Buttondown, Mailchimp, a serverless function) — the fetch call and
the error handling are already written.

Everything else is live: phone, WhatsApp, Instagram, Zomato and Google Maps directions
all point at the real destinations.

## Content accuracy

Every fact on the page is taken from the restaurant's own published material — the Zomato
listing, its food and bar menus, its Instagram bio and captions, and the page it links
from Instagram. Menu section names, the six Signature Rituals and their ingredients, the
"River Stone Fried Chicken" signature, the address, hours, phone, WhatsApp and the two
review scores are all verifiable; the ratings are labelled with their source.

Nothing is invented: there are no fabricated dishes, prices, awards, testimonials or
opening dates. Prices are omitted because the published menus do not show them.

**Reservations are by phone or WhatsApp.** The restaurant has no online booking system,
so the site never implies one.

## Photography

Images come from the venue's own public listing gallery. They are fine for this build,
but confirm reuse rights with the restaurant before putting the site into production,
and replace them with a commissioned shoot when possible — the lounge and DJ photographs
are the weakest source material.

## Accessibility

Single `<h1>`, ordered headings, alt text on every image, visible focus rings, keyboard
operable menu with `aria-expanded`, a live region on the form, and Forest (never black)
text throughout for contrast on the light grounds.
