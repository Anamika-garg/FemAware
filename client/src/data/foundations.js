// Foundation articles for the public learning library. Written from the public
// health sources cited on each article and not yet reviewed by a clinician, so
// pages that show them must say so.
const SOURCES = {
  acogFirstPeriod: {
    title: 'Your First Period',
    publisher: 'American College of Obstetricians and Gynecologists',
    url: 'https://www.acog.org/womens-health/faqs/your-first-period',
  },
  acogVitalSign: {
    title: 'Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign',
    publisher: 'American College of Obstetricians and Gynecologists',
    url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/12/menstruation-in-girls-and-adolescents-using-the-menstrual-cycle-as-a-vital-sign',
  },
  nhsPeriods: {
    title: 'Periods',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/periods/',
  },
  nhsPms: {
    title: 'Premenstrual syndrome (PMS)',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/pre-menstrual-syndrome/',
  },
  acogPms: {
    title: 'Premenstrual Syndrome (PMS)',
    publisher: 'American College of Obstetricians and Gynecologists',
    url: 'https://www.acog.org/womens-health/faqs/premenstrual-syndrome',
  },
  nhsPcos: {
    title: 'Polycystic ovary syndrome',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/',
  },
  whoPcos: {
    title: 'Polycystic ovary syndrome — fact sheet',
    publisher: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome',
  },
  ppConsent: {
    title: 'Sexual Consent',
    publisher: 'Planned Parenthood',
    url: 'https://www.plannedparenthood.org/learn/relationships/sexual-consent',
  },
  kidsHealthPuberty: {
    title: 'Everything You Wanted to Know About Puberty',
    publisher: 'Nemours KidsHealth',
    url: 'https://kidshealth.org/en/teens/puberty.html',
  },
  nhsMenopause: {
    title: 'Menopause',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/menopause/',
  },
};

export const FOUNDATION_ARTICLES = [
  {
    id: 'understanding-your-cycle',
    category: 'Periods & cycles',
    stage: 'everyone',
    title: 'Understanding your menstrual cycle',
    summary:
      'What happens across a cycle, what counts as a typical length, and why tracking a few months tells you more than any single day.',
    readTime: '6 min',
    tags: ['cycle', 'period', 'ovulation', 'tracking'],
    intro:
      'Your menstrual cycle is more than your period. It is a monthly rhythm of hormone changes that prepares the body for a possible pregnancy. Knowing the basic pattern makes it easier to notice when something is different for you.',
    sections: [
      {
        heading: 'Four phases, one rhythm',
        paragraphs: [
          'A cycle is counted from the first day of one period to the first day of the next. During the menstrual phase, the lining of the uterus is shed as period blood. In the follicular phase, hormones help an egg mature and the lining rebuild. Around ovulation, an ovary releases an egg. In the luteal phase, if the egg is not fertilised, hormone levels fall and the next period begins.',
        ],
      },
      {
        heading: 'What “typical” looks like',
        bullets: [
          'Adult cycles commonly last 21 to 35 days. In the first years after a first period, 21 to 45 days is common.',
          'Bleeding usually lasts 2 to 7 days.',
          'Cycle length often varies by a few days from month to month.',
          'Exactly 28 days is an average, not a target.',
        ],
      },
      {
        heading: 'Why tracking helps',
        paragraphs: [
          'A single short or late cycle is rarely meaningful on its own. A few months of dates and symptoms show your personal pattern, and they make a conversation with a clinician much more specific.',
        ],
      },
    ],
    takeaway:
      'Your normal is the pattern you see over several cycles. Changes to that pattern are worth noticing, and persistent changes are worth discussing.',
    sources: [SOURCES.nhsPeriods, SOURCES.acogVitalSign],
  },
  {
    id: 'your-first-period',
    category: 'Puberty & growing up',
    stage: 'teen',
    title: 'Your first period: what to expect',
    summary:
      'When periods usually start, what the first ones are like, and simple ways to feel prepared at school or away from home.',
    readTime: '5 min',
    tags: ['first period', 'puberty', 'teen'],
    intro:
      'Most people get their first period between the ages of 10 and 15, often about two years after breasts start to develop. Everyone has their own timeline, and there is no right age.',
    sections: [
      {
        heading: 'What it may look like',
        paragraphs: [
          'A first period can be light, sometimes just a few spots of brown or red. It is common for early periods to come at irregular times for the first couple of years while hormones settle.',
        ],
      },
      {
        heading: 'Being prepared',
        bullets: [
          'Keep a pad or period underwear in your bag.',
          'Know who you could ask for help at school, such as a school nurse or a teacher you trust.',
          'Write down the date your period starts so you can begin to see a pattern.',
        ],
      },
      {
        heading: 'When to check in with a doctor',
        bullets: [
          'Periods have not started by age 15.',
          'Bleeding soaks through a pad every hour or two.',
          'Pain stops you from going to school or doing everyday things.',
        ],
      },
    ],
    takeaway:
      'Starting earlier or later than friends is common. If you have questions, a parent, carer, school nurse or doctor can help.',
    sources: [SOURCES.acogFirstPeriod, SOURCES.kidsHealthPuberty],
  },
  {
    id: 'pms-common-and-when-to-seek-help',
    category: 'Periods & cycles',
    stage: 'everyone',
    title: 'PMS: what’s common and when to seek help',
    summary:
      'The physical and emotional changes many people notice before a period, what can ease them, and the signs that deserve a professional conversation.',
    readTime: '6 min',
    tags: ['PMS', 'PMDD', 'mood', 'symptoms'],
    intro:
      'Premenstrual syndrome (PMS) describes symptoms that appear in the days or weeks before a period and ease once bleeding starts. Many people notice some of them. For some, they are strong enough to affect daily life, and that is worth taking seriously.',
    sections: [
      {
        heading: 'Commonly reported symptoms',
        bullets: [
          'Bloating, breast tenderness and headaches.',
          'Tiredness or changes in sleep.',
          'Irritability, low mood, anxiety or feeling overwhelmed.',
          'Food cravings or changes in appetite.',
        ],
      },
      {
        heading: 'What can help',
        paragraphs: [
          'Regular movement, steady sleep and regular meals help some people. Tracking symptoms for two or three cycles shows whether they follow your cycle, which is the key feature of PMS. A pharmacist or doctor can talk through pain relief and other treatment options.',
        ],
      },
      {
        heading: 'When to speak to a professional',
        bullets: [
          'Symptoms affect work, school, relationships or everyday tasks.',
          'Low mood or anxiety feels severe before each period. This can be a sign of premenstrual dysphoric disorder (PMDD), which is treatable.',
          'Symptoms do not ease after your period starts.',
          'You have thoughts of harming yourself. Contact a doctor, a crisis line or emergency services straight away.',
        ],
      },
    ],
    takeaway:
      'Common does not mean you have to put up with it. A few months of symptom notes is the most useful thing to bring to an appointment.',
    sources: [SOURCES.nhsPms, SOURCES.acogPms],
  },
  {
    id: 'pcos-awareness',
    category: 'Hormones & conditions',
    stage: 'adult',
    title: 'PCOS awareness: patterns worth discussing',
    summary:
      'What polycystic ovary syndrome is, the patterns that can prompt an assessment, and why only a clinician can confirm it.',
    readTime: '7 min',
    tags: ['PCOS', 'irregular periods', 'hormones'],
    intro:
      'Polycystic ovary syndrome (PCOS) is a common hormonal condition that affects how the ovaries work. It looks different from person to person, and it can only be diagnosed by a clinician after a history, an examination and sometimes tests.',
    sections: [
      {
        heading: 'Patterns that can prompt an assessment',
        bullets: [
          'Irregular, infrequent or absent periods.',
          'Excess hair growth on the face, chest or back.',
          'Persistent acne or thinning scalp hair.',
          'Difficulty getting pregnant because of irregular ovulation.',
        ],
        paragraphs: [
          'A clinician may consider PCOS when several of the patterns below appear together. Many people without PCOS recognise some of them, and some people with PCOS recognise few. Thyroid conditions, stress and other causes can look similar.',
        ],
      },
      {
        heading: 'Why it is worth knowing',
        paragraphs: [
          'PCOS can be managed. Treatment depends on what matters most to you, whether that is regular periods, skin and hair symptoms, fertility, or long-term health such as blood sugar and heart health.',
        ],
      },
      {
        heading: 'Preparing for the conversation',
        bullets: [
          'Bring a few months of period start dates.',
          'Note symptoms and when you first noticed them.',
          'Mention family history of PCOS or type 2 diabetes.',
        ],
      },
    ],
    takeaway:
      'Noticing patterns is useful. Confirming PCOS is a clinician’s job, and a clear record of your cycles helps them do it.',
    sources: [SOURCES.nhsPcos, SOURCES.whoPcos],
  },
  {
    id: 'consent-boundaries-body-safety',
    category: 'Body safety & consent',
    stage: 'teen',
    title: 'Consent, boundaries and body safety',
    summary:
      'What consent means, how to recognise and state your boundaries, and where to turn if something does not feel right.',
    readTime: '5 min',
    tags: ['consent', 'boundaries', 'safety', 'teen'],
    intro:
      'Your body belongs to you. Consent means freely and clearly agreeing to something, and it applies to touch, photos, messages and any kind of physical closeness.',
    sections: [
      {
        heading: 'What consent looks like',
        bullets: [
          'It is given freely, without pressure, guilt or threats.',
          'It can be changed or taken back at any time.',
          'Agreeing to one thing does not mean agreeing to anything else.',
          'Someone who is asleep, very drunk or scared cannot give consent.',
        ],
      },
      {
        heading: 'Your boundaries matter',
        paragraphs: [
          'A boundary is a limit you set to feel safe and comfortable. It is OK to say no, to change your mind, and to leave a situation. People who respect you will respect your boundaries.',
        ],
      },
      {
        heading: 'If something does not feel right',
        paragraphs: [
          'If someone has hurt you, pressured you or made you uncomfortable, it is never your fault. Tell a parent, carer, school counsellor or another adult you trust. If you are in danger, call your local emergency number.',
        ],
      },
    ],
    takeaway:
      'You always have the right to say no, and you deserve support if something has happened.',
    sources: [SOURCES.ppConsent, SOURCES.kidsHealthPuberty],
  },
  {
    id: 'menopause-changing-health-needs',
    category: 'Menopause & midlife',
    stage: 'senior',
    title: 'Menopause and changing health needs',
    summary:
      'The stages around menopause, the symptoms people commonly notice, and the health checks that become more important afterwards.',
    readTime: '7 min',
    tags: ['menopause', 'perimenopause', 'postmenopause', 'bone health'],
    intro:
      'Menopause is reached 12 months after your last period. The years before it, called perimenopause, often bring changing cycles and new symptoms. Afterwards, lower oestrogen levels change some long-term health priorities.',
    sections: [
      {
        heading: 'Symptoms people commonly notice',
        bullets: [
          'Hot flushes and night sweats.',
          'Sleep changes, low mood, anxiety or difficulty concentrating.',
          'Vaginal dryness and discomfort during sex.',
          'Needing to pass urine more often, or recurring urinary infections.',
        ],
      },
      {
        heading: 'Health priorities that shift',
        paragraphs: [
          'Bone density can fall more quickly after menopause, and heart health deserves more attention. Strength and balance exercise, not smoking, and keeping blood pressure and cholesterol checks up to date all help.',
        ],
      },
      {
        heading: 'When to get checked promptly',
        bullets: [
          'Any vaginal bleeding after 12 months without a period.',
          'Symptoms that affect sleep, work or relationships. Treatments are available.',
        ],
      },
    ],
    takeaway:
      'Menopause is a normal life stage, and you do not have to manage its symptoms alone. A clinician can explain treatment options and which checks apply to you.',
    sources: [SOURCES.nhsMenopause],
  },
];
