import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateDiasRestantes, getPreviousMonthComparison } from "@/utils/dashboardUtils";

const DEFAULT_USER_DATA = {
  abertura_vencido_mes: 0,
  meta_mes: 0,
  vencido_atual: 0,
  abertura_dia: 0,
  dias_restantes: 0,
  meta_desafio: 0,
  meta_perdido: 0,
  rec_perdido: 0,
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
        if (!user) throw new Error("Usuário não autenticado. Faça login novamente!");

        const { data, error } = await supabase
          .from("user_dashboard")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        setUserData({
          ...DEFAULT_USER_DATA,
          ...(data || {}),
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
      if (!user) throw new Error("Usuário não autenticado. Faça login novamente");

      const updatedData = { ...userData, ...newData, user_id: user.id };

      // Remove id do payload para evitar conflito de PK ao fazer upsert por user_id
      const { id: _id, ...payloadWithoutId } = updatedData as typeof updatedData & { id?: string };

      const { error } = await supabase
        .from("user_dashboard")
        .upsert(
          { ...payloadWithoutId, user_id: user.id, updated_at: new Date().toISOString() },
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

  return { 
    userData, 
    updateUserData, 
    isLoading,
    diasRestantesCalculados,
    getPreviousMonthComparison,
  };
}
