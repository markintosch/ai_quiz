// Content model + defaults for the "AI impact op leiderschap" pre-registration
// page (CMO/CDO/CEO-audience). One hard event date with two slots (ochtend +
// middag), each booked + paid via Mollie. A waitlist below the slots captures
// interest for follow-up editions. CMS-editable via /admin/ai-leiderschap.

export interface AILItem { title: string; body: string }
export interface AILHost { initials: string; name: string; role: string; bio: string; photo: string }
export interface AILFact { label: string; value: string }
export interface AILFaq { q: string; a: string }
export interface AILStep { label: string; title: string; body: string }
export interface AILSlot { id: string; label: string; time: string; price: string; mollieHref: string; note: string }
export interface AILTestimonial { quote: string; name: string; role: string }

export interface AILContent {
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    eventDate: string        // e.g. "Maandag 29 juni 2026"
    eventLocation: string
    bullets: string[]
    outputs: string[]        // 3 concrete outputs strip (above the fold)
    ctaPrimary: { label: string; href: string }
    ctaSecondary: { label: string; href: string }
    note: string
  }
  problem: { heading: string; body: string }
  takeaways: { heading: string; intro: string; items: AILItem[] }
  audience: { heading: string; intro: string; roles: string[]; scenarios: string[]; note: string }
  contrast: { heading: string; notItems: string[]; wel: string }
  program: { heading: string; intro: string; items: AILItem[] }
  assessment: { heading: string; intro: string; steps: AILItem[]; privacyNote: string }
  trajectory: { heading: string; intro: string; steps: AILStep[] }
  hosts: { heading: string; intro: string; people: AILHost[] }
  meetBen: { heading: string; body: string; ctaLabel: string; ctaHref: string }
  introPage: {
    heroEyebrow: string
    heroTitle: string
    heroSub: string
    duration: string
    scenariosHeading: string
    scenarios: AILItem[]
    topicsHeading: string
    topicsIntro: string
    topics: string[]
    ctaHeading: string
    ctaLabel: string
    ctaHref: string
    note: string
    backLabel: string
  }
  projectenPage: {
    heroEyebrow: string
    heroTitle: string
    heroSub: string
    intro: string
    teamHeading: string
    team: { name: string; role: string; bio: string }[]
    workingHeading: string
    working: AILItem[]
    scenariosHeading: string
    scenarios: AILItem[]
    ctaHeading: string
    ctaLabel: string
    ctaHref: string
    backLabel: string
  }
  whyWorks: { heading: string; items: AILItem[] }
  testimonials: { heading: string; items: AILTestimonial[] }
  practical: { heading: string; facts: AILFact[] }
  included: { heading: string; items: string[] }
  slots: {
    heading: string
    intro: string
    items: AILSlot[]
    payNote: string
    duoLabel: string
    duoBody: string
  }
  waitlist: {
    heading: string
    intro: string
    successMessage: string
  }
  faq: { heading: string; items: AILFaq[] }
  footer: { tagline: string; legal: string }
}

export const DEFAULT_CONTENT: AILContent = {
  hero: {
    eyebrow: 'Executive sessie · met Ben van der Burg & Mark de Kock',
    title: 'Van AI-experimenten naar leiderschapskeuzes in 90 dagen.',
    subtitle: 'Een halve dag waarin je met andere directieleden de richting kiest, en een 90-dagen-ritme dat zorgt dat die keuze ook landt. Voor CEO, CMO en CDO.',
    eventDate: 'Maandag 14 september of woensdag 7 oktober 2026',
    eventLocation: 'Utrecht (locatie wordt gedeeld bij bevestiging)',
    bullets: [
      '📅 Maandag 14 september of woensdag 7 oktober 2026',
      '📍 Utrecht',
      'Twee identieke sessies (14 sept middag, 7 okt ochtend), kies de datum die past',
      'Max. 30 deelnemers per sessie',
      '€1.199 p.p. excl. btw',
    ],
    outputs: [
      'Persoonlijke AI-leiderschap-spiegel',
      'Eén concrete 90-dagen-leiderschapskeuze',
      'Opvolgritme met voortgangsmetingen',
      'Een besloten peer-netwerk dat na de dag doorloopt',
    ],
    ctaPrimary: { label: 'Boek je plek', href: '#boeken' },
    ctaSecondary: { label: 'Bekijk het 90-dagen-traject', href: '#traject' },
    note: 'Beide sessies gaan door bij minimaal 10 inschrijvingen. Betaling verloopt via Het Sprekershuys. Excl. btw.',
  },
  problem: {
    heading: 'AI is een leiderschapsvraagstuk, geen IT-project',
    body: 'Je organisatie experimenteert met AI, of weet dat het moet. Wat het écht vraagt van jou als leider blijft vaak ongezegd. Het gaat niet alleen over welke tool je kiest of welke training je inkoopt. Het gaat over de beslissingen die je neemt en de richting die je je organisatie meegeeft, in een tijd waarin AI je strategie, je team en je rol verandert.',
  },
  takeaways: {
    heading: 'Wat je na afloop hebt',
    intro: 'Geen aantekeningen die in een la verdwijnen. Vier concrete uitkomsten die de week erop al meedoen in je werk.',
    items: [
      { title: 'Persoonlijk rapport', body: 'Je eigen score op de AI-leiderschap-dimensies. Privé, niet gedeeld met anderen.' },
      { title: '90-dagen-canvas', body: 'Eén A3 met je gekozen richting, je eerste stap en je belangrijkste belemmering. Ingevuld op de dag, met peer-feedback.' },
      { title: 'Teamboodschap', body: 'Eén heldere zin die je maandag aan je team zegt over wat dit voor jullie betekent. Voorkomt verwarring.' },
      { title: 'Delta-meting op dag 30/60/90', body: 'Drie korte herhaalmetingen op precies de mijlpalen van je canvas. Je ziet waar je beweegt en waar niet.' },
    ],
  },
  contrast: {
    heading: 'Wat dit niet is, en wat wel',
    notItems: [
      'Geen prompttraining',
      'Geen technische AI-cursus',
      'Geen inspiratiesessie zonder vervolg',
    ],
    wel: 'Wel: een executive sprint om richting, keuzes en vervolg te organiseren. Voor leiders die niet meer willen experimenteren, maar willen sturen.',
  },
  audience: {
    heading: 'Voor wie is deze sessie?',
    intro: 'Voor leiders die met AI niet alleen willen experimenteren, maar willen sturen. Eindverantwoordelijken die hun organisatie de juiste richting in moeten zetten.',
    roles: [
      'CEO / DGA / Directeur-eigenaar',
      'CMO / Commercieel directeur',
      'CDO / Chief Digital Officer',
      'COO / Chief Operating Officer',
      'Voorzitter RvB / lid RvT',
      'Algemeen directeur / MT-voorzitter',
    ],
    scenarios: [
      'Je hebt drie AI-pilots lopen, maar geen strategie die ze verbindt.',
      'Je team vraagt om richting en je weet nog niet welke.',
      'Je wilt niet experimenteren met AI, je wilt sturen.',
    ],
    note: 'Kom met een collega uit je directie of MT. Peer-werk wordt rijker wanneer je samen kunt terugkomen op de inzichten.',
  },
  program: {
    heading: 'Het programma',
    intro: 'Vier blokken in een halve dag. Elk blok heeft een eigen opbrengst, niet alleen een onderwerp.',
    items: [
      { title: 'Keynote: gedeelde taal en leiderschapsframe', body: 'Ben opent met een uur over wat AI verschuift in jouw rol als leider. Scherp, geen hype. De zaal krijgt hetzelfde vocabulaire voor de rest van de sessie.' },
      { title: 'Diagnose: waar staan we écht?', body: 'In trio\'s op de dimensies van je assessment. Wat zien je peers dat jij niet ziet? Eerste eerlijke spiegel.' },
      { title: 'Cohort-spiegel: wat kunnen we van elkaar leren?', body: 'De geaggregeerde, anonieme data van deze zaal op het scherm. Wat doet deze groep al, wat blijft liggen, en wat zegt dat?' },
      { title: '90-dagen-canvas: welke keuze maak ik?', body: 'Eén concrete keuze waar je je 90 dagen aan committeert. Met je eerste stap en je teamboodschap erbij.' },
      { title: 'Afsluiting & Q&A', body: 'Ben en Mark vatten samen, prikkelen, beantwoorden wat er nog ligt.' },
      { title: 'Lunch & netwerken', body: 'Peers die hetzelfde dragen, dezelfde vragen stellen, andere antwoorden gevonden hebben. Wie wil, blijft daarna verbonden in een besloten WhatsApp-groep met de groep en Mark.' },
    ],
  },
  assessment: {
    heading: 'De assessment als spiegel',
    intro: 'Tien minuten vooraf invullen. De data is de stille gespreksleider van de sessie.',
    steps: [
      { title: 'Vooraf', body: 'Je vult de baseline-assessment in (~10 min). Je krijgt direct een persoonlijk rapport in je inbox.' },
      { title: 'Persoonlijke reflectie', body: 'Je rapport laat zien op welke dimensies je sterk staat en waar het risico zit. Privé.' },
      { title: 'Cohort-vergelijking', body: 'Op de dag tonen we de geaggregeerde score van de zaal. Anoniem. Je weet hoe jij je verhoudt tot peers.' },
      { title: 'Na 90 dagen', body: 'Drie herhaalmetingen op dag 30, 60 en 90. Je krijgt een delta-rapport dat laat zien waar je daadwerkelijk bent verschoven.' },
    ],
    privacyNote: 'Individuele resultaten blijven van jou. We delen geen persoonlijke scores met andere deelnemers. In de zaal tonen we alleen anonieme, geaggregeerde patronen. We verkopen geen data.',
  },
  trajectory: {
    heading: 'Een 90-dagen-traject met de sessie als startpunt',
    intro: 'De sessie is het anker. Daarna word je niet losgelaten: vier momenten waarop het systeem aan je trekt, een 1-op-1 met Mark, en een besloten groep met je mededeelnemers.',
    steps: [
      { label: 'Voor de dag', title: 'Baseline-assessment', body: 'Vul de AI-maturity-scan in (~10 min). Resultaten landen in het cohort en vormen je vertrekpunt.' },
      { label: 'Sessiedag', title: 'De sessie zelf', body: 'Keynote, diagnose, canvas, commitments en Q&A. Je vertrekt met een persoonlijk rapport en een 90-dagen-canvas.' },
      { label: 'Vanaf de sessie', title: 'Besloten peer-groep', body: 'Alle deelnemers die willen, komen samen in één WhatsApp-groep, Mark inbegrepen. Een plek om ervaringen, vragen en inzichten te blijven delen terwijl je je keuze uitvoert.' },
      { label: 'Vanaf dag 15', title: '1-op-1 met Mark', body: 'Een persoonlijk gesprek van 30 minuten over hoe je ervoor staat, waar je hapert en welke ondersteuning helpt. We spreiden de calls over een week of twee, zodat iedereen een passend moment kan vinden.' },
      { label: 'Dag 30 / 60 / 90', title: 'Progressiemetingen', body: 'Drie korte gepersonaliseerde metingen op precies de mijlpalen van je canvas. Je krijgt je delta-rapport, zo zie je waar je beweegt en waar niet.' },
      { label: 'Dag 90', title: 'Cohort-slotrapport', body: 'Hoe heeft jullie zaal als geheel zich ontwikkeld? Met een optionele afsluitcall om de balans op te maken.' },
    ],
  },
  hosts: {
    heading: 'Je begeleiders',
    intro: 'Ben brengt de scherpe buitenblik. Mark zorgt dat het landt.',
    people: [
      {
        initials: 'BvdB',
        name: 'Ben van der Burg',
        role: 'Dagvoorzitter & keynote',
        bio: 'Strateeg en spreker over leiderschap in technologische transitie. Begeleidt directieteams bij strategische heroriëntatie wanneer markt, organisatie en technologie tegelijk schuiven. Schrijft en spreekt regelmatig over de menselijke kant van digitale transformatie.',
        photo: '/Ben_van_den_Burg.jpg',
      },
      {
        initials: 'MdK',
        name: 'Mark de Kock',
        role: 'Gastheer & traject-begeleider',
        bio: 'Vertaalt AI-strategie naar uitvoering. Werkt met directieteams aan het verbinden van ambitie, organisatie en eerste werkende toepassingen. Faciliteert de werkblokken, het 90-dagen-traject en de individuele follow-up calls.',
        photo: '/markdekock_2026.png',
      },
    ],
  },
  meetBen: {
    heading: 'Twijfel? Plan eerst een intro-gesprek.',
    body: 'Wil je even sparren of deze sessie past bij jouw organisatie en jouw specifieke vraag? Lees waar een intro-gesprek met Mark zinvol voor is, en plan er een in.',
    ctaLabel: 'Bekijk wat we kunnen bespreken →',
    ctaHref: '/ai-leiderschap/intro',
  },
  introPage: {
    heroEyebrow: 'Vrijblijvend · 30 minuten · online',
    heroTitle: 'Plan een intro-gesprek met Mark',
    heroSub: 'Voor wie wil aftasten of de sessie past, of een specifieke leiderschapsvraag heeft die niet in een uur klassikaal beantwoord wordt. Geen verkooppraatje, wel een eerlijk gesprek over wat je eraan hebt.',
    duration: '30 minuten · online via Google Meet of Teams · geen kosten',
    scenariosHeading: 'Wanneer is dit gesprek zinvol?',
    scenarios: [
      { title: 'Je twijfelt of de sessie van 14 september of 7 oktober past', body: 'Logisch. We kijken samen of jouw vraag en jullie organisatie passen bij de groep, of dat een andere vorm beter zou werken.' },
      { title: 'Je hebt een specifieke AI-leiderschapsvraag', body: 'Iets wat je voor jouw situatie wilt bespreken voordat je een groep instapt. Eén concreet vraagstuk in 30 minuten, scherper dan je het in een groep zou kunnen krijgen.' },
      { title: 'Je overweegt een in-company variant', body: 'Een variant voor je MT, RvB of een specifiek leiderschapsteam. We bespreken vorm, inhoud, en wat een eigen sessie voor jullie zou opleveren.' },
      { title: 'Je staat aan het begin van een AI-transformatie', body: 'En zoekt klankbord om de eerste stappen te bepalen. Geen consulting, wel meedenken vanuit ervaring met andere directieteams.' },
    ],
    topicsHeading: 'Wat we kunnen bespreken',
    topicsIntro: 'Onderwerpen waar Mark dagelijks met directieleden over praat. Niet dat we ze in 30 minuten allemaal afhandelen, wel waar je er één van uit kunt lichten.',
    topics: [
      'Waar staat jouw organisatie nu met AI, eerlijk gezien',
      'Welke knoop wil je in de komende 90 dagen doorhakken',
      'Welke eerste stap is realistisch deze maand',
      'Hoe je dit boven de waan van de dag krijgt op directieniveau',
      'Wat een werkbare guardrails-aanpak zou zijn voor jullie context',
      'In-company sessies, advisory-trajecten of strategische sparring',
    ],
    ctaHeading: 'Klaar om te plannen?',
    ctaLabel: 'Plan je intro-gesprek →',
    ctaHref: 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock',
    note: 'Tip: deel kort vooraf je vraag of context bij de Calendly-boeking. Dan benutten we de 30 minuten beter.',
    backLabel: '← Terug naar de sessiepagina',
  },
  projectenPage: {
    heroEyebrow: 'Werkwijze · Ben & Mark',
    heroTitle: 'Wanneer moet je ons bellen?',
    heroSub: 'Technologie verandert markten. Een transformatie of AI waardevol inzetten vraagt om meer dan visie. Het vraagt om mensen die doorpakken. Die snappen hoe strategie, technologie en executie samenkomen. Die niet blijven hangen in analyse of tools, maar resultaat leveren.',
    intro: 'Wij werken met bedrijven die willen groeien, transformeren of klaarstomen voor een volgende fase. Geen bureau, geen consultancy. Wel operators die organisaties van binnenuit in beweging brengen.',
    teamHeading: 'Het team',
    team: [
      {
        name: 'Ben van der Burg',
        role: 'Digitale Strategie, Innovatie & AI',
        bio: 'Veertien jaar commercieel directeur bij Triple, marktleider in mobile streaming. Oprichter van meerdere startups. Co-host van De Technoloog (450+ afleveringen) en vaste tech-commentator bij RTL Tonight, BNR en WNL. Ben brengt technologie, en AI in het bijzonder, terug naar wat het betekent voor bedrijf en mens. Hij ziet vroeg wat eraan komt, en helpt organisaties begrijpen wat ze daar nu mee moeten. Hij is betrokken op strategisch niveau, als sparringpartner, bij cruciale momenten, en waar zijn netwerk en visie het verschil maken.',
      },
      {
        name: 'Mark de Kock',
        role: 'Strategie, Merk, Commerciële Groei & Go-to-Market',
        bio: 'Twintig jaar marketing leadership aan bureau- en klantzijde. Oprichter van creatief bureau en nu partner in Kirk Blackbeard. Mark is de hands-on strategische kracht achter de executie: positionering, go-to-market, revenue growth en marketing transformatie. Hij werkt met de tools van nu, inclusief AI, om sneller en scherper te leveren dan traditionele aanpakken toelaten. Hij stuurt, bouwt mee en zorgt dat het gebeurt. Brengt een netwerk van ervaren en betrouwbare professionals mee om het juiste team voor de juiste opdracht samen te stellen.',
      },
    ],
    workingHeading: 'Hoe we werken',
    working: [
      { title: 'Strategisch én in de operatie', body: 'Ben op de momenten die ertoe doen: boardroom, keynote, strategische keuzes. Mark in de wekelijkse executie, hands-on, eventueel als tijdelijk teamlid.' },
      { title: 'Flexibel in vorm', body: 'Van eenmalige sessie tot doorlopend leiderschap. Van keynote tot 100-dagen-programma. We schalen naar wat de situatie vraagt.' },
      { title: 'Netwerk als hefboom', body: 'Waar nodig schakelen we specialisten in: van performance marketing tot service design, van operationeel leiderschap tot PR en communicatie.' },
    ],
    scenariosHeading: 'Wanneer moet je ons bellen?',
    scenarios: [
      { title: 'De groei stokt en niemand weet precies waarom', body: 'Je hebt een goed product en een sterk team, maar de cijfers blijven achter. Marketing draait, sales belt, toch gebeurt er te weinig. Ergens zit een blokkade in de propositie, de funnel of de focus. Voorbeeld: B2B scale-up met stagnerende pipeline. Binnen 3 tot 12 weken nieuwe positionering, aangepaste funnel en meer grip op qualified leads.' },
      { title: 'We moeten naar de markt, maar weten niet hoe', body: 'Je hebt iets gebouwd dat werkt. Nu moet het verkocht worden, maar aan wie precies, via welk kanaal, met welk verhaal? We bouwen go-to-market strategieën die niet in een la blijven liggen. Voorbeeld: SaaS-product zonder marktervaring in-house, in 12 weken van propositie naar lancering.' },
      { title: 'Mijn team doet in weken wat anderen in dagen doen', body: 'Je ziet concurrenten sneller bewegen. Niet met meer mensen of meer budget, maar anders. Ze gebruiken AI op een manier die jouw team nog niet kent. We herontwerpen hoe je team werkt, met de tools die het verschil maken. Voorbeeld: marketing output verdrievoudigd zonder extra headcount, doorlooptijd campagnes van weken naar dagen.' },
      { title: 'We worden verkocht, overgenomen of zoeken investering', body: 'Het verhaal moet kloppen, de cijfers moeten staan en de organisatie moet klaar zijn voor due diligence én voor daarna. Wij brengen binnenkant en buitenkant op orde, onder tijdsdruk. Voorbeeld: 100-dagen-programma post-acquisitie, van founder-chaos naar overdraagbare structuur.' },
      { title: 'Ik heb geen CDO of CMO nodig voor 5 jaar, wel voor nu', body: 'Je hebt senior marketingleiderschap nodig, maar niet fulltime en niet permanent. Iemand die meebouwt, het team aanstuurt en weer loslaat als het staat. Voorbeeld: fractional CMO voor 6 maanden. Van founder-led sales naar een werkende marketing engine met een eigen team.' },
      { title: 'Ik wil mijn team of board laten zien wat er speelt', body: 'Technologie en AI veranderen sneller dan de meeste organisaties bijhouden. Ben geeft keynotes en interactieve sessies die het concreet maken: wat gebeurt er nu, wat betekent het voor jouw markt, wat moet je morgen anders doen. Geen hype, wel urgentie. Voorbeeld: boardroom-sessie waarna het directieteam van "AI is iets voor later" naar een concrete pilot binnen 30 dagen ging.' },
      { title: 'Ik wil gewoon even sparren met iemand die het snapt', body: 'Geen project, geen traject, gewoon een scherp gesprek met mensen die de vraagstukken kennen. Strategische sparring, een second opinion of een klankbord voordat je een beslissing neemt. Voorbeeld: kwartaalsessies met een founder als klankbord voor strategische keuzes, zonder de overhead van een advisory board.' },
    ],
    ctaHeading: 'Maak nu een afspraak met Mark',
    ctaLabel: 'Plan je gesprek →',
    ctaHref: 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock',
    backLabel: '← Terug naar de sessiepagina',
  },
  whyWorks: {
    heading: 'Waarom deze aanpak werkt',
    items: [
      { title: 'Senior peer pressure', body: 'Andere directieleden stellen scherpere vragen dan adviseurs. De spiegel komt van mensen die hetzelfde dragen.' },
      { title: 'Data-gebaseerde reflectie', body: 'De assessment maakt onderbuik concreet. Je weet niet alleen wat je voelt, je ziet ook waar je zit.' },
      { title: 'Eén concrete keuze', body: 'Geen lijst van twintig dingen. Eén keuze, scherp ingebed in een ritme van 90 dagen.' },
      { title: 'Opvolgritme', body: 'Drie metingen op precies de mijlpalen van je canvas. Niemand komt er goedkoop vanaf.' },
      { title: 'Accountability zonder zwaarte', body: 'Een 1-op-1 met Mark vanaf dag 15. Geen masterclass, wel een spiegel die zorgt dat je niet vergeet wat je koos.' },
      { title: 'Een netwerk dat blijft', body: 'Alle deelnemers die willen, komen samen in een besloten WhatsApp-groep, Mark inbegrepen. Ervaringen en inzichten blijven stromen, ook na de dag zelf.' },
    ],
  },
  testimonials: {
    heading: 'Wat deelnemers zeggen',
    items: [
      // Vul aan via /admin/ai-leiderschap. Sectie verbergt zich als de lijst leeg is.
    ],
  },
  practical: {
    heading: 'Praktisch',
    facts: [
      { label: 'Data', value: 'Maandag 14 september of woensdag 7 oktober 2026 (kies één)' },
      { label: 'Locatie', value: 'Utrecht (locatie bevestigd bij boeking)' },
      { label: 'Vorm', value: 'Sessie van ca. 4 uur (ochtend of middag)' },
      { label: 'Groep', value: 'Min. 10, max. 30 per sessie' },
      { label: 'Investering', value: '€1.199 p.p. (excl. btw)' },
      { label: 'Taal', value: 'Nederlands' },
    ],
  },
  included: {
    heading: 'Wat zit erbij in',
    items: [
      'Halve dag executive sessie (Ben + Mark)',
      'Baseline-assessment vooraf',
      'Persoonlijk rapport',
      '90-dagen-canvas (A3) + leiderschapsboekje',
      'Lunch (invulling hangt af van de locatie)',
      'Besloten WhatsApp-groep met alle deelnemers en Mark, om ervaringen en inzichten te blijven delen (optioneel)',
      '30-min 1-op-1 follow-up met Mark op dag 15',
      'Progressiemetingen op dag 30, 60 en 90',
      'Persoonlijk delta-rapport',
      'Anoniem cohort-eindrapport',
    ],
  },
  slots: {
    heading: 'Boek je plek',
    intro: 'Twee identieke sessies, kies de datum die je het beste uitkomt. 14 september is een middagsessie, 7 oktober een ochtendsessie. Beide hebben hetzelfde programma en gaan door bij minimaal 10 inschrijvingen.',
    items: [
      {
        id: 'sep14',
        label: 'Maandag 14 september 2026',
        time: '13:30 – 17:30 (middag)',
        price: '€1.199',
        // Boeking + betaling verlopen via het PlugAndPay-platform van Het Sprekershuys.
        mollieHref: 'https://sprekershuys.plugandpay.com/checkout/masterclass-ben-van-der-burg',
        note: 'Max. 30 plekken',
      },
      {
        id: 'oct07',
        label: 'Woensdag 7 oktober 2026',
        time: '09:00 – 13:30 (ochtend)',
        price: '€1.199',
        mollieHref: 'https://sprekershuys.plugandpay.com/checkout/masterclass-ben-van-der-burg-1781790562',
        note: 'Max. 30 plekken',
      },
    ],
    payNote: 'Veilig betalen via Het Sprekershuys met iDEAL, Wero of creditcard. Bij minder dan 10 inschrijvingen voor jouw slot krijg je je betaling volledig terug. Prijzen excl. btw.',
    duoLabel: '',
    duoBody: '',
  },
  waitlist: {
    heading: 'Kan je niet op 14 september of 7 oktober?',
    intro: 'Schrijf je vrijblijvend voor. We plannen regelmatig een nieuwe editie en voorinschrijvers worden als eerste uitgenodigd zodra de volgende datum vaststaat.',
    successMessage: 'Bedankt, je staat op de lijst. We laten weten zodra de volgende editie gepland is.',
  },
  faq: {
    heading: 'Veelgestelde vragen',
    items: [
      { q: 'Wat is het verschil tussen 14 september en 7 oktober?', a: 'Niets inhoudelijk. Beide sessies bieden hetzelfde programma met dezelfde begeleiders. 14 september is een middagsessie (13:30 – 17:30), 7 oktober een ochtendsessie (09:00 – 13:30). Je kiest puur op wat jou logistiek het beste schikt.' },
      { q: 'Wat als mijn sessie niet doorgaat?', a: 'Bij minder dan 10 inschrijvingen voor een sessie gaat die niet door en krijg je je betaling 100% terug. Eventueel kun je overstappen naar de andere datum.' },
      { q: 'Heb ik AI-voorkennis nodig?', a: 'Nee. We gaan ervan uit dat je in je organisatie met AI bezig bent, maar dit is geen technische sessie. Het gaat over leiderschap, niet over tooling.' },
      { q: 'Is de baseline-assessment verplicht?', a: 'Aanbevolen, niet verplicht. Wie vooraf invult haalt veel meer uit de cohort-spiegel en de werkblokken. Daar komt de data van de zaal terug.' },
      { q: 'Hoe werkt het 90-dagen-traject precies?', a: 'Vanaf dag 15 plannen we een 1-op-1 met Mark in (30 min, online). De calls worden over een week of twee gespreid, zodat iedereen een passend moment kan kiezen. Op dag 30, 60 en 90 ontvang je een korte gepersonaliseerde meting met je delta-rapport. Op dag 90 een cohort-slotrapport.' },
      { q: 'Kan ik op bedrijfsnaam factureren?', a: 'Ja. Bij de checkout van Het Sprekershuys vul je je bedrijfs- en btw-gegevens in. Je ontvangt een factuur op naam van je bedrijf.' },
      { q: 'Kan ik met twee mensen uit één organisatie komen?', a: 'Ja, dat raden we zelfs aan. Twee directieleden uit dezelfde organisatie halen meer uit het 90-dagen-traject, want jullie kunnen samen terugkomen op de inzichten. Boek gewoon twee plekken via de checkout.' },
      { q: 'Wat gebeurt er met mijn assessmentdata?', a: 'Je persoonlijke rapport is en blijft van jou. We delen geen individuele scores met andere deelnemers, je werkgever of derden. In de zaal tonen we alleen geaggregeerde, anonieme patronen, bijvoorbeeld "deze zaal scoort gemiddeld X op governance". We verkopen geen data en de assessment is GDPR-conform opgeslagen.' },
    ],
  },
  footer: {
    tagline: 'Een initiatief van Ben van der Burg & Mark de Kock.',
    legal: '© 2026. Alle rechten voorbehouden.',
  },
}

export function mergeContent(base: AILContent, override: unknown): AILContent {
  if (!override || typeof override !== 'object') return base
  return deepMerge(base, override as Record<string, unknown>) as AILContent
}

function deepMerge(base: unknown, over: unknown): unknown {
  if (Array.isArray(over)) return over
  if (over && typeof over === 'object' && base && typeof base === 'object' && !Array.isArray(base)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
    for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
      out[k] = k in (base as Record<string, unknown>) ? deepMerge((base as Record<string, unknown>)[k], v) : v
    }
    return out
  }
  return over === undefined ? base : over
}
