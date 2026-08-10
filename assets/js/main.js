/* ============================================================
   main.js — entry point. Mounts each section into its host
   element. Components are modular: Navbar, Hero, About, Menu,
   MenuCard, CategoryFilter, Gallery, OpeningHours, Contact,
   Location, Footer (+ EnquiryTray, Assistant placeholders).
   Future backend modules (CRM, payments, KDS…) hook in here.
   ============================================================ */

import { device } from "./utils.js";

async function mountAll() {
  const hosts = {
    navbar: document.querySelector('[data-mount="navbar"]'),
    hero: document.querySelector('[data-mount="hero"]'),
    about: document.querySelector('[data-mount="about"]'),
    menu: document.querySelector('[data-mount="menu"]'),
    gallery: document.querySelector('[data-mount="gallery"]'),
    reviews: document.querySelector('[data-mount="reviews"]'),
    hours: document.querySelector('[data-mount="hours"]'),
    contact: document.querySelector('[data-mount="contact"]'),
    location: document.querySelector('[data-mount="location"]'),
    footer: document.querySelector('[data-mount="footer"]'),
    "enquiry-tray": document.querySelector('[data-mount="enquiry-tray"]'),
    assistant: document.querySelector('[data-mount="assistant"]'),
  };

  const jobs = [
    ["navbar", () => import("./components/Navbar.js")],
    ["hero", () => import("./components/Hero.js")],
    ["about", () => import("./components/About.js")],
    ["menu", () => import("./components/Menu.js")],
    ["gallery", () => import("./components/Gallery.js")],
    ["reviews", () => import("./components/Reviews.js")],
    ["hours", () => import("./components/OpeningHours.js")],
    ["contact", () => import("./components/Contact.js")],
    ["location", () => import("./components/Location.js")],
    ["footer", () => import("./components/Footer.js")],
    ["enquiry-tray", () => import("./components/EnquiryTray.js")],
    ["assistant", () => import("./components/Assistant.js")],
  ];

  // Mount critical above-the-fold sections first, then the rest.
  const priority = ["navbar", "hero"];
  await Promise.all(
    jobs
      .filter(([k]) => priority.includes(k))
      .map(async ([k, load]) => {
        const mod = await load();
        mod.default(hosts[k]);
      }),
  );
  await Promise.all(
    jobs
      .filter(([k]) => !priority.includes(k))
      .map(async ([k, load]) => {
        const mod = await load();
        mod.default(hosts[k]);
      }),
  );

  document.body.classList.add("app-ready");

  // Smooth-scroll for any same-page anchor (handled per-component too)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: device.reducedMotion ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  });
}

/* Hide flash of unstyled pre-mount content */
document.documentElement.classList.add("js");

mountAll().catch((err) => {
  console.error("[Aashirwad] mount failed:", err);
});
