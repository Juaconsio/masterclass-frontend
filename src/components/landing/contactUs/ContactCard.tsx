import { Icon } from '@/lib/icons';

interface ContactCardProps {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
}

export default function ContactCard({ href, icon, title, subtitle }: ContactCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 justify-start bg-white border border-neutral shadow-sm items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-secondary/10 transition-all transform hover:scale-105 hover:shadow-lg duration-200"
    >
      <Icon name={icon} size={28} className="shrink-0 sm:w-8 sm:h-8" />

      <div className="min-w-0">
        <h4 className="text-base-content/70 text-xs sm:text-sm">{title}</h4>
        <p className="text-base sm:text-lg md:text-xl font-semibold truncate">{subtitle}</p>
      </div>
    </a>
  );
}
