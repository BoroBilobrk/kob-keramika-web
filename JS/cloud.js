// CLOUD – Firebase Storage + Firestore arhiva

async function saveToCloud(data, pdfBlob) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert("Prijava potrebna.");
            return;
        }

        // Spremaj JSON zapis u Firestore
        const docRef = await firebase.firestore()
            .collection("obracuni")
            .add({
                uid: user.uid,
                timestamp: new Date().toISOString(),
                data: data
            });

        // Upload PDF u Storage
        const filePath = `pdfs/${docRef.id}.pdf`;
        const storageRef = firebase.storage().ref().child(filePath);
        await storageRef.put(pdfBlob);

        const url = await storageRef.getDownloadURL();

        await docRef.update({
            pdfURL: url,
            pdfPath: filePath
        });

        alert("Obračun i PDF spremljeni u Cloud.");
    } catch (err) {
        console.error(err);
        alert("Greška pri spremanju u Cloud.");
    }
}


// Dohvati listu spremljenih datoteka
async function renderCloudFiles() {
    const listDiv = document.getElementById("cloudFileList");
    listDiv.innerHTML = "Učitavanje...";

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            listDiv.innerHTML = "Nije prijavljen korisnik.";
            return;
        }

        const snap = await firebase.firestore()
            .collection("obracuni")
            .where("uid", "==", user.uid)
            .orderBy("timestamp", "desc")
            .get();

        if (snap.empty) {
            listDiv.innerHTML = "<p>Nema spremljenih datoteka.</p>";
            return;
        }

        let html = "<ul>";

        snap.forEach(doc => {
            const d = doc.data();
            html += `
                <li>
                    <b>${d.timestamp}</b>  
                    <button onclick="openPdfFromCloud('${d.pdfURL}')">Otvori PDF</button>
                </li>
            `;
        });

        html += "</ul>";
        listDiv.innerHTML = html;

    } catch (err) {
        console.error(err);
        listDiv.innerHTML = "Greška pri učitavanju arhive.";
    }
}


function openPdfFromCloud(url) {
    window.open(url, "_blank");
}


// GLOBAL EXPORT
window.saveToCloud = saveToCloud;
window.renderCloudFiles = renderCloudFiles;
window.openPdfFromCloud = openPdfFromCloud;
