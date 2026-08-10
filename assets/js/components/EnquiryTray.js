/* ============================================================
   EnquiryTray.js — floating enquiry tray with badge counter.
   UI-only: state lives in data.js (enquiryState) so a backend
   or WhatsApp/CRM integration can hook in later.
   ============================================================ */

import { enquiryState } from "../data.js";
import { icon, whatsappIcon } from "../icons.js";
import { h, inr, openModal, toast, bus } from "../utils.js";

export default function mountEnquiryTray(host) {
  const fab = h("button", { class: "assistant-fab", style: "left:18px;right:auto", "aria-label": "Open enquiry tray", title: "Your menu enquiries" },
    h("span", { class: "fab-ping" }),
    h("span", { class: "fab-icon", html: icon("ticket", 24) }),
    h("span", { class: "enq-count", style: "position:absolute;top:-4px;right:-4px;min-width:22px;height:22px;border-radius:999px;background:var(--gold-grad);color:#2b1c05;font-size:.72rem;font-weight:800;display:grid;place-items:center;padding:0 5px;border:2px solid #0a1122" }, "0"),
  );

  host.append(fab);

  function count() {
    return enquiryState.list.reduce((n, e) => n + e.qty, 0);
  }

  function renderTray() {
    const items = enquiryState.list;
    const total = items.reduce((n, e) => n + e.qty, 0);
    const amount = items.reduce((n, e) => n + e.qty * e.price, 0);

    const body = h("div", { style: "display:grid;gap:.8rem" },
      items.length === 0
        ? h("p", { style: "color:var(--cream-55);text-align:center;padding:1.2rem 0;font-size:.92rem" },
            "No dishes yet — browse the menu and tap “Add to Enquiry”.")
        : h("div", { style: "display:grid;gap:.55rem" },
            ...items.map((e, i) =>
              h("div", { style: "display:flex;align-items:center;gap:.7rem;background:rgba(248,242,228,.04);border:1px solid var(--glass-border-soft);border-radius:12px;padding:.6rem .8rem" },
                h("span", { style: "font-weight:800;color:var(--gold-300);font-size:.9rem;min-width:22px" }, `${e.qty}×`),
                h("div", { style: "flex:1;min-width:0" },
                  h("div", { style: "font-weight:700;font-size:.9rem;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" }, e.name),
                  h("div", { style: "font-size:.72rem;color:var(--cream-40);font-weight:700" }, inr(e.price)),
                ),
                h("button", { class: "btn-icon", style: "width:34px;height:34px", "aria-label": `Remove ${e.name}`, onclick: () => { e.qty -= 1; if (e.qty <= 0) enquiryState.list.splice(i, 1); renderTray(); } },
                  h("span", { html: icon("close", 15) })),
              )
            ),
          ),
      items.length > 0 && h("div", { style: "display:flex;justify-content:space-between;font-weight:800;color:var(--cream);border-top:1px dashed rgba(233,192,94,.3);padding-top:.8rem" },
        h("span", {}, `${total} ${total === 1 ? "item" : "items"}`),
        h("span", { style: "color:var(--gold-300)" }, `≈ ${inr(amount)}`),
      ),
      items.length > 0 && h("div", { style: "display:grid;gap:.55rem" },
        h("a", { class: "btn btn-whatsapp btn-block", href: waOrderUrl(items), target: "_blank", rel: "noopener", html: whatsappIcon(18) + "Send Enquiry on WhatsApp" }),
        h("button", { class: "btn btn-ghost btn-block", onclick: () => { enquiryState.list.length = 0; toast("Enquiry cleared"); renderTray(); }, html: icon("close", 17) + "Clear All" }),
      ),
      h("p", { style: "font-size:.72rem;color:var(--cream-40);text-align:center" },
        "Enquiries are kept on this device for now — online ordering & CRM are coming soon."),
    );

    const { body: trayBody } = openModal({ title: `Your Enquiry (${total})`, body });
    return trayBody;
  }

  function waOrderUrl(items) {
    const lines = items.map((e) => `• ${e.name} ×${e.qty} — ${inr(e.price * e.qty)}`);
    const msg = `Hello Aashirwad Restaurant! 🙏 I'd like to enquire about:\n${lines.join("\n")}`;
    return `https://wa.me/919516000901?text=${encodeURIComponent(msg)}`;
  }

  fab.addEventListener("click", () => {
    renderTray();
  });

  /* keep badge in sync */
  const badge = fab.querySelector(".enq-count");
  const refresh = () => { badge.textContent = count(); };
  bus.on("enquiry:update", refresh);
  refresh();
}
