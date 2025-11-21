// src/app/dashboard/page.tsx
import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet, Trophy, Utensils, Gift, Sliders, Menu,
  Calendar, AlertTriangle, History, Instagram, File, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client"; // ← CORRIGIDO AQUI!
import { useNavigate } from "react-router-dom";
import Metas from "./dashboard/Metas";
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

  if (!userData && !isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Carregando...</p></div>;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background dark' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`} ref={contentRef}>
      {/* HEADER */}
      <header className="bg-card shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {isMobile ? (
            <>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Inadimplência {percentual && `${percentual}%`}
              </h1>
              <div className="flex gap-2">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild><Button variant="outline" size="icon"><Menu /></Button></SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="py-6 border-b"><h2 className="text-lg font-bold">Apps</h2></div>
                    <Apps />
                    <div className="py-4 border-t"><Button variant="destructive" className="w-full" onClick={handleLogout}>Sair</Button></div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" size="icon" onClick={toggleDarkMode}>{isDarkMode ? <Sun /> : <Moon />}</Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Controle de Inadimplência {percentual && `${percentual}%`}
              </h1>
              <div className="flex gap-3">
                <Button onClick={print} variant="outline" className="gap-2">
                  <RiScreenshot2Fill className="w-5 h-5" /> Print
                </Button>
                <Dialog><DialogTrigger asChild><Button variant="outline" className="gap-2"><File className="w-4 h-4" /> Anexos</Button></DialogTrigger><DialogContent><Anexos /></DialogContent></Dialog>
                <Dialog><DialogTrigger asChild><Button variant="outline" className="gap-2"><BiSolidReport className="w-5 h-5" /> Relatórios</Button></DialogTrigger><DialogContent className="max-w-2xl"><RelatoriosSabium /></DialogContent></Dialog>
                <Button variant="outline" size="sm" onClick={() => setShowCalendar(!showCalendar)} className="gap-2">
                  <Calendar className="h-4 w-4" /> {today.toLocaleDateString("pt-BR")}
                </Button>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild><Button variant="outline" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
                  <SheetContent side="right" className="w-80"><Apps /><div className="mt-8"><Button variant="destructive" className="w-full" onClick={handleLogout}>Sair</Button></div></SheetContent>
                </Sheet>
                <Button variant="outline" size="icon" onClick={toggleDarkMode}>{isDarkMode ? <Sun className="h-5 h-5" /> : <Moon className="h-5 h-5" />}</Button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="relative pt-6 pb-20">
        <div className="max-w-5xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* ... suas tabs iguais */}
          </Tabs>
        </div>

        {/* RANKING FIXO NO CANTO INFERIOR DIREITO */}
        <div className="fixed bottom-6 right-6 z-50">
          <RankingApoiadores />
        </div>

        {/* RANKING NO CELULAR (embaixo) */}
        <div className="lg:hidden mt-8 px-4">
          <RankingApoiadores />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-card shadow-md p-4 mt-8">
        {/* ... seu footer igual */}
      </footer>
    </div>
  );
};

export default DashboardLayout;
