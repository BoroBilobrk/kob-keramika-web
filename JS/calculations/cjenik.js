// JS/calculations/cjenik.js
import { $, parseNum } from "../core/helpers.js";

// Cijene po formatu pločice za POD i ZIDOVE
// ključ = value iz <select id="tileFormatSelect">
export const FORMAT_PRICES = {
  "30x60":   { pod: 0, zidovi: 0 },
  "60x60":   { pod: 0, zidovi: 0 },
  "90x90":   { pod: 0, zidovi: 0 },
  "120x120": { pod: 0, zidovi: 0 },
  "60x120":  { pod: 0, zidovi: 0 },
  "100x300": { pod: 0, zidovi: 0 },
  "custom":  { pod: 0, zidovi: 0 }   // default / stari način
};

// Ostale cijene – ne ovise o formatu
export const UNIT_PRICES = {
  pod: 0,       // KORISTI SE SAMO ZA "custom" ako želiš zadržati staro ponašanje
  zidovi: 0,    // isto kao gore
  hidroPod: 0,
  hidroTus: 0,
  hidroTraka: 0,
  silikon: 0,
  sokl: 0,
  lajsne: 0,
  gerung: 0
};

// ============ POMOĆNE FUNKCIJE ============

function readFormatPricesFromInputs() {
  // očekujemo inpute tipa pricePod_30x60, priceZidovi_30x60, itd.
  const formats = Object.keys(FORMAT_PRICES);

  const hasFormatInputs = formats.some(fmt => $("#pricePod_" + fmt) || $("#priceZidovi_" + fmt));

  formats.forEach(fmt => {
    const podId    = `#pricePod_${fmt}`;
    const zidoviId = `#priceZidovi_${fmt}`;

    const podVal    = $(podId)?.value;
    const zidoviVal = $(zidoviId)?.value;

    if (podVal != null)    FORMAT_PRICES[fmt].pod    = parseNum(podVal);
    if (zidoviVal != null) FORMAT_PRICES[fmt].zidovi = parseNum(zidoviVal);
  });

  // za kompatibilnost – ako želiš da stara polja "pricePod" / "priceZidovi"
  // pune custom format, ostavi ovo; ako ne, slobodno izbaci
  const legacyPod    = $("#pricePod")?.value;
  const legacyZidovi = $("#priceZidovi")?.value;

  if (legacyPod != null)    FORMAT_PRICES.custom.pod    = parseNum(legacyPod);
  if (legacyZidovi != null) FORMAT_PRICES.custom.zidovi = parseNum(legacyZidovi);

  if (!hasFormatInputs) {
    const podNum = legacyPod != null ? parseNum(legacyPod) : 0;
    const zidoviNum = legacyZidovi != null ? parseNum(legacyZidovi) : 0;

    formats.forEach(fmt => {
      FORMAT_PRICES[fmt].pod = podNum;
      FORMAT_PRICES[fmt].zidovi = zidoviNum;
    });
  }
}

// Čitanje cijena iz input polja u UNIT_PRICES + FORMAT_PRICES
export function readPricesFromInputs() {
  // formati
  readFormatPricesFromInputs();

  // zajedničke stavke
  UNIT_PRICES.hidroPod   = parseNum($("#priceHidroPod")?.value);
  UNIT_PRICES.hidroTus   = parseNum($("#priceHidroTus")?.value);
  UNIT_PRICES.hidroTraka = parseNum($("#priceHidroTraka")?.value);
  UNIT_PRICES.silikon    = parseNum($("#priceSilikon")?.value);
  UNIT_PRICES.sokl       = parseNum($("#priceSokl")?.value);
  UNIT_PRICES.lajsne     = parseNum($("#priceLajsne")?.value);
  UNIT_PRICES.gerung     = parseNum($("#priceGerung")?.value);

  // zbog stare strukture punimo i pod/zidovi s "custom" vrijednostima
  UNIT_PRICES.pod    = FORMAT_PRICES.custom.pod;
  UNIT_PRICES.zidovi = FORMAT_PRICES.custom.zidovi;

  // vraćamo plain objekt (zgodno za Cloud)
  return {
    ...UNIT_PRICES,
    formats: JSON.parse(JSON.stringify(FORMAT_PRICES))
  };
}

// Ručno spremanje cjenika (trenutno samo u memoriji + Cloud preko saveToCloud)
export function savePrices() {
  readPricesFromInputs();
}

// Pretvori cijene u objekt spreman za Cloud
export function pricesToPlainObject() {
  readPricesFromInputs();
  return {
    ...UNIT_PRICES,
    formats: JSON.parse(JSON.stringify(FORMAT_PRICES))
  };
}

// Primijeni objekt cijena (npr. iz Cloud-a) na UNIT_PRICES, FORMAT_PRICES i inpute
export function applyPricesObject(obj = {}) {
  if (!obj) return;

  // 1) UNIT_PRICES (ostale stavke)
  Object.keys(UNIT_PRICES).forEach(key => {
    if (typeof obj[key] === "number") {
      UNIT_PRICES[key] = obj[key];
    }
  });

  // 2) FORMAT_PRICES (ako postoji obj.formats)
  if (obj.formats && typeof obj.formats === "object") {
    Object.keys(FORMAT_PRICES).forEach(fmt => {
      const src = obj.formats[fmt];
      if (!src) return;
      if (typeof src.pod === "number")    FORMAT_PRICES[fmt].pod    = src.pod;
      if (typeof src.zidovi === "number") FORMAT_PRICES[fmt].zidovi = src.zidovi;
    });
  } else {
    // kompatibilnost – ako u Cloud-u još nema formats, puni custom iz starih polja
    FORMAT_PRICES.custom.pod    = UNIT_PRICES.pod;
    FORMAT_PRICES.custom.zidovi = UNIT_PRICES.zidovi;
  }

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

  // 3) upis nazad u inpute – formati
  Object.keys(FORMAT_PRICES).forEach(fmt => {
    setVal(`#pricePod_${fmt}`,    FORMAT_PRICES[fmt].pod);
    setVal(`#priceZidovi_${fmt}`, FORMAT_PRICES[fmt].zidovi);
  });

  // legacy polja (ako ih još koristiš u UI-u)
  setVal("#pricePod",        UNIT_PRICES.pod);
  setVal("#priceZidovi",     UNIT_PRICES.zidovi);

  // 4) ostale stavke
  setVal("#priceHidroPod",   UNIT_PRICES.hidroPod);
  setVal("#priceHidroTus",   UNIT_PRICES.hidroTus);
  setVal("#priceHidroTraka", UNIT_PRICES.hidroTraka);
  setVal("#priceSilikon",    UNIT_PRICES.silikon);
  setVal("#priceSokl",       UNIT_PRICES.sokl);
  setVal("#priceLajsne",     UNIT_PRICES.lajsne);
  setVal("#priceGerung",     UNIT_PRICES.gerung);
}

/**
 * Helper koji vrati cijene za trenutno odabrani format:
 *  - pod/zidovi prema FORMAT_PRICES
 *  - ostalo iz UNIT_PRICES
 */
export function getPricesForCurrentFormat() {
  const select = $("#tileFormatSelect");
  const format = select?.value || "custom";

  const fmt = FORMAT_PRICES[format] || FORMAT_PRICES.custom;
  return {
    formatPrices: fmt,
    unitPrices: UNIT_PRICES
  };
}