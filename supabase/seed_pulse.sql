-- De Machine Pulse — seed data for festivals 2026 demo theme
-- Run AFTER migration_pulse_v2.sql

-- Insert demo theme
INSERT INTO pulse_themes (
  slug, title, description, editorial_intro,
  presub_open_at, presub_close_at, opens_at, closes_at,
  published
) VALUES (
  'festivals-2026',
  'Nederlandse Festivals 2026',
  'Wat vinden De Machine-luisteraars écht? Beoordeel festivals op 5 dimensies.',
  'Elk jaar strijden tientallen festivals om de aandacht van de Nederlandse muziekliefhebber. Maar wat vind jij er nou écht van? De Machine meet de pols: niet de perschef, maar de luisteraar spreekt.',
  now() - interval '7 days',
  now() + interval '3 days',
  now() - interval '1 day',
  now() + interval '14 days',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Store the theme id in a variable for subsequent inserts
DO $$
DECLARE
  v_theme_id UUID;
BEGIN
  SELECT id INTO v_theme_id FROM pulse_themes WHERE slug = 'festivals-2026';

  -- Insert dimensions
  INSERT INTO pulse_dimensions (theme_id, slug, label, anchor_low, anchor_high, sort_order) VALUES
    (v_theme_id, 'lineup',      'Line-up',             'Veilig en voorspelbaar',  'Verrassend en eigenzinnig', 0),
    (v_theme_id, 'commercial',  'Commercialisering',   'Artist-first',            'Sponsor-first',             1),
    (v_theme_id, 'eco',         'Eco footprint',       'Verantwoord',             'Onverschillig',             2),
    (v_theme_id, 'access',      'Toegankelijkheid',    'Inclusief geprijsd',      'Elitair',                   3),
    (v_theme_id, 'impact',      'Culturele impact',    'Bepalend voor de scene',  'Volgend',                   4)
  ON CONFLICT DO NOTHING;

  -- Insert entities
  INSERT INTO pulse_entities (
    theme_id, entity_type, slug, label, subtitle, description_short,
    source_url, location_text, start_date, end_date, edition_label,
    ingest_status, sort_order
  ) VALUES
    (
      v_theme_id, 'festival', 'lowlands',
      'Lowlands',
      'Het driedaagse Biddinghuizen-spektakel',
      'Lowlands is een van de meest gerenommeerde festivals van Nederland, met een divers programma van pop, rock, wereldmuziek en theater.',
      'https://www.lowlands.nl',
      'Biddinghuizen',
      now() + interval '120 days',
      now() + interval '123 days',
      '2026',
      'live', 0
    ),
    (
      v_theme_id, 'festival', 'awakenings',
      'Awakenings',
      'Techno in de Gashouder en het Spaarnwoude park',
      'Awakenings staat voor pure, compromisloze techno. Opgericht in 1997, inmiddels een internationaal begrip in de elektronische muziekwereld.',
      'https://www.awakenings.com',
      'Spaarnwoude',
      now() + interval '100 days',
      now() + interval '102 days',
      '2026',
      'live', 1
    ),
    (
      v_theme_id, 'festival', 'dgtl',
      'DGTL',
      'Duurzaam elektronisch festival op het NDSM-terrein',
      'DGTL combineert wereldklasse electronic music met een progressieve duurzaamheidsagenda. Circulair, plantaardig en clubcultuur in optima forma.',
      'https://dgtl.nl',
      'Amsterdam',
      now() + interval '35 days',
      now() + interval '37 days',
      '2026',
      'live', 2
    ),
    (
      v_theme_id, 'festival', 'dekmantel',
      'Dekmantel',
      'Het ultieme platform voor avant-garde elektronische muziek',
      'Dekmantel is het heiligdom voor de doorgewinterde festivalbezoeker. Curatie boven comfort, verdieping boven volume.',
      'https://dekmantel.com',
      'Amsterdam',
      now() + interval '60 days',
      now() + interval '63 days',
      '2026',
      'live', 3
    ),
    (
      v_theme_id, 'festival', 'best-kept-secret',
      'Best Kept Secret',
      'Intieme indie en alternative haven in het Beekse Bergen park',
      'Best Kept Secret is misschien wel de beste ontdekking van de Nederlandse festivalscene: klein, zorgvuldig samengesteld, en vrij van massatoerisme.',
      'https://bestkeptyoursecret.nl',
      'Hilvarenbeek',
      now() + interval '80 days',
      now() + interval '82 days',
      '2026',
      'live', 4
    )
  ON CONFLICT DO NOTHING;

END $$;
