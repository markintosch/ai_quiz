-- ─── Moba Signal: aggregator feeds for blocked newsrooms ──────────────────────
-- Sanovo and several competitor sites 403 plain fetches. Rather than evading
-- bot detection (PRD §8.6 forbids circumvention), ingest Google News RSS:
-- Google already indexes those newsrooms and exposes a public feed per query.
-- Catches both their press releases and trade coverage of them, usually
-- within hours. Run in the Supabase SQL editor. Idempotent.

insert into moba_signal_sources (id, name, url, feed_url, ingest, source_class) values
  ('gnews-sanovo',
   'Google News: Sanovo',
   'https://news.google.com/search?q=%22Sanovo%22%20egg',
   'https://news.google.com/rss/search?q=%22Sanovo%22%20egg&hl=en-US&gl=US&ceid=US:en',
   'rss', 'trade-press'),
  ('gnews-prinzen',
   'Google News: Prinzen / Vencomatic',
   'https://news.google.com/search?q=%22Prinzen%22%20OR%20%22Vencomatic%22%20egg',
   'https://news.google.com/rss/search?q=%22Prinzen%22%20OR%20%22Vencomatic%22%20egg&hl=en-US&gl=US&ceid=US:en',
   'rss', 'trade-press'),
  ('gnews-zenyer',
   'Google News: Zenyer',
   'https://news.google.com/search?q=%22Zenyer%22',
   'https://news.google.com/rss/search?q=%22Zenyer%22&hl=en-US&gl=US&ceid=US:en',
   'rss', 'trade-press'),
  ('gnews-nabel',
   'Google News: NABEL egg grading',
   'https://news.google.com/search?q=%22Nabel%22%20egg%20grading',
   'https://news.google.com/rss/search?q=%22Nabel%22%20egg%20grading&hl=en-US&gl=US&ceid=US:en',
   'rss', 'trade-press'),
  ('gnews-moba',
   'Google News: Moba (mentions of us)',
   'https://news.google.com/search?q=%22Moba%22%20egg%20grading',
   'https://news.google.com/rss/search?q=%22Moba%22%20egg%20grading&hl=en-US&gl=US&ceid=US:en',
   'rss', 'trade-press')
on conflict (id) do nothing;

-- The blocked direct sources stay listed (honest gaps), but stop consuming
-- rotation slots until the newsletter/page-diff path exists.
update moba_signal_sources set active = false,
  failure_reason = coalesce(failure_reason, 'Direct fetch blocked. Covered via Google News aggregator feed for now.')
  where id in ('sanovo-news', 'prinzen-news', 'vencomatic-news', 'kyowa-news')
  and status = 'failed';
