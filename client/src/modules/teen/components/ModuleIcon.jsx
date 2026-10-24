import { BookOpen, Droplets, HandHeart, HeartPulse, RefreshCw, ShieldCheck, Sprout } from 'lucide-react';

const ICONS = { BookOpen, Droplets, HandHeart, HeartPulse, RefreshCw, ShieldCheck, Sprout };

/** Lesson icons are stored by name in the database; unknown names fall back to a book. */
export function ModuleIcon({ name, ...props }) {
  const Icon = ICONS[name] || BookOpen;
  return <Icon aria-hidden {...props} />;
}
