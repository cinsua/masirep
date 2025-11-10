#!/bin/bash

# Script seguro para commits
commit_msg="$1"

# Validar que no contenga patrones problemáticos
if [[ "$commit_msg" =~ \$\(cat.*EOF ]]; then
    echo "❌ ERROR: Detectado patrón problemático en el mensaje"
    echo "   El mensaje contiene '\$(cat <<'EOF')' que es incorrecto"
    echo "   Formato correcto:"
    echo "   ./scripts/safe-commit.sh \"feat(api): agregar endpoint\""
    exit 1
fi

# Validar formato Conventional Commits
commit_regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,50}'
if [[ ! "$commit_msg" =~ $commit_regex ]]; then
    echo "❌ ERROR: El mensaje no sigue Conventional Commits"
    echo "   Formato esperado: tipo(scope): descripción"
    echo "   Tipos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
    exit 1
fi

# Ejecutar commit si todo está válido
git commit -m "$commit_msg"