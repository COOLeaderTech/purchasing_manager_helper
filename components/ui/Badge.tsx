import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-200 text-gray-800',
  success: 'bg-green-200 text-green-800',
  warning: 'bg-yellow-200 text-yellow-800',
  danger: 'bg-red-200 text-red-800',
  info: 'bg-blue-200 text-blue-800',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-block px-3 py-1 rounded-full text-sm font-semibold
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
