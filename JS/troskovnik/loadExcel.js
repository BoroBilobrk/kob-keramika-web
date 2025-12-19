// JS/troskovnik/loadExcel.js
console.log("troskovnik Excel loader loaded");

window.troskovnikItems = [];

export function loadTroskovnikExcel(file) {
  const reader = new FileReader();

  reader.onload = e => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    // uzmi prvi sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // sheet → array of arrays
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    parseRows(rows);
  };

  reader.readAsArrayBuffer(file);
}

function parseRows(rows) {
  let headerRowIndex = -1;

  // 1️⃣ nađi header red
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map(c => String(c || "").toLowerCase());
    if (
      row.some(c => c.includes("opis")) &&
      row.some(c => c.includes("koli")) &&
      row.some(c => c.includes("j.m"))
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    alert("Nije pronađen header (OPIS / KOLIČINA / JM)");
    return;
  }

  const header = rows[headerRowIndex].map(c =>
    String(c || "").toLowerCase()
  );

  const idxOpis = header.findIndex(c => c.includes("opis"));
  const idxJm = header.findIndex(c => c.includes("j.m"));
  const idxKolicina = header.findIndex(c => c.includes("koli"));
  const idxCijena = header.findIndex(c => c.includes("cijen"));

  window.troskovnikItems = [];

  // 2️⃣ čitaj stavke
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[idxOpis]) continue;

    const opis = String(r[idxOpis]).trim();
    if (opis === "" || opis.length < 3) continue;

    const jm = r[idxJm] ? String(r[idxJm]) : "";
    const kolicina = parseFloat(
      String(r[idxKolicina] || "0").replace(",", ".")
    );
    const cijena = parseFloat(
      String(r[idxCijena] || "0").replace(",", ".")
    );

    window.troskovnikItems.push({
      id: crypto.randomUUID(),
      opis,
      jm,
      kolicina: isNaN(kolicina) ? 0 : kolicina,
      cijena: isNaN(cijena) ? 0 : cijena
    });
  }

  renderPreview();
}

function renderPreview() {
  const box = document.getElementById("troskovnikPreview");
  if (!box) return;

  box.innerHTML = "";
  window.troskovnikItems.forEach(i => {
    const div = document.createElement("div");
    div.textContent = `${i.opis} (${i.jm}) – ${i.kolicina}`;
    box.appendChild(div);
  });
}
