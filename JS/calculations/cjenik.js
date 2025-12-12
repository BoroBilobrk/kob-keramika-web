// JS/calculations/cjenik.js
import { $, parseNum } from "../core/helpers.js";

// ručni cjenik – vrijednosti se pune iz input polja
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

// Čitanje cijena iz input polja u UNIT_PRICES
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

  // vraćamo plain objekt (zgodno za Cloud)
  return { ...UNIT_PRICES };
}

// Ručno spremanje cjenika (trenutno samo u memoriji + Cloud preko saveToCloud)
export function savePrices() {
  readPricesFromInputs();
}

/**
 * Pretvori UNIT_PRICES u običan objekt spreman za Cloud.
 * (poziva se iz saveToCloud)
 */
export function pricesToPlainObject() {
  // pobrinemo se da je UNIT_PRICES svježe
  readPricesFromInputs();
  return { ...UNIT_PRICES };
}

/**
 * Primijeni objekt cijena (npr. iz Cloud-a) na:
 *  - UNIT_PRICES
 *  - input polja u UI-u "Cjenik"
 */
export function applyPricesObject(obj = {}) {
  if (!obj) return;

  // upiši u UNIT_PRICES
  Object.keys(UNIT_PRICES).forEach(key => {
    if (typeof obj[key] === "number") {
      UNIT_PRICES[key] = obj[key];
    }
  });

  // helper za upis u polje (decimalna zarez)
  const setVal = (id, val) => {
    const el = $(id);
    if (!el) return;
    if (typeof val !== "number" || isNaN(val)) {
      el.value = "";
    } else {
      el.value = val.toFixed(2).replace(".", ",");
    }
  };

  setVal("#pricePod",        UNIT_PRICES.pod);
  setVal("#priceZidovi",     UNIT_PRICES.zidovi);
  setVal("#priceHidroPod",   UNIT_PRICES.hidroPod);
  setVal("#priceHidroTus",   UNIT_PRICES.hidroTus);
  setVal("#priceHidroTraka", UNIT_PRICES.hidroTraka);
  setVal("#priceSilikon",    UNIT_PRICES.silikon);
  setVal("#priceSokl",       UNIT_PRICES.sokl);
  setVal("#priceLajsne",     UNIT_PRICES.lajsne);
  setVal("#priceGerung",     UNIT_PRICES.gerung);
}
