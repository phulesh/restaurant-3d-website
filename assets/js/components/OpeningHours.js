/* ============================================================
   OpeningHours.js — expandable premium hours card with
   dynamic OPEN/CLOSED status in Indian Standard Time.
   ============================================================ */

import { RESTAURANT, HOURS_DAYS } from "../data.js";
import { icon, whatsappIcon } from "../icons.js";
import { h, getOpenStatus, closesInLabel } from "../utils.js";

export default function mountHours(host) {
  const status = getOpenStatus();

  const dayRows = HOURS_DAYS.map((d) =>
    h("div", { class: "day-row" + (d.key === status.dayIndex ? " is-today" : ""), role: "row" },
      h("span", { class: "d-name", role: "cell" },
        h("span", { class: "d-hi", "aria-hidden": "true" }),
        d.name, d.key === status.dayIndex ? " · Today" : "",
      ),
      h("span", { class: "d-time", role: "cell" }, "08:00 – 22:00"),
    )
  );

  const sec = h("section", { class: "section-hours", id: "hours" },
    h("div", { class: "orn-line", "aria-hidden": "true" }),
    h("div", { class: "container" },
      h("div", { class: "section-head", "data-reveal": "" },
        h("span", { class: "eyebrow" }, "Opening Hours"),
        h("h2", {}, "We’re ", h("span", { class: "gold-text", id: "hours-title-state" }, status.isOpen ? "Open" : "Closed"), " Today"),
        h("p", {}, "Open every day of the week — from breakfast to dinner."),
        h("div", { class: "divider" }),
      ),
      h("div", { class: "hours-grid" },
        h("div", { class: "glass-card hours-card", "data-reveal": "left" },
          h("div", { class: "hours-head" },
            h("h3", {}, "Weekly Schedule"),
            h("span", { class: `status-pill ${status.isOpen ? "open" : "closed"}`, id: "hours-pill", role: "status" },
              h("span", { class: "dot live" }),
              h("span", { id: "hours-pill-text" }, status.isOpen ? "OPEN NOW" : "CLOSED NOW"),
            ),
          ),
          h("div", { class: "hours-list", role: "table", "aria-label": "Weekly opening hours" }, ...dayRows),
          h("div", { class: "hours-foot" },
            h("span", { html: icon("clock", 17) }),
            h("span", { id: "hours-foot-text" },
              status.isOpen
                ? `${status.nowLabel} IST · ${closesInLabel(status.closesInMin)}`
                : `${status.nowLabel} IST · Opens ${status.opensLabel} (08:00 AM)`,
            ),
          ),
        ),
        h("div", { class: "hours-side" },
          h("div", { class: "glass-card hours-stat", "data-reveal": "right", style: "transition-delay:.06s" },
            h("span", { class: "hs-icon", html: icon("clock", 24) }),
            h("div", {},
              h("div", { class: "hs-label" }, "Daily Hours"),
              h("div", { class: "hs-value" }, "08:00 AM – 10:00 PM"),
            ),
          ),
          h("div", { class: "glass-card hours-stat", "data-reveal": "right", style: "transition-delay:.12s" },
            h("span", { class: "hs-icon", html: icon("mapPin", 24) }),
            h("div", {},
              h("div", { class: "hs-label" }, "Location"),
              h("div", { class: "hs-value" }, "Kharsia Rd, Dabhara, CG 495688"),
            ),
          ),
          h("div", { class: "glass-card hours-stat", "data-reveal": "right", style: "transition-delay:.18s" },
            h("span", { class: "hs-icon", html: icon("call", 24) }),
            h("div", {},
              h("div", { class: "hs-label" }, "Call us"),
              h("div", { class: "hs-value" }, RESTAURANT.phoneDisplay),
            ),
          ),
          h("div", { class: "glass-card hours-stat", "data-reveal": "right", style: "transition-delay:.24s" },
            h("span", { class: "hs-icon", html: whatsappIcon(22) }),
            h("div", {},
              h("div", { class: "hs-label" }, "WhatsApp Enquiries"),
              h("div", { class: "hs-value" }, "Order & reservation enquiries"),
            ),
          ),
        ),
      ),
    ),
  );

  host.append(sec);

  /* live refresh every 30s */
  const pill = sec.querySelector("#hours-pill");
  const pillText = sec.querySelector("#hours-pill-text");
  const foot = sec.querySelector("#hours-foot-text");
  const title = sec.querySelector("#hours-title-state");
  setInterval(() => {
    const s = getOpenStatus();
    pill.className = `status-pill ${s.isOpen ? "open" : "closed"}`;
    pillText.textContent = s.isOpen ? "OPEN NOW" : "CLOSED NOW";
    title.textContent = s.isOpen ? "Open" : "Closed";
    foot.textContent = s.isOpen
      ? `${s.nowLabel} IST · ${closesInLabel(s.closesInMin)}`
      : `${s.nowLabel} IST · Opens ${s.opensLabel} (08:00 AM)`;
    // keep today highlight fresh
    sec.querySelectorAll(".day-row").forEach((r, i) => {
      const d = HOURS_DAYS[i];
      r.classList.toggle("is-today", d.key === s.dayIndex);
      const name = r.querySelector(".d-name");
      name.childNodes[name.childNodes.length - 1].textContent = d.key === s.dayIndex ? " · Today" : "";
    });
  }, 30000);
}
