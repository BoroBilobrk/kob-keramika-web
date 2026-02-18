# PDF Generation Documentation

## Overview

This project includes two main PDF generation modules for creating professional construction documentation with full Croatian character support.

## Files

### 1. JS/pdf/pdfSingle.js - TABELA ZA MJERENJE
Generates measurement table PDFs for construction work calculations.

#### Features:
- Company header with logo and contact details
- Investor section (INVESTITOR and GRAĐEVINA)
- Work description
- Detailed measurement table with:
  - Row number
  - Work description
  - Unit of measurement
  - Quantity
  - Unit price (EUR)
  - Executed quantity
  - Total amount (EUR)
- Total calculation
- Signature section

#### Usage:
```javascript
import { buildPdfDocument } from './JS/pdf/pdfSingle.js';

const data = {
  meta: {
    siteName: "k.č.br. 1263 k.o. Trešnjevka Nova",
    roomName: "Keramičarski radovi - kupaonica",
    investorName: "GIK GRUPA d.o.o., Zagreb",
    situationNo: "S-12/2025"
  },
  results: {
    pod: 15.50,
    zidovi: 42.30,
    // ... more items
  },
  prices: {
    pod: 25.00,
    zidovi: 35.00,
    // ... more prices
  }
};

const doc = await buildPdfDocument(data);
doc.save('Mjerenje.pdf');
```

### 2. JS/pdf/pdfSituacija.js - PRVA PRIVREMENA SITUACIJA
Generates situation report PDFs for billing and progress tracking.

#### Features:
- Company header with KOB-KERAMIKA details
- Centered logo
- Title (PRVA PRIVREMENA SITUACIJA or OKONČANA SITUACIJA)
- Report metadata:
  - Delivery date
  - Execution periods (configurable)
  - Construction site
- Client information (NARUČITELJ)
- Contract details (number and value)
- Work table with completed items
- Financial summary:
  - Contract value
  - Executed work value
  - Previous situations total
  - Remaining value
- Signature section (Izvođač radova, Nadzorni inženjer)
- Final data (date, location, operator)

#### Usage:
```javascript
import { generateSituacijaPDF } from './JS/pdf/pdfSituacija.js';

const data = {
  meta: {
    siteName: "k.č.br. 1263 k.o. Trešnjevka Nova",
    investorName: "GIK GRUPA d.o.o., Zagreb",
    situationNo: "1/PJ/1",
    contractNo: "UG-2025-123",
    contractValue: "115233.90",
    periodFrom: "1.12.2025",  // Optional
    periodTo: "31.12.2025"     // Optional
  },
  items: [
    {
      name: "Keramičarski radovi - pod",
      qty: 15.50,
      unit: "m²",
      price: 25.00,
      total: 387.50
    },
    // ... more items
  ],
  total: 1868.00,
  prevTotal: 0
};

const doc = await generateSituacijaPDF(data, 'privremena');
doc.save('Situacija.pdf');
```

### 3. JS/pdf/pdfHelpers.js - Helper Functions
Provides reusable utilities for PDF generation.

#### Functions:

##### formatNumber(num, decimals)
Formats numbers according to Croatian standards (comma as decimal separator).
```javascript
formatNumber(3.20, 2)  // Returns: "3,20"
formatNumber(1234.56)  // Returns: "1234,56"
```

##### drawTable(doc, startX, startY, headers, rows, options)
Draws a formatted table in the PDF.
```javascript
const headers = [
  { text: "Column 1", width: 50, align: "left" },
  { text: "Column 2", width: 30, align: "right" }
];
const rows = [
  ["Row 1 Data 1", "100,00"],
  ["Row 2 Data 1", "200,00"]
];
const endY = drawTable(doc, 10, 50, headers, rows);
```

##### addLogo(doc, x, y, width, height)
Adds the company logo to the PDF from the page header.

##### addCompanyHeader(doc, x, y, options)
Adds standardized company header with contact information.

##### addSeparatorLine(doc, x1, y, x2)
Draws a horizontal separator line.

##### addWrappedText(doc, text, x, y, maxWidth)
Adds text with automatic line wrapping.

## Croatian Character Support

All PDF modules use the **Roboto font** for full Croatian character support:
- č, ć, š, ž, đ
- Č, Ć, Š, Ž, Đ

### Font Loading
The font is loaded asynchronously via `ensureRoboto(doc)` from `JS/pdf/fontRoboto.js`:

```javascript
await ensureRoboto(doc);
doc.setFont("Roboto", "normal");
```

### Font File Location
- Font file: `JS/pdf/fonts/Roboto-Regular.ttf`
- Loaded via fetch API
- Cached after first load

## Number Formatting

All numbers are formatted according to Croatian standards:
- Decimal separator: comma (,)
- Examples: 3,20 EUR, 1.234,56 EUR

This is handled automatically by the `formatNumber()` function from `pdfHelpers.js`.

## Data Sources

The PDF generators support data from:
1. **Automatic calculation** (autoCalc) - from `JS/calculations/autoCalc.js`
2. **Troškovnik (cost estimate)** - from Excel/CSV import
3. **Manual entry** - custom data objects

## Integration Points

### In events.js
```javascript
import { buildPdfDocument, buildPdfDocumentForSite } from "../pdf/pdfSingle.js";

$("btnExportPdfAuto")?.addEventListener("click", async () => {
  const data = calculateAuto();
  const pdf = await buildPdfDocument(data);
  pdf.save(`Mjerenje_${data.meta.siteName}.pdf`);
});
```

### In troskovnikCalc.js
```javascript
import { generateSituacijaPDF } from "../pdf/pdfSituacija.js";

document.getElementById("btnExportPdfTroskovnik")?.addEventListener("click", async () => {
  const doc = await generateSituacijaPDF(window.currentSituationData, situationType);
  doc.save(`Situacija_${window.currentSituationData.meta.situationNo}.pdf`);
});
```

## Testing

To test PDF generation with Croatian characters:
1. Open `test_pdf.html` in a browser with internet access (for jsPDF CDN)
2. Click "Generiraj PDF 1" to test TABELA ZA MJERENJE
3. Click "Generiraj PDF 2" to test PRVA PRIVREMENA SITUACIJA
4. Verify Croatian characters display correctly
5. Verify number formatting uses comma separator

## Company Information

Default company details (can be overridden via data.meta):
- Name: KOB-KERAMIKA
- Owner: Slobodan Bilobrk
- Address: Tina Ujevića 4, 10450 Klinča Sela
- OIB: 27080482187
- IBAN: HR0823600001102094050
- SWIFT: ZABAHR2X

## Dependencies

- **jsPDF 2.5.1+** - PDF generation library
- **Roboto font** - For Croatian character support
- Modern browser with ES6 modules support

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

All browsers must support:
- ES6 modules
- Async/await
- Fetch API
- ArrayBuffer
