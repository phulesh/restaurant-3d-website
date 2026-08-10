/* ============================================================
   effects/index.js — lightweight 3D/perceptual effects.
   All effects are pure CSS 3D transforms + rAF pointer math —
   no WebGL, no big assets. Everything is disabled on
   prefers-reduced-motion and reduced on low-power devices.
   ============================================================ */

import { device } from "../utils.js";

/* ---------- Floating food particles ---------- */
export function createParticles(container, { count = 14, types = ["orb", "flake", "dot"] } = {}) {
  if (device.reducedMotion || device.lowPower) return () => {};
  const els = [];
  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const el = document.createElement("span");
    el.className = `particle p-${type}`;
    const size = type === "orb" ? 6 + Math.random() * 14 : type === "flake" ? 4 + Math.random() * 4 : 2 + Math.random() * 3;
    el.style.width = el.style.height = `${size}px`;
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${Math.random() * 100}%`;
    el.style.opacity = String(0.25 + Math.random() * 0.55);
    container.append(el);
    els.push(el);
  }
  let raf = 0;
  const t0 = performance.now();
  const tick = (now) => {
    const t = (now - t0) / 1000;
    els.forEach((el, i) => {
      const speed = 0.5 + (i % 5) * 0.22;
      const amp = 10 + (i % 4) * 9;
      const x = parseFloat(el.style.left) + Math.sin(t * speed + i * 1.7) * 1.6;
      const y = parseFloat(el.style.top) - ((t * (2.4 + (i % 3) * 1.1)) % 108) + 108;
      el.style.transform = `translate3d(${Math.sin(t * speed + i) * amp}px, ${-((t * (2.4 + (i % 3) * 1.1)) % 108)}px, 0) rotate(${Math.sin(t + i) * 30}deg)`;
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
      void el.style.transform;
    });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/* ---------- Pointer parallax (mouse / touch tilt of layers) ---------- */
export function createParallax(scope, { strength = 14 } = {}) {
  if (device.reducedMotion) return () => {};
  const layers = scope.querySelectorAll("[data-parallax]");
  if (!layers.length) return () => {};
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, running = true;

  const onMove = (e) => {
    const rect = scope.getBoundingClientRect();
    const px = e.touches ? e.touches[0].clientX : e.clientX;
    const py = e.touches ? e.touches[0].clientY : e.clientY;
    tx = ((px - rect.left) / rect.width - 0.5) * 2;
    ty = ((py - rect.top) / rect.height - 0.5) * 2;
  };
  const onLeave = () => { tx = 0; ty = 0; };

  scope.addEventListener("mousemove", onMove, { passive: true });
  scope.addEventListener("touchmove", onMove, { passive: true });
  scope.addEventListener("mouseleave", onLeave);

  const tick = () => {
    if (!running) return;
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    layers.forEach((l) => {
      const d = parseFloat(l.dataset.parallax || "1");
      l.style.transform = `translate3d(${(-cx * strength * d).toFixed(2)}px, ${(-cy * strength * d).toFixed(2)}px, 0)`;
    });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    scope.removeEventListener("mousemove", onMove);
    scope.removeEventListener("touchmove", onMove);
    scope.removeEventListener("mouseleave", onLeave);
  };
}

/* ---------- Card 3D tilt on interaction ---------- */
export function makeTilt(card, { max = 8 } = {}) {
  if (device.reducedMotion || device.coarse) return () => {};
  const onMove = (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${(px * max * 2).toFixed(2)}deg) rotateX(${(-py * max * 2).toFixed(2)}deg) translateY(-3px)`;
    const glow = card.querySelector(".tilt-glow");
    if (glow) { glow.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`); glow.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`); }
  };
  const onLeave = () => { card.style.transform = ""; };
  card.addEventListener("mousemove", onMove, { passive: true });
  card.addEventListener("mouseleave", onLeave);
  return () => {
    card.removeEventListener("mousemove", onMove);
    card.removeEventListener("mouseleave", onLeave);
  };
}

/* ---------- Subtle steam wisps (pure CSS, spawned on demand) ---------- */
export function spawnSteam(parent, { side = "left", top = "38%" } = {}) {
  if (device.reducedMotion) return;
  const steam = document.createElement("div");
  steam.className = `steam s1 ${side === "right" ? "s3" : "s2"}`;
  steam.style.cssText = `left:${side === "right" ? "68%" : "32%"};top:${top};transform:translate(-50%,-50%);`;
  for (let i = 0; i < 3; i++) steam.append(document.createElement("span"));
  parent.append(steam);
}
