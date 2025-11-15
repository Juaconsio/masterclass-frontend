import {
  Home,
  Info,
  BookOpen,
  Calendar,
  Mail,
  LogIn,
  UserPlus,
  LockKeyhole,
  Menu,
  Target,
  Mic,
  BookOpenText,
  Users,
  Handshake,
  MessageSquareWarning,
  RefreshCw,
  AtSign,
  MessageCircle,
  Instagram,
  type LucideIcon,
} from 'lucide-react';

// Map MDI icon names to Lucide React icons
export const iconMap: Record<string, LucideIcon> = {
  'mdi:home': Home,
  'mdi:information': Info,
  'mdi:book': BookOpen,
  'mdi:calendar': Calendar,
  'mdi:contact-mail': Mail,
  'mdi:sign-in-variant': LogIn,
  'mdi:login': LogIn,
  'mdi:account-plus': UserPlus,
  'mdi:lock-reset': LockKeyhole,
  'mdi:menu': Menu,
  'mdi:target-arrow': Target,
  'mdi:account-voice': Mic,
  'mdi:book-open-page-variant': BookOpenText,
  'mdi:book-open-variant': BookOpen,
  'mdi:account-group': Users,
  'mdi:user-group': Users,
  'mdi:handshake': Handshake,
  'mdi:message-alert': MessageSquareWarning,
  'mdi:refresh-circle': RefreshCw,
  'mdi:alternate-email': AtSign,
  'mdi:whatsapp': MessageCircle,
  'mdi:instagram': Instagram,
};

// Helper component to render icon by name
export function Icon({
  name,
  size = 24,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon not found: ${name}`);
    return null;
  }

  return <IconComponent size={size} className={className} />;
}
