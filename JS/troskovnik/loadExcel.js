// JS/troskovnik/loadExcel.js
console.log("loadExcel.js loaded");

// koristi SheetJS (XLSX)
export async function loadTroskovnikExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        // OČEKIVANI STUPCI:
        // Opis | JM | Cijena
        window.troskovnikItems = rows.map((r, i) => ({
          id: i + 1,
          opis: r.Opis || r.opis || "",
          jm: r.JM || r.jm || "",
          cijena: Number(
            String(r.Cijena || r.cijena || "0").replace(",", ".")
          )
        })).filter(i => i.opis);

        console.log("Učitane Excel stavke:", window.troskovnikItems);
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
