# Kako Push-ati na GitHub? 🚀

## Što znači "push"?

**Push** (Hrvatski: **poslati**, **gurnuti**) = Slanje lokalnih commit-ova (promjena) na GitHub.

```
Tvoje računalo (lokalno)  →  [PUSH]  →  GitHub (remote)
```

---

## Trenutna Situacija

```
Lokalni repo:
  ✓ copilot/update-pdf-generation branch
  ✓ main branch (sa merge-om - ako je napravljen)
  ✓ Sve promjene commit-ane

GitHub (remote):
  ✓ copilot/update-pdf-generation branch (sinkronizirano)
  ? main branch (stara verzija - treba update)
```

---

## 📋 Kako Push-ati? (3 Načina)

### 🔵 Način 1: Push s Командом (NAJČEŠĆE)

```bash
# 1. Provjeri na kojem si branchu
git status

# 2. Push trenutni branch na GitHub
git push origin <naziv-brancha>

# Primjeri:
git push origin main                           # Push main
git push origin copilot/update-pdf-generation  # Push feature branch
```

#### Detaljno za main branch:

```bash
# A) Prebaci se na main branch
git checkout main

# B) Provjeri status
git status

# C) Push na GitHub
git push origin main

# ✅ GOTOVO!
```

---

### 🔵 Način 2: GitHub Desktop (Ako imaš instaliran)

1. **Otvori GitHub Desktop**
2. **Odaberi** repozitorij: `kob-keramika-web`
3. **Odaberi** branch koji želiš push-ati (main ili copilot/...)
4. **Klikni** "Push origin" (gornji desni gumb)
5. ✅ **GOTOVO!**

---

### 🔵 Način 3: GitHub Web (Za urgentne slučajeve)

⚠️ **Napomena:** Ovo radi samo za male promjene, ne za cijeli merge.

1. Idi na GitHub: https://github.com/BoroBilobrk/kob-keramika-web
2. Klikni na fajl
3. Klikni "Edit" (olovka ikona)
4. Napravi promjene
5. Klikni "Commit changes"

---

## 🛠️ Testiranje Push-a

### Prvo testiranje (dry-run):

```bash
# Provjeri što će se push-ati BEZ stvarnog push-a
git push --dry-run origin main

# Output će pokazati:
# To https://github.com/BoroBilobrk/kob-keramika-web
#    1f68309..3417660  main -> main
```

### Provjeri prije push-a:

```bash
# Vidi razliku između lokalnog i remote brancha
git diff origin/main main

# Vidi koje commit-ove šalješ
git log origin/main..main --oneline
```

---

## 🚨 Česte Greške i Rješenja

### ❌ Greška: "Permission denied"

```
remote: Permission to BoroBilobrk/kob-keramika-web.git denied
fatal: unable to access 'https://github.com/...': 403
```

**Rješenje:**
```bash
# A) Provjeri GitHub credentials
git config --global user.name
git config --global user.email

# B) Ponovno se autentificiraj
gh auth login  # Ako imaš GitHub CLI

# ILI

# C) Koristi Personal Access Token
# 1. GitHub → Settings → Developer settings → Personal access tokens
# 2. Generate new token (classic)
# 3. Odaberi "repo" scope
# 4. Kopiraj token
# 5. Koristi umjesto password-a pri push-u
```

### ❌ Greška: "Updates were rejected"

```
error: failed to push some refs to 'github.com/...'
hint: Updates were rejected because the remote contains work that you do not have locally
```

**Rješenje:**
```bash
# Pull najnovije promjene s GitHuba
git pull origin main

# ILI ako si siguran da tvoje promjene su ispravne:
git push --force origin main  # ⚠️ OPREZNO! Briše remote verziju
```

### ❌ Greška: "Branch diverged"

```
Your branch and 'origin/main' have diverged
```

**Rješenje:**
```bash
# Pull i rebase
git pull --rebase origin main

# Ili merge
git pull origin main
```

---

## 📝 Kompletna Procedura (Korak-po-Korak)

### Za Push-anje MAIN brancha (sa merge-om):

```bash
# 1. Provjeri gdje si
pwd
# /home/runner/work/kob-keramika-web/kob-keramika-web

# 2. Vidi trenutni branch
git branch
# * copilot/update-pdf-generation
#   main  ← Lokalni main sa merge-om

# 3. Prebaci se na main
git checkout main

# 4. Provjeri status
git status
# On branch main
# nothing to commit, working tree clean

# 5. Vidi što ima za push-ati
git log origin/main..main --oneline
# 3417660 Add merge status report
# 5559a0e Merge branch 'copilot/update-pdf-generation'

# 6. PUSH!
git push origin main

# 7. Provjeri na GitHubu
# https://github.com/BoroBilobrk/kob-keramika-web/tree/main
```

---

## 🔐 Autentifikacija

### Ako GitHub traži credentials:

**Username:** `BoroBilobrk`  
**Password:** `<tvoj Personal Access Token>`

### Kako dobiti Personal Access Token (PAT):

1. GitHub → **Settings** (tvoj profil)
2. **Developer settings** (lijevi meni, dno)
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token**
5. Ime: `kob-keramika-web-push`
6. Scope: ✅ **repo** (sve pod "repo")
7. **Generate token**
8. **Kopiraj token** (vidiš ga samo jednom!)
9. Koristi kao password pri `git push`

---

## ✅ Provjera Uspješnog Push-a

### Nakon push-a, provjeri:

#### A) Lokalno:
```bash
git status
# Your branch is up to date with 'origin/main'
```

#### B) Na GitHubu:
```
1. Idi na: https://github.com/BoroBilobrk/kob-keramika-web
2. Odaberi branch: main
3. Provjeri zadnji commit:
   - Trebao bi biti tvoj merge commit
   - Datum: danas
4. Provjeri fajlove:
   - DOCS_PDF_GENERATION.md ✓
   - JS/pdf/pdfHelpers.js ✓
   - test_pdf.html ✓
```

---

## 🎯 Za Tvoj Specifičan Slučaj

Imaš **2 opcije**:

### Opcija A: Push merge-ani main branch

```bash
git checkout main
git push origin main
```

**Rezultat:** Sve PDF funkcionalnosti u main branchu na GitHubu ✓

### Opcija B: Kreiraj Pull Request (PR)

```bash
# Već je gotovo! copilot/update-pdf-generation je na GitHubu

# Samo trebaš:
# 1. GitHub → Pull requests
# 2. New pull request
# 3. base: main, compare: copilot/update-pdf-generation
# 4. Create PR
# 5. Merge PR
```

**Rezultat:** Isto kao opcija A, ali s PR record-om ✓

---

## 📊 Vizualizacija Push-a

### Prije push-a:
```
GitHub (origin/main)           Lokalno (main)
        |                             |
    1f68309                       3417660 (merge commit)
        |                             |
        |                         5559a0e (merge)
        |                             |
        |                         b6f96e3
        |                         
    [NE SINKRONIZIRANO]
```

### Nakon `git push origin main`:
```
GitHub (origin/main)           Lokalno (main)
        |                             |
    3417660 ← PUSH ← ← ← ← ← ← ← 3417660
        |                             |
    [SINKRONIZIRANO! ✅]
```

---

## 🆘 Brza Pomoć

```bash
# Ako si zaglavljen, evo brze komande:
git status                    # Gdje sam?
git branch -a                 # Koji branch-evi postoje?
git log --oneline -5          # Zadnjih 5 commit-ova
git push origin main          # Push main branch
git push origin $(git branch --show-current)  # Push trenutni branch
```

---

## Sažetak

**"Push-ati"** = **Poslati lokalne promjene na GitHub**

**Najjednostavnije:**
```bash
git push origin main
```

**To je to!** 🎉

Ako imaš probleme s credentials, pogledaj sekciju "Autentifikacija" gore.
