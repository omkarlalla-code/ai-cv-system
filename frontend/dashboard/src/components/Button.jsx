import React from 'react';
import './Button.css';

/**
 * Button Component
 * Reusable button with consistent styling
 */
const Button = ({
  children,
  variant = 'primary', // primary, outline, secondary, danger
  size = 'medium', // small, medium, large
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    loading && 'btn-loading',
    disabled && 'btn-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner"></span>}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      {!loading && children}
      {loading && 'Loading...'}
    </button>
  );
};

export default Button;
