
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Controle de Inadimplência</h1>
        <p className="text-lg text-gray-600 mb-8">
          Gerencie suas metas de inadimplência de forma eficiente e acompanhe seu progresso.
        </p>
        <div className="space-y-4">
          <Button 
            className="w-full py-6 text-lg"
            onClick={() => navigate("/auth")}
          >
            Acessar Dashboard
          </Button>
          <p className="text-sm text-gray-500">
            Faça login ou crie uma conta para começar a gerenciar suas metas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
