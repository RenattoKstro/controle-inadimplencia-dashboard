
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

  useEffect(() => {
    // Format initial value
    setDisplayValue(formatCurrency(value));
  }, [value]);

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
    
    // Handle empty input
    if (inputValue === '') {
      setDisplayValue('');
      onValueChange(0);
      return;
    }
    
    // Only allow numeric input and comma
    const cleanValue = inputValue.replace(/[^\d,]/g, '');
    if (cleanValue !== inputValue.replace(/\./g, '')) {
      setDisplayValue(cleanValue);
    } else {
      setDisplayValue(inputValue);
    }
    
    // Parse the numeric value
    const numericValue = parseCurrency(cleanValue);
    
    // Pass the numeric value to the parent
    onValueChange(numericValue);
  };

  const handleBlur = () => {
    // Ensure correct formatting on blur
    if (displayValue === '') {
      setDisplayValue('0,00');
      onValueChange(0);
    } else {
      const numericValue = parseCurrency(displayValue);
      setDisplayValue(formatCurrency(numericValue));
      onValueChange(numericValue);
    }
  };

  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="0,00"
      className={className}
    />
  );
};
