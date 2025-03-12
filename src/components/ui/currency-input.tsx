
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
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrency = (value: string): number => {
    // Remove all non-numeric characters except decimal separator
    const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
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
    if (!/^[\d.,]+$/.test(inputValue.replace(/[^\d,]/g, ''))) {
      return;
    }
    
    // Remove all non-numeric characters for processing
    const cleanValue = inputValue.replace(/[^\d,]/g, '');
    
    // Parse the numeric value
    const numericValue = parseCurrency(cleanValue);
    
    // Format for display
    let formatted = formatCurrency(numericValue);
    setDisplayValue(formatted);
    
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
