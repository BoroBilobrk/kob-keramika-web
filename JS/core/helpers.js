// JS/core/helpers.js

// brza selekcija
export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// pretvorba "3,20" → 3.20
export function parseNum(v) {
  if (!v) return 0;
  return parseFloat(String(v).replace(',', '.')) || 0;
}

// formatiranje brojeva hrvatski
export function formatHr(num, dec = 2) {
  if (num == null || isNaN(num)) return "0";
  return Number(num).toFixed(dec).replace('.', ',');
}

// generiranje ID-a
export function uid() {
  return "id-" + Math.random().toString(36).substr(2, 9);
}
