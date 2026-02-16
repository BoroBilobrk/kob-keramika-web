// JS/calculations/autoCalc.js
console.log("autoCalc.js loaded");

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
  // ZIDOVI (brutto)
  // ======================
  let zidoviBrutto = 0;
  if (chk("chkZidovi")) {
    zidoviBrutto = 2 * (d + s) * h;
    result.zidovi = zidoviBrutto;
  }

  // ======================
  // OTVORI
  // PRETPOSTAVKA:
  // window.openings = [
  //   { type: "vrata" | "prozor" | "nisa" | "geberit" | "vertikala" | "custom",
  //     povrsina: broj_u_m2,
  //     duzina: broj_u_m }
  // ]
  // Ako je struktura drugačija, treba prilagoditi ova polja.
  // ======================
  const openings = Array.isArray(window.openings) ? window.openings : [];

  // vrata se odbijaju od zidova (površina)
  const vrataPovrsina = openings
    .filter(o => o.type === "vrata")
    .reduce((sum, o) => sum + (o.povrsina || 0), 0);

  if (chk("chkZidovi") && vrataPovrsina > 0) {
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
  // baza = zbroj dužina svih otvora osim vrata + stepenice
  // ======================
  const openingsDuzinaBezVrata = openings
    .filter(o => o.type !== "vrata")
    .reduce((sum, o) => sum + (o.duzina || 0), 0);

  const bazaLajsne = openingsDuzinaBezVrata + stepenice;

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
  // (po potrebi možeš odlučiti da pri obje kvačice npr. preferiraš gerung)

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
