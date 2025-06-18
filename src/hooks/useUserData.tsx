// src/hooks/useUserData.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Initial default values for new users - todos valores começam zerados
const DEFAULT_USER_DATA = {
  abertura_vencido_mes: 0,
  abertura_dia: 0,
  meta_mes: 0,
  vencido_atual: 0,
  dias_restantes: 0,
  meta_desafio: 0,
  dailyReceipts: [], // [{ date: string, amount: number }]
  monthlyReceipts: {}, // { "2025-06": number, "2025-05": number, ... }
};

export function useUserData() {
  const [userData, setUserData] = useState(DEFAULT_USER_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Calculate business days remaining based on current date
  const calculateDiasRestantes = () => {
    const hoje = new Date();
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    let dias = 0;
    const currentDate = new Date(hoje);

    while (currentDate <= ultimoDiaMes) {
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      if (!isWeekend) {
        dias++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dias;
  };

  // Fetch user data on page load
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Fetch dashboard data
        const { data: dashboardData, error: dashboardError } = await supabase
          .from('user_dashboard')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (dashboardError && dashboardError.code !== 'PGRST116') {
          throw dashboardError;
        }

        // If no data, insert default data
        if (!dashboardData) {
          const defaultDiasRestantes = calculateDiasRestantes();
          
          const { data: newData, error: insertError } = await supabase
            .from('user_dashboard')
            .insert([{ 
              user_id: user.id,
              ...DEFAULT_USER_DATA,
              dias_restantes: defaultDiasRestantes
            }])
            .select('*')
            .single();

          if (insertError) throw insertError;
          
          if (newData) {
            setUserData(newData);
          }
        } else {
          // Ensure all fields exist with default values, including receipts
          const completeData = {
            ...DEFAULT_USER_DATA,
            ...dashboardData,
            dailyReceipts: dashboardData.dailyReceipts || [],
            monthlyReceipts: dashboardData.monthlyReceipts || {},
          };
          setUserData(completeData);
        }
      } catch (error: any) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: error.message || 'Não foi possível carregar seus dados.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [toast]);

  // Update user data
  const updateUserData = async (newData: any) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_dashboard')
        .update({ ...newData, updated_at: new Date() })
        .eq('user_id', user.id);

      if (error) throw error;

      setUserData(prev => ({ ...prev, ...newData }));
      
      toast({
        title: 'Dados atualizados',
        description: 'Seus dados foram atualizados com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar dados:', error);
      toast({
        title: 'Erro ao atualizar dados',
        description: error.message || 'Não foi possível atualizar seus dados.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a daily receipt
  const addDailyReceipt = async (date: string, amount: number) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const newReceipts = [...userData.dailyReceipts, { date, amount }];
      const monthlyKey = date.split("-").slice(0, 2).join("-"); // e.g., "2025-06"
      const monthlyTotal = (userData.monthlyReceipts[monthlyKey] || 0) + amount;
      const newMonthlyReceipts = { ...userData.monthlyReceipts, [monthlyKey]: monthlyTotal };

      await updateUserData({ dailyReceipts: newReceipts, monthlyReceipts: newMonthlyReceipts });
    } catch (error: any) {
      console.error('Erro ao adicionar recebimento:', error);
      toast({
        title: 'Erro ao adicionar recebimento',
        description: error.message || 'Não foi possível salvar o recebimento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get comparison with previous month
  const getPreviousMonthComparison = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-06"
    const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7); // e.g., "2025-05"
    const currentTotal = userData.monthlyReceipts[currentMonth] || 0;
    const prevTotal = userData.monthlyReceipts[prevMonth] || 0;
    const difference = currentTotal - prevTotal;
    const percentageChange = prevTotal ? (difference / prevTotal) * 100 : 0;
    return { currentTotal, prevTotal, difference, percentageChange };
  };

  // Calculate business days to use as default if user doesn't set manually
  const diasRestantesCalculados = calculateDiasRestantes();

  return { 
    userData, 
    updateUserData, 
    isLoading,
    diasRestantesCalculados,
    addDailyReceipt,
    getPreviousMonthComparison,
  };
}
