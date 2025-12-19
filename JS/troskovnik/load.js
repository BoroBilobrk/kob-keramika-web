// JS/troskovnik/load.js
console.log("troskovnik load.js loaded");

window.troskovnikItems = [];

export function loadTroskovnik(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "csv") {
    const reader = new FileReader();
    reader.onload = e => parseCSV(e.target.result);
    reader.readAsText(file, "UTF-8");
  } else {
    alert("Za sada podržan CSV. Excel/PDF dodajemo u sljedećem koraku.");
  }
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const rows = lines.slice(1); // preskoči header

  window.troskovnikItems = rows.map((row, i) => {
    const cols = row.split(";");
    return {
      id: i + 1,
      opis: cols[1]?.trim(),
      jm: cols[2]?.trim(),
      cijena: parseFloat(cols[4]?.replace(",", ".")) || 0
    };
  });

  renderPreview();
}

function renderPreview() {
  const box = document.getElementById("troskovnikPreview");
  box.innerHTML = "";

  window.troskovnikItems.forEach(i => {
    const div = document.createElement("div");
    div.textContent = `${i.opis} (${i.jm}) – ${i.cijena.toFixed(2)} €`;
    box.appendChild(div);
  });
}
