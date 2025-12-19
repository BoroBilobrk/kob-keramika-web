// JS/troskovnik/calc.js
// ===================================
// MAPIRANJE AUTO OBRAČUNA
// NA TROŠKOVNIK
// ===================================

export function calculateFromAuto(auto, troskovnikItems) {

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

  return troskovnikItems.map(item => {
    const name = item.name.toLowerCase();
    let qty = 0;

    Object.keys(map).forEach(key => {
      if (map[key].some(k => name.includes(k))) {
        qty = auto[key] || 0;
      }
    });

    return {
      ...item,
      qty,
      total: qty * (item.price || 0)
    };
  });
}
