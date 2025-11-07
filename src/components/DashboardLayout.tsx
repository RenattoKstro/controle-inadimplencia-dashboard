// src/app/dashboard/page.tsx
import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet, Trophy, Utensils, Gift, Sliders, Menu,
  Calendar, AlertTriangle, History, Instagram, File, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
import AvisoApoio from "@/components/AvisoApoio";
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
  const [recebidoHoje, setRecebidoHoje] = useState(0);
  const [totalGanhos, setTotalGanhos] = useState(0);
  const [layoutVersion, setLayoutVersion] = useState<"V1" | "V2">("V1");
  const today = new Date();
  const [showCalendar, setShowCalendar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isNewHistorico, setIsNewHistorico] = useState(true);
  const [showInstagramUsername, setShowInstagramUsername] = useState(false);

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
    if (userData?.abertura_vencido_mes && userData?.vencido_atual) {
      const days = new Date().getDate();
      const received = userData.abertura_vencido_mes - userData.vencido_atual;
      setRecebidoHoje(received > 0 ? received / days : 0);
    }
    setIsNewHistorico(!localStorage.getItem("hasVisitedHistorico"));
    document.body.classList.toggle("dark", isDarkMode);
  }, [userData, isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Tchau!" });
    navigate("/auth");
  };

  const handleTabChange = (v: string) => {
    setActiveTab(v);
    if (isMobile) setSheetOpen(false);
    if (v === "historicos" && isNewHistorico) {
      setIsNewHistorico(false);
      localStorage.setItem("hasVisitedHistorico", "true");
    }
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
      {/* HEADER (igual antes) */}
      <header className="bg-card shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* ... (mesmo código do header anterior) */}
          {/* COLOQUE AQUI O HEADER QUE JÁ TINHA */}
        </div>
      </header>

      {/* CALENDÁRIO (igual antes) */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCalendar(false)}>
          <div className="bg-card p-6 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* ... (mesmo calendário) */}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ABAS (igual antes) */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* ... (todas as TabsList e TabsContent do código anterior) */}
        </Tabs>

        {/* RANKING DOS HERÓIS */}
        <div className="mt-16">
          <RankingApoiadores />
        </div>
      </main>

      <footer className="bg-card shadow-md mt-8 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <FaWhatsapp className="text-green-600" />
            <a href="https://chat.whatsapp.com/GTc7DQBgrzqG1fmmHAcmPl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Grupo de Ajuda
            </a>
          </div>
          <Instagram className="text-pink-600 cursor-pointer" onClick={instagram} />
          {showInstagramUsername && <span className="text-pink-600 text-xs bg-card px-2 py-1 rounded shadow">@renato_alme1da</span>}
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
