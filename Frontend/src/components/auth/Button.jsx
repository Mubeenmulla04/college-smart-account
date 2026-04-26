import React from 'react';
import styles from './Button.module.css';

/**
 * Button — reusable button for auth forms.
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
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    full ? styles.full : '',
    className,
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <>
          <span className={styles.spinner} />
          {loadingText || children}
        </>
      ) : children}
    </button>
  );
};

export default Button;
