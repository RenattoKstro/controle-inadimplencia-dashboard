
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Utensils, Gift, Sliders, LogOut, Menu } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export interface DashboardProps {
  userData: any;
  updateUserData: (data: any) => void;
  diasSemExpediente: Date[];
  updateDiasSemExpediente: (dias: Date[]) => void;
  diasRestantesCalculados: number;
  isLoading: boolean;
}

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("meta-fiado");
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { 
    userData, 
    updateUserData, 
    diasSemExpediente, 
    updateDiasSemExpediente,
    isLoading,
    diasRestantesCalculados
  } = useUserData();

  useEffect(() => {
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isMobile) {
      setSheetOpen(false);
    }
  };

  const renderTabs = () => (
    <TabsList className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-5'} w-full p-1 bg-white shadow-sm rounded-xl`}>
      <TabsTrigger 
        value="ajustes-metas" 
        className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
        onClick={() => handleTabChange("ajustes-metas")}
      >
        <Sliders className="h-4 w-4" />
        <span>Ajustes de Metas</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meta-fiado" 
        className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
        onClick={() => handleTabChange("meta-fiado")}
      >
        <Wallet className="h-4 w-4" />
        <span>Meta Fiado</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meta-desafio" 
        className="flex items-center gap-2 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-600"
        onClick={() => handleTabChange("meta-desafio")}
      >
        <Trophy className="h-4 w-4" />
        <span>Meta Desafio</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meta-alimentacao" 
        className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-600"
        onClick={() => handleTabChange("meta-alimentacao")}
      >
        <Utensils className="h-4 w-4" />
        <span>Meta de Ticket</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meus-premios" 
        className="flex items-center gap-2 data-[state=active]:bg-pink-50 data-[state=active]:text-pink-600"
        onClick={() => handleTabChange("meus-premios")}
      >
        <Gift className="h-4 w-4" />
        <span>Meus Prêmios</span>
      </TabsTrigger>
    </TabsList>
  );

  const renderTabsContent = () => (
    <>
      <TabsContent value="ajustes-metas" className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <AjustesMetas
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="meta-fiado" className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <MetaFiado 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="meta-desafio" className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <MetaDesafio 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="meta-alimentacao" className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <MetaAlimentacao 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="meus-premios" className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <MeusPremios 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
        />
      </TabsContent>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {isMobile ? (
            <>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Controle <span className="text-sm font-normal bg-purple-500 text-white px-1 py-0.5 rounded-md ml-1">Beta</span>
              </h1>
              <div className="flex items-center gap-2">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Menu size={18} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
                    <div className="flex flex-col h-full">
                      <div className="py-6 border-b">
                        <h2 className="text-lg font-semibold">Menu de Navegação</h2>
                      </div>
                      <div className="py-4 flex-1">
                        <div className="space-y-2">
                          {["ajustes-metas", "meta-fiado", "meta-desafio", "meta-alimentacao", "meus-premios"].map((tab) => (
                            <Button
                              key={tab}
                              variant="ghost"
                              className={`w-full justify-start ${activeTab === tab ? 'text-blue-600' : ''}`}
                              onClick={() => handleTabChange(tab)}
                            >
                              {tab === "ajustes-metas" && <Sliders className="h-4 w-4 mr-2" />}
                              {tab === "meta-fiado" && <Wallet className="h-4 w-4 mr-2" />}
                              {tab === "meta-desafio" && <Trophy className="h-4 w-4 mr-2" />}
                              {tab === "meta-alimentacao" && <Utensils className="h-4 w-4 mr-2" />}
                              {tab === "meus-premios" && <Gift className="h-4 w-4 mr-2" />}
                              {tab === "ajustes-metas" && "Ajustes de Metas"}
                              {tab === "meta-fiado" && "Meta Fiado"}
                              {tab === "meta-desafio" && "Meta Desafio"}
                              {tab === "meta-alimentacao" && "Meta de Ticket"}
                              {tab === "meus-premios" && "Meus Prêmios"}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="py-4 border-t">
                        <Button 
                          variant="destructive" 
                          className="w-full" 
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2" />
                          Sair
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" size="sm" onClick={handleLogout} className="h-9 flex items-center">
                  <LogOut size={16} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Controle de Inadimplência <span className="text-sm font-normal bg-purple-500 text-white px-1.5 py-0.5 rounded-md ml-1">Beta</span>
              </h1>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors">
                <LogOut size={16} />
                <span>Sair</span>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs 
          defaultValue="meta-fiado" 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          {isMobile ? (
            <div className="hidden">{renderTabs()}</div>
          ) : (
            renderTabs()
          )}
          {renderTabsContent()}
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardLayout;
