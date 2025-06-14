import React from 'react';
import { motion } from 'framer-motion';

type InputProps = {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
  icon?: React.ReactNode;
  description?: string;
  maxLength?: number;
};

export const Input = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  multiline = false,
  rows = 4,
  icon,
  description,
  maxLength
}: InputProps) => {
  const InputComponent = multiline ? 'textarea' : 'input';
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <InputComponent
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={multiline ? rows : undefined}
          maxLength={maxLength}
          className={`
            w-full
            px-4 py-3
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-700
            rounded-xl
            shadow-sm
            placeholder-gray-400
            text-gray-900 dark:text-white
            focus:outline-none
            focus:ring-2
            focus:ring-yellow-400
            focus:border-transparent
            transition-all
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}
          `}
        />
      </div>
      
      {error && (
        <motion.p 
          className="mt-1 text-sm text-red-500"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
      
      {description && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {maxLength && (
        <p className="mt-1 text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
};
