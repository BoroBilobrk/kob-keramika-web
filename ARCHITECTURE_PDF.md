# PDF Generation - Technical Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Load Troskovnik (Excel/CSV)                                │
│  ────────────────────────────────────────────────────────────────── │
│  File Input → loadExcel.js → Parse → window.troskovnikItems         │
│                                                                       │
│  Data Structure:                                                     │
│  {                                                                   │
│    id: "Sheet-1",                                                    │
│    rb: "1",                      // Item number                     │
│    opis: "Pod kupaonice",        // Description                     │
│    jm: "m²",                     // Unit of measurement             │
│    kolicina: 12.5,               // Quantity                        │
│    cijena: 25.00,                // Unit price                      │
│    ukupno: 312.50                // Total                           │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: Fill Project Metadata                                      │
│  ────────────────────────────────────────────────────────────────── │
│  HTML Form Fields:                                                   │
│  - trkSiteName       → Site name                                    │
│  - trkRoomName       → Work description                             │
│  - trkSituationNo    → Situation number                             │
│  - trkInvestorName   → Investor name                                │
│  - trkInvestorLocation → Investor location                          │
│  - trkInvestorAddress  → Investor address                           │
│  - trkInvestorOIB      → Investor tax ID                            │
│  - trkContractNo       → Contract number                            │
│  - trkContractValue    → Contract value                             │
│  - trkDeliveryDate     → Delivery date                              │
│  - trkPeriodStart      → Period start                               │
│  - trkPeriodEnd        → Period end                                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Select PDF Type                                            │
│  ────────────────────────────────────────────────────────────────── │
│  Radio Buttons:                                                      │
│  ○ sitTypePrivremena (value="privremena") [default]                 │
│  ○ sitTypeTabela (value="tabela")                                   │
│                                                                       │
│  → situationType variable                                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Calculate Quantities                                       │
│  ────────────────────────────────────────────────────────────────── │
│  btnCalcFromTroskovnik.click() →                                     │
│                                                                       │
│  1. Get automatic calculation results (calculateAuto())              │
│     {                                                                │
│       pod: 12.5,      // Floor area                                 │
│       zidovi: 45.2,   // Wall area                                  │
│       silikon: 8.5,   // Silicone length                            │
│       ...                                                            │
│     }                                                                │
│                                                                       │
│  2. Map troskovnik items to calculated quantities:                  │
│     - Match by description keywords (pod, zid, silikon, etc.)       │
│     - Calculate total = qty × price                                 │
│                                                                       │
│  3. Store in window.currentSituationData:                            │
│     {                                                                │
│       meta: { ...form fields... },                                  │
│       items: [ ...calculated items... ],                            │
│       total: 1234.56                                                │
│     }                                                                │
│                                                                       │
│  4. Display results on screen                                        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Generate PDF                                                │
│  ────────────────────────────────────────────────────────────────── │
│  btnExportPdfTroskovnik.click() →                                    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  generateSituacijaPDF(data, situationType)                     │ │
│  │                                                                 │ │
│  │  if (situationType === "tabela"):                              │ │
│  │    → generateTabelaMjerenjaPDF(data)                           │ │
│  │       ├─ drawHeader()           // Logo + company info         │ │
│  │       ├─ drawInvestorSection()  // Investor details            │ │
│  │       ├─ drawDescriptionSection() // Work description          │ │
│  │       └─ drawMeasurementTable() // Item table                  │ │
│  │                                                                 │ │
│  │  else:                                                          │ │
│  │    → generatePrivremenaSituacijaPDF(data)                      │ │
│  │       ├─ drawCompanyHeader()    // Company info                │ │
│  │       ├─ drawCenteredLogo()     // Logo                        │ │
│  │       ├─ drawTitle()            // Situation title             │ │
│  │       ├─ drawReportData()       // Dates, building object      │ │
│  │       ├─ drawClientInfo()       // Client details              │ │
│  │       ├─ drawContractInfo()     // Contract number/value       │ │
│  │       ├─ drawWorksTable()       // Works table                 │ │
│  │       ├─ drawFinancialSummary() // Financial summary           │ │
│  │       ├─ drawSignatures()       // Signature sections          │ │
│  │       └─ drawFinalData()        // Date, location, operator    │ │
│  │                                                                 │ │
│  │  Returns: jsPDF document object                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  → doc.save(`Situacija_${situationNo}.pdf`)                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  RESULT: PDF Downloaded to User's Computer                          │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Dependencies

```
index.html
  └── JS/troskovnik/troskovnikCalc.js
        ├── imports calculateAuto from JS/calculations/autoCalc.js
        ├── imports generateSituacijaPDF from JS/pdf/pdfSituacija.js
        │     ├── imports generateTabelaMjerenjaPDF from JS/pdf/pdfTabelaMjerenja.js
        │     │     ├── imports ensureRoboto from JS/pdf/fontRoboto.js
        │     │     └── imports formatHr from JS/core/helpers.js
        │     └── imports generatePrivremenaSituacijaPDF from JS/pdf/pdfPrivremenaSituacija.js
        │           ├── imports ensureRoboto from JS/pdf/fontRoboto.js
        │           └── imports formatHr from JS/core/helpers.js
        └── imports saveSituation from JS/cloud/situacije.js

External Libraries:
  - jsPDF (from CDN: cdnjs.cloudflare.com)
  - XLSX (from CDN: cdn.jsdelivr.net)
```

## Key Functions

### troskovnikCalc.js

- **btnCalcFromTroskovnik.click()**
  - Calculates quantities from troskovnik items
  - Maps items to automatic calculation results
  - Stores data in `window.currentSituationData`

- **btnExportPdfTroskovnik.click()**
  - Calls `generateSituacijaPDF()` with current data
  - Downloads generated PDF

### pdfSituacija.js

- **generateSituacijaPDF(data, type)**
  - Routes to appropriate PDF generator based on type
  - Returns: Promise<jsPDF>

### pdfTabelaMjerenja.js

- **generateTabelaMjerenjaPDF(data)**
  - Generates measurement table PDF
  - Returns: Promise<jsPDF>

- **drawHeader(doc, meta)**
  - Draws company header with logo and details

- **drawInvestorSection(doc, meta, y)**
  - Draws investor information section

- **drawDescriptionSection(doc, meta, y)**
  - Draws work description section

- **drawMeasurementTable(doc, items, y)**
  - Draws detailed measurement table with all columns

### pdfPrivremenaSituacija.js

- **generatePrivremenaSituacijaPDF(data)**
  - Generates temporary situation PDF
  - Returns: Promise<jsPDF>

- **drawCompanyHeader(doc, y)**
  - Draws centered company information

- **drawCenteredLogo(doc, y)**
  - Draws logo in center of page

- **drawTitle(doc, meta, y)**
  - Draws situation title with number

- **drawReportData(doc, meta, y)**
  - Draws report dates and building information

- **drawClientInfo(doc, meta, y)**
  - Draws client/investor information

- **drawContractInfo(doc, meta, y)**
  - Draws contract number and value

- **drawWorksTable(doc, items, y)**
  - Draws table of performed works

- **drawFinancialSummary(doc, data, y)**
  - Draws financial summary section

- **drawSignatures(doc, y)**
  - Draws signature lines

- **drawFinalData(doc, meta)**
  - Draws final information at bottom

## Number Formatting

All numbers are formatted using the `formatHr()` helper function:

```javascript
formatHr(3.20)    → "3,20"
formatHr(115233.90) → "115233,90"
```

The function:
1. Converts input to Number
2. Calls `.toFixed(2)` for 2 decimal places
3. Replaces `.` with `,` for Croatian format

## Font Loading

The Roboto font is loaded asynchronously:

1. `ensureRoboto(doc)` is called for each PDF
2. If not already loaded:
   - Fetches `JS/pdf/fonts/Roboto-Regular.ttf`
   - Converts to base64
   - Adds to jsPDF virtual file system
   - Registers as "Roboto" font
3. Sets font to Roboto for proper Croatian character rendering

## Error Handling

- Missing troskovnik: Alert shown, PDF generation aborted
- Missing metadata: Default values used (e.g., "GIK GRUPA d.o.o.")
- PDF generation error: Error logged to console, alert shown to user
- Font loading failure: Falls back to Helvetica

## Browser Compatibility

Requires modern browser with support for:
- ES6 modules (import/export)
- Fetch API (for font loading)
- ArrayBuffer (for Excel parsing)
- Blob (for PDF download)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
