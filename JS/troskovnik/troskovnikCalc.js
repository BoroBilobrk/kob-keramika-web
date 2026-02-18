// JS/troskovnik/troskovnikCalc.js
// ===================================
// OBRAČUN PO TROŠKOVNIKU
// koristi automatski obračun
// ===================================

import { calculateAuto } from "../calculations/autoCalc.js";
import { generateSituacijaPDF } from "../pdf/pdfSituacija.js";
import { saveSituation } from "../cloud/situacije.js";

let situationType = "privremena";

// -------------------------------
// RADIO BUTTONS (privremena / okončana)
// -------------------------------
document.querySelectorAll("input[name='sitType']").forEach(radio => {
  radio.addEventListener("change", e => {
    situationType = e.target.value;
  });
});

// -------------------------------
// GLAVNI IZRAČUN
// -------------------------------
document.getElementById("btnCalcFromTroskovnik")?.addEventListener("click", () => {

  if (!window.troskovnikItems || !window.troskovnikItems.length) {
    alert("Nema učitanog troškovnika.");
    return;
  }

  const auto = calculateAuto();

  const map = {
    pod: ["pod"],
    zidovi: ["zid"],
    hidroPod: ["hidro pod"],
    hidroTus: ["hidro tuš", "tuš"],
    hidroTraka: ["traka"],
    silikon: ["silikon"],
    sokl: ["sokl"],
    lajsne: ["lajsna"],
    gerung: ["gerung"],
    stepenice: ["stepen"]
  };

  const calculated = window.troskovnikItems.map(item => {
    let qty = 0;
    const opis = (item.opis || item.name || "").toLowerCase();

    Object.keys(map).forEach(key => {
      if (map[key].some(k => opis.includes(k))) {
        qty = auto[key] || 0;
      }
    });

    return {
      ...item,
      qty,
      total: qty * (item.cijena || item.price || 0)
    };
  });

  const total = calculated.reduce((s, i) => s + i.total, 0);

  // Gather metadata from form fields (using trk prefix for troskovnik-specific fields)
  const parseValue = (id) => document.getElementById(id)?.value || "";
  const parseNumber = (id) => {
    const val = document.getElementById(id)?.value || "";
    return val ? parseFloat(val.replace(",", ".")) : 0;
  };

  window.currentSituationData = {
    meta: {
      siteCode: parseValue("siteCode"),
      siteName: parseValue("trkSiteName"),
      roomName: parseValue("trkRoomName"),
      situationNo: parseValue("trkSituationNo"),
      investorName: parseValue("trkInvestorName"),
      investorLocation: parseValue("trkInvestorLocation"),
      investorAddress: parseValue("trkInvestorAddress"),
      investorOIB: parseValue("trkInvestorOIB"),
      contractNo: parseValue("trkContractNo"),
      contractValue: parseNumber("trkContractValue"),
      deliveryDate: parseValue("trkDeliveryDate"),
      periodStart: parseValue("trkPeriodStart"),
      periodEnd: parseValue("trkPeriodEnd"),
      workDescription: parseValue("trkRoomName")
    },
    items: calculated,
    total,
    prevTotal: window.prevSituationsTotal || 0
  };

  renderResult(calculated, total);
});

// -------------------------------
// RENDER REZULTATA
// -------------------------------
function renderResult(items, total) {
  const out = document.getElementById("troskovnikOutput");
  out.innerHTML = "";

  items.forEach(i => {
    if (i.qty > 0) {
      const div = document.createElement("div");
      const name = i.opis || i.name || "Nepoznata stavka";
      const unit = i.jm || i.unit || "";
      const price = i.cijena || i.price || 0;
      div.textContent = `${name}: ${i.qty.toFixed(2)} ${unit} × ${price.toFixed(2)} = ${i.total.toFixed(2)} €`;
      out.appendChild(div);
    }
  });

  const sum = document.createElement("strong");
  sum.style.display = "block";
  sum.style.marginTop = "10px";
  sum.textContent = `UKUPNO: ${total.toFixed(2)} €`;
  out.appendChild(sum);

  document.getElementById("troskovnikResult").style.display = "block";
}

// -------------------------------
// PDF
// -------------------------------
document.getElementById("btnExportPdfTroskovnik")?.addEventListener("click", async () => {
  if (!window.currentSituationData) {
    alert("Nema podataka za generiranje PDF-a. Prvo izračunaj radove.");
    return;
  }

  try {
    const doc = await generateSituacijaPDF(window.currentSituationData, situationType);
    const filename = `Situacija_${window.currentSituationData.meta.situationNo || 'nova'}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Greška pri generiranju PDF-a:", error);
    alert("Greška pri generiranju PDF-a: " + error.message);
  }
});

// -------------------------------
// CLOUD
// -------------------------------
document.getElementById("btnSaveCloudTroskovnik")?.addEventListener("click", async () => {
  if (!window.currentSituationData) return;

  await saveSituation(window.db, window.currentSituationData);
  alert("Situacija spremljena u Cloud.");
});
