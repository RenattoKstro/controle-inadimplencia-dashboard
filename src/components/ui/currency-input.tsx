
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  value, 
  onValueChange,
  className
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, isEditing]);

  const formatCurrency = (value: number): string => {
    if (isNaN(value)) return '0,00';
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrency = (value: string): number => {
    // Remove all non-numeric characters except decimal separator
    const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    const parsed = parseFloat(numericValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow digits and comma
    const sanitizedValue = inputValue.replace(/[^\d,]/g, '');
    setDisplayValue(sanitizedValue);
  };

  const handleFocus = () => {
    setIsEditing(true);
    // Show the raw number for editing
    const rawValue = String(value).replace('.', ',');
    setDisplayValue(rawValue);
    // Set timeout to ensure the field is focused and cursor positioned properly
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numericValue = parseCurrency(displayValue);
    onValueChange(numericValue);
    setDisplayValue(formatCurrency(numericValue));
  };

  return (
    <Input
      ref={inputRef}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="0,00"
      className={className}
    />
  );
};
