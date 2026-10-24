/**
 * Lesson content. STATUS: pending_clinical_review.
 * Written for ages ~13–19 from the public sources cited on each module.
 */
import { SOURCES } from './sources.js';

export const LEARNING_MODULES = [
  {
    slug: 'menstrual-cycle-basics',
    title: 'Your Cycle, Explained',
    topic: 'menstrual_health',
    icon: 'RefreshCw',
    order: 1,
    estimatedMinutes: 6,
    xpReward: 50,
    summary: 'What a period is, why it happens, and what the four phases of the cycle do.',
    sections: [
      {
        heading: 'What is a period?',
        body: 'Each month the lining of the uterus (womb) thickens to get ready for a possible pregnancy. If no pregnancy happens, the body sheds that lining, and it leaves through the vagina as blood and tissue. That is a period, also called menstruation.',
      },
      {
        heading: 'The four phases',
        body: 'Menstrual phase: bleeding, usually 2–7 days. Follicular phase: hormones help an egg mature and the lining rebuild. Ovulation: an ovary releases an egg, roughly 2 weeks before the next period. Luteal phase: if the egg is not fertilised, hormone levels drop and the next period begins.',
      },
      {
        heading: 'How long is a cycle?',
        body: 'A cycle is counted from the first day of one period to the first day of the next. For teens, anything from 21 to 45 days is considered typical, and it is very common for cycles to be irregular for the first couple of years.',
      },
    ],
    keyPoints: [
      'Day 1 of your cycle is the first day of bleeding.',
      'Typical teen cycles are 21–45 days long.',
      'Periods usually last 2–7 days.',
    ],
    quiz: [
      {
        prompt: 'Which day counts as Day 1 of a menstrual cycle?',
        options: ['The day you ovulate', 'The first day of your period', 'The last day of your period', 'The 14th of each month'],
        correctIndex: 1,
        explanation: 'Cycles are counted from the first day of bleeding to the first day of the next period.',
      },
      {
        prompt: 'What range of cycle lengths is considered typical for teens?',
        options: ['7–14 days', '21–45 days', '50–60 days', 'Exactly 28 days'],
        correctIndex: 1,
        explanation: 'Teen cycles commonly vary between 21 and 45 days. Exactly 28 days is just an average.',
      },
      {
        prompt: 'What is shed during a period?',
        options: ['The lining of the uterus', 'The ovaries', 'Stomach lining', 'Only water'],
        correctIndex: 0,
        explanation: 'The uterine lining that built up during the cycle is shed as period blood and tissue.',
      },
      {
        prompt: 'Is it normal for periods to be irregular in the first couple of years?',
        options: ['No, it always means a problem', 'Yes, that is very common'],
        correctIndex: 1,
        explanation: 'Hormones take time to settle, so irregular cycles are common at first. Keep tracking and check in with a doctor if you are worried.',
      },
    ],
    sources: [SOURCES.acogFirstPeriod, SOURCES.acogVitalSign, SOURCES.kidsHealthMenstruation],
  },
  {
    slug: 'period-products-hygiene',
    title: 'Period Products & Hygiene',
    topic: 'hygiene',
    icon: 'Droplets',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    summary: 'Pads, tampons, cups, and period underwear — how to choose and use them safely.',
    sections: [
      {
        heading: 'Your options',
        body: 'Pads stick inside underwear. Tampons are worn inside the vagina. Menstrual cups collect blood and are emptied and rinsed. Period underwear has absorbent layers. There is no "right" choice — use what feels comfortable.',
      },
      {
        heading: 'Changing products',
        body: 'Change pads every 3–4 hours or when full. Change tampons at least every 4–8 hours and use the lowest absorbency you need. Follow the instructions that come with cups and period underwear.',
      },
      {
        heading: 'Toxic shock syndrome (TSS)',
        body: 'TSS is rare but serious. It is linked to leaving a tampon in too long. Warning signs include a sudden high fever, a sunburn-like rash, vomiting, and dizziness. If this happens, remove the tampon and get emergency help.',
      },
      {
        heading: 'Keeping clean',
        body: 'Washing the outside of your vulva with warm water is enough. The vagina cleans itself, so douches and scented products are not needed and can cause irritation.',
      },
    ],
    keyPoints: [
      'Choose whichever product feels comfortable.',
      'Never leave a tampon in for more than 8 hours.',
      'Warm water is all you need to stay clean.',
    ],
    quiz: [
      {
        prompt: 'What is the maximum time a tampon should be left in?',
        options: ['2 hours', '8 hours', '24 hours', 'Until the period ends'],
        correctIndex: 1,
        explanation: 'Change tampons every 4–8 hours to lower the risk of toxic shock syndrome.',
      },
      {
        prompt: 'Which of these is a warning sign of toxic shock syndrome?',
        options: ['Mild cramps', 'Sudden high fever and a rash', 'Feeling hungry', 'Light spotting'],
        correctIndex: 1,
        explanation: 'A sudden high fever, a sunburn-like rash, vomiting, or dizziness need emergency care.',
      },
      {
        prompt: 'How should you clean your vulva during your period?',
        options: ['Scented douche', 'Warm water', 'Antiseptic every hour', 'Perfume'],
        correctIndex: 1,
        explanation: 'Warm water is enough. Douching and scented products can upset your natural balance.',
      },
    ],
    sources: [SOURCES.nhsPeriods, SOURCES.nhsTss, SOURCES.kidsHealthMenstruation],
  },
  {
    slug: 'understanding-cramps',
    title: 'Understanding Period Pain',
    topic: 'menstrual_health',
    icon: 'HeartPulse',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 60,
    summary: 'Why cramps happen, what helps, and when pain is a reason to see a doctor.',
    sections: [
      {
        heading: 'Why cramps happen',
        body: 'During a period the uterus tightens (contracts) to push out its lining. Chemicals called prostaglandins trigger these contractions, and higher levels can mean stronger cramps.',
      },
      {
        heading: 'What can help',
        body: 'Heat on the belly or back, gentle exercise, rest, and pain relievers recommended by a parent, pharmacist, or doctor can all help. Many people find a combination works best.',
      },
      {
        heading: 'When to get checked',
        body: 'See a doctor if pain stops you going to school or doing things you enjoy, if usual remedies do not help, if pain is getting worse over time, or if you have pain when you are not on your period. Pain like this is not something you just have to put up with.',
      },
      {
        heading: 'Get help urgently if…',
        body: 'You faint, have a fever with belly pain, have sudden severe pain unlike usual cramps, or soak a pad or tampon every hour for more than two hours.',
      },
    ],
    keyPoints: [
      'Cramps are caused by the uterus contracting.',
      'Heat, movement, and approved pain relief can help.',
      "Pain that disrupts your life deserves a doctor's attention.",
    ],
    quiz: [
      {
        prompt: 'What causes period cramps?',
        options: ['The uterus contracting', 'Eating chocolate', 'Your bones growing', 'Nothing — they are imagined'],
        correctIndex: 0,
        explanation: 'Prostaglandins make the uterus contract to shed its lining, which causes cramps.',
      },
      {
        prompt: 'Which is a sign you should talk to a doctor about period pain?',
        options: ['Mild cramps on day 1', 'Pain that makes you miss school every month', 'Cramps that ease with a heat pack'],
        correctIndex: 1,
        explanation: 'Pain that regularly stops you doing normal things is worth checking.',
      },
      {
        prompt: 'Fainting during your period is…',
        options: ['Normal and nothing to worry about', 'A reason to get help urgently'],
        correctIndex: 1,
        explanation: 'Fainting can be a sign of significant blood loss or another problem — get help right away.',
      },
      {
        prompt: 'Which of these can ease cramps?',
        options: ['A heat pack', 'Skipping all water', 'Holding your breath', 'Staying completely still for days'],
        correctIndex: 0,
        explanation: 'Heat relaxes the muscles of the uterus. Gentle movement and staying hydrated help too.',
      },
    ],
    sources: [SOURCES.acogDysmenorrhea, SOURCES.nhsPeriodPain],
  },
  {
    slug: 'puberty-body-changes',
    title: 'Puberty & Body Changes',
    topic: 'puberty',
    icon: 'Sprout',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    summary: 'The physical and emotional changes of puberty, and why everyone has their own timeline.',
    sections: [
      {
        heading: 'What is puberty?',
        body: 'Puberty is when your body develops from a child\'s body to an adult\'s, guided by hormones. It usually starts between ages 8 and 13, and periods usually begin around 2–3 years after breast development starts.',
      },
      {
        heading: 'Common changes',
        body: 'Breast development, growth spurts, body hair, wider hips, oilier skin and acne, and vaginal discharge are all normal parts of puberty.',
      },
      {
        heading: 'Feelings change too',
        body: 'Changing hormones can affect moods and emotions. Talking to someone you trust, getting enough sleep, and moving your body can help. If low mood lasts for weeks, reach out to a trusted adult or doctor.',
      },
    ],
    keyPoints: [
      'Everyone goes through puberty on their own timeline.',
      'Clear or white vaginal discharge is normal.',
      'Mood changes are common — and help is available.',
    ],
    quiz: [
      {
        prompt: 'When do periods usually begin?',
        options: ['Before any other puberty changes', 'About 2–3 years after breast development starts', 'At exactly age 12 for everyone'],
        correctIndex: 1,
        explanation: 'Most people get their first period 2–3 years after breast development begins, often between ages 10 and 15.',
      },
      {
        prompt: 'Clear or white vaginal discharge during puberty is…',
        options: ['Usually normal', 'Always an infection'],
        correctIndex: 0,
        explanation: 'Discharge helps keep the vagina healthy. See a doctor if it smells bad, itches, or changes colour.',
      },
      {
        prompt: 'If low mood lasts for weeks, what is a good step?',
        options: ['Keep it to yourself', 'Talk to a trusted adult or doctor'],
        correctIndex: 1,
        explanation: 'You do not have to deal with it alone — talking to someone is a strong first step.',
      },
    ],
    sources: [SOURCES.kidsHealthPuberty, SOURCES.acogFirstPeriod],
  },
  {
    slug: 'consent-and-boundaries',
    title: 'Consent & Boundaries',
    topic: 'consent',
    icon: 'HandHeart',
    order: 5,
    estimatedMinutes: 6,
    xpReward: 60,
    summary: 'What consent really means, how to set boundaries, and how to respect other people\'s.',
    sections: [
      {
        heading: 'What is consent?',
        body: 'Consent means freely and clearly agreeing to something. It must be given without pressure, it can be withdrawn at any time, and agreeing to one thing does not mean agreeing to everything. Someone who is asleep, drunk, or high cannot give consent.',
      },
      {
        heading: 'Remember FRIES',
        body: 'Consent is Freely given, Reversible, Informed, Enthusiastic, and Specific. If any of those is missing, it is not consent.',
      },
      {
        heading: 'Your boundaries',
        body: 'You decide who touches your body and how. You can say no to hugs, photos, or messages that make you uncomfortable — with anyone, including people you know and love.',
      },
      {
        heading: 'Online, too',
        body: 'Consent applies to sharing photos and messages. Never share someone\'s private images, and you never have to send any. If someone pressures you, tell a trusted adult.',
      },
    ],
    keyPoints: [
      'Consent is freely given and can be taken back any time.',
      'Silence or "maybe" is not a yes.',
      'Your body, your boundaries — online and offline.',
    ],
    quiz: [
      {
        prompt: 'Can someone change their mind after saying yes?',
        options: ['No, a yes is final', 'Yes, consent can be withdrawn at any time'],
        correctIndex: 1,
        explanation: 'Consent is reversible. Anyone can stop at any time.',
      },
      {
        prompt: 'Someone stays silent when asked. That means…',
        options: ['They agreed', 'It is not consent'],
        correctIndex: 1,
        explanation: 'Consent is clear and enthusiastic. Silence, "maybe", or no answer is not a yes.',
      },
      {
        prompt: 'What does the "S" in FRIES stand for?',
        options: ['Silent', 'Specific', 'Strong', 'Sure, whatever'],
        correctIndex: 1,
        explanation: 'Specific: saying yes to one thing does not mean yes to anything else.',
      },
      {
        prompt: 'A friend asks you to forward a private photo of someone else. You should…',
        options: ['Forward it', 'Refuse and not share it'],
        correctIndex: 1,
        explanation: 'Sharing someone\'s private images without consent is harmful and can be illegal.',
      },
    ],
    sources: [SOURCES.ppConsent],
  },
  {
    slug: 'body-safety',
    title: 'Body Safety & Getting Help',
    topic: 'body_safety',
    icon: 'ShieldCheck',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 60,
    summary: 'Recognising unsafe situations, trusting your instincts, and who you can talk to.',
    sections: [
      {
        heading: 'Trust your feelings',
        body: 'If something feels wrong, it is OK to leave, say no, or ask for help — even if the other person is older, a relative, or someone in authority.',
      },
      {
        heading: 'Safe vs unsafe secrets',
        body: 'Surprises like birthday gifts are fine. Secrets about touching, photos, or that make you feel scared or confused are never OK to keep. It is never your fault.',
      },
      {
        heading: 'Who can help',
        body: 'Talk to a parent, carer, teacher, school counsellor, or doctor. In the US you can contact the Childhelp hotline (1-800-422-4453) or RAINN (1-800-656-4673). Elsewhere, search for your local child helpline. In an emergency, call your local emergency number.',
      },
    ],
    keyPoints: [
      'Unsafe secrets should always be told.',
      'It is never your fault if someone crosses your boundaries.',
      'Helplines are free and confidential.',
    ],
    quiz: [
      {
        prompt: 'Someone asks you to keep a secret about touching that made you uncomfortable. You should…',
        options: ['Keep the secret', 'Tell a trusted adult'],
        correctIndex: 1,
        explanation: 'Unsafe secrets should always be shared with someone you trust.',
      },
      {
        prompt: 'If someone you know crosses your boundaries, whose fault is it?',
        options: ['Yours', 'Never yours'],
        correctIndex: 1,
        explanation: 'The person who crosses a boundary is responsible — never the person it happened to.',
      },
      {
        prompt: 'Which of these is a safe person to talk to?',
        options: ['A school counsellor', 'A stranger online who asks for photos'],
        correctIndex: 0,
        explanation: 'Counsellors, teachers, doctors, and trusted family members can help.',
      },
    ],
    sources: [SOURCES.childhelp, SOURCES.rainn],
  },
];
