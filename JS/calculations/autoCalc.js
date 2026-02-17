// JS/calculations/autoCalc.js
console.log("autoCalc.js loaded");

import { getOpenings, openingArea } from "./openings.js";

export function calculateAuto() {
  // helper: string -> number (podržava zarez)
  const num = v => parseFloat(String(v ?? "").replace(",", ".")) || 0;

  // osnovne dimenzije prostorije
  const d = num(document.getElementById("dimD")?.value);
  const s = num(document.getElementById("dimS")?.value);
  const h = num(document.getElementById("dimV")?.value);

  const chk = id => !!document.getElementById(id)?.checked;

  let result = {
    pod: 0,
    zidovi: 0,

    hidroPod: 0,
    hidroTus: 0,
    hidroUkupno: 0,

    hidroTraka: 0,
    silikon: 0,
    sokl: 0,

    lajsne: 0,
    gerung: 0,

    stepenice: 0
  };

  // ======================
  // POD
  // ======================
  if (chk("chkPod")) {
    result.pod = d * s;
  }

  // ======================
  // OTVORI (iz AppState preko helpersa)
  // ======================
  const openings = getOpenings() || [];

  // ======================
  // ZIDOVI (brutto - vrata)
  // ======================
  let zidoviBrutto = 0;
  if (chk("chkZidovi")) {
    zidoviBrutto = 2 * (d + s) * h;

    // vrata: kind === "door"; površina iz openingArea
    const vrataPovrsina = openings
      .filter(o => o.kind === "door")
      .reduce((sum, o) => sum + openingArea(o), 0);

    result.zidovi = Math.max(0, zidoviBrutto - vrataPovrsina);
  }

  // ======================
  // HIDRO POD
  // ======================
  if (chk("chkHidro")) {
    result.hidroPod = d * s;
  }

  // ======================
  // HIDRO TUŠ (RUČNI UNOS)
  // (a + b) × visina
  // ======================
  const tusA = num(document.getElementById("tusA")?.value);
  const tusB = num(document.getElementById("tusB")?.value);
  const tusV = num(document.getElementById("tusV")?.value);

  if (chk("chkHidro") && tusA > 0 && tusB > 0 && tusV > 0) {
    result.hidroTus = (tusA + tusB) * tusV;

    // hidro traka za tuš: a + b + visina
    result.hidroTraka += tusA + tusB + tusV;
  }

  // ======================
  // HIDRO UKUPNO
  // ======================
  result.hidroUkupno = result.hidroPod + result.hidroTus;

  // ======================
  // HIDRO TRAKA – OSNOVNO
  // ======================
  if (chk("chkHidroTraka")) {
    result.hidroTraka += 2 * (d + s);
  }

  // ======================
  // SILIKON
  // ======================
  if (chk("chkSilikon")) {
    result.silikon = 2 * (d + s);
  }

  // ======================
  // SOKL
  // ======================
  if (chk("chkSokl")) {
    result.sokl = 2 * (d + s);
  }

  // ======================
  // STEPENICE
  // dužina × komada, samo ako oba podatka postoje
  // ======================
  let stepenice = 0;
  if (chk("chkStepenice")) {
    const stepM = num(document.getElementById("stepM")?.value);
    const stepK = num(document.getElementById("stepKom")?.value);
    if (stepM > 0 && stepK > 0) {
      stepenice = stepM * stepK;
    }
  }
  result.stepenice = stepenice;

  // ======================
  // LAJSNE / GERUNG
  // baza = prozori + niše + geberit + vertikale (+ stepenice)
  // za sve te otvore koristimo "dužinu" = obod jednog komada * count
  // ======================
  const perim = o => 2 * (o.w + o.h) * o.count;

  const bazaGerung = openings
    .filter(o =>
      o.kind === "window" ||
      o.kind === "niche" ||
      o.kind === "geberit" ||
      o.kind === "vert"
    )
    .reduce((sum, o) => sum + perim(o), 0);

  // ako želiš da se stepenice računaju u lajsne/gerung:
  const bazaLajsne = bazaGerung + stepenice;
  // ako ne želiš stepenice, umjesto ovoga koristi:
  // const bazaLajsne = bazaGerung;

  result.lajsne = 0;
  result.gerung = 0;

  const useLajsne = chk("chkLajsne");
  const useGerung = chk("chkGerung");

  if (useLajsne && !useGerung) {
    result.lajsne = bazaLajsne;
  } else if (useGerung && !useLajsne) {
    result.gerung = bazaLajsne;
  }
  // ako su obje kvačice isključene ili uključene, oba ostaju 0

  // ======================
  // POVRATNI OBJEKT
  // ======================
  const data = {
    dims: { D: d, S: s, V: h },
    results: result
  };

  window.lastCalcResult = data;
  console.log("calculateAuto result:", data);
  return data;
}

