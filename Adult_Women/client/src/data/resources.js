export const RESOURCE_CATEGORIES = [
  'All',
  'Contraception',
  'Fertility',
  'Sexual Health',
  'Pregnancy & Postpartum',
  'Perimenopause',
];

export const RESOURCES = [
  {
    id: 'ec-options-timing',
    category: 'Contraception',
    title: 'Emergency contraception: your options and timing',
    summary:
      'What is available, how quickly each option works, and the questions worth asking a pharmacist or clinician.',
    readTime: '6 min',
    tags: ['emergency contraception', 'morning after', 'timing'],
    intro:
      'Emergency contraception is used after unprotected sex or when contraception may have failed. It is not a regular method, but knowing your options before you need them can make a stressful moment easier to navigate.',
    sections: [
      {
        heading: 'The two main categories',
        paragraphs: [
          'Emergency contraceptive pills are available over the counter in many places. Most contain levonorgestrel and are licensed for use within 72 hours, though they work best the sooner they are taken. A prescription pill containing ulipristal acetate can be used up to 120 hours after sex and remains more effective closer to ovulation.',
          'A copper IUD can be fitted as emergency contraception up to five days after unprotected sex, and sometimes later depending on when ovulation is estimated. It is the most effective option, and it can also become ongoing contraception.',
        ],
        bullets: [
          'Levonorgestrel pill: available without prescription in many countries; best within 24 hours.',
          'Ulipristal acetate: prescription only in many places; can be used up to 5 days.',
          'Copper IUD: fitted by a clinician; highly effective and can provide long-term protection.',
        ],
      },
      {
        heading: 'Body weight and effectiveness',
        paragraphs: [
          'Levonorgestrel emergency pills may be less effective for people with a higher body weight. A clinician or pharmacist can help you choose an option that fits your body and timing. Do not double the dose unless a healthcare professional advises it.',
        ],
      },
      {
        heading: 'Afterwards',
        paragraphs: [
          'Emergency contraception does not protect against sexually transmitted infections. If you need STI testing, ask about it at the same visit. Your next period may arrive a few days early or late. Take a pregnancy test if it is more than a week late or if you have unusual bleeding.',
        ],
      },
    ],
    takeaway:
      'The fastest option is not always the right option for every body. A quick call to a pharmacist or sexual health clinic can help you choose with confidence.',
  },
  {
    id: 'iud-pill-options',
    category: 'Contraception',
    title: 'IUDs, pills and the “rest week” — what actually matters',
    summary:
      'A plain-language guide to how common methods work, what side effects are expected, and how to decide what fits your life.',
    readTime: '8 min',
    tags: ['IUD', 'pill', 'side effects', 'contraception'],
    intro:
      'There is no single best contraceptive. The right choice is the one that suits your health, your preferences, your tolerance for side effects and your life right now. A little information can make the conversation with a clinician much more useful.',
    sections: [
      {
        heading: 'Hormonal methods',
        paragraphs: [
          'Combined pills, patches and vaginal rings contain estrogen and progestin. They prevent ovulation and usually make periods lighter and more predictable. Progestin-only pills, implants, injections and hormonal IUDs work in different ways and are options when estrogen is not advised.',
          'With combined pills, the bleed during the placebo or “rest” week is a withdrawal bleed, not a true period. Some people choose to skip it with clinician guidance. Breakthrough bleeding is common in the first few months and often settles.',
        ],
      },
      {
        heading: 'Copper IUDs',
        paragraphs: [
          'The copper IUD is hormone-free and can last for many years. It changes the environment in the uterus so sperm cannot reach an egg. Periods may be heavier or more painful, especially in the first few months, which is important to weigh if you already have heavy bleeding.',
        ],
      },
      {
        heading: 'Questions worth asking',
        bullets: [
          'What side effects should I expect, and which ones usually settle?',
          'How soon does it work, and what happens if I miss a dose?',
          'Does this method interact with any medicine I take?',
          'If I want to stop, what does the return to my natural cycle look like?',
        ],
      },
    ],
    takeaway:
      'Contraception is a two-way conversation. You are allowed to ask about alternatives, and you can change your mind later.',
  },
  {
    id: 'switching-contraception',
    category: 'Contraception',
    title: 'Starting or switching birth control without surprises',
    summary:
      'A practical checklist for the first three months on a new method, including what to track and when to check in.',
    readTime: '5 min',
    tags: ['switching', 'side effects', 'checklist'],
    intro:
      'Starting a new contraceptive can feel like a leap. Tracking a few simple things for the first few months helps you tell a temporary adjustment from a pattern worth discussing.',
    sections: [
      {
        heading: 'Your first 90 days',
        paragraphs: [
          'Many methods cause temporary changes such as spotting, breast tenderness, headaches or mood shifts. These often improve as your body adjusts. Keep a short daily note rather than trying to remember everything at your next appointment.',
        ],
        bullets: [
          'Note any bleeding, including spotting, and whether it is predictable.',
          'Record headaches, nausea, mood changes and sleep.',
          'Mark the date you started and any missed doses.',
          'Check your blood pressure if you use a combined method and your clinician recommends it.',
        ],
      },
      {
        heading: 'When to seek advice sooner',
        paragraphs: [
          'Seek urgent care for severe calf pain, new shortness of breath, chest pain, or a severe headache with vision changes if you use a combined hormonal method. These can be signs of a rare clot. For persistent heavy bleeding, unusual discharge or symptoms that are affecting your daily life, book a non-urgent review.',
        ],
      },
    ],
    takeaway:
      'A short record of the first three months makes it much easier to know whether a method is working for you.',
  },
  {
    id: 'fertile-window',
    category: 'Fertility',
    title: 'How to identify your fertile window',
    summary:
      'Ovulation signs, calendar predictions and why no app can confirm ovulation on its own.',
    readTime: '7 min',
    tags: ['ovulation', 'fertile window', 'conception'],
    intro:
      'The fertile window is the handful of days each cycle when conception is possible. It usually ends on the day of ovulation, because an egg survives only around 12 to 24 hours, while sperm can survive in the reproductive tract for up to five days.',
    sections: [
      {
        heading: 'What the signs can tell you',
        paragraphs: [
          'Cervical mucus often becomes clearer, wetter and more stretchy near ovulation — similar to raw egg white. Some people feel a one-sided twinge called mittelschmerz. Libido may rise. These signs are helpful but not proof that ovulation has happened.',
          'Apps estimate ovulation by working backward from an expected period. That works best when cycles are regular. With irregular cycles, predictions can be several days off, which is why combining methods gives a clearer picture.',
        ],
      },
      {
        heading: 'Methods that add information',
        bullets: [
          'Basal body temperature rises slightly after ovulation — useful for confirming that ovulation happened, not for predicting it in advance.',
          'Ovulation predictor kits detect the LH surge that usually precedes ovulation by 24–36 hours.',
          'Cervical mucus tracking is free and can be learned over a few cycles.',
          'A fertility awareness instructor can help you combine signs correctly.',
        ],
      },
      {
        heading: 'When to get support',
        paragraphs: [
          'If you are under 35 and have not conceived after 12 months of regular unprotected sex, or over 35 and have not conceived after six months, it is reasonable to ask for an assessment. Seek earlier advice if your cycles are very irregular, you have no periods, or you have known conditions affecting fertility.',
        ],
      },
    ],
    takeaway:
      'Predictions are a starting point, not a guarantee. If conception timing matters to you, combine app data with body signs or ovulation tests.',
  },
  {
    id: 'trying-after-35',
    category: 'Fertility',
    title: 'Trying to conceive after 35: what the evidence says',
    summary:
      'Fertility changes with age, but age alone is not a verdict. Here is what is worth knowing and when to ask for help.',
    readTime: '6 min',
    tags: ['conception', 'age', 'fertility assessment'],
    intro:
      'Fertility gradually declines with age, with a steeper change in the late 30s and early 40s. That is a population-level pattern, not a prediction about any one person. Many people conceive in their late 30s and 40s, sometimes with support.',
    sections: [
      {
        heading: 'The practical timeline',
        paragraphs: [
          'Guidelines commonly suggest an assessment after six months of trying for people aged 35 and older, and after 12 months for those younger. If you have irregular cycles, a known condition such as endometriosis or PCOS, or a history of pelvic surgery, it is reasonable to ask sooner.',
        ],
      },
      {
        heading: 'What an assessment can include',
        bullets: [
          'A conversation about cycle history and medical history.',
          'Blood tests such as AMH and thyroid function, interpreted carefully.',
          'A pelvic ultrasound and, sometimes, a semen analysis for a partner.',
          'A review of medicines, supplements and lifestyle factors.',
        ],
      },
      {
        heading: 'Keeping perspective',
        paragraphs: [
          'No single test can predict whether you will conceive. Be cautious with clinics that offer definitive “fertility scores”. A good clinician explains uncertainty and helps you make decisions based on your whole picture.',
        ],
      },
    ],
    takeaway:
      'Age is one factor among many. If you are trying to conceive, a clear timeline and an early conversation can reduce guesswork.',
  },
  {
    id: 'fertility-assessment',
    category: 'Fertility',
    title: 'When to ask for a fertility assessment',
    summary:
      'Signs that a conversation with a fertility specialist is reasonable — without waiting longer than you need to.',
    readTime: '5 min',
    tags: ['fertility', 'testing', 'referral'],
    intro:
      'People often wonder whether they are “allowed” to ask for help. You do not need to reach a certain number of months before raising a concern that matters to you. Guidelines offer a useful frame, not a gate.',
    sections: [
      {
        heading: 'Reasons to ask sooner',
        bullets: [
          'Your cycles are consistently shorter than 21 days or longer than 35 days.',
          'You have very painful periods or pain during sex that could suggest endometriosis.',
          'You have had more than one early pregnancy loss.',
          'You have PCOS, thyroid disease or another condition that can affect ovulation.',
          'You have a partner with known fertility concerns.',
          'You are over 35 and have been trying for six months.',
        ],
      },
      {
        heading: 'What to bring',
        paragraphs: [
          'Bring your cycle dates, any symptom logs and a list of medicines. If you have been using ovulation tests, note the results. This kind of record can make a short appointment much more productive.',
        ],
      },
    ],
    takeaway:
      'Advocating for an assessment is not overreacting. It is gathering information so you can make an informed decision.',
  },
  {
    id: 'painful-sex',
    category: 'Sexual Health',
    title: 'Pain during sex is not something to push through',
    summary:
      'Pain is common, treatable and never something you simply have to tolerate. Here are the conversations worth having.',
    readTime: '6 min',
    tags: ['dyspareunia', 'pain', 'pelvic health'],
    intro:
      'Pain during sex — sometimes called dyspareunia — affects many people at some point. It can have physical, hormonal and emotional contributors, and often more than one at once. Pain is a signal, not a personal failing.',
    sections: [
      {
        heading: 'Possible contributors',
        bullets: [
          'Not enough lubrication or arousal, which can happen for many reasons.',
          'Vaginal dryness related to hormonal changes, including perimenopause and postpartum.',
          'Infections such as thrush or bacterial vaginosis.',
          'Pelvic floor muscle tension or vulvodynia.',
          'Endometriosis, fibroids or other pelvic conditions.',
          'Anxiety, past pain experiences or relationship stress.',
        ],
      },
      {
        heading: 'What a clinician can do',
        paragraphs: [
          'A good appointment starts with listening. You can ask for a slower exam protocol, a chaperone, or to stop at any point. Treatment might include lubricants, topical estrogen, pelvic floor physiotherapy, infection treatment, or a referral to a specialist.',
        ],
      },
      {
        heading: 'In the moment',
        paragraphs: [
          'Change position, add lubricant, slow down or stop. Pain that persists after sex, bleeding, or pain with penetration that makes sex impossible are all reasons to book a review. You deserve a clinician who takes this seriously.',
        ],
      },
    ],
    takeaway:
      'Painful sex is common but not something you have to accept. Effective help exists and often starts with one honest conversation.',
  },
  {
    id: 'sti-testing',
    category: 'Sexual Health',
    title: 'STI testing: what to book and when',
    summary:
      'Many STIs have no symptoms. A practical guide to testing windows, common tests and reducing awkwardness.',
    readTime: '5 min',
    tags: ['STI', 'testing', 'sexual health'],
    intro:
      'Sexual health testing is preventive care. Most infections are easy to treat when found, and many people have no symptoms at all. Testing is a normal part of looking after your health.',
    sections: [
      {
        heading: 'Common tests',
        bullets: [
          'Chlamydia and gonorrhoea: urine or swab, depending on exposure.',
          'HIV and syphilis: blood tests.',
          'Trichomoniasis: swab or urine, depending on the clinic.',
          'HPV: usually part of cervical screening, not a routine standalone test.',
          'Herpes: a swab is most useful when sores are present.',
        ],
      },
      {
        heading: 'Timing matters',
        paragraphs: [
          'Some infections take weeks to show up on a test. Ask the clinic about the window period for the tests you receive. A negative test too early does not always mean you are clear. If you have symptoms, book promptly rather than waiting.',
        ],
      },
      {
        heading: 'Making it easier',
        paragraphs: [
          'You can ask for a clinician of a particular gender, bring a friend to the waiting room, or use a self-sampling kit where available. You do not need to explain or justify your sexual history beyond what is clinically useful.',
        ],
      },
    ],
    takeaway:
      'Regular testing is a form of self-care. Knowing your status gives you options and peace of mind.',
  },
  {
    id: 'vaginal-ph',
    category: 'Sexual Health',
    title: 'Vaginal pH, discharge and what is typical',
    summary:
      'How to tell normal discharge from something that needs attention — and why douching usually backfires.',
    readTime: '5 min',
    tags: ['discharge', 'pH', 'vaginal health'],
    intro:
      'The vagina is self-cleaning. Discharge changes with the menstrual cycle, pregnancy, contraception and age. Learning your baseline makes it easier to notice when something has shifted.',
    sections: [
      {
        heading: 'What is typical',
        paragraphs: [
          'Normal discharge can be clear, milky or slightly yellow. It may be thin and stretchy around ovulation or thicker before a period. It should not usually have a strong unpleasant smell or cause significant itching or pain.',
          'The healthy vagina is acidic, typically around pH 3.8 to 4.5. Semen, menstrual blood and some soaps can temporarily raise pH, which is one reason infections can follow certain exposures.',
        ],
      },
      {
        heading: 'Signs to get checked',
        bullets: [
          'A strong fishy odour, especially after sex.',
          'Thick white discharge with itching or soreness.',
          'Green or yellow discharge, pelvic pain or fever.',
          'Bleeding between periods or after sex that is new for you.',
          'Symptoms that keep returning after treatment.',
        ],
      },
      {
        heading: 'Skip the douche',
        paragraphs: [
          'Douching and scented intimate products can disrupt the vaginal microbiome and make infections more likely. Warm water on the outside is enough. If you are prone to recurrent bacterial vaginosis, ask a clinician about evidence-based prevention options.',
        ],
      },
    ],
    takeaway:
      'Your normal is your normal. A change that persists, smells unusual or comes with pain is worth checking — not embarrassing.',
  },
  {
    id: 'pregnancy-vs-pms',
    category: 'Pregnancy & Postpartum',
    title: 'Early pregnancy signs vs. PMS',
    summary:
      'Why the first two weeks can feel confusing, and when a pregnancy test will give you a reliable answer.',
    readTime: '5 min',
    tags: ['early pregnancy', 'PMS', 'testing'],
    intro:
      'Early pregnancy and premenstrual symptoms overlap: breast tenderness, fatigue, bloating, mood changes and mild cramps can all occur in both. That overlap is why symptoms alone are not a reliable way to know.',
    sections: [
      {
        heading: 'Why they feel similar',
        paragraphs: [
          'Both early pregnancy and the luteal phase involve rising progesterone and shifting estrogen. The body does not label those sensations. A missed period plus a positive test is more informative than symptom-spotting.',
        ],
        bullets: [
          'Implantation bleeding is usually light and short; it is not a reliable sign on its own.',
          'Nausea can start around week six, later than most people expect.',
          'A test is most reliable after a missed period, or 14 days after possible conception.',
        ],
      },
      {
        heading: 'Testing timing',
        paragraphs: [
          'First-morning urine is usually most concentrated. If a test is negative but your period remains absent, wait two or three days and test again. If you have severe pain, dizziness, shoulder tip pain or heavy bleeding, seek urgent care to rule out ectopic pregnancy.',
        ],
      },
    ],
    takeaway:
      'Symptoms can hint but tests confirm. If the uncertainty is stressful, a test and a clinician conversation are usually more reassuring than more symptom research.',
  },
  {
    id: 'fourth-trimester',
    category: 'Pregnancy & Postpartum',
    title: 'The fourth trimester: healing after birth',
    summary:
      'What recovery can look like in the first twelve weeks, and the signs that deserve a call rather than a wait.',
    readTime: '7 min',
    tags: ['postpartum', 'recovery', 'mental health'],
    intro:
      'The first three months after birth are sometimes called the fourth trimester. Your body is healing, your hormones are shifting rapidly, and sleep is disrupted. Recovery is not a straight line.',
    sections: [
      {
        heading: 'Physical recovery',
        paragraphs: [
          'Lochia — postpartum bleeding and discharge — can last for several weeks. Afterpains, night sweats, hair shedding and tender breasts are common. Pelvic floor exercises can usually begin gently once you feel ready, but a pelvic health physiotherapy assessment is valuable if you have pain, leaking or heaviness.',
        ],
      },
      {
        heading: 'Emotional wellbeing',
        paragraphs: [
          'Baby blues affect many people in the first two weeks and usually ease. Postpartum anxiety or depression can appear later and can feel like constant worry, numbness, intrusive thoughts or rage. These are medical conditions, not character flaws, and they are treatable.',
        ],
        bullets: [
          'Speak to a clinician if low mood, anxiety or intrusive thoughts persist beyond two weeks.',
          'Seek urgent help if you have thoughts of harming yourself or your baby.',
          'Ask your partner or family to watch for changes you might not notice yourself.',
        ],
      },
      {
        heading: 'When to call sooner',
        paragraphs: [
          'Contact your maternity team for heavy bleeding that soaks a pad in an hour, a fever, worsening abdominal pain, a severe headache with visual changes, or a wound that looks infected. Trust your instincts if something feels wrong.',
        ],
      },
    ],
    takeaway:
      'Postpartum care is not a single six-week appointment. You are allowed to ask for help at any point in the first year.',
  },
  {
    id: 'postpartum-contraception',
    category: 'Pregnancy & Postpartum',
    title: 'Postpartum contraception and the return of your cycle',
    summary:
      'Fertility can return before your first period. Here is how to plan without relying on myths.',
    readTime: '5 min',
    tags: ['postpartum', 'contraception', 'breastfeeding'],
    intro:
      'It is possible to become pregnant before your first postpartum period. Ovulation happens about two weeks before your period, so the first bleed is not your first fertile moment.',
    sections: [
      {
        heading: 'Breastfeeding as contraception?',
        paragraphs: [
          'The lactational amenorrhoea method can be effective only when all three conditions are met: you are exclusively breastfeeding, your period has not returned, and your baby is under six months old. Each condition matters. It is not a reliable method once any of them changes.',
        ],
      },
      {
        heading: 'Options after birth',
        paragraphs: [
          'Progestin-only methods are often offered early because they do not affect milk supply in the same way as combined methods. Options include the implant, hormonal IUD, progestin-only pill and injection. A copper IUD or barrier methods are hormone-free alternatives. Combined methods are usually started after about six weeks in people who are breastfeeding.',
        ],
      },
      {
        heading: 'Not just about pregnancy prevention',
        paragraphs: [
          'Contraception can also help with heavy or painful periods, cycle regulation and conditions such as endometriosis. A postpartum review is a good time to talk about what you want for the next chapter.',
        ],
      },
    ],
    takeaway:
      'Do not rely on breastfeeding alone. If avoiding pregnancy matters, choose a method before your cycle returns.',
  },
  {
    id: 'perimenopause-101',
    category: 'Perimenopause',
    title: 'Perimenopause 101: the years before your last period',
    summary:
      'What is actually happening, why cycles become unpredictable, and which symptoms are worth tracking.',
    readTime: '8 min',
    tags: ['perimenopause', 'hormones', 'cycles'],
    intro:
      'Perimenopause is the transition from regular cycles to the final menstrual period. It often begins in the early-to-mid 40s, but it can start earlier. Menopause is confirmed only in retrospect, after 12 months without a period.',
    sections: [
      {
        heading: 'What changes',
        paragraphs: [
          'Ovarian function becomes less predictable. Estrogen can spike and then drop rather than declining smoothly. Cycles may get shorter, longer, heavier or lighter, sometimes in the same year. This is why a single weird cycle is not necessarily a sign that menopause is imminent.',
        ],
        bullets: [
          'Hot flushes and night sweats are the most commonly reported symptoms.',
          'Sleep disruption and fatigue can worsen brain fog and irritability.',
          'Vaginal dryness and discomfort during sex are common and treatable.',
          'Joint aches, palpitations and low libido can also occur.',
        ],
      },
      {
        heading: 'Tracking through transition',
        paragraphs: [
          'Logging period dates and symptoms is particularly useful now, because patterns are less obvious. Your clinician may want to know the date of your last period, cycle spacing, and whether you have new bleeding between periods or after sex.',
        ],
      },
      {
        heading: 'Treatment is not one-size-fits-all',
        paragraphs: [
          'Lifestyle measures, non-hormonal medicines and menopausal hormone therapy can all have a role. The right choice depends on symptoms, health history and personal preference. A nuanced conversation beats a one-line answer.',
        ],
      },
    ],
    takeaway:
      'Perimenopause is a transition, not a diagnosis made from one symptom. Tracking helps you and your clinician see the shape of it.',
  },
  {
    id: 'hot-flushes-sleep',
    category: 'Perimenopause',
    title: 'Hot flushes and sleep: options that can help',
    summary:
      'From cooling strategies to evidence-based treatments, a calm look at managing vasomotor symptoms.',
    readTime: '6 min',
    tags: ['hot flushes', 'sleep', 'menopause'],
    intro:
      'Hot flushes are sudden sensations of heat, often with sweating and flushing. They can happen day or night and vary widely in frequency. Sleep disruption is one of their biggest quality-of-life effects.',
    sections: [
      {
        heading: 'Everyday strategies',
        bullets: [
          'Layer clothing and keep a cool drink nearby.',
          'Keep the bedroom cool and use breathable bedding.',
          'Notice triggers such as alcohol, caffeine, spicy food or stress.',
          'Build a wind-down routine and keep screens dim before bed.',
          'Ask about cognitive behavioural therapy for sleep and hot flushes — it has good evidence.',
        ],
      },
      {
        heading: 'Medical options',
        paragraphs: [
          'Menopausal hormone therapy is the most effective treatment for vasomotor symptoms for many people. Local vaginal estrogen can help with dryness without the same systemic exposure. Non-hormonal options include certain antidepressants and other medicines. Each has benefits and risks that depend on your history.',
        ],
      },
      {
        heading: 'A note on sleep',
        paragraphs: [
          'If you snore heavily, wake gasping, or feel exhausted despite enough hours in bed, ask about sleep apnoea. It becomes more common after menopause and is often missed.',
        ],
      },
    ],
    takeaway:
      'You do not have to wait out severe symptoms. There are several evidence-based paths, and the right one can be tailored to you.',
  },
  {
    id: 'midlife-bleeding',
    category: 'Perimenopause',
    title: 'Irregular bleeding in midlife: what to check',
    summary:
      'When cycle changes are expected — and when new bleeding patterns deserve prompt assessment.',
    readTime: '5 min',
    tags: ['irregular bleeding', 'perimenopause', 'warning signs'],
    intro:
      'Cycle variability is expected in perimenopause. But some bleeding changes are not simply hormonal and should be checked promptly, especially after menopause has been confirmed.',
    sections: [
      {
        heading: 'Worth a routine conversation',
        bullets: [
          'Cycles lengthening or shortening over several months.',
          'Lighter or heavier flow without other symptoms.',
          'New mood, sleep or vasomotor symptoms alongside cycle changes.',
        ],
      },
      {
        heading: 'Seek assessment promptly',
        bullets: [
          'Any bleeding after 12 months without a period.',
          'Bleeding between periods that is new for you.',
          'Bleeding after sex.',
          'Periods so heavy you need to change protection hourly or pass large clots.',
          'Pain that is new and severe.',
        ],
        paragraphs: [
          'These symptoms have many possible causes, most of them not serious. Assessment helps rule out endometrial changes, fibroids, polyps and other treatable conditions.',
        ],
      },
    ],
    takeaway:
      'Not every irregular bleed is an emergency, but postmenopausal bleeding and new heavy bleeding should always be assessed.',
  },
];
