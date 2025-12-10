// js/csv/csvExport.js
import { runAutoCalc } from "../calculations/autoCalc.js";
import { formatHr } from "../core/helpers.js";

export function exportCsv() {
  const data = runAutoCalc(true);
  if (!data) return;

  let csv = "Naziv,Vrijednost\n";
  const r = data.results || {};
  Object.keys(r).forEach(k => {
    if (typeof r[k] === "number") {
      csv += `${k},${formatHr(r[k])}\n`;
    }
  });

  const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "obracun.csv";
  a.click();
  URL.revokeObjectURL(url);
}
