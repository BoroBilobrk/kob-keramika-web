// JS/troskovnik/calc.js
import { calculateAuto } from "../calculations/autoCalc.js";

export function calcFromTroskovnik() {
  console.log("🔥 calcFromTroskovnik START");

  // provjera troškovnika
  if (!window.troskovnikItems || !window.troskovnikItems.length) {
    alert("Troškovnik nije učitan");
    return;
  }

  // svi izračuni iz automatskog obračuna
  const auto = calculateAuto();

  const resultCard = document.getElementById("troskovnikResult");
  const resultBox = document.getElementById("troskovnikOutput");

  if (!resultCard || !resultBox) {
    console.error("❌ Result DOM not found");
    return;
  }

  const checked = document.querySelectorAll(
    "#troskovnikItemsList input[type='checkbox']:checked"
  );

  if (!checked.length) {
    alert("Nema odabranih stavki");
    return;
  }

  let output = [];

  checked.forEach(chk => {
    const id = String(chk.value); // 🔥 KLJUČNO
    const item = window.troskovnikItems.find(
      i => String(i.id) === id
    );
    if (!item) return;

    let qty = 0;
    const opis = item.opis.toLowerCase();

    // ==========================
    // MAPIRANJE PO OPISU
    // ==========================

    // PODOVI – m2
    if (opis.includes("kupaonice")) qty = auto.m2Kupaonice || 0;
    else if (opis.includes("kuhinja")) qty = auto.m2Kuhinja || 0;
    else if (opis.includes("loggia")) qty = auto.m2Loggia || 0;
    else if (opis.includes("pod hodnika")) qty = auto.m2HodnikPod || 0;
    else if (opis.includes("pod lifta")) qty = auto.m2Lift || 0;

    // ZIDOVI – m2
    else if (opis.includes("zid hodnika")) qty = auto.m2HodnikZid || 0;

    // HIDRO / IMPREGNACIJA – m2
    else if (opis.includes("hidroizolacije")) qty = auto.m2Kupaonice || 0;
    else if (opis.includes("impregnacije")) qty = auto.m2Kupaonice || 0;

    // TRAKE / SILIKON / SOKL / GERUNG – m'
    else if (opis.includes("sokl")) qty = auto.mSokl || 0;
    else if (opis.includes("trake")) qty = auto.mBridovi || 0;
    else if (opis.includes("silikona")) qty = auto.mBridovi || 0;
    else if (opis.includes("lajsne")) qty = auto.mLajsne || 0;
    else if (opis.includes("gerunga")) qty = auto.mGerung || 0;

    // SATI
    else if (opis.includes("režijski")) qty = auto.sati || 0;

    output.push({
      opis: item.opis,
      jm: item.jm,
      qty
    });
  });

  // ==========================
  // ISPIS
  // ==========================
  resultCard.style.display = "block";

  resultBox.innerHTML = `
    <ul>
      ${output
        .map(o => `<li><b>${o.qty}</b> ${o.jm} – ${o.opis}</li>`)
        .join("")}
    </ul>
  `;

  console.log("✅ Rezultat:", output);
}
