// JS/troskovnik/calc.js
import { calculateAuto } from "../calculations/autoCalc.js";

function getItemFormat(itemId) {
  const select = document.querySelector(
    `#troskovnikItemsList select[data-item-id="${String(itemId).replace(/\"/g, "\\\"")}"]`
  );

  return select?.value || "custom";
}

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
    const format = getItemFormat(id);

    // ==========================
    // MAPIRANJE PO OPISU
    // ==========================

    // ==========================
    // MAPIRANJE NA AUTO CALC
    // ==========================

    // PODOVI – m2
    if (
      opis.includes("kupaonice") ||
      opis.includes("wc") ||
      opis.includes("kuhinja") ||
      opis.includes("loggia") ||
      opis.includes("pod hodnika") ||
      opis.includes("pod lifta")
    ) {
      qty = auto.pod || 0;
    }

    // ZIDOVI – m2
    else if (opis.includes("zid")) {
      qty = auto.zidovi || 0;
    }

    // HIDROIZOLACIJA / IMPREGNACIJA – m2
    else if (
      opis.includes("hidroizolacije") ||
      opis.includes("impregnacije")
    ) {
      qty = auto.hidroUkupno || 0;
    }

    // HIDRO TRAKA – m'
    else if (opis.includes("trake")) {
      qty = auto.hidroTraka || 0;
    }

    // SILIKON – m'
    else if (opis.includes("silikona")) {
      qty = auto.silikon || 0;
    }

    // SOKL – m'
    else if (opis.includes("sokl")) {
      qty = auto.sokl || 0;
    }

    // LAJSNE – m'
    else if (opis.includes("lajsne")) {
      qty = auto.lajsne || 0;
    }

    // GERUNG – m'
    else if (opis.includes("gerung")) {
      qty = auto.gerung || 0;
    }

    // STEPENICE – kom / m'
    else if (opis.includes("stepenice")) {
      qty = auto.stepenice || 0;
    }

    // REŽIJSKI SATI (ako kasnije dodaš)
    else if (opis.includes("režijski")) {
      qty = auto.sati || 0;
    }

    // FALLBACK
    else {
      qty = 0;
    }

    output.push({
      opis: item.opis,
      jm: item.jm,
      qty,
      format
    });
  });

  // ==========================
  // ISPIS
  // ==========================
  resultCard.style.display = "block";

  resultBox.innerHTML = `
    <ul>
      ${output
        .map(o => `<li><b>${o.qty}</b> ${o.jm} – ${o.opis}${o.format ? ` (${o.format})` : ""}</li>`)
        .join("")}
    </ul>
  `;

  console.log("✅ Rezultat:", output);
}