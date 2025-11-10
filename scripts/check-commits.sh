#!/bin/bash

# Script para verificar rápidamente si hay commits problemáticos
echo "🔍 Buscando commits con mensajes problemáticos..."

# Buscar commits con patrones problemáticos
problematic_commits=$(git log --oneline --grep="\$(cat" --grep="<<'EOF'" 2>/dev/null)

if [[ -n "$problematic_commits" ]]; then
    echo "❌ SE ENCONTRARON COMMITS PROBLEMÁTICOS:"
    echo "$problematic_commits"
    echo ""
    echo "🔧 Para corregir:"
    echo "   - Último commit: git commit --amend -m \"mensaje correcto\""
    echo "   - Múltiples commits: git rebase -i HEAD~N"
    echo ""
    echo "📖 Usa métodos seguros: ./scripts/safe-commit.sh \"mensaje\""
    exit 1
else
    echo "✅ No se encontraron commits problemáticos"
    echo "🎉 Todos los commits tienen formato correcto"
    exit 0
fi