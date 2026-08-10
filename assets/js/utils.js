/* ============================================================
   utils.js — DOM helpers, formatting, open-status logic,
   toast/modal system, tiny event bus, reveal observer
   ============================================================ */

import { icon } from "./icons.js";

/* ---------- Tiny event bus ---------- */
export const bus = {
  _m: new Map(),
  on(ev, fn) {
    if (!this._m.has(ev)) this._m.set(ev, new Set());
    this._m.get(ev).add(fn);
    return () => this._m.get(ev)?.delete(fn);
  },
  emit(ev, payload) {
    this._m.get(ev)?.forEach((fn) => fn(payload));
  },
};

/* ---------- Formatting ---------- */
export const inr = (n) => `₹${n.toLocaleString("en-IN")}`;

/* ---------- Open / closed status (Asia/Kolkata) ---------- */
export function getOpenStatus(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short", hour: "numeric", minute: "2-digit", hour12: true,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const dayIndex = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }[parts.weekday];
  const hour = Number(parts.hour === "12" ? "0" : parts.hour) + (parts.dayPeriod === "PM" ? 12 : 0);
  const minute = Number(parts.minute);
  const mins = hour * 60 + minute;
  const open = 8 * 60;
  const close = 22 * 60;
  const isOpen = mins >= open && mins < close;
  return {
    isOpen,
    dayIndex,
    nowLabel: `${parts.hour}:${parts.minute} ${parts.dayPeriod}`,
    closesLabel: "10:00 PM",
    opensLabel: "08:00 AM",
    closesInMin: isOpen ? close - mins : null,
  };
}

export function closesInLabel(min) {
  if (min <= 0) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `Closes in ${h}h ${m}m` : `Closes in ${m}m`;
}

/* ---------- DOM helpers ---------- */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    el.append(c.nodeType ? c : document.createTextNode(c));
  }
  return el;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- Toast notifications ---------- */
let toastStack = null;
export function toast(msg) {
  if (!toastStack) {
    toastStack = h("div", { class: "toast-stack", "aria-live": "polite" });
    document.body.append(toastStack);
  }
  const el = h("div", { class: "toast", role: "status" },
    h("span", { class: "tick", html: icon("check", 13) }),
    h("span", {}, msg),
  );
  toastStack.append(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 320);
  }, 2600);
}

/* ---------- Modal ---------- */
let activeModal = null;
export function openModal({ title, body, onMount }) {
  closeModal();
  const backdrop = h("div", { class: "modal-backdrop", role: "dialog", "aria-modal": "true", "aria-label": title });
  const modal = h("div", { class: "modal" },
    h("button", { class: "modal-close", "aria-label": "Close", onclick: closeModal, html: icon("close", 20) }),
    h("div", { class: "modal-body" }),
  );
  const bodyEl = $(".modal-body", modal);
  if (title) {
    bodyEl.append(h("h3", { class: "font-display", style: "font-size:1.45rem;color:var(--cream);font-weight:600;margin-bottom:1rem;padding-right:2.4rem" }, title));
  }
  bodyEl.append(body);
  backdrop.append(modal);
  document.body.append(backdrop);
  document.body.style.overflow = "hidden";
  activeModal = backdrop;
  onMount?.(bodyEl, modal);
  return { backdrop, modal, body: bodyEl };
}

export function closeModal() {
  activeModal?.remove();
  activeModal = null;
  document.body.style.overflow = "";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeModal(); bus.emit("escape"); }
});

/* ---------- Scroll reveal observer ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  for (const en of entries) {
    if (en.isIntersecting) {
      en.target.classList.add("is-revealed");
      revealObserver.unobserve(en.target);
    }
  }
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

export function initReveals(root = document) {
  $$("[data-reveal]:not(.is-revealed)", root).forEach((el) => revealObserver.observe(el));
}

/* ---------- Smooth-scroll helper (respects reduced motion) ---------- */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/* ---------- Device capability flags ---------- */
export const device = {
  reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  lowPower: navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false,
  coarse: matchMedia("(pointer: coarse)").matches,
};
