/* ============================================================
   Gallery.js — premium masonry gallery with cinematic hover,
   zoom-on-click lightbox, keyboard navigation.
   Imagery is clearly labelled illustrative (no real photos
   were supplied).
   ============================================================ */

import { GALLERY_ITEMS } from "../data.js";
import { icon } from "../icons.js";
import { h, initReveals, bus } from "../utils.js";

export default function mountGallery(host) {
  let current = 0;

  const sec = h("section", { class: "section-gallery", id: "gallery" },
    h("span", { class: "section-ornament orn-lotus", "data-reveal": "zoom", "aria-hidden": "true", html: icon("lotus", 190) }),
    h("div", { class: "container" },
      h("div", { class: "section-head", "data-reveal": "" },
        h("span", { class: "eyebrow" }, "Gallery"),
        h("h2", {}, "A Feast for the ", h("span", { class: "gold-text" }, "Eyes")),
        h("p", {}, "A glimpse of the flavours waiting at Aashirwad Restaurant."),
        h("div", { class: "divider" }),
      ),
      h("p", { class: "gallery-note", "data-reveal": "" },
        h("span", { html: icon("info", 15) }),
        "Photos shown are illustrative placeholders — real restaurant photos coming soon.",
      ),
      h("div", { class: "gallery-masonry", "data-reveal": "zoom" },
        ...GALLERY_ITEMS.map((g, i) =>
          h("figure", { class: "g-item", tabindex: "0", role: "button", "aria-label": `Open image: ${g.title}`, onclick: () => openLightbox(i), onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); } } },
            h("img", { src: g.img, alt: `${g.title} — ${g.note.toLowerCase()}`, loading: "lazy", width: g.img.endsWith(".svg") ? "200" : "1029", height: g.img.endsWith(".svg") ? "260" : "1285" }),
            h("span", { class: "g-zoom", html: icon("chevrons", 18) }),
            h("figcaption", { class: "g-overlay" },
              h("h3", {}, g.title),
              h("p", {}, g.note),
            ),
          ),
        ),
      ),
    ),
  );

  host.append(sec);
  initReveals(sec);

  /* ---------- lightbox ---------- */
  let lb = null;
  function openLightbox(i) {
    current = i;
    renderLightbox();
  }
  function closeLightbox() {
    lb?.remove(); lb = null;
    document.body.style.overflow = "";
  }
  function step(d) {
    current = (current + d + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
    renderLightbox();
  }
  function renderLightbox() {
    closeLightbox();
    const g = GALLERY_ITEMS[current];
    lb = h("div", { class: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": `Image ${current + 1} of ${GALLERY_ITEMS.length}` },
      h("button", { class: "lb-close", "aria-label": "Close gallery", onclick: closeLightbox, html: icon("close", 22) }),
      h("button", { class: "lb-prev", "aria-label": "Previous image", onclick: () => step(-1), html: icon("chevronLeft", 22) }),
      h("button", { class: "lb-next", "aria-label": "Next image", onclick: () => step(1), html: icon("chevronRight", 22) }),
      h("div", { style: "text-align:center" },
        h("img", { src: g.img, alt: g.title }),
        h("p", { class: "lb-caption" }, `${g.title} · ${g.note} — ${current + 1} / ${GALLERY_ITEMS.length}`),
      ),
    );
    document.body.append(lb);
    document.body.style.overflow = "hidden";
  }

  const onKey = (e) => {
    if (!lb) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };
  document.addEventListener("keydown", onKey);
  bus.on("escape", closeLightbox);
}
