import { forwardRef, useImperativeHandle, useState } from 'react';
import type { ReactNode } from 'react';

export interface DrawerRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

interface DrawerAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'error' | 'warning' | 'info' | 'success';
  disabled?: boolean;
  loading?: boolean;
}

interface DrawerProps {
  title: string;
  children: ReactNode;
  actions?: DrawerAction[];
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  side?: 'left' | 'right';
  showCloseButton?: boolean;
  onClose?: () => void;
}

const widthClasses = {
  sm: 'w-64',
  md: 'w-80',
  lg: 'w-96',
  xl: 'w-[32rem]',
  full: 'w-full',
};

const Drawer = forwardRef<DrawerRef, DrawerProps>(
  (
    {
      title,
      children,
      actions = [],
      width = 'md',
      side = 'right',
      showCloseButton = true,
      onClose,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const drawerId = `drawer-${Math.random().toString(36).slice(2, 9)}`;

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => {
        setIsOpen(false);
        onClose?.();
      },
      toggle: () => setIsOpen((prev) => !prev),
      isOpen,
    }));

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    const getButtonVariantClass = (variant?: DrawerAction['variant']) => {
      switch (variant) {
        case 'primary':
          return 'btn-primary';
        case 'secondary':
          return 'btn-secondary';
        case 'error':
          return 'btn-error';
        case 'warning':
          return 'btn-warning';
        case 'info':
          return 'btn-info';
        case 'success':
          return 'btn-success';
        case 'ghost':
          return 'btn-ghost';
        default:
          return '';
      }
    };

    return (
      <div className={`drawer ${side === 'right' ? 'drawer-end' : ''} z-50`}>
        <input
          id={drawerId}
          type="checkbox"
          className="drawer-toggle"
          checked={isOpen}
          onChange={(e) => {
            const newState = e.target.checked;
            setIsOpen(newState);
            if (!newState) {
              onClose?.();
            }
          }}
        />

        {/* Drawer Side */}
        <div className="drawer-side">
          <label
            htmlFor={drawerId}
            aria-label="close sidebar"
            className="drawer-overlay"
            onClick={handleClose}
          />

          <div className={`bg-base-200 min-h-full ${widthClasses[width]} flex flex-col`}>
            <div className="flex h-full flex-col p-4">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base-content text-xl font-bold">{title}</h2>
                {showCloseButton && (
                  <label htmlFor={drawerId} className="btn btn-circle btn-ghost btn-sm">
                    ✕
                  </label>
                )}
              </div>

              <div className="divider my-2" />

              {/* Content */}
              <div className="flex-1 overflow-y-auto">{children}</div>

              {/* Actions */}
              {actions.length > 0 && (
                <>
                  <div className="divider my-2" />
                  <div className="flex flex-col gap-2">
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        className={`btn w-full ${getButtonVariantClass(action.variant)}`}
                        onClick={action.onClick}
                        disabled={action.disabled || action.loading}
                      >
                        {action.loading ? (
                          <span className="loading loading-spinner loading-sm" />
                        ) : (
                          action.label
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Drawer.displayName = 'Drawer';

export default Drawer;
