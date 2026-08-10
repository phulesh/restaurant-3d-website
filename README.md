# Aashirwad Restaurant — Premium 3D Restaurant Website

A cinematic, futuristic **frontend-only** website for **Aashirwad Restaurant (आशीर्वाद रेस्टोरेंट)**,
a pure vegetarian restaurant at **Kharsia Rd, Dabhara, Chhattisgarh 495688** · Plus Code **Q3MF+H5** ·
☎ 095160 00901 · Open daily **08:00 AM – 10:00 PM**.

## Stage 1 scope

This stage is **UI/UX + 3D experience only**. There is **no backend, database, CRM, payment gateway or
real AI automation** yet. The code is structured so those can be plugged in later (see "Future-ready" below).

## Tech

- Vanilla ES modules (no framework, no build step) — fast, portable, easy to host anywhere
- CSS 3D transforms + rAF pointer math for the 3D feel — **no WebGL/Three.js assets to download**
- Lightweight: 10 AI-generated illustrative food photos (menu categories) + 3 hand-made SVG beverage artworks
- `prefers-reduced-motion` respected everywhere; effects automatically reduced on low-power devices
  (`navigator.hardwareConcurrency ≤ 4`) and coarse pointers (no card tilt on touch)

## Run it

```bash
# any static server works
python3 -m http.server 8080
# or
npx serve .
```

Open http://localhost:8080

## Structure

```
index.html                     — shell + SEO/JSON-LD + noscript fallback
assets/
  css/
    base.css                   — tokens (royal navy / gold / cream), reset, type
    components.css             — buttons, chips, badges, modal, toast, inputs
    sections.css               — per-section layout & responsive rules
    effects.css                — reveals, particles, parallax helpers, marquee, ornaments
  img/
    hero-thali.jpg             — hero 3D card (illustrative)
    menu/*.jpg                 — category photography (illustrative)
    art/*.svg                  — lassi / mocktail / shake artwork (no photo available)
    favicon.svg
  js/
    data.js                    — ★ single source of truth: restaurant + menu + gallery data
    icons.js                   — inline SVG icon set
    utils.js                   — DOM helpers, INR format, IST open-status, toast/modal, reveals
    effects/index.js           — particles, parallax, card tilt, steam (all CSS-3D based)
    main.js                    — mount registry (add future modules here)
    components/
      Navbar.js                — sticky glass navbar + mobile drawer + scroll-spy
      Hero.js                  — cinematic hero: parallax stage, steam, OPEN NOW live status
      About.js                 — "Good Food. Great Moments." + 3D feature cards
      Menu.js                  — category filter + search + sort + grid (109 items)
      MenuCard.js              — 3D food card: veg badge, price, details modal, enquiry
      CategoryFilter.js        — chips + search + sort controls (emits bus events)
      Gallery.js               — masonry gallery + lightbox (clearly-labelled illustrative)
      Reviews.js               — placeholder (no fabricated reviews)
      OpeningHours.js          — weekly hours + dynamic IST OPEN/CLOSED
      Contact.js               — 3D contact card + enquiry form placeholder
      Location.js              — Google Maps embed of the real Plus Code (no invented coords)
      Footer.js                — footer + mobile bottom action bar
      EnquiryTray.js           — floating enquiry tray (UI-only cart state)
      Assistant.js             — floating AI assistant placeholder (canned replies)
```

## How to hook up the future backend

- **All data lives in `assets/js/data.js`** — swap `MENU_ITEMS`, `RESTAURANT`, `GALLERY_ITEMS` with API
  responses when the backend exists.
- **Enquiry state** is a UI-only array (`enquiryState` in `data.js`) with a WhatsApp deep-link builder —
  replace with a real API call / WhatsApp Business API / n8n webhook later.
- **Assistant** replies are canned; point it at an LLM / n8n endpoint later.
- **Contact form** is a placeholder — wire it to CRM (e.g. HubSpot / custom) later.
- **Mount registry in `main.js`** — add `KDS.js`, `AdminPanel.js`, `Payments.js`, etc. as new components.

## Honesty notes (no fabricated information)

- No real restaurant photos were supplied → hero/menu photos are clearly labelled **"Illustrative"** and
  beverage categories use SVG artwork labelled **"Illustration"**; the gallery carries an explicit notice.
- No fake reviews, awards, history or facilities claims are made.
- Location uses the official **Plus Code Q3MF+H5** (Google Maps search/embed) — no invented coordinates.
- Opening status is computed live in **Asia/Kolkata (IST)** from the real 08:00–22:00 schedule.
