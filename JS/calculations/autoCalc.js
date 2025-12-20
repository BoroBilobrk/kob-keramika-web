// JS/calculations/autoCalc.js
console.log("autoCalc.js loaded");

export function calculateAuto() {
  const num = v => parseFloat(String(v ?? "").replace(",", ".")) || 0;

  const d = num(document.getElementById("dimD")?.value);
  const s = num(document.getElementById("dimS")?.value);
  const h = num(document.getElementById("dimV")?.value);

  const chk = id => document.getElementById(id)?.checked;

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
  // ZIDOVI
  // ======================
  if (chk("chkZidovi")) {
    result.zidovi = 2 * (d + s) * h;
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
  // dužina × komada
  // ======================
  if (chk("chkStepenice")) {
    const stepM = num(document.getElementById("stepM")?.value);
    const stepK = num(document.getElementById("stepKom")?.value);
    result.stepenice = stepM * stepK;
  }

  // ======================
  // LAJSNE / GERUNG
  // (ovisno o kvačici)
  // ======================
  if (chk("chkLajsne")) {
    result.lajsne = result.stepenice;
  }

  if (chk("chkGerung")) {
    result.gerung = result.stepenice;
  }

  // === KRAJ autoCalc funkcije ===
const data = {
  meta,
  results: result,
  openings: [...openings],
  D, S, V,
  totalPrice
};

window.lastCalcResult = data;
return data;
