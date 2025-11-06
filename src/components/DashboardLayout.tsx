import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Utensils, Gift, Sliders, LogOut, Menu, Calendar, AlertTriangle, History, Instagram, Video, File, FileText } from "lucide-react";
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
import { Calculator, Moon, Sun } from "lucide-react";
import { RiScreenshot2Fill } from "react-icons/ri";
import { BiSolidReport } from "react-icons/bi";
import { Card, CardContent } from "@/components/ui/card";
import Anexos from "./Anexos";
import Apps from "./Apps";
import MetaPerdido from "./dashboard/MetaPerdido";
import { TbEar } from "react-icons/tb";

export interface DashboardProps {
  userData: any;
  updateUserData: (data: any) => void;
  diasSemExpediente: Date[];
  updateDiasSemExpediente: (dias: Date[]) => void;
  diasRestantesCalculados: number;
  isLoading: boolean;
  bonusPerdidoAtivado: boolean;
  setBonusPerdidoAtivado: (value: boolean) => void;
  setTotalGanhos: (value: number) => void;
  totalGanhos: number;
}

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("meta-fiado");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bonusPerdidoAtivado, setBonusPerdidoAtivado] = useState(false);
  const {
    userData,
    updateUserData,
    diasSemExpediente,
    updateDiasSemExpediente,
    isLoading,
    diasRestantesCalculados
  } = useUserData();
  const [recebidoHoje, setRecebidoHoje] = useState(0);
  const [totalGanhos, setTotalGanhos] = useState(0);
  const [layoutVersion, setLayoutVersion] = useState<"V1" | "V2">("V1");
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showCalendar, setShowCalendar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isNewHistorico, setIsNewHistorico] = useState(true);
  const [showInstagramUsername, setShowInstagramUsername] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Sessão
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!data.session || error) {
        toast({ title: "Sessão expirada", description: "Redirecionando...", variant: "destructive" });
        await supabase.auth.signOut();
        navigate("/auth");
      }
    };
    checkSession();
    const intervalId = setInterval(checkSession, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [navigate, toast]);

  // Dados do dia
  useEffect(() => {
    const fetchReceivedToday = async () => {
      if (userData?.abertura_vencido_mes && userData?.vencido_atual) {
        const daysPassed = new Date().getDate();
        const receivedSoFar = userData.abertura_vencido_mes - userData.vencido_atual;
        setRecebidoHoje(receivedSoFar > 0 ? receivedSoFar / daysPassed : 0);
      }
    };
    fetchReceivedToday();

    const hasVisited = localStorage.getItem("hasVisitedHistorico");
    setIsNewHistorico(!hasVisited);
    document.body.classList.toggle("dark", isDarkMode);
  }, [userData, isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => {
    const newMode = !prev;
    document.body.classList.toggle("dark", newMode);
    return newMode;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Tchau!", description: "Volte sempre." });
    navigate("/auth");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isMobile) setSheetOpen(false);
    if (value === "historicos" && isNewHistorico) {
      setIsNewHistorico(false);
      localStorage.setItem("hasVisitedHistorico", "true");
    }
  };

  const handlePrintScreen = () => {
    if (!contentRef.current) return;
    html2canvas(document.body, { scale: 2, useCORS: true }).then(canvas => {
      const a = document.createElement("a");
      a.download = `dashboard_${new Date().toISOString().slice(0, 10)}.png`;
      a.href = canvas.toDataURL();
      a.click();
    });
  };

  const handleInstagramClick = () => {
    setShowInstagramUsername(true);
    setTimeout(() => setShowInstagramUsername(false), 2000);
  };

  const carteiraTotal = userData?.carteira_total || 0;
  const vencidoAtual = userData?.vencido_atual || 0;
  const percentualVencido = carteiraTotal > 0 ? ((vencidoAtual / carteiraTotal) * 100).toFixed(2) : null;

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const getCalendarDays = (date: Date) => {
    const days = [];
    for (let i = 0; i < getFirstDayOfMonth(date); i++) days.push(null);
    for (let i = 1; i <= getDaysInMonth(date); i++) days.push(new Date(date.getFullYear(), date.getMonth(), i));
    return days;
  };
  const getDayColor = (date: Date | null) => {
    if (!date) return "text-gray-400";
    const d = date.getDay();
    return d === 0 ? "text-red-500" : d === 6 ? "text-yellow-500" : "text-green-500";
  };
  const handleMonthNavigation = (dir: "prev" | "next") => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + (dir === "next" ? 1 : -1), 1));
  };

  if (!userData && !isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-foreground">Carregando...</p>
    </div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background dark' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`} ref={contentRef}>
      {/* HEADER */}
      <header className="bg-card shadow-md">
        <div className="max-w-7xl mx-auto px-2 py-4 flex items-center justify-between">
          {isMobile ? (
            <>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Controle de Inadimplência
                {percentualVencido && <span className="ml-2">{percentualVencido}%</span>}
              </h1>
              <div className="flex items-center gap-2">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9"><Menu size={18} /></Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80vw] sm:w-[350px] bg-card">
                    <div className="py-6 border-b"><h2 className="text-lg font-semibold">Apps</h2></div>
                    <Apps />
                    <div className="py-4 border-t">
                      <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        <LogOut size={16} className="mr-2" /> Sair
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCalendar(!showCalendar)}>
                  <Calendar className="h-5 w-5" />
                  {today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Controle de Inadimplência {percentualVencido && `${percentualVencido}%`}
              </h1>
              <div className="flex items-center gap-4">
                <Button onClick={handlePrintScreen} className="gap-2">
                  <RiScreenshot2Fill className="h-4 w-4" /> Print
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2"><File className="h-4 w-4" /> Anexos</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md"><Anexos /></DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2"><BiSolidReport className="h-4 w-4" /> Relatórios</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl"><RelatoriosSabium /></DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => setShowCalendar(!showCalendar)} className="gap-2">
                  <Calendar className="h-5 w-5" />
                  {today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </Button>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon"><Menu className="h-5 w-5" /></Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[350px] bg-card">
                    <div className="py-6 border-b"><h2 className="text-lg font-semibold">Apps</h2></div>
                    <Apps />
                    <div className="py-4 border-t">
                      <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        <LogOut size={16} className="mr-2" /> Sair
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLayoutVersion(prev => prev === "V1" ? "V2" : "V1")}>
                  {layoutVersion === "V1" ? "V2" : "V1"}
                </Button>
                <Button variant="outline" size="icon" onClick={() => setShowImageDialog(true)}>
                  <TbEar className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* CALENDÁRIO FLUTUANTE */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCalendar(false)}>
          <div className="bg-card p-6 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <Button variant="ghost" onClick={() => handleMonthNavigation("prev")}>{"<"}</Button>
              <span className="font-bold">{calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
              <Button variant="ghost" onClick={() => handleMonthNavigation("next")}>{">"}</Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(d => <div key={d} className="text-sm text-muted-foreground">{d}</div>)}
              {getCalendarDays(calendarMonth).map((day, i) => (
                <div key={i} className={`w-10 h-10 flex items-center justify-center rounded-full ${getDayColor(day)}`}>
                  {day?.getDate()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full p-1 bg-card rounded-xl">
            <TabsTrigger value="ajustes-metas" className="gap-2"><Sliders className="h-4 w-4" /> Ajustes</TabsTrigger>
            {layoutVersion === "V1" ? (
              <>
                <TabsTrigger value="meta-fiado" className="gap-2"><Wallet className="h-4 w-4" /> Fiado</TabsTrigger>
                <TabsTrigger value="meta-desafio" className="gap-2"><Trophy className="h-4 w-4" /> Desafio</TabsTrigger>
                <TabsTrigger value="meta-alimentacao" className="gap-2"><Utensils className="h-4 w-4" /> Alimentação</TabsTrigger>
              </>
            ) : (
              <TabsTrigger value="metas" className="gap-2"><Wallet className="h-4 w-4" /> Metas</TabsTrigger>
            )}
            {layoutVersion === "V1" && bonusPerdidoAtivado && (
              <TabsTrigger value="meta-perdido" className="gap-2"><AlertTriangle className="h-4 w-4" /> Perdido</TabsTrigger>
            )}
            <TabsTrigger value="meus-premios" className="gap-2"><Gift className="h-4 w-4" /> Prêmios</TabsTrigger>
            <TabsTrigger value="historicos" className="gap-2">
              <History className="h-4 w-4" /> Histórico
              {isNewHistorico && <span className="text-destructive font-bold ml-1">N</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ajustes-metas" className="bg-card p-6 rounded-xl"><AjustesMetas {...{ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado, setBonusPerdidoAtivado }} /></TabsContent>
          {layoutVersion === "V1" && (
            <>
              <TabsContent value="meta-fiado" className="bg-card p-6 rounded-xl"><MetaFiado {...{ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado, setRecebidoHoje }} /></TabsContent>
              <TabsContent value="meta-desafio" className="bg-card p-6 rounded-xl"><MetaDesafio {...{ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado, setRecebidoHoje }} /></TabsContent>
              <TabsContent value="meta-alimentacao" className="bg-card p-6 rounded-xl"><MetaAlimentacao {...{ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado, setRecebidoHoje }} /></TabsContent>
            </>
          )}
          {layoutVersion === "V2" && (
            <TabsContent value="metas" className="bg-card p-6 rounded-xl"><Metas {...{ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado, setRecebidoHoje }} /></TabsContent>
          )}
          {layoutVersion === "V1" && bonusPerdidoAtivado && (
            <TabsContent value="meta-perdido" className="bg-card p-6 rounded-xl"><MetaPerdido {...{ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado, setRecebidoHoje }} /></TabsContent>
          )}
          <TabsContent value="meus-premios" className="bg-card p-6 rounded-xl"><MeusPremios {...{ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado, setBonusPerdidoAtivado, setTotalGanhos }} /></TabsContent>
          <TabsContent value="historicos" className="bg-card p-6 rounded-xl"><Historicos {...{ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado, recebido: recebidoHoje, totalGanhos }} /></TabsContent>
        </Tabs>
      </main>

      {/* FOOTER */}
      <footer className="bg-card shadow-md mt-6 p-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <FaWhatsapp className="h-5 w-5 text-success" />
            <a href="https://chat.whatsapp.com/GTc7DQBgrzqG1fmmHAcmPl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
              Grupo de Ajuda no WhatsApp
            </a>
          </div>
          <Instagram className="h-5 w-5 text-pink-600 cursor-pointer" onClick={handleInstagramClick} />
          {showInstagramUsername && <span className="absolute mt-8 text-pink-600 text-xs bg-card p-1 rounded shadow"> @renato_alme1da </span>}
        </div>
      </footer>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-2xl">
          <img src="https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/qlick.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL3FsaWNrLmpwZWciLCJpYXQiOjE3NjAwNDMxMTIsImV4cCI6MTc2MjYzNTExMn0.qGyktssM84jEByd8WRk6tAyR8xCXO5-ncsLWA3zdLfw" alt="Qlick" className="w-full" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardLayout;
