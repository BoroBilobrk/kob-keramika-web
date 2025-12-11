// JS/calculations/openings.js
import { AppState } from "../core/state.js";
import { $, uid, parseNum, formatHr } from "../core/helpers.js";

const TYPE_LABELS = {
  door:    "Vrata",
  window:  "Prozor",
  niche:   "Niša",
  geberit: "Geberit",
  vert:    "Vertikala",
  custom:  "Otvor"
};

export function openingArea(o) {
  return o.w * o.h * o.count;
}

export function openingPerim(o) {
  return 2 * (o.w + o.h) * o.count;
}

export function addOpening(kind) {
  const label = TYPE_LABELS[kind] || "Otvor";

  const wStr = prompt(`Širina ${label} (m):`, "0,90");
  const hStr = prompt(`Visina ${label} (m):`, "2,00");
  const cStr = prompt(`Broj komada:`, "1");

  const w = parseNum(wStr);
  const h = parseNum(hStr);
  const c = parseInt(cStr || "1", 10) || 1;

  if (!w || !h || !c) {
    alert("Unos nije ispravan.");
    return;
  }

  AppState.openings.push({
    id: uid(),
    kind,
    label,
    w,
    h,
    count: c
  });

  renderOpenings();
}

export function removeOpening(id) {
  AppState.openings = AppState.openings.filter(o => o.id !== id);
  renderOpenings();
}

export function renderOpenings() {
  const wrap = $("#openingsList");
  if (!wrap) return;

  if (!AppState.openings.length) {
    wrap.innerHTML = `<p class="hint">Nema unesenih otvora.</p>`;
    return;
  }

  wrap.innerHTML = "";
  AppState.openings.forEach(o => {
    const div = document.createElement("div");
    div.className = "opening-card";
    div.innerHTML = `
      <div class="opening-header">
        <div>
          <div class="opening-title">${o.label}</div>
          <div class="opening-meta">
            ${formatHr(o.w)} × ${formatHr(o.h)} m • kom: ${o.count}
          </div>
        </div>
        <button class="btn-small secondary">🗑</button>
      </div>
    `;
    div.querySelector("button").addEventListener("click", () => removeOpening(o.id));
    wrap.appendChild(div);
  });
}

export function getOpenings() {
  return AppState.openings;
}
