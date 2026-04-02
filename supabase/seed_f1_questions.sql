-- F1 / Vrooooom Arena question bank
-- Run AFTER migration_arena_product_key.sql

INSERT INTO arena_questions (id, product_key, question_text, options, correct_value, explanation, difficulty, topic, ai_generated, active) VALUES

-- ── EASY ──────────────────────────────────────────────────────────────────────
(gen_random_uuid(), 'f1_arena',
 'Which team did Lewis Hamilton join for the 2025 Formula 1 season?',
 '[{"label":"A","text":"Mercedes","value":"a"},{"label":"B","text":"McLaren","value":"b"},{"label":"C","text":"Ferrari","value":"c"},{"label":"D","text":"Aston Martin","value":"d"}]',
 'c', 'Lewis Hamilton made his highly anticipated move to Ferrari in 2025 after 12 seasons at Mercedes.', 'easy', '2025_season', false, true),

(gen_random_uuid(), 'f1_arena',
 'Who won the 2025 F1 Drivers'' Championship?',
 '[{"label":"A","text":"Max Verstappen","value":"a"},{"label":"B","text":"Oscar Piastri","value":"b"},{"label":"C","text":"Lando Norris","value":"c"},{"label":"D","text":"Charles Leclerc","value":"d"}]',
 'c', 'Lando Norris won his first championship, beating Verstappen by just 2 points in a nail-biting finale.', 'easy', '2025_season', false, true),

(gen_random_uuid(), 'f1_arena',
 'How many points does a driver receive for winning a race?',
 '[{"label":"A","text":"10","value":"a"},{"label":"B","text":"20","value":"b"},{"label":"C","text":"25","value":"c"},{"label":"D","text":"30","value":"d"}]',
 'c', 'A race win earns 25 points. The points system runs 25-18-15-12-10-8-6-4-2-1 for the top 10.', 'easy', 'rules', false, true),

(gen_random_uuid(), 'f1_arena',
 'What does DRS stand for in Formula 1?',
 '[{"label":"A","text":"Dynamic Racing Suspension","value":"a"},{"label":"B","text":"Drag Reduction System","value":"b"},{"label":"C","text":"Direct Response Speed","value":"c"},{"label":"D","text":"Driver Regulation Safety","value":"d"}]',
 'b', 'DRS (Drag Reduction System) opens a flap in the rear wing to reduce aerodynamic drag and aid overtaking.', 'easy', 'technical', false, true),

(gen_random_uuid(), 'f1_arena',
 'Which team does Max Verstappen drive for?',
 '[{"label":"A","text":"Mercedes","value":"a"},{"label":"B","text":"McLaren","value":"b"},{"label":"C","text":"Ferrari","value":"c"},{"label":"D","text":"Red Bull Racing","value":"d"}]',
 'd', 'Max Verstappen has driven for Red Bull Racing since 2016, winning four consecutive titles from 2021 to 2024.', 'easy', 'drivers', false, true),

(gen_random_uuid(), 'f1_arena',
 'The British Grand Prix is held at which circuit?',
 '[{"label":"A","text":"Brands Hatch","value":"a"},{"label":"B","text":"Silverstone","value":"b"},{"label":"C","text":"Donington Park","value":"c"},{"label":"D","text":"Thruxton","value":"d"}]',
 'b', 'Silverstone has hosted the British Grand Prix almost continuously since the first-ever F1 championship race in 1950.', 'easy', 'circuits', false, true),

(gen_random_uuid(), 'f1_arena',
 'How many teams compete on the current Formula 1 grid?',
 '[{"label":"A","text":"8","value":"a"},{"label":"B","text":"10","value":"b"},{"label":"C","text":"12","value":"c"},{"label":"D","text":"14","value":"d"}]',
 'b', 'Ten constructors each field two cars, giving 20 drivers on the grid per race.', 'easy', 'rules', false, true),

(gen_random_uuid(), 'f1_arena',
 'Which Italian circuit is nicknamed "The Temple of Speed"?',
 '[{"label":"A","text":"Imola","value":"a"},{"label":"B","text":"Mugello","value":"b"},{"label":"C","text":"Monza","value":"c"},{"label":"D","text":"Vallelunga","value":"d"}]',
 'c', 'Monza is the fastest circuit on the calendar, earning its nickname from its legendary high-speed straights.', 'easy', 'circuits', false, true),

(gen_random_uuid(), 'f1_arena',
 'Which nationality is Lando Norris?',
 '[{"label":"A","text":"Australian","value":"a"},{"label":"B","text":"Belgian","value":"b"},{"label":"C","text":"Portuguese","value":"c"},{"label":"D","text":"British","value":"d"}]',
 'd', 'Lando Norris was born in Bristol, England. He holds dual British and Belgian nationality.', 'easy', 'drivers', false, true),

(gen_random_uuid(), 'f1_arena',
 'Which colour flag signals the end of a Formula 1 race?',
 '[{"label":"A","text":"Blue","value":"a"},{"label":"B","text":"Red","value":"b"},{"label":"C","text":"Black and white chequered","value":"c"},{"label":"D","text":"Yellow and red","value":"d"}]',
 'c', 'The chequered flag has been the universal symbol of a race finish since the early days of motorsport.', 'easy', 'rules', false, true),

-- ── MEDIUM ─────────────────────────────────────────────────────────────────────
(gen_random_uuid(), 'f1_arena',
 'In what year did the current hybrid power unit era begin in Formula 1?',
 '[{"label":"A","text":"2010","value":"a"},{"label":"B","text":"2012","value":"b"},{"label":"C","text":"2014","value":"c"},{"label":"D","text":"2016","value":"d"}]',
 'c', 'The 1.6-litre V6 turbo-hybrid power unit was introduced in 2014, replacing the naturally aspirated 2.4L V8 era.', 'medium', 'technical', false, true),

(gen_random_uuid(), 'f1_arena',
 'Which driver scored their very first F1 podium in their 239th race start in 2025?',
 '[{"label":"A","text":"Fernando Alonso","value":"a"},{"label":"B","text":"Valtteri Bottas","value":"b"},{"label":"C","text":"Nico Hülkenberg","value":"c"},{"label":"D","text":"Kevin Magnussen","value":"d"}]',
 'c', 'Nico Hülkenberg''s patience was finally rewarded at the 2025 British Grand Prix — the most races any driver had started before reaching the podium.', 'medium', '2025_season', false, true),

(gen_random_uuid(), 'f1_arena',
 'Who replaced Lewis Hamilton at Mercedes for the 2025 season?',
 '[{"label":"A","text":"George Russell","value":"a"},{"label":"B","text":"Kimi Antonelli","value":"b"},{"label":"C","text":"Carlos Sainz","value":"c"},{"label":"D","text":"Franco Colapinto","value":"d"}]',
 'b', 'Andrea Kimi Antonelli, aged 18, became one of the youngest drivers to represent Mercedes, replacing Hamilton.', 'medium', '2025_season', false, true),

(gen_random_uuid(), 'f1_arena',
 'Which team won the 2025 F1 Constructors'' Championship?',
 '[{"label":"A","text":"Red Bull","value":"a"},{"label":"B","text":"Ferrari","value":"b"},{"label":"C","text":"Mercedes","value":"c"},{"label":"D","text":"McLaren","value":"d"}]',
 'd', 'McLaren secured their second consecutive Constructors'' title and tenth overall — their first double championship since 1998.', 'medium', '2025_season', false, true),

(gen_random_uuid(), 'f1_arena',
 'How many F1 World Championships does Lewis Hamilton hold?',
 '[{"label":"A","text":"5","value":"a"},{"label":"B","text":"6","value":"b"},{"label":"C","text":"7","value":"c"},{"label":"D","text":"8","value":"d"}]',
 'c', 'Hamilton and Michael Schumacher are tied on 7 championships — the most in F1 history.', 'medium', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'How many races did Max Verstappen win in his record-breaking 2023 season?',
 '[{"label":"A","text":"15","value":"a"},{"label":"B","text":"17","value":"b"},{"label":"C","text":"19","value":"c"},{"label":"D","text":"21","value":"d"}]',
 'c', 'Verstappen won 19 of 22 races in 2023, shattering the previous records held by himself and Sebastian Vettel.', 'medium', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'What does KERS stand for?',
 '[{"label":"A","text":"Kinetic Energy Recovery System","value":"a"},{"label":"B","text":"Key Engine Response System","value":"b"},{"label":"C","text":"Kinematic Exhaust Regulation Standard","value":"c"},{"label":"D","text":"Kinetic Electric Racing System","value":"d"}]',
 'a', 'KERS harvests energy under braking and deploys it as a power boost. It was introduced in F1 in 2009 and evolved into the current MGU-K.', 'medium', 'technical', false, true),

(gen_random_uuid(), 'f1_arena',
 'How old was Sebastian Vettel when he became the youngest F1 World Champion in 2010?',
 '[{"label":"A","text":"21","value":"a"},{"label":"B","text":"22","value":"b"},{"label":"C","text":"23","value":"c"},{"label":"D","text":"24","value":"d"}]',
 'c', 'Vettel was 23 years and 134 days old when he clinched the 2010 title at Abu Dhabi. The record was later approached by Verstappen.', 'medium', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'The Suzuka Grand Prix is held in which country?',
 '[{"label":"A","text":"South Korea","value":"a"},{"label":"B","text":"China","value":"b"},{"label":"C","text":"Japan","value":"c"},{"label":"D","text":"Singapore","value":"d"}]',
 'c', 'Suzuka International Racing Course in Mie Prefecture has hosted the Japanese GP since 1987 and is considered one of F1''s greatest circuits.', 'medium', 'circuits', false, true),

(gen_random_uuid(), 'f1_arena',
 'By how many points did Lando Norris beat Max Verstappen to win the 2025 championship?',
 '[{"label":"A","text":"1","value":"a"},{"label":"B","text":"2","value":"b"},{"label":"C","text":"5","value":"c"},{"label":"D","text":"10","value":"d"}]',
 'b', 'Norris secured his title by just 2 points in one of the closest championship finishes in recent memory.', 'medium', '2025_season', false, true),

-- ── HARD ───────────────────────────────────────────────────────────────────────
(gen_random_uuid(), 'f1_arena',
 'Which F1 constructor has won the most Constructors'' Championships in history?',
 '[{"label":"A","text":"McLaren","value":"a"},{"label":"B","text":"Williams","value":"b"},{"label":"C","text":"Ferrari","value":"c"},{"label":"D","text":"Red Bull","value":"d"}]',
 'c', 'Ferrari leads with 16 Constructors'' titles. McLaren have 8, Williams 9, and Red Bull 6 (as of 2025).', 'hard', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'How many cylinders does a current F1 power unit''s internal combustion engine have?',
 '[{"label":"A","text":"4","value":"a"},{"label":"B","text":"6","value":"b"},{"label":"C","text":"8","value":"c"},{"label":"D","text":"10","value":"d"}]',
 'b', 'The current regulations mandate a 1.6-litre turbocharged V6 ICE, combined with an MGU-H and MGU-K hybrid system.', 'hard', 'technical', false, true),

(gen_random_uuid(), 'f1_arena',
 'Who was the last McLaren driver before Lando Norris to win the F1 Drivers'' Championship?',
 '[{"label":"A","text":"Mika Häkkinen","value":"a"},{"label":"B","text":"David Coulthard","value":"b"},{"label":"C","text":"Lewis Hamilton","value":"c"},{"label":"D","text":"Jenson Button","value":"d"}]',
 'c', 'Lewis Hamilton won with McLaren in 2008. Button''s 2009 title was with Brawn GP, and Häkkinen''s wins were in 1998–99.', 'hard', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'Which driver holds the all-time record for the most fastest laps in Formula 1?',
 '[{"label":"A","text":"Michael Schumacher","value":"a"},{"label":"B","text":"Lewis Hamilton","value":"b"},{"label":"C","text":"Alain Prost","value":"c"},{"label":"D","text":"Kimi Räikkönen","value":"d"}]',
 'd', 'Kimi Räikkönen set 46 fastest laps in his F1 career — more than any other driver in history.', 'hard', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'In which year was the Formula 1 World Championship first held?',
 '[{"label":"A","text":"1948","value":"a"},{"label":"B","text":"1950","value":"b"},{"label":"C","text":"1952","value":"c"},{"label":"D","text":"1955","value":"d"}]',
 'b', 'The inaugural F1 World Championship season took place in 1950. Giuseppe Farina won the title driving for Alfa Romeo.', 'hard', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'Fernando Alonso won both his World Championships driving for which team?',
 '[{"label":"A","text":"McLaren","value":"a"},{"label":"B","text":"Ferrari","value":"b"},{"label":"C","text":"Renault","value":"c"},{"label":"D","text":"Honda","value":"d"}]',
 'c', 'Alonso won back-to-back titles with Renault in 2005 and 2006, becoming the youngest champion at the time.', 'hard', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'Max Verstappen won his first F1 World Championship at which Grand Prix?',
 '[{"label":"A","text":"Brazilian GP","value":"a"},{"label":"B","text":"Saudi Arabian GP","value":"b"},{"label":"C","text":"Abu Dhabi GP","value":"c"},{"label":"D","text":"Japanese GP","value":"d"}]',
 'c', 'The 2021 Abu Dhabi GP ended in controversy when a late safety car restart gave Verstappen the title on the final lap.', 'hard', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'Which circuit features the iconic high-speed "130R" corner?',
 '[{"label":"A","text":"Spa-Francorchamps","value":"a"},{"label":"B","text":"Monza","value":"b"},{"label":"C","text":"Suzuka","value":"c"},{"label":"D","text":"Barcelona","value":"d"}]',
 'c', '130R at Suzuka is named after its radius of 130 metres. In the V10 era, drivers took it flat out — a true test of bravery.', 'hard', 'circuits', false, true),

(gen_random_uuid(), 'f1_arena',
 'In which year did Ayrton Senna win his last F1 World Championship?',
 '[{"label":"A","text":"1989","value":"a"},{"label":"B","text":"1990","value":"b"},{"label":"C","text":"1991","value":"c"},{"label":"D","text":"1992","value":"d"}]',
 'c', 'Senna won his third and final championship in 1991 with McLaren-Honda. He passed away at the 1994 San Marino GP.', 'hard', 'history', false, true),

(gen_random_uuid(), 'f1_arena',
 'Who won the very first Formula 1 World Championship in 1950?',
 '[{"label":"A","text":"Juan Manuel Fangio","value":"a"},{"label":"B","text":"Giuseppe Farina","value":"b"},{"label":"C","text":"Alberto Ascari","value":"c"},{"label":"D","text":"Stirling Moss","value":"d"}]',
 'b', 'Dr. Giuseppe "Nino" Farina won the inaugural F1 championship in 1950 driving for Alfa Romeo, ahead of Fangio.', 'hard', 'history', false, true);
