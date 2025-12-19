// JS/troskovnik/load.js
console.log("troskovnik/load.js loaded ✅");

// globalno dostupne stavke troškovnika
window.troskovnikItems = [];

/**
 * Učitavanje troškovnika iz XLSX / CSV
 * Očekivani stupci (prvi red):
 *  - Opis | Jedinica | Cijena
 * (nazivi nisu case-sensitive)
 */
export async function loadTroskovnik(file) {
  const statusEl = document.getElementById("troskovnikUploadStatus");
  const previewEl = document.getElementById("troskovnikPreview");

  try {
    statusEl.textContent = "⏳ Učitavanje troškovnika...";
    previewEl.textContent = "";

    const arrayBuffer = await file.arrayBuffer();

    // XLSX čitanje
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    if (!workbook.SheetNames.length) {
      throw new Error("Excel nema nijedan sheet");
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // sheet → JSON (svaki red kao objekt)
    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false
    });

    if (!rows.length) {
      throw new Error("Excel je prazan");
    }

    // reset
    window.troskovnikItems = [];

    rows.forEach((row, index) => {
      // normalizacija ključeva
      const normalized = {};
      Object.keys(row).forEach(k => {
        normalized[k.toLowerCase().trim()] = row[k];
      });

      const opis =
        normalized["opis"] ||
        normalized["naziv"] ||
        normalized["stavka"] ||
        "";

      const jm =
        normalized["jedinica"] ||
        normalized["jm"] ||
        normalized["jed"] ||
        "";

      const cijenaRaw =
        normalized["cijena"] ||
        normalized["cijena eur"] ||
        normalized["eur"] ||
        0;

      const cijena = parseFloat(
        String(cijenaRaw).replace(",", ".")
      ) || 0;

      if (!opis) return; // preskoči prazne redove

      window.troskovnikItems.push({
        id: `t-${index + 1}`,
        opis: String(opis).trim(),
        jm: String(jm).trim(),
        cijena
      });
    });

    if (!window.troskovnikItems.length) {
      throw new Error("Nema valjanih stavki u Excelu");
    }

    // preview u UI
    previewEl.innerHTML = `
      <ul>
        ${window.troskovnikItems
          .map(
            i =>
              `<li><b>${i.opis}</b> — ${i.jm || "?"} — ${i.cijena.toFixed(
                2
              )} €</li>`
          )
          .join("")}
      </ul>
    `;

    statusEl.textContent = `✅ Učitano ${window.troskovnikItems.length} stavki`;

    console.log("Učitane stavke troškovnika:", window.troskovnikItems);
  } catch (err) {
    console.error("Greška pri učitavanju troškovnika:", err);
    statusEl.textContent = "❌ Greška pri učitavanju troškovnika";
    alert("Greška pri učitavanju Excel troškovnika");
  }
}
