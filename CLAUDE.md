# Database migrations (Supabase)

Migrations in `supabase/*.sql` are applied by hand in the Supabase SQL editor;
deploys never touch the database. Whenever you create or change a migration
file, ALWAYS paste the complete SQL text directly in the chat reply as well,
in a copyable code block, so Mark can run it immediately without opening the
file. Write every migration to be idempotent and safe on a database where it
has not run yet.

# Writing style for user-facing copy

Persistent preferences from Mark for content on `markdekock.com` (page copy,
CMS defaults, email bodies, anything that ships to a reader).

## Punctuation
- **No em-dashes (—).** They are a recognisable AI tell. Use a comma, period,
  colon, or a parenthetical instead. If a real break is needed, a hyphen with
  spaces ( - ) is acceptable.
- Same goes for en-dashes (–) used as sentence connectors. Keep them only for
  real numeric ranges like `09:00–13:00`.

## Phrasing to avoid
- "Not X, it's Y" or "Niet X, wel Y" patterns when they add no real meaning.
- "Whether you're...", "Let's dive in", "leverage", "synergies", "empower",
  "deliverables", "in today's fast-paced world".
- Triadic structures ("X, Y, en Z") when they're decorative rather than
  meaningful.
- Hedge words that pad the line: "really", "actually", "simply".

## Voice
- First person where Mark is the author.
- Calm, opinionated, lightly contrarian. Match the existing brand tone.
- Short sentences over long ones; a clear sentence beats a clever one.
- Avoid "AI gegenereerd" cadence. If a sentence reads as if a model produced
  it, rewrite.

Applies to: all page content (`src/app/**/content.ts`, `messages/*.json`,
admin CMS defaults), email templates, and copy generated for users.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
