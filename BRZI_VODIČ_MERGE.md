# BRZI VODIČ: Kako Merge-ati na GitHubu

## Korak-po-Korak (S Screenshot Lokacijama)

### 1️⃣ Otvori GitHub Repozitorij
```
🌐 https://github.com/BoroBilobrk/kob-keramika-web
```

### 2️⃣ Klikni na "Pull requests" tab
```
┌─────────────────────────────────────────────┐
│ Code  Issues  Pull requests  Actions  ...  │  ← Klikni ovdje
└─────────────────────────────────────────────┘
```

### 3️⃣ Klikni "New pull request" (zeleni gumb)
```
┌─────────────────────────────────────────────┐
│  Pull Requests                              │
│                                             │
│  [🟢 New pull request]  ← Klikni           │
└─────────────────────────────────────────────┘
```

### 4️⃣ Odaberi Branch-eve
```
┌─────────────────────────────────────────────┐
│  base: main   ←   compare: copilot/update-  │
│                    pdf-generation            │
│                                             │
│  [ odaberi main ]  [ odaberi tvoj branch ] │
└─────────────────────────────────────────────┘
```

**Gdje:**
- **base:** `main` (kamo spajamo)
- **compare:** `copilot/update-pdf-generation` (što spajamo)

### 5️⃣ Provjeri Promjene
GitHub će prikazati:
```
✓ Able to merge
  
📄 Files changed: 7
  
  ✅ JS/pdf/pdfHelpers.js          +172
  ✅ JS/pdf/pdfSingle.js            +190 -35
  ✅ JS/pdf/pdfSituacija.js         +191 -28
  ✅ DOCS_PDF_GENERATION.md         +238
  ✅ DOCS_PDF_GENERIRANJE_HR.md     +199
  ✅ IMPLEMENTATION_SUMMARY.md      +350
  ✅ test_pdf.html                  +145
```

### 6️⃣ Dodaj Naslov i Opis
```
┌─────────────────────────────────────────────┐
│ Title:                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ Implement PDF generation with Croatian │ │
│ │ character support                       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Description:                                │
│ ┌─────────────────────────────────────────┐ │
│ │ - TABELA ZA MJERENJE                    │ │
│ │ - PRVA PRIVREMENA SITUACIJA             │ │
│ │ - Full Croatian support (č,ć,š,ž,đ)     │ │
│ │ - Croatian number format (3,20)         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 7️⃣ Klikni "Create pull request" (zeleni gumb dolje)
```
┌─────────────────────────────────────────────┐
│                                             │
│         [🟢 Create pull request]            │
└─────────────────────────────────────────────┘
```

### 8️⃣ Čekaj par sekundi...
GitHub provjerava:
- ✅ Nema konflikata
- ✅ Sve provjere prođu (ako ih imaš)

### 9️⃣ Klikni "Merge pull request" (zeleni gumb)
```
┌─────────────────────────────────────────────┐
│  ✅ This branch has no conflicts with main  │
│                                             │
│     [🟢 Merge pull request]  ▼              │
│                                             │
│     ( ) Create merge commit                 │
│     ( ) Squash and merge                    │
│     ( ) Rebase and merge                    │
└─────────────────────────────────────────────┘
```

**Preporuka:** Odaberi **"Create merge commit"** (default)

### 🔟 Potvrdi Merge
```
┌─────────────────────────────────────────────┐
│  Merge pull request #X from                 │
│  copilot/update-pdf-generation              │
│                                             │
│  [🟢 Confirm merge]                         │
└─────────────────────────────────────────────┘
```

### ✅ GOTOVO!
```
┌─────────────────────────────────────────────┐
│  🎉 Pull request successfully merged        │
│     and closed                              │
│                                             │
│  You're all set—the copilot/update-pdf-     │
│  generation branch can be safely deleted.   │
│                                             │
│  [🗑️ Delete branch]                         │
└─────────────────────────────────────────────┘
```

---

## Što Sada?

### Provjeri Main Branch:
```bash
git checkout main
git pull origin main
```

### Vidi Nove Fajlove:
```bash
ls JS/pdf/
# pdfHelpers.js  ← NOVO!
# pdfSingle.js   ← AŽURIRANO!
# pdfSituacija.js ← AŽURIRANO!

ls *.md
# DOCS_PDF_GENERATION.md      ← NOVO!
# DOCS_PDF_GENERIRANJE_HR.md  ← NOVO!
# IMPLEMENTATION_SUMMARY.md   ← NOVO!
```

### Koristi Nove Funkcije:
```javascript
// U svom kodu:
import { buildPdfDocument } from './JS/pdf/pdfSingle.js';
import { generateSituacijaPDF } from './JS/pdf/pdfSituacija.js';

// Generiraj PDF!
const doc = await buildPdfDocument(data);
doc.save('mjerenje.pdf');
```

---

## Česte Greške i Rješenja

### ❌ "There isn't anything to compare"
**Rješenje:** Provjerim jesu li branch-evi različiti. Možda su već merge-ani.

### ❌ "Merge conflicts"
**Rješenje:** U tvom slučaju **nema konflikata** jer su fajlovi novi. Ako ipak ima, GitHub će pokazati koje linije, pa ručno odaberi koje želiš.

### ❌ "Protected branch"
**Rješenje:** Možda `main` branch ima protection rules. Zatraži od repo admina (tj. sebe) da ih temporarily disable ili approve PR.

---

## Alternative: Brži Način (Ako si Admin)

Ako imaš **write access**, možeš direktno merge-ati:

```bash
# Lokalno
git checkout main
git merge copilot/update-pdf-generation
git push origin main

# Gotovo!
```

Ali **Pull Request način je bolji** jer:
- ✅ Imaš record promjena
- ✅ Možeš pregledati prije merge-a
- ✅ Drugi ljudi mogu vidjeti što si radio
- ✅ GitHub čuva povijest

---

## Sažetak

```
1. GitHub → Pull requests
2. New pull request
3. base: main, compare: copilot/update-pdf-generation
4. Create pull request
5. Merge pull request
6. Confirm merge
7. ✅ GOTOVO!
```

**Vrijeme:** ~2 minute ⏱️

---

## Pomoć?

Ako ne radi ili imaš pitanja:
1. Provjeri da li si prijavljen na GitHub
2. Provjeri da li imaš permissions na repo
3. Pokušaj ponovno
4. Pitaj me! 😊
