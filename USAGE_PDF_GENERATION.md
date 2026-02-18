# PDF Generation - Usage Guide

This document explains how to use the new PDF generation features for KOB-KERAMIKA web application.

## Overview

The application now supports generating two types of PDF documents:

1. **TABELA ZA MJERENJE** (Measurement Table)
2. **PRVA PRIVREMENA SITUACIJA** (First Temporary Situation)

## How to Use

### Step 1: Load Troskovnik (Cost Estimate)

1. Navigate to "📥 Učitavanje troškovnika" from the home screen
2. Select an Excel file (.xlsx, .xls, or .csv) containing your cost estimate
3. Click "📥 Učitaj troškovnik" to load the file
4. The system will automatically parse the file and display a preview of loaded items

**Expected Excel Format:**
- Columns: R.BR (item number), OPIS STAVKE (description), J.M (unit), KOLIČINA (quantity), JED. CIJENA (unit price), UKUPNO (total)
- The system will automatically detect the header row

### Step 2: Configure Project Data

1. Navigate to "📊 Obračun po troškovniku" from the home screen
2. Fill in the project metadata fields:
   - **Naziv gradilišta**: Building site name (e.g., "k.č.br. 1263 k.o. Trešnjevka Nova")
   - **Opis radova**: Description of works (e.g., "kosi profil")
   - **Broj situacije**: Situation number (e.g., "1")
   - **Investitor**: Investor name (e.g., "GIK GRUPA d.o.o.")
   - **Lokacija investitora**: Investor location (e.g., "Zagreb")
   - **Adresa investitora**: Investor address (e.g., "Pile I. 1")
   - **OIB investitora**: Investor tax ID (e.g., "91287854085")
   - **Broj ugovora**: Contract number (e.g., "001/2025")
   - **Vrijednost ugovora**: Contract value in EUR (e.g., "115233.90")
   - **Datum isporuke**: Delivery date (e.g., "31.12.2025")
   - **Početak perioda**: Period start date (e.g., "01.12.2025")
   - **Kraj perioda**: Period end date (e.g., "31.12.2025")

### Step 3: Select PDF Type

Choose the desired PDF format using radio buttons:
- **Privremena situacija**: Generates a temporary situation report with financial summary
- **Tabela za mjerenje**: Generates a detailed measurement table

### Step 4: Calculate and Generate PDF

1. Click "🔍 Izračunaj po troškovniku" to calculate quantities based on the loaded cost estimate
2. Review the calculated results displayed on screen
3. Click "📄 PDF – po troškovniku" to generate and download the PDF

## PDF Formats

### 1. TABELA ZA MJERENJE (Measurement Table)

This format includes:
- **Header**: Company logo and details (KOB-KERAMIKA, address, OIB, IBAN, SWIFT)
- **Investor Section**: Investor name, location, address, and tax ID
- **Building Information**: Building site details
- **Work Description**: Description of works performed
- **Measurement Table** with columns:
  - Red broj (Item number)
  - Opis stavke (Description)
  - Jed. mjera (Unit of measurement)
  - Ukupna količina (Total contracted quantity)
  - Cijena (Unit price in EUR)
  - Izvršena količina (Executed quantity)
  - Mjesečni obračun (Monthly calculation)

**When to use**: For detailed item-by-item measurement reports

### 2. PRVA PRIVREMENA SITUACIJA (First Temporary Situation)

This format includes:
- **Header**: Company information (KOB-KERAMIKA, owner, OIB, IBAN, SWIFT)
- **Logo**: Centered company logo
- **Title**: "PRVA PRIVREMENA SITUACIJA" with situation number
- **Report Data**: Delivery date, execution period, building object
- **Client Information**: Client name, location, address, tax ID
- **Contract Information**: Contract number and value
- **Works Table**: List of performed works with executed prices
- **Financial Summary**:
  - Contract number
  - Contract value
  - Value of executed works
- **Signatures**: Sections for contractor and supervising engineer
- **Final Data**: Date, location, operator information

**When to use**: For official temporary situation reports with financial summaries

## Data Sources

The PDF generation uses data from multiple sources:

1. **Excel/CSV File**: Loaded via "Učitavanje troškovnika"
   - Item descriptions
   - Units of measurement
   - Quantities
   - Unit prices

2. **Form Input Fields**: User-entered project metadata
   - Site information
   - Investor details
   - Contract information
   - Dates

3. **Calculated Values**: Automatically computed
   - Executed quantities (based on automatic calculation logic)
   - Total amounts (quantity × unit price)
   - Financial summaries

## Number Formatting

All numbers in the PDFs are formatted according to Croatian standards:
- Decimal separator: comma (,)
- Example: 3.20 → 3,20
- Example: 115233.90 → 115.233,90

## Technical Details

- **Library**: jsPDF for PDF generation
- **Font**: Roboto-Regular for Croatian character support
- **Page Format**: A4, portrait orientation
- **Encoding**: UTF-8 with proper Croatian character support

## Troubleshooting

### PDF generation fails
- Check that all required fields are filled in
- Ensure the troskovnik is loaded correctly
- Check browser console for error messages

### Numbers not formatted correctly
- Verify that input fields use either comma (,) or dot (.) as decimal separator
- The system automatically converts to Croatian format (comma)

### Missing items in PDF
- Verify that items were loaded correctly in the preview
- Check that the calculation was performed ("Izračunaj po troškovniku")
- Ensure items have valid quantities and prices

## Advanced Configuration

### Customizing the Situation Suffix

By default, the situation title includes "/PJ/1" suffix. This can be customized by adding a `situationSuffix` field to the metadata in the code.

### Adding Custom Fields

To add custom fields to the PDFs, modify the relevant PDF generator file:
- `JS/pdf/pdfTabelaMjerenja.js` for measurement tables
- `JS/pdf/pdfPrivremenaSituacija.js` for temporary situations

## Support

For issues or questions, contact the development team or refer to the codebase documentation.
