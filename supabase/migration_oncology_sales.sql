-- Oncology Market Readiness — Sales Performance data
-- Table stores actual quarterly revenue per market (EUR thousands)

create table if not exists oncology_sales (
  market_id  text    not null,
  quarter    text    not null,
  revenue    integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (market_id, quarter)
);

-- Seed with default/placeholder actuals (matches SALES_DATA in data.ts)
insert into oncology_sales (market_id, quarter, revenue) values
  ('de','q1_24',890), ('de','q2_24',920), ('de','q3_24',955), ('de','q4_24',1010),
  ('de','q1_25',1050),('de','q2_25',1095),('de','q3_25',1140),('de','q4_25',1190),

  ('fr','q1_24',620), ('fr','q2_24',640), ('fr','q3_24',660), ('fr','q4_24',695),
  ('fr','q1_25',720), ('fr','q2_25',745), ('fr','q3_25',775), ('fr','q4_25',808),

  ('uk','q1_24',1050),('uk','q2_24',1100),('uk','q3_24',1160),('uk','q4_24',1230),
  ('uk','q1_25',1290),('uk','q2_25',1360),('uk','q3_25',1430),('uk','q4_25',1510),

  ('nl','q1_24',310), ('nl','q2_24',325), ('nl','q3_24',340), ('nl','q4_24',360),
  ('nl','q1_25',375), ('nl','q2_25',395), ('nl','q3_25',415), ('nl','q4_25',438),

  ('es','q1_24',280), ('es','q2_24',295), ('es','q3_24',305), ('es','q4_24',320),
  ('es','q1_25',335), ('es','q2_25',350), ('es','q3_25',370), ('es','q4_25',392),

  ('it','q1_24',260), ('it','q2_24',270), ('it','q3_24',285), ('it','q4_24',300),
  ('it','q1_25',315), ('it','q2_25',330), ('it','q3_25',345), ('it','q4_25',362),

  ('ch','q1_24',480), ('ch','q2_24',500), ('ch','q3_24',520), ('ch','q4_24',545),
  ('ch','q1_25',565), ('ch','q2_25',590), ('ch','q3_25',615), ('ch','q4_25',642),

  ('be','q1_24',175), ('be','q2_24',182), ('be','q3_24',190), ('be','q4_24',200),
  ('be','q1_25',208), ('be','q2_25',218), ('be','q3_25',228), ('be','q4_25',240),

  ('at','q1_24',195), ('at','q2_24',205), ('at','q3_24',215), ('at','q4_24',225),
  ('at','q1_25',235), ('at','q2_25',248), ('at','q3_25',260), ('at','q4_25',274),

  ('no','q1_24',380), ('no','q2_24',405), ('no','q3_24',430), ('no','q4_24',460),
  ('no','q1_25',495), ('no','q2_25',530), ('no','q3_25',565), ('no','q4_25',602)
on conflict (market_id, quarter) do nothing;

-- Allow service-role writes; dashboard reads are public
alter table oncology_sales enable row level security;

create policy "oncology_sales_read_all"
  on oncology_sales for select
  using (true);

-- Only service role (API routes) can write
create policy "oncology_sales_service_write"
  on oncology_sales for all
  using (auth.role() = 'service_role');
