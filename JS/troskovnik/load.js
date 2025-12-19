// JS/troskovnik/load.js
// Učitavanje troškovnika iz Excel-a (XLSX/XLS) + preview + spremanje u window.troskovnikItems

function setStatus(msg) {
  const el = document.getElementById("troskovnikUploadStatus");
  if (el) el.textContent = msg || "";
}

function setPreview(html) {
  const el = document.getElementById("troskovnikPreview");
  if (el) el.innerHTML = html || "Nema učitanih stavki.";
}

// Fallback: ako XLSX nije globalno učitan, pokušaj ga dohvatiti kao ESM s jsDelivr (+esm)
async function ensureXLSX() {
  if (window.XLSX) return window.XLSX;

  try {
    const mod = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm");
    // jsDelivr +esm obično vraća default export
    window.XLSX = mod?.default || mod;
    return window.XLSX;
  } catch (e) {
    console.error("Ne mogu učitati XLSX biblioteku preko +esm:", e);
    throw new Error("XLSX biblioteka nije učitana. Dodaj XLSX <script> u index.html.");
  }
}

function normalizeUnit(u) {
  if (u == null) return "";
  const s = String(u).trim();
  if (!s) return "";
  // normalize m² / m2
  if (s.toLowerCase() === "m²") return "m2";
  return s;
}

function toNumber(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const s = String(v).trim().replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickBestSheetName(sheetNames = []) {
  // prefer “KERAMIČARSKI RADOVI” ili nešto slično
  const prefer = sheetNames.find(n => /kerami/i.test(n));
  return prefer || sheetNames[0];
}

function parseRowsToItems(rows) {
  // rows = array of arrays (header:1)
  // očekivano: [RB, Opis, JM, Količina, Cijena, Ukupno]
  const items = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const rbRaw = row[0];
    const opisRaw = row[1];
    const jmRaw = row[2];

    // preskoči potpuno prazne
    if (
      (rbRaw == null || String(rbRaw).trim() === "") &&
      (opisRaw == null || String(opisRaw).trim() === "") &&
      (jmRaw == null || String(jmRaw).trim() === "")
    ) continue;

    // preskoči naslovne redove tipa "RB", "opis" itd.
    const rbStr = rbRaw == null ? "" : String(rbRaw).trim();
    const opisStr = opisRaw == null ? "" : String(opisRaw).trim();
    const jmStr = jmRaw == null ? "" : String(jmRaw).trim();

    if (/^rb$/i.test(rbStr) || /opis/i.test(opisStr) || /jed/i.test(jmStr)) continue;

    // RB u tvom file-u često dolazi kao "8." ili "16."
    // prihvati i "8" i "8." i 8
    let rbNum = null;
    if (typeof rbRaw === "number") {
      rbNum = rbRaw;
    } else if (rbStr) {
      const m = rbStr.match(/^(\d+)\s*\.?\s*$/);
      if (m) rbNum = Number(m[1]);
    }

    // opis mora postojati
    if (!opisStr) continue;

    // jedinica mjere
    const jm = normalizeUnit(jmStr);

    // probaj kol/cijena/ukupno (ako postoje)
    const kol = toNumber(row[3]);
    const cijena = toNumber(row[4]);
    const ukupno = toNumber(row[5]);

    // Dodatni filter: ako nema ni RB ni JM, a opis izgleda kao poglavlje (npr. "1. PODOVI"), možemo preskočiti
    const isSectionLike =
      !jm &&
      !kol &&
      !cijena &&
      !ukupno &&
      (/^\d+\.\s*[A-ZČĆŽŠĐ]/.test(opisStr) || /^[A-ZČĆŽŠĐ0-9 .-]{5,}$/.test(opisStr));

    if (isSectionLike) continue;

    // Ako RB ne postoji, ali ima JM i cijenu ili količinu – svejedno uzmi (generiraj id)
    const id = rbNum != null ? String(rbNum) : `row_${i + 1}`;

    items.push({
      id,
      rb: rbNum != null ? rbNum : null,
      opis: opisStr,
      jm: jm || "",
      kol: kol != null ? kol : null,
      cijena: cijena != null ? cijena : null,
      ukupno: ukupno != null ? ukupno : null,
    });
  }

  return items;
}

function renderPreviewList(items) {
  if (!items || !items.length) {
    setPreview("Nema učitanih stavki.");
    return;
  }

  const first = items.slice(0, 25).map(it => {
    const jm = it.jm ? ` (${it.jm})` : "";
    const cij = it.cijena != null ? ` – ${it.cijena} €` : "";
    const kol = it.kol != null ? `, kol: ${it.kol}` : "";
    return `<div>${it.rb != null ? `<b>${it.rb}.</b> ` : ""}${it.opis}${jm}${kol}${cij}</div>`;
  }).join("");

  const more = items.length > 25 ? `<div class="hint" style="margin-top:8px;">Prikazano 25 / ${items.length} stavki.</div>` : "";
  setPreview(first + more);
}

function notifyChecklistRender() {
  // ako app.js ima lokalnu funkciju renderTroskovnikChecklist() – nije globalna
  // zato emitamo event; a ako postoji globalna funkcija, zovemo je direktno
  try {
    if (typeof window.renderTroskovnikChecklist === "function") {
      window.renderTroskovnikChecklist();
    } else {
      window.dispatchEvent(new CustomEvent("troskovnik:loaded", { detail: { count: window.troskovnikItems?.length || 0 } }));
    }
  } catch (e) {
    console.warn("Ne mogu okinuti render checkliste:", e);
  }
}

export async function loadTroskovnik(file) {
  try {
    if (!file) throw new Error("Nema datoteke.");

    const name = (file.name || "").toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      throw new Error("Molim učitaj Excel datoteku (.xlsx ili .xls).");
    }

    setStatus("Učitavam Excel…");

    const XLSX = await ensureXLSX();

    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: "array" });

    const sheetName = pickBestSheetName(wb.SheetNames);
    const ws = wb.Sheets[sheetName];
    if (!ws) throw new Error("Excel nema valjani sheet.");

    // header:1 => dobijemo raw redove (array-of-arrays)
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

    const items = parseRowsToItems(rows);

    window.troskovnikItems = items;

    renderPreviewList(items);

    if (!items.length) {
      setStatus("Excel učitan, ali nema prepoznatih stavki ❗ (provjeri strukturu stupaca).");
      // korisno za debug u konzoli:
      console.log("DEBUG rows[0..30]:", rows.slice(0, 30));
      return;
    }

    setStatus(`Excel troškovnik učitan ✅ (${items.length} stavki)`);
    notifyChecklistRender();

    // opcionalno: alert kao kod tebe
    // alert("Excel troškovnik učitan ✅");

  } catch (err) {
    console.error("Greška pri učitavanju Excel troškovnika:", err);
    setStatus("Greška pri učitavanju Excel troškovnika ❌");
    setPreview("Nema učitanih stavki.");
    alert(err?.message || "Greška pri učitavanju Excel troškovnika");
  }
}
