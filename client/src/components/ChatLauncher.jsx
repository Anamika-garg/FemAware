import { Link, useLocation } from 'react-router-dom';
import { MessageCircleHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFallbackGuide, resolveChatStage } from '../modules/chat/chatConfig';
import { cn } from '../lib/utils';

/**
 * A persistent shortcut to the health guide. It sits above the mobile tab bar
 * and disappears on the chat page itself so the action is never redundant.
 */
const ChatLauncher = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (pathname === '/chat' || pathname.startsWith('/chat/')) return null;

  const guide = getFallbackGuide(resolveChatStage(user?.lifeStage));

  return (
    <Link
      to="/chat"
      aria-label={`Open a private chat with ${guide.guideName}`}
      title={`Ask ${guide.guideName}`}
      className={cn(
        'fixed bottom-24 right-4 z-30 inline-flex min-h-[56px] items-center gap-2 rounded-full bg-deep-rose px-4 text-sm font-semibold text-white shadow-lift ring-4 ring-white/80 transition-all hover:-translate-y-0.5 hover:bg-[#A3134C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-glow sm:right-6 lg:bottom-8 lg:right-8'
      )}
    >
      <MessageCircleHeart className="h-6 w-6 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">Ask {guide.guideName}</span>
    </Link>
  );
};

export default ChatLauncher;
