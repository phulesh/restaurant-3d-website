/* ============================================================
   Location.js — map area built on the real Plus Code
   (no invented coordinates). Google Maps embed of the
   exact Plus Code Q3MF+H5 Dabhara, Chhattisgarh.
   ============================================================ */

import { RESTAURANT } from "../data.js";
import { icon } from "../icons.js";
import { h, initReveals } from "../utils.js";

export default function mountLocation(host) {
  const sec = h("section", { class: "section-location", id: "location" },
    h("div", { class: "orn-line", "aria-hidden": "true" }),
    h("div", { class: "container" },
      h("div", { class: "section-head", "data-reveal": "" },
        h("span", { class: "eyebrow" }, "Find Us"),
        h("h2", {}, "Right in the ", h("span", { class: "gold-text" }, "Heart of Dabhara")),
        h("p", {}, "Kharsia Rd, Dabhara, Chhattisgarh 495688 · Plus Code Q3MF+H5"),
        h("div", { class: "divider" }),
      ),
      h("div", { class: "location-grid" },
        h("div", { class: "location-info", "data-reveal": "left" },
          h("div", { class: "glass-card li-row" },
            h("span", { class: "c-ico", html: icon("mapPin", 22) }),
            h("div", {},
              h("div", { class: "c-label" }, "Address"),
              h("div", { class: "c-value" }, RESTAURANT.address),
            ),
          ),
          h("div", { class: "glass-card li-row" },
            h("span", { class: "c-ico", html: icon("directions", 22) }),
            h("div", {},
              h("div", { class: "c-label" }, "Plus Code"),
              h("div", { class: "c-value" }, RESTAURANT.plusCode),
            ),
          ),
          h("div", { class: "glass-card li-row" },
            h("span", { class: "c-ico", html: icon("clock", 22) }),
            h("div", {},
              h("div", { class: "c-label" }, "Open Today"),
              h("div", { class: "c-value" }, "08:00 AM – 10:00 PM"),
            ),
          ),
          h("div", { class: "li-actions" },
            h("a", { class: "btn btn-gold", href: RESTAURANT.mapsUrl, target: "_blank", rel: "noopener", html: icon("directions", 18) + "Get Directions" }),
            h("a", { class: "btn btn-call", href: `tel:${RESTAURANT.phoneE164}`, html: icon("call", 18) + "Call Now" }),
          ),
          h("p", { style: "font-size:.78rem;color:var(--cream-40);font-weight:600" },
            "Directions open in Google Maps using the restaurant’s official Plus Code."),
        ),
        h("div", { class: "glass-card map-card", "data-reveal": "right" },
          h("div", { class: "map-frame" },
            h("iframe", {
              src: RESTAURANT.mapsEmbedUrl,
              title: "Map showing Aashirwad Restaurant, Kharsia Rd, Dabhara, Chhattisgarh (Plus Code Q3MF+H5)",
              loading: "lazy",
              referrerpolicy: "no-referrer-when-downgrade",
              allowfullscreen: "",
            }),
          ),
          h("div", { class: "map-foot" },
            h("span", { html: icon("mapPin", 16) + "Aashirwad Restaurant" }),
            h("span", { class: "pc" }, "Q3MF+H5"),
          ),
        ),
      ),
    ),
  );

  host.append(sec);
  initReveals(sec);
}
