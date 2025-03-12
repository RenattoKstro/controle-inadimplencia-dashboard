
import React, { useState, useEffect } from 'react';
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
    setDisplayValue(inputValue.replace(/[^\d,]/g, ''));
    
    const numericValue = parseCurrency(inputValue);
    if (!isNaN(numericValue)) {
      onValueChange(numericValue);
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
    // Show the raw number without formatting when editing
    setDisplayValue(displayValue.replace(/[^\d,]/g, ''));
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numericValue = parseCurrency(displayValue);
    setDisplayValue(formatCurrency(numericValue));
    onValueChange(numericValue);
  };

  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="0,00"
      className={className}
    />
  );
};
