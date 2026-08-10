/* ============================================================
   MenuCard.js — animated 3D food card.
   Renders item name, veg badge, price, description, details
   modal + "Add to Enquiry" (UI-only for now).
   ============================================================ */

import { MENU_CATEGORIES, ARTWORK_CATS, addEnquiry } from "../data.js";
import { icon } from "../icons.js";
import { h, inr, openModal, closeModal, toast, device, bus } from "../utils.js";
import { makeTilt } from "../effects/index.js";

export function categoryLabel(cat) {
  return MENU_CATEGORIES.find((c) => c.id === cat)?.label || cat;
}

export default function createMenuCard(item) {
  const cat = MENU_CATEGORIES.find((c) => c.id === item.cat);
  const isArt = ARTWORK_CATS.includes(item.cat);

  const card = h("article", { class: "food-card", "data-cat": item.cat, role: "article" },
    h("span", { class: "tilt-glow" }),
    h("div", { class: "food-media" + (isArt ? " svg-art" : "") },
      isArt
        ? h("img", { src: item.img, alt: `${item.name} — illustration`, loading: "lazy", width: "200", height: "260" })
        : h("img", { src: item.img, alt: `${item.name} — illustrative dish photo`, loading: "lazy", width: "1029", height: "1285" }),
      h("span", { class: "food-cat-tag" }, cat.label),
      isArt ? h("span", { class: "media-label" }, "Illustration") : h("span", { class: "media-label" }, "Illustrative"),
    ),
    h("div", { class: "food-body" },
      h("div", { class: "food-name-row" },
        h("h3", { class: "food-name" }, item.name),
        h("span", { class: "food-price" }, inr(item.price)),
      ),
      h("div", { class: "food-meta", style: "display:flex;align-items:center;gap:.55rem" },
        h("span", { class: "veg-badge", html: `<span class="veg-dot"></span>Veg` }),
        h("span", { style: "font-size:.72rem;color:var(--cream-40);font-weight:700" }, `₹${item.price} · ${cat.label}`),
      ),
      h("p", { class: "food-desc" }, item.desc),
      h("div", { class: "food-actions" },
        h("button", { class: "btn btn-ghost btn-sm", onclick: () => openDetails(item), html: icon("eye", 16) + "Details" }),
        h("button", { class: "btn btn-gold btn-sm", onclick: () => addToEnquiry(item), html: icon("plus", 16) + "Enquiry" }),
      ),
    ),
  );

  /* 3D tilt on desktop only */
  if (!device.reducedMotion && !device.coarse) {
    card.addEventListener("mouseenter", () => card.classList.add("is-tilting"));
    makeTilt(card, { max: 7 });
  }

  return card;
}

/* ---------- Details modal ---------- */
function openDetails(item) {
  const cat = MENU_CATEGORIES.find((c) => c.id === item.cat);
  const body = h("div", { style: "display:grid;gap:1rem" },
    h("img", { src: item.img, alt: item.name, style: "width:100%;aspect-ratio:4/3.2;object-fit:cover;border-radius:16px;border:1px solid var(--glass-border-soft)", loading: "lazy" }),
    h("div", { style: "display:flex;align-items:center;gap:.7rem;flex-wrap:wrap" },
      h("span", { class: "veg-badge", html: `<span class="veg-dot"></span>Pure Veg` }),
      h("span", { class: "food-cat-tag" }, cat.label),
    ),
    h("p", { style: "color:var(--cream-70);font-size:.95rem" }, item.desc),
    h("div", { style: "display:flex;align-items:center;gap:.6rem" },
      h("span", { style: "font-size:1.5rem;font-weight:800;color:var(--gold-300)" }, inr(item.price)),
      h("span", { style: "font-size:.8rem;color:var(--cream-40);font-weight:700" }, "per serving · taxes extra"),
    ),
    h("div", { style: "display:flex;gap:.6rem;margin-top:.3rem" },
      h("button", { class: "btn btn-gold", style: "flex:1", onclick: () => { addToEnquiry(item); closeDetailsModal(body); }, html: icon("plus", 17) + "Add to Enquiry" }),
    ),
    h("p", { style: "font-size:.76rem;color:var(--cream-40);display:flex;gap:.4rem;align-items:center" },
      h("span", { html: icon("info", 14) }),
      "Prices as listed on the menu. Please confirm current prices with the restaurant before ordering.",
    ),
  );
  openModal({ title: item.name, body });

  function closeDetailsModal() { closeModal(); }
}

/* ---------- Enquiry (UI-only; backend/WhatsApp integration comes later) ---------- */
function addToEnquiry(item) {
  addEnquiry(item);
  bus.emit("enquiry:update");
  toast(`Added to enquiry: ${item.name}`);
}
