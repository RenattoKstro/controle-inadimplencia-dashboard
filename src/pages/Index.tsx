
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
      <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Controle de Inadimplência</h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
          Gerencie suas metas de inadimplência de forma eficiente e acompanhe seu progresso.
        </p>
        <div className="space-y-4">
          <Button 
            className="w-full py-5 sm:py-6 text-base sm:text-lg"
            onClick={() => navigate("/auth")}
          >
            Acessar Dashboard
          </Button>
          <p className="text-xs sm:text-sm text-gray-500">
            Faça login ou crie uma conta para começar a gerenciar suas metas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
