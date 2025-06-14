import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

export const Button = ({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  type = 'button'
}: ButtonProps) => {
  const baseStyles = "font-medium rounded-full transition-all flex items-center justify-center";
  
  const variantStyles = {
    primary: "bg-yellow-400 hover:bg-yellow-500 text-gray-900 hover:shadow-lg hover:shadow-yellow-300/20",
    secondary: "bg-gray-800 hover:bg-gray-700 text-white hover:shadow-lg hover:shadow-gray-800/20",
    outline: "bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
  };
  
  const sizeStyles = {
    sm: "text-xs py-1.5 px-3",
    md: "text-sm py-2.5 px-5",
    lg: "text-base py-3 px-7"
  };
  
  const buttonContent = (
    <>
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        <span className="flex items-center">
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </span>
      )}
    </>
  );

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  const buttonMotion = {
    whileTap: { scale: 0.97 },
    whileHover: { scale: 1.02 }
  };

  if (href) {
    return (
      <Link 
        href={href} 
        className={buttonClasses}
        onClick={onClick}
      >
        <motion.span
          className="flex w-full h-full items-center justify-center"
          {...buttonMotion}
        >
          {buttonContent}
        </motion.span>
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...buttonMotion}
    >
      {buttonContent}
    </motion.button>
  );
};
