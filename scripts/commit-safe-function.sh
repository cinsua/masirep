# Función para validar y ejecutar commits seguros
# Agregar a ~/.bashrc o ~/.zshrc

commit_safe() {
    local msg="$1"
    
    # Validar que se proporcionó un mensaje
    if [[ -z "$msg" ]]; then
        echo "❌ ERROR: Debes proporcionar un mensaje de commit"
        echo "   Uso: commit_safe \"feat(api): agregar endpoint\""
        return 1
    fi
    
    # Validar patrones problemáticos
    if [[ "$msg" =~ \$\(cat.*EOF ]]; then
        echo "❌ ERROR: Detectado patrón problemático"
        echo "   El mensaje contiene '\$(cat <<'EOF')'"
        echo "   Usa formato simple: commit_safe \"mensaje\""
        return 1
    fi
    
    # Validar formato Conventional Commits
    local commit_regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,50}'
    if [[ ! "$msg" =~ $commit_regex ]]; then
        echo "❌ ERROR: Formato inválido"
        echo "   Formato esperado: tipo(scope): descripción"
        echo "   Tipos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
        return 1
    fi
    
    # Ejecutar commit
    git commit -m "$msg"
    echo "✅ Commit creado exitosamente"
}

# Alias corto
alias cs='commit_safe'