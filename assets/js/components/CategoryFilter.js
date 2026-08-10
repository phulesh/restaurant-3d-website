/* ============================================================
   CategoryFilter.js — category chips + search + sort.
   Emits "filter" events; Menu.js renders the grid.
   ============================================================ */

import { MENU_CATEGORIES } from "../data.js";
import { icon } from "../icons.js";
import { h } from "../utils.js";
import { bus } from "../utils.js";

export default function createCategoryFilter(state) {
  const chips = MENU_CATEGORIES.map((c) => {
    const count = state.allCounts[c.id] ?? 0;
    return h("button", {
      class: "chip" + (state.cat === c.id ? " active" : ""),
      "data-cat": c.id,
      role: "tab",
      "aria-selected": state.cat === c.id ? "true" : "false",
      onclick: () => bus.emit("filter:cat", c.id),
    }, icon(c.icon, 17), c.label, h("span", { class: "count" }, count));
  });

  const searchField = h("div", { class: "field" },
    h("span", { html: icon("search", 19) }),
    h("input", {
      type: "search", placeholder: "Search menu…", value: state.query,
      "aria-label": "Search menu",
      oninput: (e) => bus.emit("filter:query", e.target.value),
    }),
  );

  const sortSelect = h("div", { class: "select-wrap" },
    h("select", {
      "aria-label": "Sort menu",
      onchange: (e) => bus.emit("filter:sort", e.target.value),
    },
      h("option", { value: "cat", selected: state.sort === "cat" }, "Category order"),
      h("option", { value: "price-asc", selected: state.sort === "price-asc" }, "Price: Low → High"),
      h("option", { value: "price-desc", selected: state.sort === "price-desc" }, "Price: High → Low"),
      h("option", { value: "name", selected: state.sort === "name" }, "Name A–Z"),
    ),
  );

  const toolbar = h("div", { class: "menu-toolbar" },
    searchField,
    sortSelect,
    h("span", { class: "results", id: "menu-results" }, ""),
  );
  const chipRow = h("div", { class: "menu-cats", role: "tablist", "aria-label": "Menu categories" }, ...chips);

  return { toolbar, chipRow, chips };
}
