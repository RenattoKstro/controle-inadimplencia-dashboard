import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Utensils, Gift, Sliders, LogOut, Menu, Calendar, MessageCircle, Instagram, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import MetaFiado from "./dashboard/MetaFiado";
import MetaDesafio from "./dashboard/MetaDesafio";
import MetaPerdido from "./dashboard/MetaPerdido";
import MetaAlimentacao from "./dashboard/MetaAlimentacao";
import MeusPremios from "./dashboard/MeusPremios";
import AjustesMetas from "./dashboard/AjustesMetas";
import { useUserData } from "@/hooks/useUserData";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RelatoriosSabium from "./RelatoriosSabium";
import jsPDF from "jspdf/dist/jspdf.umd.min.js"; // Mantido, mas não usado
import autoTable from "jspdf-autotable"; // Mantido, mas não usado
import gsap from "gsap";
import html2canvas from "html2canvas";

// Tipos para os dados das metas
interface MetaData {
  title: string;
  data: { item: string; value: string }[];
}

export interface DashboardProps {
  userData: any;
  updateUserData: (data: any) => void;
  diasSemExpediente: Date[];
  updateDiasSemExpediente: (dias: Date[]) => void;
  diasRestantesCalculados: number;
  isLoading: boolean;
  bonusPerdidoAtivado: boolean;
  setBonusPerdidoAtivado: (value: boolean) => void;
  onMetaDataUpdate?: (data: MetaData) => void;
}

// Componente da Barra de Navegação Animada
const AnimatedNavBar = ({ progress }: { progress: number }) => {
  const swimmerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      ".water",
      { backgroundPositionX: "0%" },
      { backgroundPositionX: "-100%", duration: 2, repeat: -1, ease: "linear" }
    );

    if (swimmerRef.current) {
      const maxWidth = 80;
      const newPosition = (progress / 100) * maxWidth;
      gsap.to(swimmerRef.current, {
        left: `${newPosition}%`,
        duration: 1,
        ease: "power2.out",
      });
    }
  }, [progress]);

  return (
    <div className="w-full h-16 relative bg-[var(--sidebar-background)] overflow-hidden mb-4">
      <div className="absolute right-0 top-0 h-full w-20 bg-[var(--sidebar-primary)] flex items-center justify-center">
        <span className="text-[var(--sidebar-primary-foreground)] font-bold">Praia</span>
      </div>
      <div className="water absolute top-0 left-0 h-full w-[80%] bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] animate-wave" />
      <div
        ref={swimmerRef}
        className="absolute top-2 w-6 h-6 bg-[var(--destructive)] rounded-full flex items-center justify-center text-[var(--destructive-foreground)] text-xs"
        style={{ left: "0%" }}
      >
        🏊‍♂️
      </div>
      <div className="absolute top-16 w-full text-center text-[var(--foreground)] text-sm">
        Progresso: {progress}%
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  console.log("DashboardLayout renderizado");
  const [activeTab, setActiveTab] = useState("meta-fiado");
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
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showCalendar, setShowCalendar] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [metaDataList, setMetaDataList] = useState<MetaData[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log("userData:", userData);
    if (userData) {
      setBonusPerdidoAtivado(!!userData.bonusPerdidoAtivado);
      const totalMetas = metaDataList.length;
      const completedMetas = metaDataList.filter(meta => 
        meta.data.some(row => parseFloat(row.value) > 0)
      ).length;
      const newProgress = totalMetas > 0 ? (completedMetas / totalMetas) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, newProgress)));
    }
  }, [userData, metaDataList]);

  useEffect(() => {
    console.log("DashboardLayout useEffect executado", userData);
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

  const exportToImage = () => {
    if (!dashboardRef.current) return;
    const dialog = document.querySelector("dialog[open]");
    if (dialog) dialog.style.display = "none";
    html2canvas(dashboardRef.current, { scale: 4, useCORS: true }).then((canvas) => {
      if (dialog) dialog.style.display = "";
      const link = document.createElement("a");
      link.download = `relatorio_completo_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    });
  };

  const handleMetaDataUpdate = (data: MetaData) => {
    setMetaDataList(prev => {
      const existingIndex = prev.findIndex(item => item.title === data.title);
      if (existingIndex >= 0) {
        const newList = [...prev];
        newList[existingIndex] = data;
        return newList;
      }
      return [...prev, data];
    });
  };

  const renderTabs = () => (
    <TabsList className={`grid grid-cols-6 w-full p-1 bg-[var(--card)] shadow-sm rounded-xl ${isMobile ? 'grid-cols-1 gap-2' : ''}`}>
      <TabsTrigger 
        value="ajustes-metas" 
        className="flex items-center gap-2 data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]"
        onClick={() => handleTabChange("ajustes-metas")}
      >
        <Sliders className="h-4 w-4" />
        <span>Ajustes de Metas</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meta-fiado" 
        className="flex items-center gap-2 data-[state=active]:bg-[var(--secondary)] data-[state=active]:text-[var(--secondary-foreground)]"
        onClick={() => handleTabChange("meta-fiado")}
      >
        <Wallet className="h-4 w-4" />
        <span>Meta Fiado</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meta-desafio" 
        className="flex items-center gap-2 data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-foreground)]"
        onClick={() => handleTabChange("meta-desafio")}
      >
        <Trophy className="h-4 w-4" />
        <span>Meta Desafio</span>
      </TabsTrigger>
      {bonusPerdidoAtivado && (
        <TabsTrigger 
          value="meta-perdido" 
          className="flex items-center gap-2 data-[state=active]:bg-[var(--destructive)] data-[state=active]:text-[var(--destructive-foreground)]"
          onClick={() => handleTabChange("meta-perdido")}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Meta Perdido</span>
        </TabsTrigger>
      )}
      <TabsTrigger 
        value="meta-alimentacao" 
        className="flex items-center gap-2 data-[state=active]:bg-[var(--muted)] data-[state=active]:text-[var(--muted-foreground)]"
        onClick={() => handleTabChange("meta-alimentacao")}
      >
        <Utensils className="h-4 w-4" />
        <span>Meta de Ticket</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meus-premios" 
        className="flex items-center gap-2 data-[state=active]:bg-[var(--sidebar-accent)] data-[state=active]:text-[var(--sidebar-accent-foreground)]"
        onClick={() => handleTabChange("meus-premios")}
      >
        <Gift className="h-4 w-4" />
        <span>Meus Prêmios</span>
      </TabsTrigger>
    </TabsList>
  );

  const renderTabsContent = () => (
    <>
      <TabsContent value="ajustes-metas" className="bg-[var(--card)] p-4 md:p-6 rounded-xl shadow-sm">
        <AjustesMetas
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
          setBonusPerdidoAtivado={setBonusPerdidoAtivado}
          onMetaDataUpdate={handleMetaDataUpdate}
        />
      </TabsContent>
      <TabsContent value="meta-fiado" className="bg-[var(--card)] p-4 md:p-6 rounded-xl shadow-sm">
        <MetaFiado 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
          onMetaDataUpdate={handleMetaDataUpdate}
        />
      </TabsContent>
      <TabsContent value="meta-desafio" className="bg-[var(--card)] p-4 md:p-6 rounded-xl shadow-sm">
        <MetaDesafio 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
          onMetaDataUpdate={handleMetaDataUpdate}
        />
      </TabsContent>
      <TabsContent value="meta-perdido" className="bg-[var(--card)] p-4 md:p-6 rounded-xl shadow-sm">
        {bonusPerdidoAtivado && (
          <MetaPerdido 
            userData={userData}
            updateUserData={updateUserData}
            diasSemExpediente={diasSemExpediente}
            updateDiasSemExpediente={updateDiasSemExpediente}
            diasRestantesCalculados={diasRestantesCalculados}
            isLoading={isLoading}
            bonusPerdidoAtivado={bonusPerdidoAtivado}
            onMetaDataUpdate={handleMetaDataUpdate}
          />
        )}
      </TabsContent>
      <TabsContent value="meta-alimentacao" className="bg-[var(--card)] p-4 md:p-6 rounded-xl shadow-sm">
        <MetaAlimentacao 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
          onMetaDataUpdate={handleMetaDataUpdate}
        />
      </TabsContent>
      <TabsContent value="meus-premios" className="bg-[var(--card)] p-4 md:p-6 rounded-xl shadow-sm">
        {userData ? (
          <MeusPremios 
            userData={userData}
            updateUserData={updateUserData}
            diasSemExpediente={diasSemExpediente}
            updateDiasSemExpediente={updateDiasSemExpediente}
            diasRestantesCalculados={diasRestantesCalculados}
            isLoading={isLoading}
            bonusPerdidoAtivado={bonusPerdidoAtivado}
            setBonusPerdidoAtivado={setBonusPerdidoAtivado}
            onMetaDataUpdate={handleMetaDataUpdate}
          />
        ) : (
          <div>Carregando dados...</div>
        )}
      </TabsContent>
    </>
  );

  const getDaysInMonth = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return 0;
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return 0;
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getCalendarDays = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date provided to getCalendarDays:", date);
      return [];
    }
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(date.getFullYear(), date.getMonth(), i);
      days.push(d);
    }
    return days;
  };

  const getDayColor = (date: Date | null) => {
    if (!date) return "text-[var(--muted-foreground)]";
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return "text-[var(--destructive)]";
    if (dayOfWeek === 6) return "text-[var(--accent-foreground)]";
    return "text-[var(--muted-foreground)]";
  };

  const handleMonthNavigation = (direction: "prev" | "next") => {
    setCalendarMonth((prev) => {
      if (!(prev instanceof Date) || isNaN(prev.getTime())) {
        console.error("Invalid calendarMonth state:", prev);
        return new Date(today.getFullYear(), today.getMonth(), 1);
      }
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + (direction === "next" ? 1 : -1), 1);
      if (isNaN(newMonth.getTime())) {
        console.error("Invalid new month calculated:", newMonth);
        return prev;
      }
      return newMonth;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]" ref={dashboardRef}>
      <header className="bg-[var(--card)] shadow-md">
        <AnimatedNavBar progress={progress} />
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {isMobile ? (
            <>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                Controle <span className="text-sm font-normal bg-[var(--primary)] text-[var(--primary-foreground)] px-1 py-0.5 rounded-md ml-1">Beta</span>
              </h1>
              <div className="flex items-center gap-2">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-[var(--border)]">
                      <Menu size={18} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80vw] sm:w-[350px] bg-[var(--card)] border-[var(--border)]">
                    <div className="flex flex-col h-full">
                      <div className="py-6 border-b border-[var(--border)]">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Menu de Navegação</h2>
                      </div>
                      <div className="py-4 flex-1">
                        <div className="space-y-2">
                          {["ajustes-metas", "meta-fiado", "meta-desafio", "meta-perdido", "meta-alimentacao", "meus-premios"].map((tab) => (
                            <Button
                              key={tab}
                              variant="ghost"
                              className={`w-full justify-start ${activeTab === tab ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}
                              onClick={() => handleTabChange(tab)}
                            >
                              {tab === "ajustes-metas" && <Sliders className="h-4 w-4 mr-2" />}
                              {tab === "meta-fiado" && <Wallet className="h-4 w-4 mr-2" />}
                              {tab === "meta-desafio" && <Trophy className="h-4 w-4 mr-2" />}
                              {tab === "meta-perdido" && <AlertTriangle className="h-4 w-4 mr-2" />}
                              {tab === "meta-alimentacao" && <Utensils className="h-4 w-4 mr-2" />}
                              {tab === "meus-premios" && <Gift className="h-4 w-4 mr-2" />}
                              {tab === "ajustes-metas" && "Ajustes de Metas"}
                              {tab === "meta-fiado" && "Meta Fiado"}
                              {tab === "meta-desafio" && "Meta Desafio"}
                              {tab === "meta-perdido" && "Meta Perdido"}
                              {tab === "meta-alimentacao" && "Meta de Ticket"}
                              {tab === "meus-premios" && "Meus Prêmios"}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="py-4 border-t border-[var(--border)]">
                        <Button 
                          variant="destructive" 
                          className="w-full text-[var(--destructive-foreground)]"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2" />
                          Sair
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex items-center gap-2 text-[var(--foreground)] border-[var(--border)] hover:text-[var(--primary)]"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">
                      {today.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </Button>
                  {showCalendar && (
                    <div className="absolute right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg p-3 z-50 w-72">
                      <div className="flex justify-between items-center mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lg font-bold text-[var(--foreground)]"
                          onClick={() => handleMonthNavigation("prev")}
                        >
                          {"<"}
                        </Button>
                        <span className="text-base font-semibold text-[var(--foreground)]">
                          {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lg font-bold text-[var(--foreground)]"
                          onClick={() => handleMonthNavigation("next")}
                        >
                          {">"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                          <div key={day} className="text-sm font-medium text-[var(--muted-foreground)]">
                            {day}
                          </div>
                        ))}
                        {getCalendarDays(calendarMonth).map((day, index) => (
                          <div
                            key={index}
                            className={`text-lg w-10 h-10 flex items-center justify-center rounded-full ${getDayColor(day)}`}
                          >
                            {day ? day.getDate() : ""}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="h-9 flex items-center border-[var(--border)] text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)]">
                  <LogOut size={16} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                Controle de Inadimplência <span className="text-sm font-normal bg-[var(--primary)] text-[var(--primary-foreground)] px-1.5 py-0.5 rounded-md ml-1">Beta</span>
              </h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-[var(--foreground)] border-[var(--border)] hover:text-[var(--primary)]"
                        onClick={() => setShowCalendar(!showCalendar)}
                      >
                        <Calendar className="h-5 w-5" />
                        <span className="text-sm">
                          {today.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </Button>
                    </DialogTrigger>
                    {showCalendar && (
                      <div className="absolute right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg p-3 z-50 w-72">
                        <div className="flex justify-between items-center mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-lg font-bold text-[var(--foreground)]"
                            onClick={() => handleMonthNavigation("prev")}
                          >
                            {"<"}
                          </Button>
                          <span className="text-base font-semibold text-[var(--foreground)]">
                            {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-lg font-bold text-[var(--foreground)]"
                            onClick={() => handleMonthNavigation("next")}
                          >
                            {">"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center">
                          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                            <div key={day} className="text-sm font-medium text-[var(--muted-foreground)]">
                              {day}
                            </div>
                          ))}
                          {getCalendarDays(calendarMonth).map((day, index) => (
                            <div
                              key={index}
                              className={`text-lg w-10 h-10 flex items-center justify-center rounded-full ${getDayColor(day)}`}
                            >
                              {day ? day.getDate() : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Dialog>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-[var(--foreground)] border-[var(--border)] hover:text-[var(--primary)]"
                    >
                      Relatórios Sabium
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl h-[80vh] overflow-y-auto bg-[var(--card)] border-[var(--border)] p-6 rounded-lg shadow-lg">
                    <RelatoriosSabium />
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-[var(--foreground)] border-[var(--border)] hover:text-[var(--primary)]"
                    >
                      Print Tela
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[var(--card)] border-[var(--border)]">
                    <DialogHeader>
                      <DialogTitle className="text-[var(--foreground)]">Capturar Tela</DialogTitle>
                      <DialogDescription className="text-[var(--muted-foreground)]">
                        Clique no botão abaixo para capturar a tela como imagem.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="default"
                        onClick={exportToImage}
                        className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]"
                      >
                        Print Tela
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 border-[var(--border)] text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)]">
                  <LogOut size={16} />
                  <span>Sair</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-[var(--muted)] p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-3 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[var(--primary)]" />
            <a
              href="https://wa.me/68992237305"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline font-medium"
            >
              Suporte WhatsApp: (68) 99223-7305
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-[var(--accent-foreground)]" />
            <a
              href="https://instagram.com/renato_alme1da"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-foreground)] hover:underline font-medium"
            >
              @renato_alme1da
            </a>
          </div>
        </div>

        <Tabs 
          defaultValue="meta-fiado" 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          {renderTabs()}
          {renderTabsContent()}
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardLayout;