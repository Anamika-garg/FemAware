import {
  Activity,
  BookOpen,
  CalendarHeart,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LineChart,
  NotebookPen,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

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
  { to: '/resources', label: 'Learning library', icon: BookOpen },
];

export const seniorNavSections = [
  { label: 'Your care', items: seniorPrimaryNav },
  { label: 'Understand', items: seniorUnderstandNav },
  { label: 'Learn', items: seniorSupportNav },
  { label: 'Account', items: accountNav },
];

export const getNavSections = (lifeStage) =>
  lifeStage === 'senior' ? seniorNavSections : navSections;

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
  { to: '/doctor-report', label: 'Doctor report', icon: FileText, description: 'Prepare a clinical summary' },
  { to: '/late-period', label: 'Late period guide', icon: HeartHandshake, description: 'Step-by-step assessment' },
  { to: '/pcos', label: 'PCOS awareness', icon: Activity, description: 'Patterns and education' },
  { to: '/resources', label: 'Resource library', icon: BookOpen, description: 'Articles and guides' },
  { to: '/privacy', label: 'Privacy & data', icon: ShieldCheck, description: 'Export or delete your data' },
];

export const seniorMoreLinks = [
  { to: '/resources', label: 'Learning library', icon: BookOpen, description: 'Reviewed later-life health guides' },
  { to: '/privacy', label: 'Privacy & data', icon: ShieldCheck, description: 'Export or delete your data' },
];

export const getMobileTabs = (lifeStage) =>
  lifeStage === 'senior' ? seniorMobileTabs : mobileTabs;

export const getMoreLinks = (lifeStage) =>
  lifeStage === 'senior' ? seniorMoreLinks : moreLinks;

export const pageMeta = {
  '/dashboard': { title: 'Overview', eyebrow: 'Your health space' },
  '/cycle': { title: 'Cycle tracker', eyebrow: 'Periods & predictions' },
  '/symptoms': { title: 'Symptom journal', eyebrow: 'Daily check-in' },
  '/insights': { title: 'Health insights', eyebrow: 'Patterns over time' },
  '/doctor-report': { title: 'Doctor report', eyebrow: 'Visit preparation' },
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
  '/resources': { title: 'Learning library', eyebrow: 'Reviewed guidance' },
  '/privacy': { title: 'Privacy & data', eyebrow: 'Your information, your control' },
};

export const getPageMeta = (pathname, lifeStage) =>
  (lifeStage === 'senior' ? seniorPageMeta[pathname] : pageMeta[pathname]) ||
  pageMeta[pathname] || {
    title: 'CycleSense',
    eyebrow: 'Your health space',
  };

export const PhaseIcon = Sparkles;
