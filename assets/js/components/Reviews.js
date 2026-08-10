/* ============================================================
   Reviews.js — placeholder reviews section.
   No reviews are fabricated. Once the restaurant has real
   Google reviews, they can be embedded/imported here
   (future: Google Reviews API / widget integration).
   ============================================================ */

import { RESTAURANT } from "../data.js";
import { icon } from "../icons.js";
import { h, initReveals } from "../utils.js";

export default function mountReviews(host) {
  const sec = h("section", { class: "section-reviews", id: "reviews" },
    h("span", { class: "section-ornament orn-mandala", "data-reveal": "zoom", "aria-hidden": "true", html: icon("mandala", 150) }),
    h("div", { class: "container" },
      h("div", { class: "section-head", "data-reveal": "" },
        h("span", { class: "eyebrow" }, "Reviews"),
        h("h2", {}, "Loved by ", h("span", { class: "gold-text" }, "Dabhara")),
        h("p", {}, "Real guest reviews will appear here as they come in."),
        h("div", { class: "divider" }),
      ),
      h("div", { class: "reviews-placeholder glass-card", "data-reveal": "zoom" },
        h("span", { class: "rp-icon", html: icon("review", 34) }),
        h("h3", {}, "Reviews coming soon"),
        h("p", {}, "We’re collecting genuine guest feedback. Visit us and share your experience — we’d love to hear from you."),
        h("a", { class: "btn btn-gold", href: RESTAURANT.mapsUrl, target: "_blank", rel: "noopener", html: icon("star", 18) + "Find us on Google Maps" }),
        h("p", { class: "rp-note" }, "Live Google reviews, ratings & customer feedback will be connected in a future update."),
      ),
    ),
  );

  host.append(sec);
  initReveals(sec);
}
