// JS/csv/csvExport.js
import { formatHr } from "../core/helpers.js";

// ===============================
// GLAVNI EXPORT (KOMPATIBILNOST)
// ===============================
export function exportCsv(data) {
  return exportCsvFromCalc(data);
}

// ===============================
// STVARNA IMPLEMENTACIJA
// ===============================
export function exportCsvFromCalc(data) {
  if (!data) return;

  const p = data.prices || {};

  let lines = [];
  lines.push("Stavka;Količina;Jed.;Cijena;Ukupno");

  function addRow(name, key) {
    const it = p[key];
    if (!it || !it.qty) return;
    const total = it.qty * it.price;
    lines.push([
      name,
      formatHr(it.qty),
      it.unit,
      formatHr(it.price, 2),
      formatHr(total, 2)
    ].join(";"));
  }

  addRow("Pod", "pod");
  addRow("Zidovi", "zidovi");
  addRow("Hidro pod", "hidroPod");
  addRow("Hidro tuš", "hidroTus");
  addRow("Hidro traka", "hidroTraka");
  addRow("Silikon", "silikon");
  addRow("Sokl", "sokl");
  addRow("Lajsne", "lajsne");
  addRow("Gerung", "gerung");

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "obracun.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
