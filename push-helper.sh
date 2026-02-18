#!/bin/bash
# Interaktivni PUSH helper za kob-keramika-web

echo "=================================================="
echo "🚀 PUSH HELPER za kob-keramika-web"
echo "=================================================="
echo ""

# Provjeri trenutni branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Trenutni branch: $CURRENT_BRANCH"
echo ""

# Provjeri status
echo "📊 Git status:"
git status --short
echo ""

# Provjeri uncommitted promjene
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  UPOZORENJE: Imaš uncommitted promjene!"
    echo "   Prvo commit-aj: git add . && git commit -m 'opis'"
    echo ""
    exit 1
fi

# Provjeri ima li za push-ati
AHEAD=$(git rev-list --count origin/$CURRENT_BRANCH..$CURRENT_BRANCH 2>/dev/null || echo "0")
BEHIND=$(git rev-list --count $CURRENT_BRANCH..origin/$CURRENT_BRANCH 2>/dev/null || echo "0")

echo "📦 Promjene za push:"
if [ "$AHEAD" -gt 0 ]; then
    echo "   ✅ $AHEAD commit(ova) za push-ati"
    git log origin/$CURRENT_BRANCH..$CURRENT_BRANCH --oneline
else
    echo "   ℹ️  Nema novih commit-ova za push-ati"
fi
echo ""

if [ "$BEHIND" -gt 0 ]; then
    echo "⚠️  Remote je $BEHIND commit(ova) ispred!"
    echo "   Prvo pull-aj: git pull origin $CURRENT_BRANCH"
    echo ""
fi

# Ponudi opcije
echo "=================================================="
echo "Što želiš napraviti?"
echo "=================================================="
echo "1) Push trenutni branch ($CURRENT_BRANCH)"
echo "2) Push main branch"
echo "3) Dry-run (test bez stvarnog push-a)"
echo "4) Vidi razliku (diff)"
echo "5) Otkaži"
echo ""
read -p "Odaberi (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Push-am $CURRENT_BRANCH na GitHub..."
        git push origin $CURRENT_BRANCH
        echo ""
        echo "✅ GOTOVO!"
        ;;
    2)
        echo ""
        echo "📋 Prebacujem na main branch..."
        git checkout main
        echo ""
        echo "🚀 Push-am main na GitHub..."
        git push origin main
        echo ""
        echo "✅ GOTOVO!"
        echo "📋 Vraćam se na $CURRENT_BRANCH..."
        git checkout $CURRENT_BRANCH
        ;;
    3)
        echo ""
        echo "🧪 Dry-run (test)..."
        git push --dry-run origin $CURRENT_BRANCH
        echo ""
        echo "ℹ️  Ovo je bio samo test. Ništa nije push-ano."
        ;;
    4)
        echo ""
        echo "📊 Razlika između lokalnog i remote:"
        git diff origin/$CURRENT_BRANCH $CURRENT_BRANCH --stat
        ;;
    5)
        echo ""
        echo "❌ Otkazano."
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Nevažeći izbor!"
        exit 1
        ;;
esac

echo ""
echo "=================================================="
echo "Gotovo! 🎉"
echo "=================================================="
