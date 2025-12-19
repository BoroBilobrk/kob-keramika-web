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

  console.log("ODABRANE STAVKE:", selectedItems);

  renderPreview(selectedItems);
}

function renderPreview(items) {
  const box = document.getElementById("troskovnikOutput");
  const result = document.getElementById("troskovnikResult");

  box.innerHTML = `
    <ul>
      ${items.map(i => `
        <li>${i.opis} – ${i.jm}</li>
      `).join("")}
    </ul>
  `;

  result.style.display = "block";
}
