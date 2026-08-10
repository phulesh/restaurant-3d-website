/* ============================================================
   Footer.js — brand, quick links, social placeholders,
   hours summary + mobile bottom action bar.
   ============================================================ */

import { RESTAURANT } from "../data.js";
import { icon, whatsappIcon } from "../icons.js";
import { h, getOpenStatus, initReveals } from "../utils.js";

export default function mountFooter(host) {
  const status = getOpenStatus();

  const foot = h("footer", { class: "footer" },
    h("div", { class: "container" },
      h("div", { class: "footer-grid" },
        h("div", { class: "footer-brand" },
          h("a", { class: "nav-brand", href: "#home", "aria-label": "Back to top" },
            h("span", { class: "logo-mark", html: icon("logo", 26) }),
            h("span", { class: "brand-text" },
              h("span", { class: "brand-name" }, "Aashirwad ", h("em", {}, "Restaurant")),
              h("div", { class: "brand-sub hindi" }, "आशीर्वाद रेस्टोरेंट"),
            ),
          ),
          h("p", {}, "Pure Vegetarian Restaurant · Dabhara, Chhattisgarh. Fresh, vegetarian, family dining — every day from 08:00 AM to 10:00 PM."),
          h("div", { class: "footer-social" },
            h("a", { class: "btn-icon", href: "#", "aria-label": "Instagram (coming soon)", title: "Instagram — coming soon", html: icon("image", 19) }),
            h("a", { class: "btn-icon", href: "#", "aria-label": "Facebook (coming soon)", title: "Facebook — coming soon", html: icon("heart", 19) }),
            h("a", { class: "btn-icon", href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", "aria-label": "WhatsApp", html: whatsappIcon(19) }),
            h("a", { class: "btn-icon", href: `tel:${RESTAURANT.phoneE164}`, "aria-label": `Call ${RESTAURANT.phoneDisplay}`, html: icon("call", 19) }),
          ),
        ),
        h("div", {},
          h("h4", {}, "Quick Links"),
          h("ul", {},
            ...["home", "about", "menu", "gallery", "reviews"].map((id) =>
              h("li", {}, h("a", { href: `#${id}`, html: icon("chevronRight", 14) + id.charAt(0).toUpperCase() + id.slice(1) })),
            ),
          ),
        ),
        h("div", {},
          h("h4", {}, "Get in Touch"),
          h("ul", {},
            ...["contact", "hours", "location"].map((id) =>
              h("li", {}, h("a", { href: `#${id}`, html: icon("chevronRight", 14) + (id === "hours" ? "Opening Hours" : id.charAt(0).toUpperCase() + id.slice(1)) })),
            ),
            h("li", {}, h("a", { href: `tel:${RESTAURANT.phoneE164}`, html: icon("call", 14) + "Call Now" })),
            h("li", {}, h("a", { href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", html: whatsappIcon(14) + "WhatsApp" })),
            h("li", {}, h("a", { href: RESTAURANT.mapsUrl, target: "_blank", rel: "noopener", html: icon("directions", 14) + "Directions" })),
          ),
        ),
        h("div", {},
          h("h4", {}, "Reach Us"),
          h("ul", {},
            h("li", { html: icon("mapPin", 14) + RESTAURANT.address }),
            h("li", { html: icon("directions", 14) + RESTAURANT.plusCode }),
            h("li", { html: icon("call", 14) + RESTAURANT.phoneDisplay }),
            h("li", { html: icon("clock", 14) + "Open daily 08:00 AM – 10:00 PM" }),
          ),
        ),
      ),
      h("div", { class: "footer-bottom" },
        h("span", {}, `© ${new Date().getFullYear()} ${RESTAURANT.name} (${RESTAURANT.nameDeva}). All rights reserved.`),
        h("span", { class: "made" }, h("span", { html: icon("heart", 14) }), "Made with care in Dabhara"),
      ),
    ),
  );

  /* ---------- mobile bottom action bar ---------- */
  const bar = h("div", { class: "mobile-bar", role: "navigation", "aria-label": "Quick actions" },
    h("div", { class: "mb-inner" },
      h("a", { class: "mb-btn primary", href: "#menu", html: icon("menu", 21) + "Menu" }),
      h("a", { class: "mb-btn", href: `tel:${RESTAURANT.phoneE164}`, html: icon("call", 21) + "Call" }),
      h("a", { class: "mb-btn wa", href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", html: whatsappIcon(21) + "WhatsApp" }),
      h("a", { class: "mb-btn", href: RESTAURANT.mapsUrl, target: "_blank", rel: "noopener", html: icon("directions", 21) + "Directions" }),
      h("a", { class: "mb-btn", href: "#home", html: icon("home", 21) + "Top" }),
    ),
  );

  host.append(foot, bar);
  initReveals(foot);
}
