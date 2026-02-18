# Dokumentacija PDF Generiranja

## Pregled

Ovaj projekt uključuje dva glavna modula za generiranje PDF dokumenata za profesionalnu građevinsku dokumentaciju s potpunom podrškom za hrvatske znakove.

## Datoteke

### 1. JS/pdf/pdfSingle.js - TABELA ZA MJERENJE
Generira PDF dokumente s tabelom mjerenja za obračun građevinskih radova.

#### Značajke:
- Zaglavlje s logom i kontakt podacima tvrtke
- Sekcija investitora (INVESTITOR i GRAĐEVINA)
- Opis radova
- Detaljna tabela mjerenja sa:
  - Redni broj
  - Opis radova
  - Jedinica mjere
  - Količina
  - Cijena jedinice (EUR)
  - Izvršena količina
  - Ukupan iznos (EUR)
- Izračun ukupne vrijednosti
- Sekcija za potpis

#### Primjer korištenja:
```javascript
import { buildPdfDocument } from './JS/pdf/pdfSingle.js';

const podatci = {
  meta: {
    siteName: "k.č.br. 1263 k.o. Trešnjevka Nova",
    roomName: "Keramičarski radovi - kupaonica",
    investorName: "GIK GRUPA d.o.o., Zagreb",
    situationNo: "S-12/2025"
  },
  results: {
    pod: 15.50,
    zidovi: 42.30,
    hidroPod: 15.50,
    silikon: 12.80
  },
  prices: {
    pod: 25.00,
    zidovi: 35.00,
    hidroPod: 18.50,
    silikon: 8.50
  }
};

const doc = await buildPdfDocument(podatci);
doc.save('Mjerenje.pdf');
```

### 2. JS/pdf/pdfSituacija.js - PRVA PRIVREMENA SITUACIJA
Generira PDF dokumente s privremenom ili okončanom situacijom za naplatu i praćenje napretka.

#### Značajke:
- Zaglavlje s podacima tvrtke KOB-KERAMIKA
- Centrirani logo
- Naslov (PRVA PRIVREMENA SITUACIJA ili OKONČANA SITUACIJA)
- Metapodaci izvještaja:
  - Datum isporuke
  - Periode izvršenja (mogu se konfigurirati)
  - Gradilište
- Podaci o naručitelju (NARUČITELJ)
- Detalji ugovora (broj i vrijednost)
- Tabela s izvršenim radovima
- Financijski sažetak:
  - Vrijednost ugovora
  - Vrijednost izvršenih radova
  - Prethodne situacije ukupno
  - Preostala vrijednost
- Sekcija za potpise (Izvođač radova, Nadzorni inženjer)
- Završni podaci (datum, lokacija, operater)

#### Primjer korištenja:
```javascript
import { generateSituacijaPDF } from './JS/pdf/pdfSituacija.js';

const podatci = {
  meta: {
    siteName: "k.č.br. 1263 k.o. Trešnjevka Nova",
    investorName: "GIK GRUPA d.o.o., Zagreb",
    situationNo: "1/PJ/1",
    contractNo: "UG-2025-123",
    contractValue: "115233.90",
    periodFrom: "1.12.2025",  // Opcionalno
    periodTo: "31.12.2025"     // Opcionalno
  },
  items: [
    {
      name: "Keramičarski radovi - pod",
      qty: 15.50,
      unit: "m²",
      price: 25.00,
      total: 387.50
    }
  ],
  total: 1868.00,
  prevTotal: 0
};

const doc = await generateSituacijaPDF(podatci, 'privremena');
doc.save('Situacija.pdf');
```

### 3. JS/pdf/pdfHelpers.js - Pomoćne Funkcije
Pruža ponovno upotrebljive alate za generiranje PDF-a.

#### Funkcije:

##### formatNumber(num, decimals)
Formatira brojeve prema hrvatskim standardima (zarez kao decimalni separator).
```javascript
formatNumber(3.20, 2)  // Vraća: "3,20"
formatNumber(1234.56)  // Vraća: "1234,56"
```

##### drawTable(doc, startX, startY, headers, rows, options)
Crta formatiranu tablicu u PDF-u.

##### addLogo(doc, x, y, width, height)
Dodaje logo tvrtke u PDF iz zaglavlja stranice.

##### addCompanyHeader(doc, x, y, options)
Dodaje standardizirano zaglavlje tvrtke s kontakt informacijama.

## Podrška za Hrvatske Znakove

Svi PDF moduli koriste **Roboto font** za punu podršku hrvatskih znakova:
- č, ć, š, ž, đ
- Č, Ć, Š, Ž, Đ

### Učitavanje Fonta
Font se učitava asinkrono putem `ensureRoboto(doc)` iz `JS/pdf/fontRoboto.js`:

```javascript
await ensureRoboto(doc);
doc.setFont("Roboto", "normal");
```

### Lokacija Font Datoteke
- Font datoteka: `JS/pdf/fonts/Roboto-Regular.ttf`
- Učitava se putem fetch API-ja
- Kešira se nakon prvog učitavanja

## Formatiranje Brojeva

Svi brojevi se formatiraju prema hrvatskim standardima:
- Decimalni separator: zarez (,)
- Primjeri: 3,20 EUR, 1.234,56 EUR

Ovo se automatski obrađuje putem funkcije `formatNumber()` iz `pdfHelpers.js`.

## Izvori Podataka

PDF generatori podržavaju podatke iz:
1. **Automatski obračun** (autoCalc) - iz `JS/calculations/autoCalc.js`
2. **Troškovnik** - iz Excel/CSV uvoza
3. **Ručni unos** - prilagođeni objekti podataka

## Testiranje

Za testiranje PDF generiranja s hrvatskim znakovima:
1. Otvori `test_pdf.html` u pregledniku s internetskom vezom (za jsPDF CDN)
2. Klikni "Generiraj PDF 1" za testiranje TABELE ZA MJERENJE
3. Klikni "Generiraj PDF 2" za testiranje PRVE PRIVREMENE SITUACIJE
4. Provjeri da se hrvatski znakovi pravilno prikazuju
5. Provjeri da formatiranje brojeva koristi zarez kao separator

## Podaci o Tvrtki

Zadani podaci tvrtke (mogu se zamijeniti putem data.meta):
- Naziv: KOB-KERAMIKA
- Vlasnik: Slobodan Bilobrk
- Adresa: Tina Ujevića 4, 10450 Klinča Sela
- OIB: 27080482187
- IBAN: HR0823600001102094050
- SWIFT: ZABAHR2X

## Ovisnosti

- **jsPDF 2.5.1+** - biblioteka za generiranje PDF-a
- **Roboto font** - za podršku hrvatskih znakova
- Moderni preglednik s podrškom za ES6 module

## Kompatibilnost Preglednika

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Svi preglednici moraju podržavati:
- ES6 module
- Async/await
- Fetch API
- ArrayBuffer
