/* ============================================================
   Contact.js — 3D contact card with Call / WhatsApp /
   Directions + enquiry CTA card (UI-only).
   ============================================================ */

import { RESTAURANT } from "../data.js";
import { icon, whatsappIcon } from "../icons.js";
import { h, initReveals, openModal, closeModal, toast, device } from "../utils.js";
import { makeTilt } from "../effects/index.js";

export default function mountContact(host) {
  const enquiryForm = () => {
    const body = h("div", { style: "display:grid;gap:.9rem" },
      h("p", { style: "color:var(--cream-70);font-size:.92rem" },
        "Send a menu enquiry and we’ll get back to you on WhatsApp or by call. (Frontend demo — live ordering is coming soon.)"),
      h("div", { class: "field", html: icon("user", 18) },
        h("input", { type: "text", placeholder: "Your name", "aria-label": "Your name" })),
      h("div", { class: "field", html: icon("call", 18) },
        h("input", { type: "tel", placeholder: "Phone number", "aria-label": "Phone number" })),
      h("div", { class: "field", html: icon("menu", 18) },
        h("input", { type: "text", placeholder: "What would you like to order?", "aria-label": "Order enquiry" })),
      h("div", { style: "display:flex;gap:.6rem" },
        h("button", { class: "btn btn-gold", style: "flex:1", onclick: () => { toast("Enquiry saved — we’ll contact you soon"); closeModal(); } }, "Send Enquiry"),
        h("a", { class: "btn btn-whatsapp", href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", html: whatsappIcon(18) + "WhatsApp" }),
      ),
      h("p", { style: "font-size:.75rem;color:var(--cream-40)" },
        "This form is a UI placeholder — no data is stored yet. A live ordering & CRM system will be connected soon."),
    );
    return body;
  };

  const sec = h("section", { class: "section-contact", id: "contact" },
    h("span", { class: "section-ornament orn-dome", "data-reveal": "zoom", "aria-hidden": "true", html: icon("dome", 180) }),
    h("div", { class: "container" },
      h("div", { class: "section-head", "data-reveal": "" },
        h("span", { class: "eyebrow" }, "Contact"),
        h("h2", {}, "Come, ", h("span", { class: "gold-text" }, "Say Namaste")),
        h("p", {}, "Questions, orders or table enquiries — we’re one call or message away."),
        h("div", { class: "divider" }),
      ),
      h("div", { class: "contact-grid" },
        h("div", { class: "glass-card contact-card", "data-reveal": "left" },
          h("div", { class: "cc-name" },
            RESTAURANT.name,
            h("span", { class: "deva hindi" }, RESTAURANT.nameDeva),
          ),
          h("div", { class: "c-row" },
            h("span", { class: "c-ico", html: icon("mapPin", 22) }),
            h("div", {},
              h("div", { class: "c-label" }, "Address"),
              h("div", { class: "c-value" }, RESTAURANT.address),
            ),
          ),
          h("div", { class: "c-row" },
            h("span", { class: "c-ico", html: icon("directions", 22) }),
            h("div", {},
              h("div", { class: "c-label" }, "Plus Code"),
              h("div", { class: "c-value" }, RESTAURANT.plusCode),
            ),
          ),
          h("div", { class: "c-row" },
            h("span", { class: "c-ico", html: icon("call", 22) }),
            h("div", {},
              h("div", { class: "c-label" }, "Phone"),
              h("div", { class: "c-value" },
                h("a", { href: `tel:${RESTAURANT.phoneE164}` }, RESTAURANT.phoneDisplay)),
            ),
          ),
          h("div", { class: "c-row" },
            h("span", { class: "c-ico", html: icon("clock", 22) }),
            h("div", {},
              h("div", { class: "c-label" }, "Hours"),
              h("div", { class: "c-value" }, "08:00 AM – 10:00 PM · Open daily"),
            ),
          ),
          h("div", { class: "contact-actions" },
            h("a", { class: "btn btn-call", href: `tel:${RESTAURANT.phoneE164}`, html: icon("call", 18) + "Call Now" }),
            h("a", { class: "btn btn-whatsapp", href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", html: whatsappIcon(18) + "WhatsApp" }),
            h("a", { class: "btn btn-ghost btn-wide", href: RESTAURANT.mapsUrl, target: "_blank", rel: "noopener", html: icon("directions", 18) + "Get Directions" }),
          ),
        ),
        h("div", { class: "glass-card contact-cta-card", "data-reveal": "right" },
          h("span", { class: "f-icon", style: "width:64px;height:64px", html: icon("sparkle", 28) }),
          h("h3", {}, "Hungry already?"),
          h("p", {}, "Browse the menu, add dishes to your enquiry, or ask us anything — we reply fast on WhatsApp."),
          h("div", { class: "cta-actions" },
            h("a", { class: "btn btn-gold btn-block", href: "#menu", html: icon("menu", 18) + "View Menu" }),
            h("button", { class: "btn btn-ghost btn-block", onclick: () => openModal({ title: "Send an Enquiry", body: enquiryForm() }), html: icon("send", 18) + "Send Enquiry" }),
            h("a", { class: "btn btn-whatsapp btn-block", href: RESTAURANT.waTextUrl, target: "_blank", rel: "noopener", html: whatsappIcon(18) + "Chat on WhatsApp" }),
          ),
          h("p", { class: "cta-note" }, "Online ordering, table reservation & AI assistant are coming soon."),
        ),
      ),
    ),
  );

  host.append(sec);
  initReveals(sec);

  if (!device.reducedMotion && !device.coarse) {
    const card = sec.querySelector(".contact-card");
    makeTilt(card, { max: 3 });
  }
}
