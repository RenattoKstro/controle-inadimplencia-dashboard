// src/utils/dashboardUtils.ts
import { addDays, subMonths, isAfter, isBefore } from "date-fns";

export const calculateDiasRestantes = (): number => {
  const today = new Date("2025-06-18T18:32:00-03:00"); // Atualizado para o horário atual
  const day15 = new Date(today.getFullYear(), today.getMonth(), 15, 23, 59, 59, 999);
  if (isAfter(today, day15)) return 0; // Se já passou do dia 15, retorna 0
  const diffTime = day15.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let diasUteis = 0;
  for (let i = 0; i < diffDays; i++) {
    const currentDate = addDays(today, i);
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) diasUteis++; // Exclui sábados (6) e domingos (0)
  }
  return diasUteis;
};

export const getPreviousMonthComparison = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};
