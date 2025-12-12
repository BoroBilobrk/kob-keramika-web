// JS/calculations/cjenik.js
// ------------------------------------------
// Cijene po formatu pločica + ručni cjenik
// ------------------------------------------

import { $, parseNum } from "../core/helpers.js";

// GLOBALNI Cjenik koji koristi autoCalc
export const UNIT_PRICES = {
  pod: 0,
  zidovi: 0,
  hidroPod: 0,
  hidroTus: 0,
  hidroTraka: 0,
  silikon: 0,
  sokl: 0,
  lajsne: 0,
  gerung: 0
};

// -------------------------------
// 1. STORAGE CIJENA PO FORMATIMA
// -------------------------------
const STORAGE_KEY = "kob_format_prices";

// struktura:
// {
//    "120x120": { pod: 12, zidovi: 14, ... },
//    "60x60":   { pod: 10, zidovi: 12, ... },
//    "custom:90x45": { ... }
// }
export function loadAllFormatPrices() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveAllFormatPrices(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

// -------------------------------
// 2. UČITAVANJE CIJENA ZA ODABRANI FORMAT
// -------------------------------
export function loadPricesForFormat(tileFormat) {
  if (!tileFormat) return null;

  const all = loadAllFormatPrices();
  const key = formatKey(tileFormat);

  return all[key] || null;
}

// -------------------------------
// 3. SPREMANJE CIJENA ZA FORMAT
// -------------------------------
export function savePricesForFormat(tileFormat) {
  if (!tileFormat) return;

  const key = formatKey(tileFormat);
  const all = loadAllFormatPrices();

  all[key] = {
    pod: parseNum($("#pricePod")?.value),
    zidovi: parseNum($("#priceZidovi")?.value),
    hidroPod: parseNum($("#priceHidroPod")?.value),
    hidroTus: parseNum($("#priceHidroTus")?.value),
    hidroTraka: parseNum($("#priceHidroTraka")?.value),
    silikon: parseNum($("#priceSilikon")?.value),
    sokl: parseNum($("#priceSokl")?.value),
    lajsne: parseNum($("#priceLajsne")?.value),
    gerung: parseNum($("#priceGerung")?.value)
  };

  saveAllFormatPrices(all);
}

// generira ključ formata
function formatKey(f) {
  if (!f) return "unknown";
  if (f.wcm && f.hcm) return `${f.wcm}x${f.hcm}`;
  return String(f).trim();
}

// -------------------------------
// 4. UVOĐENJE CIJENA U UI
// -------------------------------
export function applyPricesToUI(tileFormat) {
  const p = loadPricesForFormat(tileFormat);
  if (!p) return; // ako nema zapisa – UI ostaje prazan

  $("#pricePod").value        = String(p.pod).replace(".", ",");
  $("#priceZidovi").value     = String(p.zidovi).replace(".", ",");
  $("#priceHidroPod").value   = String(p.hidroPod).replace(".", ",");
  $("#priceHidroTus").value   = String(p.hidroTus).replace(".", ",");
  $("#priceHidroTraka").value = String(p.hidroTraka).replace(".", ",");
  $("#priceSilikon").value    = String(p.silikon).replace(".", ",");
  $("#priceSokl").value       = String(p.sokl).replace(".", ",");
  $("#priceLajsne").value     = String(p.lajsne).replace(".", ",");
  $("#priceGerung").value     = String(p.gerung).replace(".", ",");
}

// -------------------------------
// 5. UČITAVANJE RUČNO UNESENIH CIJENA U UNIT_PRICES (koristi autoCalc)
// -------------------------------
export function readPricesFromInputs() {
  UNIT_PRICES.pod        = parseNum($("#pricePod")?.value);
  UNIT_PRICES.zidovi     = parseNum($("#priceZidovi")?.value);
  UNIT_PRICES.hidroPod   = parseNum($("#priceHidroPod")?.value);
  UNIT_PRICES.hidroTus   = parseNum($("#priceHidroTus")?.value);
  UNIT_PRICES.hidroTraka = parseNum($("#priceHidroTraka")?.value);
  UNIT_PRICES.silikon    = parseNum($("#priceSilikon")?.value);
  UNIT_PRICES.sokl       = parseNum($("#priceSokl")?.value);
  UNIT_PRICES.lajsne     = parseNum($("#priceLajsne")?.value);
  UNIT_PRICES.gerung     = parseNum($("#priceGerung")?.value);
}

// -------------------------------
// 6. Gumb "Spremi cjenik" → sprema CIJENE ZA FORMAT
// -------------------------------
export function savePrices(tileFormat = null) {
  readPricesFromInputs();
  if (tileFormat) savePricesForFormat(tileFormat);
}
