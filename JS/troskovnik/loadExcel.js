// JS/troskovnik/loadExcel.js
console.log("loadExcel.js loaded");

function normStr(v) {
  if (v === null || v === undefined) return "";
  return String(v).replace(/\s+/g, " ").trim();
}

function toNumber(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  const s = String(v).trim().replace(/\./g, "").replace(",", "."); // 1.234,56 -> 1234.56
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function looksLikeHeaderRow(row) {
  const a = normStr(row[0]).toLowerCase();
  const b = normStr(row[1]).toLowerCase();
  const c = normStr(row[2]).toLowerCase();
  const d = normStr(row[3]).toLowerCase();

  // tražimo nešto tipa: R.BR / OPIS STAVKE / J.M / KOLIČINA
  const okA = a.includes("r.br") || a.includes("r.br.") || a.includes("rb") || a.includes("r.b");
  const okB = b.includes("opis") && b.includes("stav");
  const okC = c.includes("j.m") || c.includes("jm");
  const okD = d.includes("koli") || d.includes("kol");
  return okB && okC && okD; // A nije uvijek pouzdan pa ga ne forsiramo
}

function pickBestSheet(workbook) {
  // 1) preferiraj sheet koji u nazivu ima "KERAMI"
  const names = workbook.SheetNames || [];
  const keram = names.find(n => n.toLowerCase().includes("kerami"));
  if (keram) return keram;

  // 2) ili prvi sheet koji sadrži header "OPIS STAVKE / J.M / KOLIČINA"
  for (const name of names) {
    const ws = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, blankrows: false });
    for (let i = 0; i < Math.min(rows.length, 40); i++) {
      if (looksLikeHeaderRow(rows[i])) return name;
    }
  }

  // 3) fallback: prvi sheet
  return names[0];
}

function parseItemsFromRows(rows, sheetName) {
  let headerIndex = -1;

  for (let i = 0; i < Math.min(rows.length, 60); i++) {
    if (looksLikeHeaderRow(rows[i])) {
      headerIndex = i;
      break;
    }
  }

  // Ako ne nađemo header, svejedno probaj od početka
  const start = headerIndex >= 0 ? headerIndex + 1 : 0;

  const items = [];
  for (let r = start; r < rows.length; r++) {
    const row = rows[r] || [];

    const rb = normStr(row[0]);        // može biti "1.", "a", "", itd.
    const opis = normStr(row[1]);      // OPIS STAVKE (kod tvog fajla je tu)
    const jm = normStr(row[2]);        // J.M. (m2, m', kom...)
    const kolicina = toNumber(row[3]); // KOLIČINA
    const cijena = toNumber(row[4]);   // JED. CIJENA
    const ukupno = toNumber(row[5]);   // UKUPNO

    // Filtriraj: mora imati opis + jm, i mora imati barem količinu ili cijenu ili ukupno
    if (!opis || !jm) continue;

    // izbaci napomene i section naslove koji nemaju brojeve
    const hasNumbers = (kolicina !== null) || (cijena !== null) || (ukupno !== null);
    if (!hasNumbers) continue;

    // izbaci "NAPOMENA" / bullet redove gdje je jm prazno (već smo)
    // i izbaci sumarne redove gdje je opis predug ali nema mjere (već smo)

    items.push({
      id: `${sheetName}-${r + 1}`,
      rb,
      opis,
      jm,
      kolicina,
      cijena,
      ukupno,
      sheet: sheetName,
      row: r + 1,
    });
  }

  return items;
}

function renderPreview(items) {
  const box = document.getElementById("troskovnikPreview");
  if (!box) return;

  if (!items?.length) {
    box.textContent = "Nema učitanih stavki.";
    return;
  }

  const top = items.slice(0, 25).map(i => {
    const qty = i.kolicina ?? "";
    const price = i.cijena ?? "";
    return `• ${i.opis} (${i.jm})  ${qty} × ${price}`;
  });

  box.innerHTML = `
    <div class="hint">Učitano stavki: <b>${items.length}</b></div>
    <div style="margin-top:8px; white-space:pre-wrap;">${top.join("\n")}${items.length > 25 ? "\n…" : ""}</div>
  `;
}

export async function loadTroskovnikExcel(file) {
  if (typeof XLSX === "undefined") {
    throw new Error("XLSX nije definiran. Provjeri da je xlsx.full.min.js uključen u index.html prije app.js");
  }

  const statusEl = document.getElementById("troskovnikUploadStatus");
  const setStatus = (t) => { if (statusEl) statusEl.textContent = t; };

  setStatus("Učitavam Excel…");

  const buf = await file.arrayBuffer();
  const workbook = XLSX.read(buf, { type: "array" });

  const sheetName = pickBestSheet(workbook);
  const ws = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, blankrows: false });

  const items = parseItemsFromRows(rows, sheetName);

  // GLOBAL za app.js
  window.troskovnikItems = items;

  renderPreview(items);

  // Status
  setStatus(items.length ? `Učitano: ${items.length} stavki (Sheet: ${sheetName})` : `Excel učitan, ali nisam našao stavke (Sheet: ${sheetName}).`);

  return items;
}
