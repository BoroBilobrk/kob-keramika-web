// JS/pdf/fontRoboto.js
// Dinamičko učitavanje Roboto-Regular.ttf i registracija u jsPDF

let robotoLoaded = false;

export async function ensureRoboto(doc) {
  if (robotoLoaded) {
    try {
      doc.setFont("Roboto", "normal");
    } catch (e) {
      doc.setFont("helvetica", "normal");
    }
    return;
  }

  try {
    const response = await fetch("JS/pdf/fonts/Roboto-Regular.ttf");

    if (!response.ok) {
      console.error("Ne mogu učitati Roboto font:", response.status);
      doc.setFont("helvetica", "normal");
      return;
    }

    const buffer = await response.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    let binary = "";
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64 = btoa(binary);

    doc.addFileToVFS("Roboto-Regular.ttf", base64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

    doc.setFont("Roboto", "normal");
    robotoLoaded = true;

  } catch (e) {
    console.error("Greška učitavanja Roboto fonta:", e);
    doc.setFont("helvetica", "normal");
  }
}
