# Samrat Electronics — HVAC Solutions, Raipur

A premium, 3D-animated single-page website for **Samrat Electronics** — an electronics store and
HVAC solutions company at Sharda Chowk, Raipur (Chhattisgarh). This is a frontend/demo build
ready to go live for a real client.

> **Tagline:** *Delivering Comfort with Precision & Performance.*

![Tech](https://img.shields.io/badge/React-18-61dafb) ![Vite](https://img.shields.io/badge/Vite-6-646cff)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Three.js](https://img.shields.io/badge/Three.js-r3f-000000)

---

## ✨ Highlights

- **Cinematic 3D hero** — a floating AC unit with smooth rotation, cool-airflow particles,
  blue/cyan lighting, realistic shadows, mouse parallax and scroll animation
  (React Three Fiber + Three.js + drei, lazy-loaded).
- **Interactive 3D room experience** — scroll to animate cooling airflow through a room
  (indoor unit, outdoor condenser, temperature readout that drops as you scroll).
- **3D glass cards for the 8 HVAC services** — procedural 3D icons rendered in a *single*
  shared WebGL canvas that tracks the DOM cards (cheap on Android).
- **Immersive 3D vignettes** for Hospitals 🏥 / Commercial 🏢 / Residential 🏠.
- **Authorized Brands** section — Mitsubishi Electric, Voltas, Blue Star, Daikin, O General, LG
  (text-based glass cards; no invented logos).
- **Real showroom gallery** — 8 photos with 3D hover, lightbox, keyboard nav, mobile swipe & zoom.
- **Dynamic OPEN NOW / CLOSED indicator** based on the current time in IST (Asia/Kolkata).
- **Google Maps embed without any API key** + “Open in Google Maps” / “Get Directions” CTAs.
- **Mobile-first UX** — hamburger menu, sticky Call Now button, no horizontal overflow,
  reduced particle counts on low-end devices, `prefers-reduced-motion` fallback, WebGL fallback.
- **SEO-ready** — meta title/description, Open Graph, Twitter cards, JSON-LD (`HVACBusiness`
  schema with hours, address, rating).

## 🧱 Stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Framework    | React 18 + Vite 6 + TypeScript                      |
| Styling      | Tailwind CSS v4 (CSS-first config in `src/index.css`) |
| 3D           | Three.js + @react-three/fiber + @react-three/drei   |
| Motion       | Lenis (smooth scroll) + IntersectionObserver reveals |
| Icons        | lucide-react                                        |
| Fonts        | Sora (display) + Manrope (body)                     |

## 🚀 Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build
npm start          # serve dist/ on 0.0.0.0:$PORT (used in production)
```

> Requires Node 18+.

## ☁️ Deploy on Railway

The repository root contains `package.json`, so Railway auto-detects it as a Node/Vite project —
no configuration needed.

| Step    | Command                    |
| ------- | -------------------------- |
| Install | `npm install` (automatic)  |
| Build   | `npm run build`            |
| Start   | `npm start`                |

`npm start` runs `vite preview --host 0.0.0.0 --port $PORT`, binding to the port Railway injects.
`vite.config.ts` sets `preview.allowedHosts: true` so the generated `*.up.railway.app` (or custom)
domain is accepted.

## 📁 Project structure

```
src/
├── main.tsx / App.tsx          # entry, lazy scene orchestration
├── index.css                   # Tailwind v4 theme + design tokens
├── lib/
│   ├── business.ts             # phone, address, maps, nav links
│   ├── types.ts / webgl.ts     # quality profiles, WebGL detection
│   └── useDeviceProfile.ts     # mobile / low-end / reduced-motion detection
├── data/content.ts             # services, applications, process, gallery
├── components/
│   ├── Navbar / Hero / About / Brands / Solutions / Applications
│   ├── Experience / Process / Gallery / Trust / Hours / Location
│   ├── Contact / Footer / StickyCall / Reveal / ScrollProgress
│   └── three/
│       ├── Hero3D.tsx          # cinematic floating-AC hero
│       ├── Experience3D.tsx    # scroll-driven 3D room
│       ├── IconGrid3D.tsx      # one canvas, icons tracked to DOM cards
│       └── AppScene3D.tsx      # hospital / commercial / residential scenes
```

## 📸 Gallery images

`public/photos/showroom-1.jpg … showroom-8.jpg` are **placeholder photographs** generated so the
site ships visually complete. Replace them with the client’s real showroom photos — keep the same
filenames (or update `src/data/content.ts` → `GALLERY_IMAGES`) and the gallery will pick them up.

## 🎯 Performance & accessibility

- Heavy 3D chunks are lazy-loaded (`React.lazy` + code-splitting) and only mounted near the viewport.
- Single shared canvas for icon grids; low particle counts on low-end/mobile devices.
- `prefers-reduced-motion` disables 3D & heavy animation; WebGL-less devices get a friendly fallback.
- Semantic HTML, `aria-label`s, keyboard-accessible lightbox and focus rings.

## 🔍 Verification checklist

- `npm run build` passes (type-check + bundle)
- All nav links scroll to their sections; Call / Email / Directions links use `tel:`, `mailto:`, Google Maps
- Gallery lightbox: arrows, Escape, swipe, double-click zoom
- Business-hours status reflects IST time; Sunday = Closed
- No console errors on desktop and mobile viewports

## 📄 License

Business content © Samrat Electronics, Raipur. Brand names & trademarks belong to their respective owners.
