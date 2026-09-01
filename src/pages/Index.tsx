import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate("/dashboard");
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-900/80 shadow-2xl p-8 sm:p-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-sm">
          <Shield className="h-4 w-4" /> Plataforma Oficial
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold">
          Meu Fiado
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
          Gerencie metas de forma clara, acompanhe indicadores em tempo real e mantenha performance com visual moderno.
        </p>

        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-left text-sm text-amber-200">
          <strong className="text-amber-300">Aviso:</strong> cadastre-se preferencialmente com e-mails Gmail (@gmail.com) para evitar falhas de autenticação.
        </div>

        <div className="space-y-3">
          <Button
            className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-500"
            onClick={() => navigate("/auth")}
          >
            Acessar Dashboard <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-sm text-zinc-500">Faça login ou crie uma conta para começar.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
