// js/calc.js

function parseNum(val) {
  if (val === undefined || val === null) return 0;
  let s = String(val).trim().replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function formatHr(n) {
  return (Math.round(n * 1000) / 1000).toString().replace('.', ',');
}

// dodavanje dodatnih dimenzija u UI
function addExtraDimRow() {
  const container = document.getElementById('extraDimsContainer');
  const row = document.createElement('div');
  row.className = 'extra-row';
  row.innerHTML = `
    <input type="text" class="exD" placeholder="d (m)" />
    <input type="text" class="exS" placeholder="š (m)" />
    <input type="text" class="exV" placeholder="v (m)" />
    <select class="exSign">
      <option value="+">+</option>
      <option value="-">−</option>
    </select>
    <button type="button" class="btn-secondary btn-small">✕</button>
  `;
  row.querySelector('button').onclick = () => row.remove();
  container.appendChild(row);
}

// glavni izračun
function runAutoCalc() {
  const D = parseNum(document.getElementById('dimD').value);
  const S = parseNum(document.getElementById('dimS').value);
  const V = parseNum(document.getElementById('dimV').value);

  const chkPod       = document.getElementById('chkPod').checked;
  const chkZidovi    = document.getElementById('chkZidovi').checked;
  const chkHidroPod  = document.getElementById('chkHidroPod').checked;
  const chkHidroTrak = document.getElementById('chkHidroTraka').checked;
  const chkSilikon   = document.getElementById('chkSilikon').checked;

  let html = "";
  const results = {};

  // dodatne dimenzije
  const extraRows = document.querySelectorAll('#extraDimsContainer .extra-row');

  let extraPod = 0;
  let extraHidroPod = 0;
  let extraZid = 0;
  let extraTraka = 0;
  let extraSilikon = 0;

  extraRows.forEach(row => {
    const dE = parseNum(row.querySelector('.exD').value);
    const sE = parseNum(row.querySelector('.exS').value);
    const vE = parseNum(row.querySelector('.exV').value);
    const sign = row.querySelector('.exSign').value === '-' ? -1 : 1;

    const deltaPod      = sign * (dE + sE);
    const deltaZid      = sign * ((2 * dE + sE) * vE);
    const deltaTraka    = sign * (2 * dE + sE);
    const deltaSilikon  = sign * ((2 * dE + sE) + 2 * vE);

    extraPod      += deltaPod;
    extraHidroPod += deltaPod;
    extraZid      += deltaZid;
    extraTraka    += deltaTraka;
    extraSilikon  += deltaSilikon;
  });

  // POD
  if (chkPod) {
    const osnovno = D * S;
    const pod = osnovno + extraPod;
    results.pod = pod;
    html += `<b>Pod:</b><br>`;
    html += `Osnovno: D×Š = ${formatHr(D)}×${formatHr(S)} = ${formatHr(osnovno)} m²<br>`;
    if (extraPod !== 0) {
      html += `Dodatne dimenzije: ${extraPod > 0 ? '+' : ''}${formatHr(extraPod)} m²<br>`;
    }
    html += `Ukupno pod = <b>${formatHr(pod)} m²</b><br><br>`;
  }

  // ZIDOVI (bez otvora za sada)
  if (chkZidovi) {
    const zidBruto = 2 * (D * V) + 2 * (S * V);
    const zidNeto  = zidBruto + extraZid;
    results.zidovi = zidNeto;

    html += `<b>Zidovi:</b><br>`;
    html += `Bruto: 2(D×V)+2(Š×V) = 2(${formatHr(D)}×${formatHr(V)}) + 2(${formatHr(S)}×${formatHr(V)}) = ${formatHr(zidBruto)} m²<br>`;
    if (extraZid !== 0) {
      html += `Dodatne dimenzije: ${extraZid > 0 ? '+' : ''}${formatHr(extraZid)} m²<br>`;
    }
    html += `Neto zidovi = <b>${formatHr(zidNeto)} m²</b><br><br>`;
  }

  // HIDRO POD
  if (chkHidroPod) {
    const hOsnovno = D * S;
    const hPod = hOsnovno + extraHidroPod;
    results.hidroPod = hPod;

    html += `<b>Hidro – pod:</b><br>`;
    html += `Osnovno: D×Š = ${formatHr(D)}×${formatHr(S)} = ${formatHr(hOsnovno)} m²<br>`;
    if (extraHidroPod !== 0) {
      html += `Dodatne dimenzije: ${extraHidroPod > 0 ? '+' : ''}${formatHr(extraHidroPod)} m²<br>`;
    }
    html += `Ukupno hidro pod = <b>${formatHr(hPod)} m²</b><br><br>`;
  }

  // HIDRO TRAKA – pojednostavljeno: 2D+2Š+2V + extraTraka
  if (chkHidroTrak) {
    const base = 2 * D + 2 * S + 2 * V;
    const trak = base + extraTraka;
    results.hidroTraka = trak;

    html += `<b>Hidro traka:</b><br>`;
    html += `Osnovno: 2D + 2Š + 2V = 2${formatHr(D)} + 2${formatHr(S)} + 2${formatHr(V)} = ${formatHr(base)} m<br>`;
    if (extraTraka !== 0) {
      html += `Dodatne dimenzije: ${extraTraka > 0 ? '+' : ''}${formatHr(extraTraka)} m<br>`;
    }
    html += `Ukupno hidro traka = <b>${formatHr(trak)} m</b><br><br>`;
  }

  // SILIKON – pojednostavljeno: 2D+2Š+4V + extraSilikon
  if (chkSilikon) {
    const base = 2 * D + 2 * S + 4 * V;
    const sil = base + extraSilikon;
    results.silikon = sil;

    html += `<b>Silikon:</b><br>`;
    html += `Osnovni opseg: 2D + 2Š + 4V = 2${formatHr(D)} + 2${formatHr(S)} + 4${formatHr(V)} = ${formatHr(base)} m<br>`;
    if (extraSilikon !== 0) {
      html += `Dodatne dimenzije: ${extraSilikon > 0 ? '+' : ''}${formatHr(extraSilikon)} m<br>`;
    }
    html += `Ukupno silikon = <b>${formatHr(sil)} m</b><br><br>`;
  }

  const out = document.getElementById('calcOutput');
  const box = document.getElementById('calcResult');
  out.innerHTML = html || 'Nema podataka za prikaz.';
  box.style.display = 'block';

  // mogao bi se spremati u Firestore ako želiš kasnije
  return results;
}
