interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
  href?: string;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  href,
}: ButtonProps) {
  const baseStyles = 'px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-primaryText)',
    },
    secondary: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text)',
      border: '2px solid var(--color-border)',
    },
  };

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`inline-block text-center ${baseStyles} ${className}`}
        style={variantStyles[variant]}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </button>
  );
}
