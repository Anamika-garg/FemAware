import {
  Activity,
  BookHeart,
  BookOpen,
  CalendarHeart,
  ClipboardList,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LineChart,
  MessageCircleHeart,
  NotebookPen,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

// Teen accounts may be stored as 'teen' or the older 'adolescent' value.
export const isTeenStage = (lifeStage) => lifeStage === 'teen' || lifeStage === 'adolescent';

export const primaryNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/cycle', label: 'Cycle tracker', icon: CalendarHeart },
  { to: '/symptoms', label: 'Symptom journal', icon: NotebookPen },
];

export const understandNav = [
  { to: '/insights', label: 'Health insights', icon: LineChart },
  { to: '/doctor-report', label: 'Doctor report', icon: FileText },
];

export const supportNav = [
  { to: '/chat', label: 'Ask Ava', icon: MessageCircleHeart },
  { to: '/late-period', label: 'Late period guide', icon: HeartHandshake },
  { to: '/pcos', label: 'PCOS awareness', icon: Activity },
  { to: '/resources', label: 'Resource library', icon: BookOpen },
];

export const accountNav = [
  { to: '/privacy', label: 'Privacy & data', icon: ShieldCheck },
];

export const allNav = [
  ...primaryNav,
  ...understandNav,
  ...supportNav,
  ...accountNav,
];

export const navSections = [
  { label: 'Your space', items: primaryNav },
  { label: 'Understand', items: understandNav },
  { label: 'Support', items: supportNav },
  { label: 'Account', items: accountNav },
];

// Senior care replaces cycle-specific links with comfort, prevention and
// appointment preparation while keeping the same shared shell.
export const seniorPrimaryNav = [
  { to: '/dashboard', label: 'Care overview', icon: LayoutDashboard, end: true },
  { to: '/symptoms', label: 'Daily check-in', icon: NotebookPen },
];

export const seniorUnderstandNav = [
  { to: '/insights', label: 'Health trends', icon: LineChart },
  { to: '/doctor-report', label: 'Visit preparation', icon: FileText },
];

export const seniorSupportNav = [
  { to: '/chat', label: 'Ask Mira', icon: MessageCircleHeart },
  { to: '/resources', label: 'Learning library', icon: BookOpen },
];

export const seniorNavSections = [
  { label: 'Your care', items: seniorPrimaryNav },
  { label: 'Understand', items: seniorUnderstandNav },
  { label: 'Learn', items: seniorSupportNav },
  { label: 'Account', items: accountNav },
];

// The teen space adds lessons, a guided symptom check and body-safety help.
export const teenPrimaryNav = [
  { to: '/dashboard', label: 'My space', icon: LayoutDashboard, end: true },
  { to: '/cycle', label: 'Period calendar', icon: CalendarHeart },
  { to: '/symptoms', label: 'Symptom diary', icon: NotebookPen },
];

export const teenUnderstandNav = [
  { to: '/learn', label: 'Learn & quizzes', icon: BookHeart },
  { to: '/check', label: 'Symptom check', icon: ClipboardList },
  { to: '/insights', label: 'My insights', icon: LineChart },
];

export const teenSupportNav = [
  { to: '/chat', label: 'Ask Bloom', icon: MessageCircleHeart },
  { to: '/safety', label: 'Body safety & help', icon: HeartHandshake },
  { to: '/disclaimer', label: 'Health disclaimer', icon: ShieldAlert },
];

export const teenNavSections = [
  { label: 'Your space', items: teenPrimaryNav },
  { label: 'Learn & understand', items: teenUnderstandNav },
  { label: 'Support', items: teenSupportNav },
  { label: 'Account', items: accountNav },
];

export const getNavSections = (lifeStage) => {
  if (lifeStage === 'senior') return seniorNavSections;
  if (isTeenStage(lifeStage)) return teenNavSections;
  return navSections;
};

export const mobileTabs = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/cycle', label: 'Cycle', icon: CalendarHeart },
  { to: '/symptoms', label: 'Log', icon: NotebookPen, center: true },
  { to: '/insights', label: 'Insights', icon: LineChart },
];

export const seniorMobileTabs = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/symptoms', label: 'Check-in', icon: NotebookPen, center: true },
  { to: '/insights', label: 'Trends', icon: LineChart },
  { to: '/doctor-report', label: 'Visit', icon: FileText },
];

export const moreLinks = [
  { to: '/chat', label: 'Ask Ava', icon: MessageCircleHeart, description: 'Private health questions, answered' },
  { to: '/doctor-report', label: 'Doctor report', icon: FileText, description: 'Prepare a clinical summary' },
  { to: '/late-period', label: 'Late period guide', icon: HeartHandshake, description: 'Step-by-step assessment' },
  { to: '/pcos', label: 'PCOS awareness', icon: Activity, description: 'Patterns and education' },
  { to: '/resources', label: 'Resource library', icon: BookOpen, description: 'Articles and guides' },
  { to: '/privacy', label: 'Privacy & data', icon: ShieldCheck, description: 'Export or delete your data' },
];

export const seniorMoreLinks = [
  { to: '/chat', label: 'Ask Mira', icon: MessageCircleHeart, description: 'Private health questions, answered' },
  { to: '/resources', label: 'Learning library', icon: BookOpen, description: 'Reviewed later-life health guides' },
  { to: '/privacy', label: 'Privacy & data', icon: ShieldCheck, description: 'Export or delete your data' },
];

export const teenMobileTabs = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/cycle', label: 'Calendar', icon: CalendarHeart },
  { to: '/symptoms', label: 'Log', icon: NotebookPen, center: true },
  { to: '/learn', label: 'Learn', icon: BookHeart },
];

export const teenMoreLinks = [
  { to: '/chat', label: 'Ask Bloom', icon: MessageCircleHeart, description: 'A private place to ask about your body' },
  { to: '/check', label: 'Symptom check', icon: ClipboardList, description: 'Clear next steps, not a diagnosis' },
  { to: '/insights', label: 'My insights', icon: LineChart, description: 'Patterns from your logs' },
  { to: '/safety', label: 'Body safety & help', icon: HeartHandshake, description: 'Consent, safety and who to talk to' },
  { to: '/privacy', label: 'Privacy & data', icon: ShieldCheck, description: 'Export or delete your data' },
];

export const getMobileTabs = (lifeStage) => {
  if (lifeStage === 'senior') return seniorMobileTabs;
  if (isTeenStage(lifeStage)) return teenMobileTabs;
  return mobileTabs;
};

export const getMoreLinks = (lifeStage) => {
  if (lifeStage === 'senior') return seniorMoreLinks;
  if (isTeenStage(lifeStage)) return teenMoreLinks;
  return moreLinks;
};

export const pageMeta = {
  '/dashboard': { title: 'Overview', eyebrow: 'Your health space' },
  '/cycle': { title: 'Cycle tracker', eyebrow: 'Periods & predictions' },
  '/symptoms': { title: 'Symptom journal', eyebrow: 'Daily check-in' },
  '/insights': { title: 'Health insights', eyebrow: 'Patterns over time' },
  '/doctor-report': { title: 'Doctor report', eyebrow: 'Visit preparation' },
  '/chat': { title: 'Ask Ava', eyebrow: 'Private health chat' },
  '/late-period': { title: 'Late period guide', eyebrow: 'Guided assessment' },
  '/pcos': { title: 'PCOS awareness', eyebrow: 'Understanding patterns' },
  '/resources': { title: 'Resource library', eyebrow: 'Learn at your pace' },
  '/privacy': { title: 'Privacy & data', eyebrow: 'Your information, your control' },
};

export const seniorPageMeta = {
  '/dashboard': { title: 'Care overview', eyebrow: 'Senior care & wellbeing' },
  '/symptoms': { title: 'Daily check-in', eyebrow: 'Comfort & symptoms' },
  '/insights': { title: 'Health trends', eyebrow: 'Patterns at a glance' },
  '/doctor-report': { title: 'Visit preparation', eyebrow: 'Appointment planner' },
  '/chat': { title: 'Ask Mira', eyebrow: 'Private health chat' },
  '/resources': { title: 'Learning library', eyebrow: 'Reviewed guidance' },
  '/privacy': { title: 'Privacy & data', eyebrow: 'Your information, your control' },
};

export const teenPageMeta = {
  '/dashboard': { title: 'My space', eyebrow: 'Teen space' },
  '/cycle': { title: 'Period calendar', eyebrow: 'Track your cycle' },
  '/symptoms': { title: 'Symptom diary', eyebrow: 'How you feel' },
  '/learn': { title: 'Learn & quizzes', eyebrow: 'Earn XP and badges' },
  '/check': { title: 'Symptom check', eyebrow: 'Guided next steps' },
  '/insights': { title: 'My insights', eyebrow: 'Patterns over time' },
  '/safety': { title: 'Body safety & help', eyebrow: 'You deserve to feel safe' },
  '/chat': { title: 'Ask Bloom', eyebrow: 'A private place to ask' },
  '/disclaimer': { title: 'Health disclaimer', eyebrow: 'What FemAware is and is not' },
  '/privacy': { title: 'Privacy & data', eyebrow: 'Your information, your control' },
};

const stageMeta = (lifeStage) => {
  if (lifeStage === 'senior') return seniorPageMeta;
  if (isTeenStage(lifeStage)) return teenPageMeta;
  return pageMeta;
};

export const getPageMeta = (pathname, lifeStage) => {
  const meta = stageMeta(lifeStage);
  // Lesson pages share the Learn heading.
  const path = pathname.startsWith('/learn/') ? '/learn' : pathname;
  return (
    meta[path] ||
    pageMeta[path] ||
    teenPageMeta[path] || {
      title: 'FemAware',
      eyebrow: 'Your health space',
    }
  );
};

export const PhaseIcon = Sparkles;
