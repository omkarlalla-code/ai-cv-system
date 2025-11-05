import React from 'react';
import './Card.css';

/**
 * Card Component
 * Reusable container with consistent styling
 */
const Card = ({
  children,
  title = null,
  subtitle = null,
  variant = 'default', // default, outlined, flat
  padding = 'normal', // none, small, normal, large
  hoverable = false,
  onClick = null,
  header = null,
  footer = null,
  className = '',
  ...props
}) => {
  const classNames = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hoverable && 'card-hoverable',
    onClick && 'card-clickable',
    className
  ].filter(Boolean).join(' ');

  const hasHeader = title || subtitle || header;

  return (
    <div
      className={classNames}
      onClick={onClick}
      {...props}
    >
      {hasHeader && (
        <div className="card-header">
          {header || (
            <>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </>
          )}
        </div>
      )}

      <div className="card-body">
        {children}
      </div>

      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
