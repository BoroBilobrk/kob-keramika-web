import { calculateAuto } from "../calculations/autoCalc.js";

export function calcFromTroskovnik() {
  const checkedIds = Array.from(
    document.querySelectorAll('#troskovnikItemsList input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  if (!checkedIds.length) {
    alert("Nema odabranih stavki");
    return;
  }

  const selectedItems = window.troskovnikItems.filter(i =>
    checkedIds.includes(String(i.id))
  );

  const autoData = calculateAuto(); // ⬅ postojeća logika
  const calculated = selectedItems.map(item => ({
    ...item,
    kolicina: resolveQuantity(item, autoData)
  }));

  renderResult(calculated);
}

// ===============================
// MAPIRANJE OPISA → MJERE
// ===============================
function resolveQuantity(item, auto) {
  const o = item.opis.toLowerCase();

  if (item.jm === "m2") {
    if (o.includes("kupaon")) return auto.kupaonice || 0;
    if (o.includes("wc")) return auto.kupaonice || 0;
    if (o.includes("kuhin")) return auto.kuhinja || 0;
    if (o.includes("hodnik") && o.includes("zid")) return auto.hodnikZid || 0;
    if (o.includes("hodnik")) return auto.hodnikPod || 0;
    if (o.includes("loggia")) return auto.loggia || 0;
    if (o.includes("ostav") || o.includes("vešer")) return auto.ostava || 0;
  }

  if (item.jm.includes("m")) {
    if (o.includes("sokl")) return auto.sokl || 0;
    if (o.includes("lajsne")) return auto.lajsne || 0;
    if (o.includes("gerung")) return auto.gerung || 0;
  }

  if (item.jm === "h") {
    return auto.radniSati || 0;
  }

  return 0;
}

// ===============================
// PRIKAZ
// ===============================
function renderResult(items) {
  const box = document.getElementById("troskovnikOutput");
  const result = document.getElementById("troskovnikResult");

  box.innerHTML = `
    <table class="table">
      <tr>
        <th>Stavka</th>
        <th>Količina</th>
        <th>JM</th>
      </tr>
      ${items.map(i => `
        <tr>
          <td>${i.opis}</td>
          <td>${i.kolicina}</td>
          <td>${i.jm}</td>
        </tr>
      `).join("")}
    </table>
  `;

  result.style.display = "block";
}
