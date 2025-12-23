import React from 'react';

type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✅',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: '⚠️',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '❌',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ️',
  },
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, children, onClose, className = '', ...props }, ref) => {
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={`
          border-l-4 rounded-lg p-4
          ${styles.bg} ${styles.border} ${styles.text}
          ${className}
        `}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-lg">{styles.icon}</span>
            <div>
              {title && <h3 className="font-semibold text-base mb-1">{title}</h3>}
              <div className="text-sm">{children}</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-lg opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Close alert"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
