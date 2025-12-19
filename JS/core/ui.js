// JS/core/ui.js
console.log("UI.JS LOADED");

// ==========================
// VIEW SWITCHING
// ==========================
const views = document.querySelectorAll(".view");

function showView(id) {
  views.forEach(v => (v.style.display = "none"));
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

// ==========================
// HOME MENU BUTTONS
// ==========================
document.getElementById("btnOpenAutoCalc")?.addEventListener("click", () =>
  showView("autoCalcView")
);

document.getElementById("btnOpenMeasures")?.addEventListener("click", () =>
  showView("measuresView")
);

document.getElementById("btnOpenCosts")?.addEventListener("click", () =>
  showView("costsView")
);

document.getElementById("btnOpenPrices")?.addEventListener("click", () =>
  showView("pricesView")
);

document.getElementById("btnOpenArchive")?.addEventListener("click", () =>
  showView("archiveView")
);

// 🔥 NEDOSTAJALO
document.getElementById("btnOpenTroskovnikUpload")?.addEventListener("click", () =>
  showView("troskovnikUploadView")
);

document.getElementById("btnOpenTroskovnikCalc")?.addEventListener("click", () =>
  showView("troskovnikCalcView")
);

// ==========================
// BACK BUTTONS
// ==========================
document.querySelectorAll(".btn-back").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    if (target) showView(target);
  });
});

// ==========================
// STEPENICE TOGGLE
// ==========================
const chkStep = document.getElementById("chkStepenice");
const stepInputs = document.getElementById("stepeniceInputs");

chkStep?.addEventListener("change", () => {
  if (stepInputs)
    stepInputs.style.display = chkStep.checked ? "block" : "none";
});
