// The public learning library: foundation articles plus the adult and senior
// library content, normalised into one list with a life stage and topic.
import { FOUNDATION_ARTICLES } from './foundations';
import { RESOURCES } from './resources';
import { SENIOR_ARTICLES } from './seniorResources';

export const STAGE_FILTERS = [
  { value: 'all', label: 'All stages' },
  { value: 'teen', label: 'Teens' },
  { value: 'adult', label: 'Adult women' },
  { value: 'senior', label: 'Senior women' },
];

export const STAGE_LABELS = {
  everyone: 'Every stage',
  teen: 'Teens',
  adult: 'Adult women',
  senior: 'Senior women',
};

const TOPIC_FOR_CATEGORY = {
  Contraception: 'Contraception',
  Fertility: 'Fertility',
  'Sexual Health': 'Sexual health',
  'Pregnancy & Postpartum': 'Pregnancy & postpartum',
  Perimenopause: 'Menopause & midlife',
  Postmenopause: 'Menopause & midlife',
  Osteoporosis: 'Bone & heart health',
  'Cardiovascular Health': 'Bone & heart health',
  'Intimate Health': 'Intimate & urinary health',
  'Healthy Aging': 'Healthy ageing',
};

export const TOPICS = [
  'Periods & cycles',
  'Puberty & growing up',
  'Body safety & consent',
  'Hormones & conditions',
  'Contraception',
  'Fertility',
  'Sexual health',
  'Pregnancy & postpartum',
  'Menopause & midlife',
  'Bone & heart health',
  'Intimate & urinary health',
  'Healthy ageing',
];

const withTopic = (article, stage) => ({
  ...article,
  stage,
  topic: TOPIC_FOR_CATEGORY[article.category] || article.category,
});

export const LIBRARY = [
  ...FOUNDATION_ARTICLES.map((article) => ({ ...article, topic: article.category, reviewed: false })),
  ...RESOURCES.map((article) => withTopic(article, 'adult')),
  ...SENIOR_ARTICLES.map((article) => withTopic(article, 'senior')),
];

export const getArticle = (id) => LIBRARY.find((article) => article.id === id) || null;

export const matchesStage = (article, stage) =>
  stage === 'all' || article.stage === stage || article.stage === 'everyone';

// Articles a reader has finished, kept in this browser only.
const READ_KEY = 'femaware_library_read';

export const getReadArticles = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export const setArticleRead = (id, read) => {
  const current = new Set(getReadArticles());
  if (read) current.add(id);
  else current.delete(id);
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...current]));
  } catch {
    // Progress is a convenience. Without storage the reader still gets the article.
  }
  return [...current];
};
