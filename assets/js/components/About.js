/* ============================================================
   About.js — "Good Food. Great Moments." + 3D floating
   feature cards + factual restaurant info
   ============================================================ */

import { RESTAURANT } from "../data.js";
import { icon, whatsappIcon } from "../icons.js";
import { h, initReveals, device } from "../utils.js";
import { makeTilt } from "../effects/index.js";

const FEATURES = [
  { icon: "leaf", title: "Pure Vegetarian", desc: "A 100% pure vegetarian kitchen — no meat, no eggs, ever." },
  { icon: "flame", title: "Fresh Menu", desc: "Breakfast, tandoor, Indo-Chinese, pizzas and more — made fresh daily." },
  { icon: "user", title: "Family Dining", desc: "A comfortable family-friendly space in the heart of Dabhara." },
];

export default function mountAbout(host) {
  const sec = h("section", { class: "section-about", id: "about" },
    h("span", { class: "section-ornament orn-lotus", "data-reveal": "zoom", "aria-hidden": "true", html: icon("lotus", 210) }),
    h("span", { class: "section-ornament orn-dome", "data-reveal": "zoom", "aria-hidden": "true", html: icon("dome", 200) }),
    h("div", { class: "container" },
      h("div", { class: "about-grid" },
        h("div", { class: "about-visual", "data-reveal": "left" },
          h("div", { class: "frame" },
            h("img", { src: "assets/img/hero-thali.jpg", alt: "Pure vegetarian thali — illustrative presentation", loading: "lazy" }),
          ),
          h("div", { class: "about-quote float-bob-slow" },
            h("span", {}, "Every plate is a blessing. Pure vegetarian, made with care."),
          ),
        ),
        h("div", { class: "about-copy" },
          h("div", { class: "section-head", "data-reveal": "" },
            h("span", { class: "eyebrow" }, "About Us"),
            h("h2", {}, "Good Food. ", h("span", { class: "gold-text" }, "Great Moments.")),
            h("div", { class: "divider" }),
          ),
          h("p", { "data-reveal": "" },
            h("strong", {}, RESTAURANT.name), " is a pure vegetarian restaurant on Kharsia Rd, Dabhara — a family-friendly dining destination for vegetarian food in Chhattisgarh."
          ),
          h("p", { "data-reveal": "", style: "transition-delay:.08s" },
            "From a hearty breakfast of poha, idli and dosa to tandoor specials, Indo-Chinese starters, wood-fired pizzas, pasta and creamy shakes — the menu is crafted for every meal of the day. Every dish is 100% vegetarian, freshly prepared and served hot."
          ),
          h("p", { "data-reveal": "", style: "transition-delay:.14s" },
            `Open every day from 08:00 AM to 10:00 PM, with a price range of ${RESTAURANT.priceRange} per person. Walk in with your family, or call ${RESTAURANT.phoneDisplay} to ask about your order.`
          ),
          h("div", { class: "feature-cards", role: "list" },
            ...FEATURES.map((f, i) =>
              h("div", { class: "feature-card", "data-reveal": "", style: `transition-delay:${0.1 + i * 0.1}s`, role: "listitem" },
                h("span", { class: "tilt-glow" }),
                h("span", { class: "f-icon", html: icon(f.icon, 26) }),
                h("h3", {}, f.title),
                h("p", {}, f.desc),
              )
            ),
          ),
          h("div", { class: "about-facts", "data-reveal": "" },
            h("span", { class: "fact", html: icon("clock", 19) + "Open daily 08:00 AM – 10:00 PM" }),
            h("span", { class: "fact", html: icon("star", 19) + `Price ${RESTAURANT.priceRange}` }),
            h("a", { class: "fact", href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", html: whatsappIcon(19) + "Order enquiries on WhatsApp" }),
          ),
        ),
      ),
    ),
  );

  host.append(sec);
  initReveals(sec);

  /* tilt on feature cards (desktop only) */
  if (!device.reducedMotion && !device.coarse) {
    sec.querySelectorAll(".feature-card").forEach((c) => makeTilt(c, { max: 5 }));
  }
}
