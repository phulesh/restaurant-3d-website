/* ============================================================
   Assistant.js — floating AI assistant PLACEHOLDER.
   UI only. The chat replies are canned; hooking a real LLM /
   n8n / WhatsApp automation comes in the next phase.
   ============================================================ */

import { RESTAURANT } from "../data.js";
import { icon, whatsappIcon } from "../icons.js";
import { h, getOpenStatus } from "../utils.js";

const QUICK = ["Menu & price", "Today's hours", "Location & directions", "Order on WhatsApp"];

export default function mountAssistant(host) {
  const fab = h("button", { class: "assistant-fab", "aria-label": "Open AI assistant", title: "Aashirwad Assistant (coming soon)" },
    h("span", { class: "fab-ping" }),
    h("span", { html: icon("sparkle", 26) }),
  );

  host.append(fab);

  let panel = null;

  function canned(q) {
    const s = getOpenStatus();
    const text = q.toLowerCase();
    if (text.includes("hour") || text.includes("open") || text.includes("close") || text.includes("time"))
      return `We're open every day, 08:00 AM – 10:00 PM (IST). Right now it's ${s.nowLabel} — so we are ${s.isOpen ? "open" : "closed"}.`;
    if (text.includes("menu") || text.includes("price") || text.includes("dish"))
      return `Our menu has Breakfast, Starters, Tandoor, Soup, Pizza, Pasta, Sandwich, Burger, Drinks, Lassi, Mocktails & Shakes — priced mostly between ₹20 and ₹509. Browse the full menu above!`;
    if (text.includes("location") || text.includes("direction") || text.includes("where") || text.includes("address"))
      return `We're at ${RESTAURANT.address} — Plus Code ${RESTAURANT.plusCode}. Tap “Get Directions” to open Google Maps.`;
    if (text.includes("whatsapp") || text.includes("order") || text.includes("book") || text.includes("reserve"))
      return `You can message us on WhatsApp at ${RESTAURANT.phoneDisplay} for orders and table enquiries. Online ordering is coming soon!`;
    if (text.includes("veg") || text.includes("pure"))
      return `Yes — Aashirwad Restaurant is a 100% pure vegetarian restaurant. No meat, no eggs.`;
    return `Namaste! 🙏 I'm Aashirwad's assistant (demo). Ask me about the menu, hours, location or ordering — or tap a quick question below.`;
  }

  function openPanel() {
    panel?.remove();
    panel = h("div", { class: "assistant-panel", role: "dialog", "aria-label": "Aashirwad assistant" },
      h("div", { class: "ap-head" },
        h("span", { class: "ap-ava", html: icon("sparkle", 20) }),
        h("div", {},
          h("h4", {}, "Aashirwad Assistant"),
          h("p", {}, "Demo — real AI coming soon"),
        ),
        h("button", { class: "modal-close", style: "position:static;width:36px;height:36px", "aria-label": "Close assistant", onclick: closePanel, html: icon("close", 17) }),
      ),
      h("div", { class: "ap-body" },
        h("p", { class: "ap-msg" }, "Namaste! 🙏 Welcome to Aashirwad Restaurant. Ask me anything about our menu, timings or location."),
        h("div", { class: "ap-chips" },
          ...QUICK.map((q) =>
            h("button", { onclick: () => answer(q) }, q),
          ),
        ),
        h("div", { class: "ap-input" },
          h("input", { type: "text", placeholder: "Type your question…", "aria-label": "Ask the assistant", onkeydown: (e) => { if (e.key === "Enter") send(e.target.value); } }),
          h("button", { "aria-label": "Send", onclick: () => send(panel.querySelector("input").value) }, h("span", { html: icon("send", 17) })),
        ),
      ),
    );
    document.body.append(panel);
  }

  function closePanel() { panel?.remove(); panel = null; }

  function answer(q) {
    const body = panel.querySelector(".ap-body");
    const oldChips = body.querySelector(".ap-chips");
    const oldInput = body.querySelector(".ap-input");
    const reply = h("p", { class: "ap-msg", style: "border-color:rgba(233,192,94,.4);color:var(--gold-200)" }, canned(q));
    body.insertBefore(reply, oldChips || oldInput);
    if (oldChips) oldChips.remove();
    oldInput?.querySelector("input")?.focus();
  }

  function send(raw) {
    const v = (raw || "").trim();
    if (!v) return;
    answer(v);
  }

  fab.addEventListener("click", () => (panel ? closePanel() : openPanel()));
}
