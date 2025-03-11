
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Utensils, Gift, Sliders, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import MetaFiado from "./dashboard/MetaFiado";
import MetaDesafio from "./dashboard/MetaDesafio";
import MetaAlimentacao from "./dashboard/MetaAlimentacao";
import MeusPremios from "./dashboard/MeusPremios";
import AjustesMetas from "./dashboard/AjustesMetas";
import { useUserData } from "@/hooks/useUserData";

export interface DashboardProps {
  userData: any;
  updateUserData: (data: any) => void;
  diasSemExpediente: Date[];
  updateDiasSemExpediente: (dias: Date[]) => void;
  isLoading: boolean;
}

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("meta-fiado");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    userData, 
    updateUserData, 
    diasSemExpediente, 
    updateDiasSemExpediente,
    isLoading 
  } = useUserData();

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar a página
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Saiu com sucesso",
      description: "Você saiu da sua conta.",
    });
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Controle de Inadimplência
          </h1>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={16} />
            <span>Sair</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs 
          defaultValue="meta-fiado" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-5 w-full p-1 bg-white shadow-sm rounded-xl">
            <TabsTrigger value="ajustes-metas" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Sliders className="h-4 w-4" />
              <span>Ajustes de Metas</span>
            </TabsTrigger>
            <TabsTrigger value="meta-fiado" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <Wallet className="h-4 w-4" />
              <span>Meta Fiado</span>
            </TabsTrigger>
            <TabsTrigger value="meta-desafio" className="flex items-center gap-2 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-600">
              <Trophy className="h-4 w-4" />
              <span>Meta Desafio</span>
            </TabsTrigger>
            <TabsTrigger value="meta-alimentacao" className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
              <Utensils className="h-4 w-4" />
              <span>Meta de Ticket</span>
            </TabsTrigger>
            <TabsTrigger value="meus-premios" className="flex items-center gap-2 data-[state=active]:bg-pink-50 data-[state=active]:text-pink-600">
              <Gift className="h-4 w-4" />
              <span>Meus Prêmios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ajustes-metas" className="bg-white p-6 rounded-xl shadow-sm">
            <AjustesMetas
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="meta-fiado" className="bg-white p-6 rounded-xl shadow-sm">
            <MetaFiado 
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="meta-desafio" className="bg-white p-6 rounded-xl shadow-sm">
            <MetaDesafio 
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="meta-alimentacao" className="bg-white p-6 rounded-xl shadow-sm">
            <MetaAlimentacao 
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="meus-premios" className="bg-white p-6 rounded-xl shadow-sm">
            <MeusPremios 
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardLayout;
