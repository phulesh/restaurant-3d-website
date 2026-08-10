/* ============================================================
   Hero.js — cinematic 3D hero: layered depth, parallax stage,
   floating particles, steam, live OPEN status, strong CTAs
   ============================================================ */

import { RESTAURANT } from "../data.js";
import { icon, whatsappIcon } from "../icons.js";
import { h, $, getOpenStatus, closesInLabel, initReveals, device } from "../utils.js";
import { createParticles, createParallax, spawnSteam } from "../effects/index.js";

export default function mountHero(host) {
  const status = getOpenStatus();

  const orb1 = h("span", { class: "orb orb-1", "data-parallax": "2.2" });
  const orb2 = h("span", { class: "orb orb-2", "data-parallax": "1.6" });
  const orb3 = h("span", { class: "orb orb-3", "data-parallax": "3" });
  const particlesHost = h("span", { class: "hero-orbs" }, orb1, orb2, orb3);

  const stage = h("div", { class: "hero-stage", "data-reveal": "zoom" },
    h("div", { class: "stage-inner", "data-parallax": "0.8" },
      h("div", { class: "food-card-3d" },
        h("img", { src: "assets/img/hero-thali.jpg", alt: "Pure vegetarian thali served at Aashirwad Restaurant (illustrative presentation)", width: "1029", height: "1285", loading: "eager", fetchpriority: "high" }),
        h("span", { class: "fc-gold-ring" }),
        h("div", { class: "fc-caption" },
          h("h3", {}, "The Aashirwad Thali"),
          h("p", {}, "A pure vegetarian experience"),
        ),
      ),
      h("div", { class: "float-chip chip-1 float-bob", html: icon("leaf", 16) + "Pure Veg" }),
      h("div", { class: "float-chip chip-2 float-bob-slow", html: icon("flame", 16) + "Fresh & Hot" }),
      h("div", { class: "float-chip chip-3 float-bob", html: icon("star", 16) + "Family Dining" }),
    ),
  );

  const hero = h("section", { class: "section-hero", id: "home" },
    h("div", { class: "hero-bg" }),
    particlesHost,
    h("div", { class: "container hero-grid" },
      h("div", { class: "hero-copy" },
        h("div", { class: "hero-badges", "data-reveal": "" },
          h("span", { class: `status-pill ${status.isOpen ? "open" : "closed"}`, role: "status", id: "hero-status-pill" },
            h("span", { class: "dot live" }),
            h("span", { id: "hero-status-text" }, status.isOpen ? "OPEN NOW" : "CLOSED NOW"),
          ),
          h("span", { class: "veg-badge", html: `<span class="veg-dot"></span>Pure Veg` }),
          h("span", { class: "veg-badge", html: `<span class="veg-dot"></span>100% Vegetarian` }),
        ),
        h("h1", { class: "hero-title", "data-reveal": "", style: "transition-delay:.08s" },
          h("span", { class: "gold-text" }, "Aashirwad Restaurant"),
          h("span", { class: "hero-title-deva hindi" }, RESTAURANT.nameDeva),
        ),
        h("p", { class: "hero-subtitle", "data-reveal": "", style: "transition-delay:.16s" }, "Pure Vegetarian Dining in Dabhara"),
        h("div", { class: "hero-tagline", "data-reveal": "", style: "transition-delay:.22s" },
          h("span", {}, "Fresh"), h("span", { class: "dotsep" }),
          h("span", {}, "Vegetarian"), h("span", { class: "dotsep" }),
          h("span", {}, "Family Dining"),
        ),
        h("p", { class: "hero-status-line", "data-reveal": "", style: "transition-delay:.28s" },
          h("span", { class: "status-inline", html: icon("clock", 18) }, ),
          h("span", { id: "hero-open-line" }, status.isOpen ? `Open • ${status.closesLabel}` : `Closed • Opens ${status.opensLabel}`),
          h("span", { class: "sub", id: "hero-closes-in" }, status.isOpen ? `(${closesInLabel(status.closesInMin)})` : "· Every day 08:00 AM – 10:00 PM"),
        ),
        h("div", { class: "hero-actions", "data-reveal": "", style: "transition-delay:.34s" },
          h("a", { class: "btn btn-gold", href: "#menu", html: icon("menu", 19) + "View Menu" }),
          h("a", { class: "btn btn-call", href: `tel:${RESTAURANT.phoneE164}`, html: icon("call", 18) + "Call Now" }),
          h("a", { class: "btn btn-whatsapp", href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", html: whatsappIcon(18) + "WhatsApp" }),
          h("a", { class: "btn btn-ghost", href: RESTAURANT.mapsUrl, target: "_blank", rel: "noopener", html: icon("directions", 18) + "Get Directions" }),
        ),
        h("p", { class: "hero-address-line", "data-reveal": "", style: "transition-delay:.4s" },
          h("span", { html: icon("mapPin", 17) }),
          h("span", {}, RESTAURANT.address),
          h("span", { html: icon("chevronRight", 14), style: "color:var(--gold-400)" }),
        ),
      ),
      stage,
    ),
    h("div", { class: "hero-ribbon-wrap container", "data-reveal": "", style: "transition-delay:.46s" },
      h("div", { class: "ribbon" },
        h("span", { html: icon("clock", 17) + "Open daily 08:00 AM – 10:00 PM" }),
        h("span", { class: "sep" }),
        h("span", { html: icon("mapPin", 17) + "Dabhara, Chhattisgarh" }),
        h("span", { class: "sep" }),
        h("span", { html: icon("call", 17) + RESTAURANT.phoneDisplay }),
        h("span", { class: "sep" }),
        h("span", { html: icon("star", 17) + `Price ${RESTAURANT.priceRange}` }),
      ),
    ),
    h("div", { class: "hero-scroll-cue", "data-reveal": "" },
      h("span", { class: "mouse" }),
      h("span", {}, "Scroll"),
    ),
  );

  host.append(hero);
  initReveals(hero);

  /* --- live status updates every 30s --- */
  const pillText = $("#hero-status-text", hero);
  const pill = $("#hero-status-pill", hero);
  const openLine = $("#hero-open-line", hero);
  const closesIn = $("#hero-closes-in", hero);
  setInterval(() => {
    const s = getOpenStatus();
    pill.className = `status-pill ${s.isOpen ? "open" : "closed"}`;
    pillText.textContent = s.isOpen ? "OPEN NOW" : "CLOSED NOW";
    openLine.textContent = s.isOpen ? `Open • ${s.closesLabel}` : `Closed • Opens ${s.opensLabel}`;
    closesIn.textContent = s.isOpen ? `(${closesInLabel(s.closesInMin)})` : "· Every day 08:00 AM – 10:00 PM";
  }, 30000);

  /* --- effects --- */
  if (!device.reducedMotion) {
    createParticles(particlesHost, { count: device.lowPower ? 8 : 16, types: ["orb", "dot", "flake"] });
    spawnSteam($(".food-card-3d", hero), { side: "left", top: "42%" });
    spawnSteam($(".food-card-3d", hero), { side: "right", top: "34%" });
  }
  createParallax(hero, { strength: device.coarse ? 6 : 12 });
}
