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

export const PhaseIcon = Sparkles;
