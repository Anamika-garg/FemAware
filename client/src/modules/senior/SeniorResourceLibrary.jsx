import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Droplets,
  HeartPulse,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/States';
import { cn } from '../../lib/utils';
import SeniorPageShell from './SeniorPageShell';

const CATEGORIES = [
  'All',
  'Postmenopause',
  'Osteoporosis',
  'Cardiovascular Health',
  'Intimate Health',
  'Healthy Aging',
];

const CATEGORY_STYLES = {
  Postmenopause: { icon: Sparkles, tone: 'bg-soft-petal text-deep-rose' },
  Osteoporosis: { icon: ShieldCheck, tone: 'bg-blush-pink/70 text-deep-rose' },
  'Cardiovascular Health': { icon: HeartPulse, tone: 'bg-[#FFE4EC] text-deep-rose' },
  'Intimate Health': { icon: Droplets, tone: 'bg-rose-mist text-deep-rose' },
  'Healthy Aging': { icon: Activity, tone: 'bg-soft-petal text-deep-rose' },
};

const ARTICLES = [
  {
    id: 'understanding-postmenopause',
    category: 'Postmenopause',
    title: 'Understanding postmenopause',
    summary:
      'What changes after menopause, which symptoms can persist, and how to build a calm plan for preventive care.',
    readTime: '6 min',
    tags: ['postmenopause', 'hot flashes', 'sleep', 'preventive care'],
    intro:
      'Postmenopause begins after you have gone 12 months without a period and no other cause is found. It is a normal stage of life, but symptoms such as hot flashes, sleep changes and vaginal dryness can continue. Knowing what is expected — and what deserves a conversation — helps you feel more in control.',
    sections: [
      {
        heading: 'What may continue after menopause',
        paragraphs: [
          'Hot flashes and night sweats can persist for years, although they often become less frequent over time. Sleep can be affected by night sweats, needing the toilet, or changes in mood.',
          'Vaginal dryness, discomfort during sex, and urinary urgency are common because oestrogen levels are lower. These symptoms are treatable and worth raising, even if they feel embarrassing to mention.',
        ],
        bullets: [
          'Hot flashes or night sweats that interrupt sleep or daily life',
          'Vaginal dryness, soreness or discomfort during intimacy',
          'Needing to pass urine urgently, more often, or waking at night',
          'Joint stiffness, muscle aches or changes in energy',
          'Memory or concentration changes that affect daily tasks',
        ],
      },
      {
        heading: 'A simple preventive care rhythm',
        paragraphs: [
          'Later life is a good time to keep routine checks up to date. Your clinician can advise which screenings apply to you based on your age, family history and previous results.',
        ],
        bullets: [
          'Blood pressure and cholesterol checks',
          'Bone density (DEXA) scan when advised',
          'Breast screening and cervical screening according to your local programme',
          'Bowel screening when offered',
          'Vision, hearing and dental reviews',
          'Vaccinations recommended for your age and health',
        ],
      },
      {
        heading: 'What to bring to an appointment',
        paragraphs: [
          'A short list is enough: your main symptoms, how often they happen, what helps, your medicines, and the questions you most want answered. The CycleSense visit planner can help you put this together.',
        ],
      },
    ],
    callout: {
      tone: 'warn',
      title: 'Bleeding after menopause is not expected',
      text: 'Any vaginal bleeding after 12 months without a period should be reviewed promptly by a clinician, even if it is light or stops on its own. It is not a diagnosis — it is a reason to check.',
    },
  },
  {
    id: 'bone-health-osteoporosis',
    category: 'Osteoporosis',
    title: 'Bone health and osteoporosis',
    summary:
      'How bone density changes, what a DEXA scan shows, and the small daily habits that protect strength and reduce falls.',
    readTime: '7 min',
    tags: ['bone density', 'DEXA', 'calcium', 'vitamin D', 'falls'],
    intro:
      'Bone strength naturally changes with age, especially after menopause. Osteoporosis means bones have become thinner and more likely to break. It often has no symptoms until a fracture happens, which is why preventive checks and steady strength work matter.',
    sections: [
      {
        heading: 'What a DEXA scan measures',
        paragraphs: [
          'A dual-energy X-ray absorptiometry (DEXA) scan is a quick, painless scan that measures bone mineral density, usually at the hip and lower spine. It produces a T-score comparing your bone density with a healthy young adult.',
          'Your clinician uses the result alongside your age, fracture history, family history and medicines to decide whether treatment or monitoring is appropriate. A scan result alone does not tell the whole story.',
        ],
        bullets: [
          'Ask whether a DEXA scan is due for you, and how often it should be repeated',
          'Bring previous scan results if you have them',
          'Mention any fracture after a minor fall',
          'Review medicines that can affect bone health with your clinician',
        ],
      },
      {
        heading: 'Calcium and vitamin D',
        paragraphs: [
          'Calcium supports bone structure, and vitamin D helps the body absorb it. Food sources are usually the first choice, with supplements used when intake or levels are low.',
          'Recommended amounts vary by country and by individual health needs. Ask your clinician or pharmacist before starting a new supplement, especially if you take other medicines or have kidney problems.',
        ],
        bullets: [
          'Calcium-rich foods: milk, yoghurt, cheese, fortified plant drinks, tofu, tinned fish with bones, leafy greens',
          'Vitamin D: safe sunlight exposure, oily fish, eggs, fortified foods',
          'Avoid smoking, and keep alcohol within recommended limits',
          'Weight-bearing activity such as walking supports bone strength',
        ],
      },
      {
        heading: 'Strength, balance and fall prevention',
        paragraphs: [
          'Muscle strength and balance reduce the risk of falls, which are a common cause of fractures. Two short sessions a week can make a meaningful difference.',
        ],
        bullets: [
          'Practise sit-to-stand, step-ups or light resistance bands',
          'Try balance work near a stable support, such as standing on one leg',
          'Keep pathways clear, use good lighting and remove loose rugs',
          'Review footwear and vision, and ask about a falls assessment if you have fallen',
          'Tell your clinician about dizziness or any fall, even if you were not hurt',
        ],
      },
    ],
    callout: {
      tone: 'info',
      title: 'A fracture after a minor fall is worth investigating',
      text: 'If you break a bone after a fall from standing height or lower, ask your clinician whether your bone health should be assessed.',
    },
  },
  {
    id: 'cardiovascular-wellness',
    category: 'Cardiovascular Health',
    title: 'Cardiovascular wellness after menopause',
    summary:
      'Why heart health deserves attention in later life, the numbers worth knowing, and a gentle weekly activity check-in.',
    readTime: '6 min',
    tags: ['heart', 'blood pressure', 'cholesterol', 'activity', 'risk factors'],
    intro:
      'After menopause, the risk of heart disease and stroke gradually rises. Most of the risk comes from factors you can influence: blood pressure, cholesterol, activity, smoking, sleep and weight. Understanding your own numbers makes a preventive conversation much easier.',
    sections: [
      {
        heading: 'Know your numbers',
        paragraphs: [
          'Blood pressure and cholesterol are silent most of the time. A routine check can reveal a problem before symptoms appear.',
        ],
        bullets: [
          'Blood pressure — ask what your reading was and what range is right for you',
          'Cholesterol and blood sugar — checked when advised',
          'Waist measurement and weight trends over time',
          'Family history of early heart disease or stroke',
          'Sleep quality, stress and alcohol intake',
        ],
      },
      {
        heading: 'Movement that fits your body',
        paragraphs: [
          'You do not need intense exercise to benefit. Regular moderate movement, strength work and fewer long sitting periods all support heart health. Build up gradually and choose something you enjoy.',
        ],
        bullets: [
          'Aim for steady movement on most days — a brisk walk counts',
          'Add strength or resistance work once or twice a week',
          'Break up long periods of sitting with a short walk',
          'Stop and seek advice if you develop chest pain, unusual breathlessness or dizziness',
        ],
      },
      {
        heading: 'When to seek urgent help',
        paragraphs: [
          'Heart symptoms can look different in women. Do not wait to see whether they pass if you are worried.',
        ],
        bullets: [
          'Chest pain, pressure or tightness',
          'Pain spreading to the arm, jaw, neck or back',
          'Sudden shortness of breath, cold sweat or nausea',
          'Fainting, or a racing or irregular heartbeat with feeling unwell',
        ],
      },
    ],
    callout: {
      tone: 'danger',
      title: 'Call emergency services for possible heart attack symptoms',
      text: 'If you have chest pain or pressure, severe breathlessness, or feel faint and unwell, seek emergency help immediately. Do not drive yourself.',
    },
    activityCheckin: true,
  },
  {
    id: 'intimate-urinary-health',
    category: 'Intimate Health',
    title: 'Intimate and urinary health navigator',
    summary:
      'A private, practical guide to pelvic floor health, dryness, leakage and urinary urgency — and what can help.',
    readTime: '7 min',
    tags: ['pelvic floor', 'incontinence', 'dryness', 'bladder', 'intimacy'],
    intro:
      'Changes to intimate and urinary health are common after menopause, and they are treatable. Many people delay asking for help because of embarrassment. A clinician has these conversations every day — you are not expected to manage alone.',
    sections: [
      {
        heading: 'Vaginal dryness and comfort',
        paragraphs: [
          'Lower oestrogen can make the vaginal tissues thinner and less lubricated. This can cause soreness, irritation, or discomfort during sex or everyday activity.',
          'Moisturisers used regularly can help dryness, and lubricants can reduce friction during intimacy. Local oestrogen treatments are also available for some people; your clinician can advise whether they are suitable for you.',
        ],
        bullets: [
          'Choose a vaginal moisturiser for regular comfort and a lubricant for intimacy',
          'Avoid strongly scented soaps or washes around the vulva',
          'Mention pain or bleeding during sex — it should not be dismissed',
          'Ask about local treatments if dryness affects daily life',
        ],
      },
      {
        heading: 'Pelvic floor and leakage',
        paragraphs: [
          'The pelvic floor muscles support the bladder, bowel and uterus. Like other muscles, they can be trained. A pelvic health physiotherapist can check your technique so you are exercising the right muscles.',
        ],
        bullets: [
          'Pelvic floor exercises are most effective when taught and reviewed',
          'Bladder training and fluid timing can help urgency for some people',
          'Avoid cutting out fluids completely — dehydration can worsen urgency',
          'Ask about constipation, which puts extra pressure on the pelvic floor',
          'Pads and protective products are a practical option while you get help',
        ],
      },
      {
        heading: 'Urinary urgency and infection',
        paragraphs: [
          'Needing to go suddenly, going more often, or waking at night can have several causes. Your clinician may check for infection and review medicines, caffeine and pelvic floor function.',
        ],
        bullets: [
          'Burning, fever, back pain or blood in urine needs prompt assessment',
          'Recurrent urinary infections deserve a review, not repeated guesswork',
          'Some medicines, including diuretics, affect bladder habits',
          'Keep a short bladder diary if symptoms are frequent',
        ],
      },
    ],
    callout: {
      tone: 'info',
      title: 'You can ask for a private conversation',
      text: 'You are allowed to request a clinician you feel comfortable with, or to bring a trusted person. You do not have to explain everything at once.',
    },
  },
  {
    id: 'healthy-aging',
    category: 'Healthy Aging',
    title: 'Healthy aging: sleep, strength and steady habits',
    summary:
      'Practical ways to protect sleep, strength, mood and independence — without turning health into a full-time job.',
    readTime: '5 min',
    tags: ['healthy aging', 'sleep', 'strength', 'balance', 'mood', 'independence'],
    intro:
      'Healthy aging is built from ordinary habits repeated gently over time. It is not about doing everything perfectly. Sleep, movement, connection and preventive checks are the foundations most worth protecting.',
    sections: [
      {
        heading: 'Protect your sleep',
        paragraphs: [
          'Sleep changes with age, and night sweats or bladder urgency can make it harder. A consistent routine helps your body know when to wind down.',
        ],
        bullets: [
          'Keep a regular wake time, even after a poor night',
          'Make the bedroom cool, dark and quiet',
          'Limit caffeine late in the day and alcohol close to bedtime',
          'Keep water nearby if night sweats wake you',
          'Mention persistent insomnia or loud snoring to your clinician',
        ],
      },
      {
        heading: 'Stay strong and steady',
        paragraphs: [
          'Strength and balance are closely linked to independence. Small amounts of practice, done regularly, are more useful than occasional intense sessions.',
        ],
        bullets: [
          'Stand up from a chair several times while the kettle boils',
          'Walk on most days, even for ten minutes',
          'Practise balance near a stable surface',
          'Include protein at meals to support muscle',
          'Ask about a physiotherapy or falls prevention programme if you feel unsteady',
        ],
      },
      {
        heading: 'Connection and mood',
        paragraphs: [
          'Social connection is part of health. Low mood, anxiety or loss of interest are not simply a normal part of aging, and talking therapies or other support can help.',
        ],
        bullets: [
          'Keep in touch with one or two people you trust',
          'Plan something to look forward to each week',
          'Tell your clinician if low mood lasts more than a couple of weeks',
          'Ask for help with grief, caring responsibilities or isolation',
        ],
      },
    ],
    callout: {
      tone: 'info',
      title: 'Prevention is a conversation, not a checklist',
      text: 'Ask your clinician which screenings and vaccinations are right for you. Recommendations differ by country, age and personal history.',
    },
  },
];

const Callout = ({ tone, title, text }) => {
  const styles = {
    warn: 'border-[#E9B27A] bg-[#FFF7EC] text-[#8A4510]',
    danger: 'border-deep-rose/40 bg-rose-mist text-deep-rose',
    info: 'border-blush-pink bg-soft-petal/40 text-deep-rose',
  };
  return (
    <div className={cn('rounded-2xl border-2 p-4', styles[tone] || styles.info)}>
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-base font-bold">{title}</p>
          <p className="mt-1 text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
};

const ActivityCheckin = () => {
  const [checked, setChecked] = useState([]);
  const items = [
    'I moved for at least 20 minutes on most days this week',
    'I did some strength or balance work this week',
    'I know my most recent blood pressure reading',
    'I have had cholesterol checked when advised',
    'I do not smoke, or I have asked for help to stop',
    'I know the signs of a heart attack and when to call for help',
  ];

  const toggle = (item) => {
    setChecked((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );
  };

  return (
    <div className="rounded-3xl border-2 border-blush-pink bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft-petal text-deep-rose">
          <HeartPulse className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h4 className="font-display text-lg font-semibold text-deep-rose">
            My weekly heart check-in
          </h4>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">
            A private reflection to bring to your next appointment. Nothing is saved or sent.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const active = checked.includes(item);
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(item)}
              className={cn(
                'flex min-h-[52px] w-full items-start gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-sm font-semibold transition-colors',
                active
                  ? 'border-deep-rose bg-rose-mist text-deep-rose'
                  : 'border-blush-pink bg-white text-ink hover:border-pink-glow hover:bg-soft-petal/40'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2',
                  active ? 'border-deep-rose bg-deep-rose text-white' : 'border-blush-pink bg-white'
                )}
                aria-hidden="true"
              >
                {active ? <Check className="h-4 w-4" /> : null}
              </span>
              <span className="leading-relaxed">{item}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 rounded-2xl bg-rose-mist/70 px-4 py-3 text-sm leading-relaxed text-muted">
        {checked.length} of {items.length} reflections checked. This is not a risk score. Use it to
        notice what you would like to discuss.
      </p>
    </div>
  );
};

const SeniorResourceLibrary = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ARTICLES.filter((article) => {
      const matchesCategory = category === 'All' || article.category === category;
      if (!matchesCategory) return false;
      if (!term) return true;
      const haystack = [article.title, article.summary, article.category, ...article.tags]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [query, category]);

  return (
    <SeniorPageShell>
      <PageHeader
        eyebrow="Learning library"
        title={`Reviewed guidance, ${firstName}`}
        description="Clear, calm articles on later-life health. Read at your own pace, and bring anything useful to your next appointment."
      />

      <section className="rounded-3xl border-2 border-blush-pink/70 bg-white p-4 sm:p-5">
        <label htmlFor="senior-resource-search" className="text-base font-bold text-ink">
          Search the library
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="senior-resource-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “bone density”, “sleep” or “bladder”"
            className="senior-input !pl-12 !pr-12"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl text-muted hover:bg-rose-mist hover:text-deep-rose"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
          {CATEGORIES.map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item)}
                className={cn('senior-choice min-h-[48px] px-4 text-base', active && 'senior-choice-active')}
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-muted">
          {filtered.length} guide{filtered.length === 1 ? '' : 's'}
          {category !== 'All' ? ` in ${category}` : ''}
          {query ? ` matching “${query.trim()}”` : ''}
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-deep-rose">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Reviewed senior health information
        </span>
      </div>

      {filtered.length ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article) => {
            const style = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.Postmenopause;
            const Icon = style.icon;
            return (
              <li key={article.id}>
                <article className="flex h-full flex-col rounded-3xl border-2 border-white/90 bg-white/95 p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-pink-glow/50 hover:shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn('grid h-12 w-12 place-items-center rounded-2xl', style.tone)}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-rose-mist px-3 py-1 text-xs font-bold text-deep-rose">
                      {article.readTime}
                    </span>
                  </div>

                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-deep-rose/60">
                    {article.category}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold leading-snug text-deep-rose">
                    {article.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{article.summary}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-rose-mist/80 px-2.5 py-1 text-[11px] font-semibold text-deep-rose/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveArticle(article)}
                    className="senior-button mt-4 w-full border-2 border-blush-pink bg-white text-deep-rose hover:border-deep-rose hover:bg-soft-petal"
                    aria-label={`Read ${article.title}`}
                  >
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                    Read guide
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={Search}
          title="No guides match that search"
          description="Try a broader word, or choose “All” to see every guide in the library."
          action={
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('All');
              }}
              className="senior-button bg-deep-rose text-white hover:bg-[#a81450]"
            >
              Show all guides
            </button>
          }
          className="border-2"
        />
      )}

      <section className="rounded-3xl border-2 border-blush-pink/70 bg-soft-petal/40 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-semibold text-deep-rose">
              Information, not diagnosis
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              These guides offer general education and do not replace personalised medical advice.
              Recommendations for screening and treatment vary by country and individual history.
              If you have a symptom that worries you, contact your clinician. For urgent symptoms,
              seek emergency care.
            </p>
          </div>
        </div>
      </section>

      <Modal
        open={Boolean(activeArticle)}
        onClose={() => setActiveArticle(null)}
        title={activeArticle?.title}
        description={
          activeArticle ? `${activeArticle.category} · ${activeArticle.readTime} read` : undefined
        }
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="senior-button bg-deep-rose text-white hover:bg-[#a81450]"
            >
              Back to the library
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        }
      >
        {activeArticle ? (
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-ink">{activeArticle.intro}</p>

            {activeArticle.callout &&
            ['warn', 'danger'].includes(activeArticle.callout.tone) ? (
              <Callout {...activeArticle.callout} />
            ) : null}

            {activeArticle.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="font-display text-lg font-semibold text-deep-rose">
                  {section.heading}
                </h3>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-2 text-base leading-relaxed text-ink">
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-base leading-relaxed text-ink">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-deep-rose" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {activeArticle.activityCheckin ? <ActivityCheckin /> : null}

            {activeArticle.callout && activeArticle.callout.tone === 'info' ? (
              <Callout {...activeArticle.callout} />
            ) : null}

            <p className="rounded-2xl bg-rose-mist/80 px-4 py-3 text-sm leading-relaxed text-muted">
              Reviewed by the CycleSense clinical content team. Last reviewed this year. This guide
              is general education, not personalised medical advice.
            </p>
          </div>
        ) : null}
      </Modal>
    </SeniorPageShell>
  );
};

export default SeniorResourceLibrary;
