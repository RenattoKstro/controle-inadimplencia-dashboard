
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUserData() {
  const [userData, setUserData] = useState({
    abertura_vencido_mes: 1118083.42,
    abertura_dia: 836527.75,
    meta_mes: 448867.63,
    vencido_atual: 787154.86,
    dias_restantes: 17,
    meta_desafio: 446982.10,
  });
  const [diasSemExpediente, setDiasSemExpediente] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Buscar dados do usuário ao carregar a página
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Buscar dados do dashboard do usuário
        const { data: dashboardData, error: dashboardError } = await supabase
          .from('user_dashboard')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (dashboardError && dashboardError.code !== 'PGRST116') {
          throw dashboardError;
        }

        // Se não encontrar dados, inserir dados padrão
        if (!dashboardData) {
          const { data: newData, error: insertError } = await supabase
            .from('user_dashboard')
            .insert([{ user_id: user.id }])
            .select('*')
            .single();

          if (insertError) throw insertError;
          
          if (newData) {
            setUserData(newData);
          }
        } else {
          setUserData(dashboardData);
        }

        // Buscar dias sem expediente
        const { data: diasData, error: diasError } = await supabase
          .from('dias_sem_expediente')
          .select('data')
          .eq('user_id', user.id);

        if (diasError) throw diasError;

        if (diasData) {
          setDiasSemExpediente(diasData.map(d => new Date(d.data)));
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

  // Função para atualizar os dados do usuário
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

  // Função para atualizar os dias sem expediente
  const updateDiasSemExpediente = async (dias: Date[]) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      // Primeiro remover todos os dias existentes
      const { error: deleteError } = await supabase
        .from('dias_sem_expediente')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Depois inserir os novos dias
      if (dias.length > 0) {
        const diasParaInserir = dias.map(dia => ({
          user_id: user.id,
          data: dia.toISOString().split('T')[0]
        }));

        const { error: insertError } = await supabase
          .from('dias_sem_expediente')
          .insert(diasParaInserir);

        if (insertError) throw insertError;
      }

      setDiasSemExpediente(dias);
      
      toast({
        title: 'Calendário atualizado',
        description: 'Dias sem expediente foram atualizados com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar calendário:', error);
      toast({
        title: 'Erro ao atualizar calendário',
        description: error.message || 'Não foi possível atualizar o calendário.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, isLoading };
}
