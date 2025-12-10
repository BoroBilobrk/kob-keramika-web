// js/core/helpers.js
export function parseNum(v) {
  if (!v) return 0;
  return parseFloat(String(v).replace(",", ".")) || 0;
}

export function formatHr(v, decimals = 2) {
  if (v == null || isNaN(v)) return "0";
  return Number(v).toFixed(decimals).replace(".", ",");
}

export function newId() {
  return Math.random().toString(36).substr(2, 9);
}
