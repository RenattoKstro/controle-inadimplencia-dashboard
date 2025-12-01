// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Users, Upload, Shield, LogOut } from "lucide-react";
import UploadFiliaisExcel from "@/components/UploadFiliaisExcel";
import GerenciarUsuarios from "@/components/GerenciarUsuarios";

const ADMIN_EMAIL = "rks7ro@gmail.com";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      if (user.email !== ADMIN_EMAIL) {
        alert("Acesso negado. Você não tem permissão para acessar esta área.");
        navigate("/");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkAccess();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Verificando acesso administrativo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header Admin */}
      <header className="bg-black/50 backdrop-blur border-b border-purple-500">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="h-10 w-10 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
              <p className="text-sm text-purple-300">Bem-vindo, {user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-purple-500 text-white hover:bg-purple-600">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Seção Upload Filiais */}
        <section>
          <Card className="bg-white/10 backdrop-blur border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Upload className="h-8 w-8 text-purple-400" />
                Upload de Base de Filiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadFiliaisExcel />
            </CardContent>
          </Card>
        </section>

        {/* Seção Gerenciar Usuários */}
        <section>
          <Card className="bg-white/10 backdrop-blur border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-8 w-8 text-purple-400" />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GerenciarUsuarios />
            </CardContent>
          </Card>
        </section>

        {/* Botão Aprovações */}
        <section className="flex justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-xl px-12 py-8 font-bold shadow-2xl"
            onClick={() => navigate("/aprovacoes")}
          >
            Acessar Área de Aprovações
          </Button>
        </section>

        {/* Alerta de Segurança */}
        <div className="text-center text-sm text-purple-300 opacity-80">
          <AlertCircle className="inline-block h-5 w-5 mr-2" />
          Esta área é restrita apenas ao administrador do sistema.
        </div>
      </main>
    </div>
  );
};

export default Admin;
