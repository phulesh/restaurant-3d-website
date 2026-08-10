/* ============================================================
   Navbar.js — sticky glass navbar + premium mobile drawer
   ============================================================ */

import { RESTAURANT, NAV_LINKS } from "../data.js";
import { icon, whatsappIcon } from "../icons.js";
import { h, $$, scrollToId, getOpenStatus } from "../utils.js";

export default function mountNavbar(host) {
  const status = getOpenStatus();

  const links = NAV_LINKS.map((l) =>
    h("a", { class: "nav-link", href: `#${l.id}`, "data-nav": l.id, html: icon(l.icon, 18) + `<span>${l.label}</span>` })
  );

  /* drawer links get icons + labels stacked vertically */
  const drawerLinks = NAV_LINKS.map((l) =>
    h("a", { class: "nav-link", href: `#${l.id}`, "data-nav": l.id, html: icon(l.icon, 20) + `<span>${l.label}</span>` })
  );

  const burger = h("button", {
    class: "nav-burger", "aria-label": "Open menu", "aria-expanded": "false",
    onclick: toggleDrawer,
  }, icon("menu", 24));

  const navCta = h("div", { class: "nav-cta" },
    h("a", { class: "btn btn-call btn-sm", href: `tel:${RESTAURANT.phoneE164}`, "aria-label": `Call ${RESTAURANT.phoneDisplay}`, html: icon("call", 17) + "Call" }),
    h("a", { class: "btn btn-whatsapp btn-sm", href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", html: whatsappIcon(17) + "WhatsApp" }),
    h("a", { class: "btn btn-gold btn-sm btn-menu-label", href: "#menu", html: icon("menu", 17) + "Menu" }),
  );

  const drawer = h("div", { class: "mobile-drawer", id: "mobile-drawer", "aria-label": "Mobile navigation" },
    h("div", { class: "drawer-cta" },
      h("a", { class: "btn btn-gold btn-block", href: "#menu", html: icon("menu", 19) + "View Full Menu" }),
      h("a", { class: "btn btn-call btn-block", href: `tel:${RESTAURANT.phoneE164}`, html: icon("call", 19) + `Call ${RESTAURANT.phoneDisplay}` }),
      h("a", { class: "btn btn-whatsapp btn-block", href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", html: whatsappIcon(19) + "WhatsApp Us" }),
      h("a", { class: "btn btn-ghost btn-block", href: RESTAURANT.mapsUrl, target: "_blank", rel: "noopener", html: icon("directions", 19) + "Get Directions" }),
    ),
    ...drawerLinks,
    h("p", { class: "drawer-hours" }, `${status.isOpen ? "● Open now" : "○ Currently closed"} · Daily 08:00 AM – 10:00 PM`),
  );
  const backdrop = h("div", { class: "drawer-backdrop", onclick: closeDrawer });

  const nav = h("header", { class: "navbar", id: "site-nav" },
    h("div", { class: "nav-inner" },
      h("a", { class: "nav-brand", href: "#home", "aria-label": `${RESTAURANT.name} home` },
        h("span", { class: "logo-mark", html: icon("logo", 26) }),
        h("span", { class: "brand-text" },
          h("span", { class: "brand-name" }, "Aashirwad ", h("em", {}, "Restaurant")),
          h("div", { class: "brand-sub" }, "Pure Vegetarian"),
        ),
      ),
      h("nav", { class: "nav-links", "aria-label": "Primary" }, ...links),
      navCta,
      burger,
    ),
    drawer, backdrop,
  );

  host.append(nav);

  /* ---- state ---- */
  let open = false;
  function toggleDrawer() {
    open ? closeDrawer() : openDrawer();
  }
  function openDrawer() {
    open = true;
    drawer.classList.add("open");
    backdrop.classList.add("show");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    open = false;
    drawer.classList.remove("open");
    backdrop.classList.remove("show");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  drawer.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeDrawer();
  });

  /* ---- scrolled state ---- */
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- active link highlighting ---- */
  const allLinks = $$(".nav-link", host);
  const spy = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      allLinks.forEach((l) => l.classList.toggle("active", l.dataset.nav === en.target.id));
    }
  }, { rootMargin: "-40% 0px -55% 0px" });
  NAV_LINKS.forEach((l) => {
    const sec = document.getElementById(l.id);
    if (sec) spy.observe(sec);
  });

  /* intercept clicks for smooth scrolling (mobile drawer closes via listener above) */
  allLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToId(a.dataset.nav);
    });
  });
}
