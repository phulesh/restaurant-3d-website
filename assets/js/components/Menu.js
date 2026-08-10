/* ============================================================
   Menu.js — interactive menu: categories, search, sort,
   animated 3D food cards, marquee, counts.
   ============================================================ */

import { MENU_ITEMS, MENU_CATEGORIES } from "../data.js";
import { icon } from "../icons.js";
import { h, inr, initReveals, bus } from "../utils.js";
import createCategoryFilter from "./CategoryFilter.js";
import createMenuCard from "./MenuCard.js";

const MARQUEE_ITEMS = [
  "Chhole Bhature", "Masala Dosa", "Paneer Tikka", "Veg Sizzler",
  "Triple Schezwan Noodles", "Paneer Chilli Pizza", "White Sauce Pasta",
  "Veg Grilled Sandwich", "Oreo Shake", "Blue Lagoon", "Mint Mojito",
  "Dry Fruit Lassi", "Pav Bhaji", "Cheese Corn Kabab",
];

export default function mountMenu(host) {
  /* ---------- state ---------- */
  const state = {
    cat: "all",
    query: "",
    sort: "cat",
    allCounts: { all: MENU_ITEMS.length },
  };
  MENU_CATEGORIES.forEach((c) => { if (c.id !== "all") state.allCounts[c.id] = MENU_ITEMS.filter((i) => i.cat === c.id).length; });

  const filter = createCategoryFilter(state);
  const grid = h("div", { class: "menu-grid", role: "tabpanel" });
  const resultsEl = filter.toolbar.querySelector("#menu-results");

  const sec = h("section", { class: "section-menu", id: "menu" },
    h("div", { class: "orn-line", "aria-hidden": "true" }),
    h("span", { class: "section-ornament orn-mandala", "data-reveal": "zoom", "aria-hidden": "true", html: icon("mandala", 170) }),
    h("div", { class: "container" },
      h("div", { class: "section-head", "data-reveal": "" },
        h("span", { class: "eyebrow" }, "Our Menu"),
        h("h2", {}, "Crafted for ", h("span", { class: "gold-text" }, "Every Craving")),
        h("p", {}, "Breakfast to shakes — 100% vegetarian, freshly made. Tap a dish to see details or add it to your enquiry."),
        h("div", { class: "divider" }),
      ),
      h("div", { class: "marquee", "data-reveal": "" },
        h("div", { class: "marquee-track" },
          ...[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m) => h("span", {}, m)),
        ),
      ),
      filter.toolbar,
      filter.chipRow,
      grid,
    ),
  );

  host.append(sec);
  initReveals(sec);

  /* ---------- filtering ---------- */
  function apply() {
    const q = state.query.trim().toLowerCase();
    let list = MENU_ITEMS.filter((i) =>
      (state.cat === "all" || i.cat === state.cat) &&
      (!q || i.name.toLowerCase().includes(q))
    );
    if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (state.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    grid.replaceChildren();
    if (!list.length) {
      grid.append(
        h("div", { class: "menu-empty" },
          h("span", { html: icon("search", 44) }),
          h("h3", {}, "No dishes found"),
          h("p", {}, `Nothing matches “${state.query}” in this category.`),
          h("button", { class: "btn btn-gold btn-sm", onclick: () => { state.query = ""; state.cat = "all"; bus.emit("reset-filter"); apply(); } }, "Clear search"),
        ),
      );
    } else {
      const frag = document.createDocumentFragment();
      list.forEach((item) => frag.append(createMenuCard(item)));
      grid.append(frag);
    }
    resultsEl.textContent = `${list.length} ${list.length === 1 ? "dish" : "dishes"}`;
  }

  /* keep chips + search in sync with state */
  bus.on("filter:cat", (id) => {
    state.cat = id;
    filter.chips.forEach((c) => {
      const on = c.dataset.cat === id;
      c.classList.toggle("active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
    });
    apply();
  });
  bus.on("filter:query", (v) => { state.query = v; apply(); });
  bus.on("filter:sort", (v) => { state.sort = v; apply(); });
  bus.on("reset-filter", () => {
    state.query = "";
    const inp = filter.toolbar.querySelector("input");
    if (inp) inp.value = "";
    filter.chips.forEach((c) => {
      const on = c.dataset.cat === "all";
      c.classList.toggle("active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
    });
  });

  apply();

  return { refresh: apply, get count() { return grid.children.length; } };
}
