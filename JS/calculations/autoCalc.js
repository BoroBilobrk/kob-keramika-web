// JS/calculations/autoCalc.js
console.log("autoCalc.js loaded");

export function calculateAuto() {
  const num = v => parseFloat(String(v).replace(",", ".")) || 0;

  const d = num(dimD.value);
  const s = num(dimS.value);
  const v = num(dimV.value);

  let result = {
    pod: 0,
    zidovi: 0,
    hidroPod: 0,
    hidroTus: 0,
    hidroTraka: 0,
    silikon: 0,
    sokl: 0,
    lajsne: 0,
    gerung: 0,
    stepenice: 0
  };

  // POD
  if (chkPod.checked) {
    result.pod = d * s;
  }

  // ZIDOVI
  if (chkZidovi.checked) {
    result.zidovi = 2 * (d + s) * v;
  }

  // HIDRO POD
  if (chkHidro.checked) {
    result.hidroPod = d * s;
  }

  // ======================
  // HIDRO TUŠ (RUČNI UNOS)
  // ======================
  const tusA = num(document.getElementById("tusA")?.value);
  const tusB = num(document.getElementById("tusB")?.value);
  const tusV = num(document.getElementById("tusV")?.value);

  if (chkHidro.checked && tusA && tusB && tusV) {
    result.hidroTus = (tusA + tusB) * tusV;
    result.hidroTraka += tusA + tusB + tusV;
  }

  // HIDRO TRAKA – OSNOVNO
  if (chkHidroTraka.checked) {
    result.hidroTraka += 2 * (d + s);
  }

  // SILIKON
  if (chkSilikon.checked) {
    result.silikon = 2 * (d + s);
  }

  // SOKL
  if (chkSokl.checked) {
    result.sokl = 2 * (d + s);
  }

  // ======================
  // STEPENICE
  // ======================
  if (chkStepenice.checked) {
    const stepM = num(document.getElementById("stepM").value);
    const stepK = num(document.getElementById("stepKom").value);
    result.stepenice = stepM * stepK;
  }

  // ======================
  // LAJSNE / GERUNG
  // ======================
  if (chkLajsne.checked) {
    result.lajsne = result.stepenice;
  }

  if (chkGerung.checked) {
    result.gerung = result.stepenice;
  }

  return result;
}
