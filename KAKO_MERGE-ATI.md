# Kako Merge-ati (Spojiti) Promjene

## Što znači "merge"?

**Merge** (Hrvatski: **spajanje**, **sjedinjavanje**) je Git operacija koja kombinira promjene iz jednog brancha (grane) u drugi branch.

---

## Trenutna Situacija

```
┌─────────────────────────────────────────────┐
│  Branch: copilot/update-pdf-generation      │
│  (TVoje nove promjene - PDF generiranje)    │
│                                             │
│  6 commits:                                 │
│  - PDF helpers                              │
│  - TABELA ZA MJERENJE                       │
│  - PRVA PRIVREMENA SITUACIJA                │
│  - Dokumentacija                            │
│  - Code review fixes                        │
│  - Implementation summary                   │
└─────────────────────────────────────────────┘
                    ↓
              [MERGE] ← Ovo trebaš napraviti
                    ↓
┌─────────────────────────────────────────────┐
│  Branch: main                               │
│  (Glavni branch - produkcijski kod)        │
└─────────────────────────────────────────────┘
```

Nakon merge-a, **main** branch će imati sve nove PDF funkcionalnosti!

---

## Kako Merge-ati? (3 načina)

### 🔵 Način 1: GitHub Web Interface (NAJLAKŠE)

1. **Idi na GitHub:**
   ```
   https://github.com/BoroBilobrk/kob-keramika-web
   ```

2. **Klikni na "Pull requests"** (gore u meniju)

3. **Klikni "New pull request"** (zeleni gumb)

4. **Odaberi:**
   - **base:** `main` (gdje spajamo)
   - **compare:** `copilot/update-pdf-generation` (što spajamo)

5. **Klikni "Create pull request"**

6. **Dodaj opis** (može copy-paste iz PR description što sam dao)

7. **Klikni "Create pull request"** ponovno

8. **Klikni "Merge pull request"** (zeleni gumb)

9. **Klikni "Confirm merge"**

✅ **GOTOVO!** Sve promjene su sada u `main` branchu!

---

### 🔵 Način 2: GitHub CLI (gh)

Ako imaš GitHub CLI instaliran:

```bash
# Kreiraj Pull Request
gh pr create \
  --title "Implement PDF generation with Croatian support" \
  --body "Complete PDF implementation" \
  --base main \
  --head copilot/update-pdf-generation

# Merge Pull Request (nakon što se kreira)
gh pr merge --merge
```

---

### 🔵 Način 3: Git Command Line (DIREKTNO)

⚠️ **Napomena:** Ovo direktno spaja bez Pull Request-a (ne preporučam za tim rad)

```bash
# 1. Prebaci se na main branch
git checkout main

# 2. Povuci najnovije promjene s GitHuba
git pull origin main

# 3. Merge copilot/update-pdf-generation u main
git merge copilot/update-pdf-generation

# 4. Push na GitHub
git push origin main

# 5. (Opcionalno) Obriši stari branch
git branch -d copilot/update-pdf-generation
git push origin --delete copilot/update-pdf-generation
```

---

## Nakon Merge-a

Što se dogodi nakon merge-a:

### ✅ Promjene u `main` branchu:
```
Novi fajlovi (4):
  ✓ JS/pdf/pdfHelpers.js
  ✓ DOCS_PDF_GENERATION.md
  ✓ DOCS_PDF_GENERIRANJE_HR.md
  ✓ IMPLEMENTATION_SUMMARY.md
  ✓ test_pdf.html

Ažurirani fajlovi (3):
  ✓ JS/pdf/pdfSingle.js
  ✓ JS/pdf/pdfSituacija.js
  ✓ JS/troskovnik/troskovnikCalc.js
```

### ✅ Rezultat:
- `main` branch sada ima sve PDF funkcionalnosti
- Možeš koristiti:
  - `buildPdfDocument()` za TABELA ZA MJERENJE
  - `generateSituacijaPDF()` za PRVA PRIVREMENA SITUACIJA
- Puna podrška za hrvatske znakove (č, ć, š, ž, đ)
- Hrvatski format brojeva (3,20)

---

## Terminologija

| Engleski Termin | Hrvatski Prijevod | Značenje |
|----------------|-------------------|----------|
| **merge** | spojiti, sjediniti | Kombinirati promjene iz 2 brancha |
| **branch** | grana, ogranak | Odvojena verzija koda |
| **commit** | commit, snimiti | Spremiti promjene u Git |
| **pull request (PR)** | zahtjev za spajanje | Predložiti merge na GitHubu |
| **push** | poslati, gurnuti | Poslati lokalne promjene na GitHub |
| **pull** | povući, preuzeti | Preuzeti promjene s GitHuba |

---

## Vizualna Analogija

Zamišljaj Git kao **stablo**:

```
           main (deblo)
             |
             |
        (ovdje radiš)
             |
             ├─────→ copilot/update-pdf-generation (nova grana)
             |       |
             |       ├─ Commit 1: PDF helpers
             |       ├─ Commit 2: pdfSingle.js
             |       ├─ Commit 3: pdfSituacija.js
             |       ├─ Commit 4: Dokumentacija
             |       ├─ Commit 5: Fixes
             |       └─ Commit 6: Summary
             |       
     [MERGE] ←──────┘
             |
             | (sada main ima sve)
             ↓
```

Nakon merge-a, nova grana se **vraća** u glavno deblo (main).

---

## FAQ

### ❓ Hoće li se obrisati moje promjene?
**NE!** Merge **dodaje** promjene u main, ne briše ih.

### ❓ Trebam li obrisati `copilot/update-pdf-generation` branch nakon merge-a?
**Možeš**, ali nije obavezno. Sigurno ga možeš obrisati jer su sve promjene sad u `main`.

### ❓ Što ako ima konflikata?
GitHub će te upozoriti. U tvom slučaju **nema konflikata** jer su svi fajlovi novi ili ne-overlapping.

### ❓ Mogu li poništiti merge?
**DA**, s `git revert` ili `git reset`, ali nije potrebno u tvom slučaju.

---

## Preporuka

🎯 **PREPORUČAM Način 1** (GitHub Web Interface):
- Najlakši
- Najsigurniji
- Vidiš pregled svih promjena
- Možeš dodati code reviewere
- Ima record u Pull Request-u

---

## Sažetak

**"Merge-ati"** = **Spojiti promjene iz jednog brancha u drugi**

U tvom slučaju:
1. Otvori GitHub
2. Kreiraj Pull Request
3. Klikni "Merge pull request"
4. ✅ GOTOVO!

Sve tvoje PDF funkcionalnosti će biti u `main` branchu i dostupne svima! 🚀
