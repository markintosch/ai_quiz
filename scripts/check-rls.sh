#!/usr/bin/env bash
# scripts/check-rls.sh
# ──────────────────────────────────────────────────────────────────────────────
# Fails (exit 1) if any STAGED .sql file in supabase/ contains CREATE TABLE
# without an accompanying ENABLE ROW LEVEL SECURITY for the same table.
#
# This is the automated enforcement of the rule that has bitten us four
# times: every new Supabase table needs RLS enabled in the same migration.
#
# Run modes:
#   ./scripts/check-rls.sh                  → check all staged sql in supabase/
#   ./scripts/check-rls.sh --all            → scan EVERY supabase/*.sql
#   ./scripts/check-rls.sh path/to/file.sql → check a specific file
#
# Wired into .git/hooks/pre-commit so commits with a CREATE TABLE without
# RLS are blocked. To bypass (last resort, only for known-safe ALTER files):
#   git commit --no-verify
# But seriously: don't.

set -euo pipefail

# ── Colour helpers (skip when not a TTY) ────────────────────────────────────
if [[ -t 1 ]]; then
  RED=$'\033[31m'; YELLOW=$'\033[33m'; GREEN=$'\033[32m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  RED=''; YELLOW=''; GREEN=''; BOLD=''; RESET=''
fi

# ── Determine which files to scan ───────────────────────────────────────────
mode="${1:-staged}"
files=()
case "$mode" in
  --all)
    while IFS= read -r f; do files+=("$f"); done < <(find supabase -maxdepth 1 -type f -name '*.sql' 2>/dev/null)
    ;;
  staged|"")
    while IFS= read -r f; do
      [[ -n "$f" ]] && files+=("$f")
    done < <(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E '^supabase/.*\.sql$' || true)
    ;;
  *)
    files=("$mode")
    ;;
esac

if (( ${#files[@]} == 0 )); then
  exit 0  # nothing to check
fi

# ── Allow-list: tables whose RLS is enabled in ANOTHER migration file. ──────
# Use this when a separate "rls catch-up" migration handles a table.
# Format: one table name per line, # for comments.
# Stored as a newline-separated string for bash 3.x compatibility (macOS).
ALLOWLIST_FILE="supabase/.rls-allowlist"
ALLOWED_TABLES=""
if [[ -f "$ALLOWLIST_FILE" ]]; then
  ALLOWED_TABLES=$(sed -E 's/#.*$//; s/[[:space:]]+//g' "$ALLOWLIST_FILE" | grep -v '^$' || true)
fi

is_allowed() {
  local needle="$1"
  [[ -z "$ALLOWED_TABLES" ]] && return 1
  printf '%s\n' "$ALLOWED_TABLES" | grep -qx "$needle"
}

# ── For each file: extract CREATE TABLE names, check each has ENABLE RLS ────
# Regex: capture the table name AFTER "CREATE TABLE [IF NOT EXISTS] [public.]"
# Skip pseudo-matches like "CREATE TABLE IF" (legacy regex bug) and the
# bare schema name "public" (when style is "CREATE TABLE public.tablename").
violations=()
for file in "${files[@]}"; do
  [[ -f "$file" ]] || continue

  # Strip line-comments (-- ...) before extraction so comments don't yield
  # false matches like "CREATE TABLE IF NOT EXISTS" mentioned in prose.
  # Then extract table names from real CREATE TABLE statements.
  tables=$(perl -ne 's/--.*$//; while(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)/gi){print "$1\n"}' "$file" \
           | sort -u || true)

  [[ -z "$tables" ]] && continue

  for table in $tables; do
    # Skip tables that are RLS-enabled in another migration (allowlist)
    if is_allowed "$table"; then
      continue
    fi

    if ! grep -iEq "ALTER TABLE[[:space:]]+(public\\.)?$table[[:space:]]+ENABLE ROW LEVEL SECURITY" "$file" \
       && ! grep -iEq "EXECUTE[[:space:]]+'ALTER TABLE[[:space:]]+(public\\.)?$table[[:space:]]+ENABLE ROW LEVEL SECURITY" "$file"; then
      violations+=("${file}:${table}")
    fi
  done
done

# ── Report ──────────────────────────────────────────────────────────────────
if (( ${#violations[@]} > 0 )); then
  echo ""
  echo "${RED}${BOLD}❌  RLS check failed — ${#violations[@]} table(s) missing ENABLE ROW LEVEL SECURITY:${RESET}"
  for v in "${violations[@]}"; do
    file="${v%%:*}"
    table="${v##*:}"
    echo "${RED}  ✘ ${file} → CREATE TABLE ${BOLD}${table}${RESET}${RED} has no matching ENABLE ROW LEVEL SECURITY${RESET}"
  done
  echo ""
  echo "${YELLOW}Add this to the migration (example for table '${violations[0]##*:}'):${RESET}"
  echo "${YELLOW}  ALTER TABLE ${violations[0]##*:} ENABLE ROW LEVEL SECURITY;${RESET}"
  echo ""
  echo "${YELLOW}This rule has bitten us four times. The hook exists to stop a fifth.${RESET}"
  echo "${YELLOW}To bypass (only if you know it's intentional): git commit --no-verify${RESET}"
  echo ""
  exit 1
fi

if [[ "$mode" == "--all" ]]; then
  echo "${GREEN}✓ RLS check passed — all ${#files[@]} migration file(s) clean${RESET}"
fi
exit 0
