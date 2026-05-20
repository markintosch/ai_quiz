-- FILE: supabase/seed_sannah_pages.sql
-- Vult Over Mij / CV / Contact met placeholder content (NL + EN) zodat de
-- pagina's niet leeg ogen. Sannah kan elk veld via /admin/sannah aanpassen.
-- Veilig om opnieuw te draaien: overschrijft alleen lege rows (body IS NULL).

-- ── Over mij ──────────────────────────────────────────────────────
UPDATE sannah_pages SET
  body_nl = E'Sannah De Zwart maakt schilderijen, tekeningen en mixed-media werk. Haar werk vertrekt vanuit observatie van het alledaagse — fruit op het aanrecht, een open boek, een gezicht dat ze kent. Door materiaal en compositie te variëren onderzoekt ze hoe iets gewoons opeens iets te zeggen kan hebben.\n\nZe werkt vanuit haar atelier en bereidt zich voor op de Breitner Academie in Amsterdam.\n\nVoor opdrachten of samenwerkingen: info@sannahdezwart.nl',
  body_en = E'Sannah De Zwart works in painting, drawing and mixed media. Her practice begins with close observation of the everyday — fruit on the kitchen counter, an open book, a familiar face. By shifting between materials and compositions, she explores how an ordinary subject can suddenly say something.\n\nShe works from her studio and is preparing for the Breitner Academie in Amsterdam.\n\nFor commissions or collaborations: info@sannahdezwart.nl'
WHERE page_key = 'over_mij'
  AND (body_nl IS NULL OR body_nl = '')
  AND (body_en IS NULL OR body_en = '');

-- ── CV ────────────────────────────────────────────────────────────
UPDATE sannah_pages SET
  body_nl = E'## Opleiding\n2025 — Breitner Academie, Amsterdam (aanmelding)\n2020–2024 — Middelbare school\n\n## Tentoonstellingen\n2024 — Groepsexpositie, locatie volgt\n2023 — Eerste expositie, locatie volgt\n\n## Werk in collecties\nParticuliere collecties in Nederland\n\n## Talen\nNederlands, Engels',
  body_en = E'## Education\n2025 — Breitner Academie, Amsterdam (applying)\n2020–2024 — Secondary school\n\n## Exhibitions\n2024 — Group show, location TBA\n2023 — First exhibition, location TBA\n\n## Work in collections\nPrivate collections in the Netherlands\n\n## Languages\nDutch, English'
WHERE page_key = 'cv'
  AND (body_nl IS NULL OR body_nl = '')
  AND (body_en IS NULL OR body_en = '');

-- ── Contact ───────────────────────────────────────────────────────
UPDATE sannah_pages SET
  body_nl = E'Voor vragen over beschikbaar werk, opdrachten of samenwerkingen:\n\ninfo@sannahdezwart.nl',
  body_en = E'For enquiries about available work, commissions or collaborations:\n\ninfo@sannahdezwart.nl'
WHERE page_key = 'contact'
  AND (body_nl IS NULL OR body_nl = '')
  AND (body_en IS NULL OR body_en = '');

-- Check resultaat
SELECT page_key,
       length(coalesce(body_nl, '')) AS nl_len,
       length(coalesce(body_en, '')) AS en_len
FROM sannah_pages
ORDER BY page_key;
