// JS/troskovnik/load.js
console.log("troskovnik/load.js loaded ✅");

// Helper: normaliziraj tekst (mala slova, bez dijakritike)
function norm(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Helper: pretvori "12,50" -> 12.5
function toNumber(x) {
  if (x == null) return 0;
  if (typeof x === "number") return x;
  const s = String(x).trim().replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

// Nađi header red (u prvih N redova) po keywordima
function findHeaderRow(rows, maxScan = 30) {
  const keys = ["opis", "rad", "naziv", "stavka", "jm", "jed", "cijena", "iznos", "sifra", "kolicina", "kol"];
  let best = { idx: -1, score: 0 };

  const scan = Math.min(rows.length, maxScan);
  for (let r = 0; r < scan; r++) {
    const row = rows[r] || [];
    const cells = row.map(norm);
    let score = 0;
    for (const k of keys) {
      if (cells.some(c => c.includes(k))) score++;
    }
    if (score > best.score) best = { idx: r, score };
  }

  // prag: mora imati bar nešto smisleno
  return best.score >= 2 ? best.idx : 0;
}

// Mapiraj stupce prema nazivu
function detectColumns(headerCells) {
  const h = headerCells.map(norm);

  const idxOf = (preds) => {
    for (let i = 0; i < h.length; i++) {
      const c = h[i];
      if (!c) continue;
      if (preds.some(p => c.includes(p))) return i;
    }
    return -1;
  };

  const colOpis  = idxOf(["opis", "naziv", "rad", "stavka", "opis radova"]);
  const colJM    = idxOf(["jm", "jed", "jedin", "mj", "mjera", "jed mj"]);
  const colSifra = idxOf(["sifra", "šifra", "id", "oznaka", "rb", "rbr", "redni"]);
  const colCijena = idxOf(["cijena", "jedinicna", "jedinična", "eur", "€/"]);
  // kolicina nije obavezna za učitavanje stavki, ali ga čitamo ako postoji
  const colKol = idxOf(["kolicina", "količina", "kol", "qty", "kom", "m2", "m²"]);

  return { colOpis, colJM, colSifra, colCijena, colKol };
}

function renderPreview(items) {
  const box = document.getElementById("troskovnikPreview");
  if (!box) return;

  if (!items?.length) {
    box.textContent = "Nema učitanih stavki.";
    return;
  }

  // prikaži prvih 30
  const show = items.slice(0, 30);
  box.innerHTML = show
    .map(i => `${i.opis} (${i.jm || "—"}) – ${i.cijena ? i.cijena.toFixed(2) : "0.00"} €`)
    .join("<br>");

  if (items.length > 30) {
    box.innerHTML += `<br><br><span class="hint">Prikazano 30 od ${items.length} stavki.</span>`;
  }
}

function renderChecklist(items) {
  const box = document.getElementById("troskovnikItemsList");
  if (!box) return;

  if (!items?.length) {
    box.textContent = "Učitaj troškovnik da se pojave stavke.";
    return;
  }

  box.innerHTML = "";
  items.forEach(i => {
    const row = document.createElement("div");
    row.className = "checkbox-row";
    row.innerHTML = `
      <label>
        <input type="checkbox" value="${i.id}" checked>
        ${i.opis} ${i.jm ? `(${i.jm})` : ""}
      </label>
    `;
    box.appendChild(row);
  });
}

function setStatus(msg, ok = true) {
  const el = document.getElementById("troskovnikUploadStatus");
  if (!el) return;
  el.textContent = msg;
  el.style.color = ok ? "" : "#ff6b6b";
}

export async function loadTroskovnik(file) {
  try {
    if (!file) return;

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const isExcel = ext === "xlsx" || ext === "xls";
    const isCsv = ext === "csv";
    const isPdf = ext === "pdf";

    if (isPdf) {
      setStatus("PDF učitavanje nije uključeno u ovom koraku.", false);
      alert("Trenutno radimo XLSX. PDF ćemo kasnije.");
      return;
    }

    if (!isExcel && !isCsv) {
      alert("Podržano: .xlsx, .xls (i opcionalno .csv)");
      return;
    }

    setStatus("Učitavam…");

    // ✅ XLSX
    if (isExcel) {
      if (typeof XLSX === "undefined") {
        throw new Error("XLSX nije učitan (XLSX is undefined). Provjeri index.html redoslijed scriptova.");
      }

      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });

      const firstSheetName = wb.SheetNames?.[0];
      if (!firstSheetName) throw new Error("Excel nema sheet.");
      const ws = wb.Sheets[firstSheetName];

      // čitaj kao matrica (header:1) da možemo tražiti header red
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });

      if (!rows?.length) throw new Error("Sheet je prazan.");

      const headerRowIdx = findHeaderRow(rows, 30);
      const header = rows[headerRowIdx] || [];
      const { colOpis, colJM, colSifra, colCijena } = detectColumns(header);

      if (colOpis === -1) {
        // bez opisa nema smisla
        console.warn("Header:", header);
        throw new Error("Ne mogu pronaći stupac OPIS/NAZIV u Excelu.");
      }

      const items = [];
      for (let r = headerRowIdx + 1; r < rows.length; r++) {
        const row = rows[r] || [];

        const opis = String(row[colOpis] ?? "").trim();
        if (!opis) continue; // skip prazne

        const jm = colJM >= 0 ? String(row[colJM] ?? "").trim() : "";
        const sifraRaw = colSifra >= 0 ? String(row[colSifra] ?? "").trim() : "";
        const cijena = colCijena >= 0 ? toNumber(row[colCijena]) : 0;

        items.push({
          id: sifraRaw || `row_${r}`,
          sifra: sifraRaw || "",
          opis,
          jm,
          cijena
        });
      }

      // spremi globalno
      window.troskovnikItems = items;

      renderPreview(items);
      renderChecklist(items);

      setStatus(`Učitano ${items.length} stavki iz Excel-a ✅`);
      alert("Excel troškovnik učitan ✅");
      console.log("troskovnikItems:", items);
      return;
    }

    // (Ako baš ostaviš CSV kao fallback — možeš i izbaciti)
    if (isCsv) {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length);
      if (!lines.length) throw new Error("CSV je prazan.");

      // probaj ; pa , (HR često ;)
      const guessSep = (lines[0].includes(";") ? ";" : ",");
      const header = lines[0].split(guessSep).map(s => s.trim());

      const h = header.map(norm);
      const colOpis = h.findIndex(x => x.includes("opis") || x.includes("naziv") || x.includes("rad"));
      const colJM = h.findIndex(x => x === "jm" || x.includes("jed"));
      const colCijena = h.findIndex(x => x.includes("cijena") || x.includes("jedinicna") || x.includes("eur"));
      const colSifra = h.findIndex(x => x.includes("sifra") || x.includes("oznaka") || x.includes("rb"));

      if (colOpis === -1) throw new Error("CSV: ne mogu pronaći stupac OPIS/NAZIV.");

      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(guessSep);
        const opis = (parts[colOpis] ?? "").trim();
        if (!opis) continue;

        items.push({
          id: (parts[colSifra] ?? `row_${i}`).trim(),
          sifra: (parts[colSifra] ?? "").trim(),
          opis,
          jm: (parts[colJM] ?? "").trim(),
          cijena: toNumber(parts[colCijena])
        });
      }

      window.troskovnikItems = items;
      renderPreview(items);
      renderChecklist(items);

      setStatus(`Učitano ${items.length} stavki iz CSV-a ✅`);
      alert("CSV troškovnik učitan ✅");
    }
  } catch (err) {
    console.error(err);
    setStatus(`Greška: ${err.message || err}`, false);
    alert("Greška pri učitavanju Excel troškovnika");
  }
    }
