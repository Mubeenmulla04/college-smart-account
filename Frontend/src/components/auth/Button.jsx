import React from 'react';

/**
 * Button — reusable button for auth forms using Tailwind CSS.
 *
 * Props:
 *  - variant   {'primary'|'secondary'|'ghost'|'danger'}  default 'primary'
 *  - size      {'sm'|'md'|'lg'}                          default 'md'
 *  - full      {boolean}   Stretch to 100% width
 *  - loading   {boolean}   Show spinner + disable
 *  - loadingText {string}  Text while loading (optional)
 *  - type      {string}    'button' | 'submit' | 'reset'  default 'button'
 *  - onClick   {function}
 *  - disabled  {boolean}
 *  - children  {ReactNode}
 *  - className {string}    Extra class names
 */
const Button = ({
  variant = 'primary',
  size    = 'md',
  full    = false,
  loading = false,
  loadingText,
  type    = 'button',
  onClick,
  disabled,
  children,
  className = '',
  ...rest
}) => {
  
  const baseClasses = "relative inline-flex items-center justify-center font-bold outline-none transition-all duration-200 disabled:cursor-not-allowed overflow-hidden";
  
  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 border border-transparent disabled:bg-indigo-400 disabled:shadow-none focus:ring-4 focus:ring-indigo-100",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 focus:ring-4 focus:ring-gray-100",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600 disabled:text-gray-400 border border-transparent focus:bg-gray-100",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 border border-transparent disabled:bg-rose-400 disabled:shadow-none focus:ring-4 focus:ring-rose-100"
  };

  const sizeClasses = {
    sm: "h-9 px-4 text-sm rounded-lg",
    md: "h-11 px-6 text-sm rounded-xl",
    lg: "h-12 px-8 text-base rounded-xl"
  };

  const fullWidthClass = full ? "w-full flex" : "";
  const disabledClass = (disabled || loading) ? "opacity-80" : "active:scale-[0.98]";

  const cls = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidthClass} ${disabledClass} ${className}`;

  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};

export default Button;
