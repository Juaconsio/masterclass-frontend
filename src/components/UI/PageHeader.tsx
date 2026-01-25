import { type ReactNode } from 'react';

interface Badge {
  text: string;
  variant: 'success' | 'error' | 'warning' | 'info' | 'ghost';
}

interface Action {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
}

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryBadge?: Badge;
  secondaryBadges?: Badge[];
  actions?: Action[];
}

/**
 * Reusable page header component with title, badges, and action buttons
 * @param title - Main page title
 * @param description - Optional description text below the title
 * @param primaryBadge - Primary badge displayed next to the title
 * @param secondaryBadges - Array of secondary badges shown below the title
 * @param actions - Array of action buttons displayed on the right
 * @returns Page header component
 */
export default function PageHeader({
  title,
  description,
  primaryBadge,
  secondaryBadges = [],
  actions = [],
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 py-1">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{title}</h1>
            {primaryBadge && (
              <div className={`badge h-full badge-${primaryBadge.variant} gap-2`}>
                {primaryBadge.text}
              </div>
            )}
          </div>
          {(description || secondaryBadges.length > 0) && (
            <p className="text-base-content/60 mt-2">
              {secondaryBadges.map((badge, index) => (
                <span key={index} className={`badge badge-${badge.variant} mr-2`}>
                  {badge.text}
                </span>
              ))}
              {description && <span>{description}</span>}
            </p>
          )}
        </div>
      </div>
      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`btn btn-${action.variant || 'primary'} gap-2`}
              onClick={action.onClick}
            >
              {action.icon && <span>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
