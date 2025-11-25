import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet, Trophy, Utensils, Gift, Sliders, Menu,
  Calendar, AlertTriangle, History, Instagram, File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import MetaFiado from "./dashboard/MetaFiado";
import MetaDesafio from "./dashboard/MetaDesafio";
import MetaAlimentacao from "./dashboard/MetaAlimentacao";
import MeusPremios from "./dashboard/MeusPremios";
import AjustesMetas from "./dashboard/AjustesMetas";
import Historicos from "./Historicos";
import { useUserData } from "@/hooks/useUserData";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RelatoriosSabium from "./RelatoriosSabium";
import html2canvas from "html2canvas";
import { FaWhatsapp } from "react-icons/fa";
import { Moon, Sun } from "lucide-react";
import { RiScreenshot2Fill } from "react-icons/ri";
import { BiSolidReport } from "react-icons/bi";
import Anexos from "./Anexos";
import Apps from "./Apps";
import MetaPerdido from "./dashboard/MetaPerdido";
import RankingApoiadores from "@/components/RankingApoiadores";

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("meta-fiado");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bonusPerdidoAtivado, setBonusPerdidoAtivado] = useState(false);
  const { userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, isLoading, diasRestantesCalculados } = useUserData();

  // ESTE É O VALOR QUE VAI APARECER NO HISTÓRICO — VEM DIRETO DA META FIADO
  const [recebidoHoje, setRecebidoHoje] = useState(0);

  const [showCalendar, setShowCalendar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showInstagramUsername, setShowInstagramUsername] = useState(false);
  const today = new Date();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({ title: "Sessão expirada", variant: "destructive" });
        await supabase.auth.signOut();
        navigate("/auth");
      }
    };
    check();
    const id = setInterval(check, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [navigate, toast]);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Tchau!" });
    navigate("/auth");
  };

  const handleTabChange = (v: string) => {
    setActiveTab(v);
    if (isMobile) setSheetOpen(false);
  };

  const print = () => {
    if (!contentRef.current) return;
    html2canvas(document.body, { scale: 2, useCORS: true }).then(c => {
      const a = document.createElement("a");
      a.download = `dashboard_${today.toISOString().slice(0, 10)}.png`;
      a.href = c.toDataURL();
      a.click();
    });
  };

  const instagram = () => {
    setShowInstagramUsername(true);
    setTimeout(() => setShowInstagramUsername(false), 2000);
  };

  const percentual = userData?.carteira_total > 0
    ? ((userData.vencido_atual / userData.carteira_total) * 100).toFixed(1)
    : null;

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background dark' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`} ref={contentRef}>
      {/* HEADER */}
      <header className="bg-card shadow-md sticky top-0 z-40">
        {/* ... seu header igual ... */}
      </header>

      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="hidden lg:block w-80 bg-gradient-to-b from-purple-50 to-pink-50 border-r-4 border-purple-300 fixed left-0 top-20 bottom-0 overflow-y-auto z-30">
          <div className="p-6">
            <RankingApoiadores />
          </div>
        </aside>

        <main className="flex-1 lg:ml-80 pt-6 pb-20">
          <div className="max-w-5xl mx-auto px-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-7 w-full p-1 bg-card rounded-xl mb-6">
                {/* ... seus triggers ... */}
              </TabsList>

              {/* OUTRAS ABAS */}
              <TabsContent value="ajustes-metas"><AjustesMetas /* props */ /></TabsContent>
              <TabsContent value="meta-desafio"><MetaDesafio /* props */ /></TabsContent>
              <TabsContent value="meta-alimentacao"><MetaAlimentacao /* props */ /></TabsContent>
              {bonusPerdidoAtivado && <TabsContent value="meta-perdido"><MetaPerdido /* props */ /></TabsContent>}
              <TabsContent value="meus-premios"><MeusPremios /* props */ /></TabsContent>

              {/* AQUI É O SEGREDO: PASSA A FUNÇÃO setRecebidoHoje PARA A META FIADO */}
              <TabsContent value="meta-fiado">
                <MetaFiado
                  userData={userData}
                  updateUserData={updateUserData}
                  diasSemExpediente={diasSemExpediente}
                  updateDiasSemExpediente={updateDiasSemExpediente}
                  diasRestantesCalculados={diasRestantesCalculados}
                  isLoading={isLoading}
                  bonusPerdidoAtivado={bonusPerdidoAtivado}
                  setRecebidoHoje={setRecebidoHoje}   // ← ESSA LINHA É O QUE FAZ FUNCIONAR!
                />
              </TabsContent>

              {/* HISTÓRICO RECEBE O VALOR CORRETO */}
              <TabsContent value="historicos">
                <Historicos
                  userData={userData}
                  updateUserData={updateUserData}
                  diasSemExpediente={diasSemExpediente}
                  updateDiasSemExpediente={updateDiasSemExpediente}
                  diasRestantesCalculados={diasRestantesCalculados}
                  isLoading={isLoading}
                  bonusPerdidoAtivado={bonusPerdidoAtivado}
                  recebido={recebidoHoje}   // ← VALOR DE HOJE (R$ 5.485,40)
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* ... resto do layout ... */}
    </div>
  );
};

export default DashboardLayout;
