// src/hooks/useUserData.ts
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateDiasRestantes, getPreviousMonthComparison } from "@/utils/dashboardUtils";

const DEFAULT_USER_DATA = {
  abertura_vencido_mes: 0,
  meta_mes: 0,
  vencido_atual: 0,
  dailyreceipts: [], // Alterado para minúsculas
  monthlyreceipts: {}, // Alterado para minúsculas
};

export function useUserData() {
  const [userData, setUserData] = useState(DEFAULT_USER_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
          .from("user_dashboard")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") { // PGRST116 significa que não encontrou o registro
          throw error;
        }

        setUserData({
          ...DEFAULT_USER_DATA,
          ...(data || {}),
          dailyreceipts: data?.dailyreceipts || [], // Usando minúsculas
          monthlyreceipts: data?.monthlyreceipts || {}, // Usando minúsculas
        });
      } catch (error: any) {
        console.error("Erro ao carregar dados do usuário:", error);
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Não foi possível carregar os dados do usuário.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const diasRestantesCalculados = calculateDiasRestantes();

  const updateUserData = async (newData: Partial<typeof DEFAULT_USER_DATA>) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const updatedData = { ...userData, ...newData };
      const { error } = await supabase
        .from("user_dashboard")
        .upsert(
          { 
            user_id: user.id, 
            ...updatedData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      setUserData(updatedData);
      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar dados:", error);
      toast({
        title: "Erro ao atualizar dados",
        description: error.message || "Não foi possível atualizar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDailyReceipt = async (date: string, amount: number) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const newReceipts = [...(userData.dailyreceipts || []), { date, amount }]; // Usando minúsculas
      const monthlyKey = date.split("-").slice(0, 2).join("-"); // e.g., "2025-06"
      const monthlyTotal = (userData.monthlyreceipts?.[monthlyKey] || 0) + amount;
      const newMonthlyReceipts = { ...userData.monthlyreceipts, [monthlyKey]: monthlyTotal }; // Usando minúsculas

      await updateUserData({ dailyreceipts: newReceipts, monthlyreceipts: newMonthlyReceipts }); // Usando minúsculas
    } catch (error: any) {
      console.error("Erro ao adicionar recebimento:", error);
      toast({
        title: "Erro ao adicionar recebimento",
        description: error.message || "Não foi possível salvar o recebimento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    userData, 
    updateUserData, 
    isLoading,
    diasRestantesCalculados,
    addDailyReceipt,
    getPreviousMonthComparison,
  };
}
