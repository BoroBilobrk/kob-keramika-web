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

export function savePrices() {
  readPricesFromInputs();
}
