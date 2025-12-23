import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm font-semibold text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            px-4 py-2 border-2 rounded-lg font-base
            border-gray-300 focus:border-blue-500 focus:outline-none
            transition-colors duration-200
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
        {helper && !error && <span className="text-sm text-gray-500">{helper}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
