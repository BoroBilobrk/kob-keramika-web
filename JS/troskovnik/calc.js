// JS/troskovnik/calc.js

export function calcFromTroskovnik() {
  if (!window.troskovnikItems) {
    alert("Nema učitanog troškovnika");
    return;
  }

  const checkedIds = Array.from(
    document.querySelectorAll("#troskovnikItemsList input[type=checkbox]:checked")
  ).map(cb => cb.value);

  const selected = window.troskovnikItems.filter(i =>
    checkedIds.includes(i.id)
  );

  if (selected.length === 0) {
    alert("Nijedna stavka nije odabrana");
    return;
  }

  let total = 0;

  const out = document.getElementById("troskovnikOutput");
  out.innerHTML = "";

  selected.forEach(item => {
    total += item.total;

    const row = document.createElement("div");
    row.textContent = `${item.opis}: ${item.qty} ${item.jm} = ${item.total.toFixed(2)} €`;
    out.appendChild(row);
  });

  const sum = document.createElement("strong");
  sum.style.display = "block";
  sum.style.marginTop = "10px";
  sum.textContent = `UKUPNO: ${total.toFixed(2)} €`;
  out.appendChild(sum);

  document.getElementById("troskovnikResult").style.display = "block";

  // spremi za PDF
  window.troskovnikCalcResult = {
    items: selected,
    total
  };
}
