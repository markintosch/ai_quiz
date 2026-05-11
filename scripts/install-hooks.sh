#!/usr/bin/env bash
# scripts/install-hooks.sh
# ──────────────────────────────────────────────────────────────────────────────
# Installs the project's git hooks into .git/hooks/. Idempotent — safe to
# re-run after pulling new hooks.
#
# Usage:
#   ./scripts/install-hooks.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"
SCRIPTS_DIR="$REPO_ROOT/scripts"

mkdir -p "$HOOKS_DIR"

# ── pre-commit: run the RLS guard against staged migrations ─────────────────
cat > "$HOOKS_DIR/pre-commit" <<'HOOK'
#!/usr/bin/env bash
# Auto-installed via scripts/install-hooks.sh — do not edit by hand.

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"

# RLS check on staged supabase migration files
if [[ -x "$REPO_ROOT/scripts/check-rls.sh" ]]; then
  "$REPO_ROOT/scripts/check-rls.sh"
fi
HOOK

chmod +x "$HOOKS_DIR/pre-commit"

echo "✓ Installed pre-commit hook → $HOOKS_DIR/pre-commit"
echo "  Hook will run scripts/check-rls.sh against staged supabase/*.sql files."
echo "  To bypass for one commit (last resort): git commit --no-verify"
