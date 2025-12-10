// js/calculations/openings.js
import { state } from "../core/state.js";
import { newId, parseNum, formatHr } from "../core/helpers.js";

export function openingArea(o) {
  return (o.w * o.h) * o.count;
}

export function openingPerim(o) {
  return (2 * (o.w + o.h)) * o.count;
}

export function addOpening(type, label) {
  const w = prompt("Širina (m)?", "0,90");
  const h = prompt("Visina (m)?", "2,00");
  const c = prompt("Komada?", "1");

  const wv = parseNum(w);
  const hv = parseNum(h);
  const cv = parseInt(c) || 1;

  state.openings.push({
    id: newId(),
    type,
    label,
    w: wv,
    h: hv,
    count: cv,
    subtract: type === "vrata"
  });

  renderOpenings();
}

export function removeOpening(id) {
  state.openings = state.openings.filter(o => o.id !== id);
  renderOpenings();
}

export function renderOpenings() {
  const container = document.getElementById("openingsList");
  if (!container) return;

  if (!state.openings.length) {
    container.innerHTML = `<p class="hint">Nema unesenih otvora.</p>`;
    return;
  }

  container.innerHTML = state.openings.map(o => `
    <div class="opening-card">
      <div class="opening-header">
        <div>
          <div class="opening-title">${o.label}</div>
          <div class="opening-meta">
            ${formatHr(o.w)} × ${formatHr(o.h)} m • kom: ${o.count}
          </div>
        </div>
        <button class="btn-small secondary" onclick="window.removeOpening('${o.id}')">🗑</button>
      </div>
    </div>
  `).join("");
}
