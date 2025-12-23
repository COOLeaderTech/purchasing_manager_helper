import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
  outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          font-semibold rounded-lg transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? '⏳ Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
