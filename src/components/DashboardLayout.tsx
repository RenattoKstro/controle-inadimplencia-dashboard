import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Utensils, Gift, Sliders, LogOut, Menu, Calendar, AlertTriangle, History, Instagram, Video, File, FileText } from "lucide-react";
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
import Historicos from "./Historicos";
import { useUserData } from "@/hooks/useUserData";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import RelatoriosSabium from "./RelatoriosSabium";
import html2canvas from "html2canvas";
import { FaWhatsapp } from "react-icons/fa";
import { Calculator, Moon, Sun } from "lucide-react";
import VersaoLog from "./VersaoLog";
import Scripts from "./dashboard/Scripts";
import { RiScreenshot2Fill } from "react-icons/ri";
import { BiSolidReport } from "react-icons/bi";
import { Card, CardContent } from "@/components/ui/card";
import AvisosESugestoes from "./dashboard/AvisosESugestoes";
import Anexos from "./Anexos";
import Apps from "./Apps"; // Novo componente importado

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
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showCalendar, setShowCalendar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isNewHistorico, setIsNewHistorico] = useState(true);
  const [showInstagramUsername, setShowInstagramUsername] = useState(false);
  const [isScriptsOpen, setIsScriptsOpen] = useState(false);

  useEffect(() => {
    const fetchReceivedToday = async () => {
      if (userData && userData.abertura_vencido_mes && userData.vencido_atual) {
        const currentDate = new Date();
        const daysPassed = currentDate.getDate();
        const receivedSoFar = userData.abertura_vencido_mes - userData.vencido_atual;
        const dailyAverage = receivedSoFar > 0 ? receivedSoFar / daysPassed : 0;
        setRecebidoHoje(dailyAverage); // Usa média diária como fallback
      } else {
        console.log("[DashboardLayout] userData ou valores ausentes, usando recebidoHoje = 0");
        setRecebidoHoje(0);
      }
    };
    fetchReceivedToday();

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Autenticação não verificada",
          description: "Você não está autenticado. Deve sair do app e entrar novamente.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    checkAuth();

    const hasVisitedHistorico = localStorage.getItem("hasVisitedHistorico");
    if (!hasVisitedHistorico) {
      setIsNewHistorico(true);
    } else {
      setIsNewHistorico(false);
    }

    document.body.classList.toggle("dark", isDarkMode);
  }, [navigate, toast, userData, isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.body.classList.toggle("dark", newMode);
      return newMode;
    });
  };

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
    if (value === "historicos" && isNewHistorico) {
      setIsNewHistorico(false);
      localStorage.setItem("hasVisitedHistorico", "true");
    }
  };

  const handlePrintScreen = () => {
    if (contentRef.current) {
      html2canvas(document.body, {
        scale: 2,
        useCORS: true,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `dashboard_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const handleInstagramClick = () => {
    setShowInstagramUsername(true);
    setTimeout(() => setShowInstagramUsername(false), 2000);
  };

  const carteiraTotal = userData?.carteira_total || 0;
  const vencidoAtual = userData?.vencido_atual || 0;
  const percentualVencido = carteiraTotal > 0 ? ((vencidoAtual / carteiraTotal) * 100).toFixed(2) : null;

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
    if (!date) return "text-gray-400";
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return "text-red-500";
    if (dayOfWeek === 6) return "text-yellow-500";
    return "text-green-500";
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

  // Validação inicial de userData
  if (!userData && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-12 w-12" />
        <p className="text-foreground ml-2">Carregando dados do usuário...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background dark' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`} ref={contentRef}>
      <header className="bg-card shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {isMobile ? (
            <>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent flex items-center">
                Controle de Inadimplência
                {percentualVencido !== null && (
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text ml-2">
                    {percentualVencido}%
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-2">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Menu size={18} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80vw] sm:w-[350px] bg-card">
                    <div className="flex flex-col h-full">
                      <div className="py-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Apps</h2>
                      </div>
                      <Apps /> {/* Integração do novo componente Apps */}
                      <div className="py-4 border-t border-border">
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
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <VersaoLog />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex items-center gap-2 text-foreground hover:text-primary"
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
                    <div className="absolute right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-3 z-50 w-72">
                      <div className="flex justify-between items-center mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lg font-bold text-foreground"
                          onClick={() => handleMonthNavigation("prev")}
                        >
                          {"<"}
                        </Button>
                        <span className="text-base font-semibold text-foreground">
                          {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lg font-bold text-foreground"
                          onClick={() => handleMonthNavigation("next")}
                        >
                          {">"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                          <div key={day} className="text-sm font-medium text-muted-foreground">
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
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold flex items-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                <span>Controle de Inadimplência</span>
                {percentualVencido !== null && (
                  <span className="ml-2">{percentualVencido}%</span>
                )}
              </h1>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePrintScreen}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-2"
                >
                  <RiScreenshot2Fill className="h-4 w-4" />
                  Print Tela
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-foreground hover:text-primary"
                    >
                      <File className="h-4 w-4" />
                      Anexos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-card">
                    <Anexos />
                  </DialogContent>
                </Dialog>
                <Dialog open={isScriptsOpen} onOpenChange={setIsScriptsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-foreground hover:text-primary"
                    >
                      <FileText className="h-4 w-4" />
                      Scripts
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-card custom-dialog-no-close">
                    <Scripts onClose={() => setIsScriptsOpen(false)} />
                  </DialogContent>
                </Dialog>
                <div className="relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-foreground hover:text-primary"
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
                      <div className="absolute right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-3 z-50 w-72">
                        <div className="flex justify-between items-center mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-lg font-bold text-foreground"
                            onClick={() => handleMonthNavigation("prev")}
                          >
                            {"<"}
                          </Button>
                          <span className="text-base font-semibold text-foreground">
                            {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-lg font-bold text-foreground"
                            onClick={() => handleMonthNavigation("next")}
                          >
                            {">"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center">
                          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                            <div key={day} className="text-sm font-medium text-muted-foreground">
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
                      className="flex items-center gap-2 text-foreground hover:text-primary"
                    >
                      <BiSolidReport className="h-4 w-4" />
                      Relatórios Sabium
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-card">
                    <RelatoriosSabium />
                  </DialogContent>
                </Dialog>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-foreground hover:text-primary"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80vw] sm:w-[350px] bg-card">
                    <div className="flex flex-col h-full">
                      <div className="py-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Apps</h2>
                      </div>
                      <Apps /> {/* Integração do novo componente Apps */}
                      <div className="py-4 border-t border-border">
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
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <VersaoLog />
              </div>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <AvisosESugestoes userData={userData} recebidoHoje={recebidoHoje} />
        <Tabs 
          defaultValue="meta-fiado" 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-7 w-full p-1 bg-card shadow-sm rounded-xl">
            <TabsTrigger 
              value="ajustes-metas" 
              className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
              onClick={() => handleTabChange("ajustes-metas")}
            >
              <Sliders className="h-4 w-4" />
              <span className="text-foreground">Ajustes de Metas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="meta-fiado" 
              className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
              onClick={() => handleTabChange("meta-fiado")}
            >
              <Wallet className="h-4 w-4" />
              <span className="text-foreground">Meta Fiado</span>
            </TabsTrigger>
            <TabsTrigger 
              value="meta-desafio" 
              className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
              onClick={() => handleTabChange("meta-desafio")}
            >
              <Trophy className="h-4 w-4" />
              <span className="text-foreground">Meta Desafio</span>
            </TabsTrigger>
            {bonusPerdidoAtivado && (
              <TabsTrigger 
                value="meta-perdido" 
                className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
                onClick={() => handleTabChange("meta-perdido")}
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="text-foreground">Meta Perdido</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="meta-alimentacao" 
              className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
              onClick={() => handleTabChange("meta-alimentacao")}
            >
              <Utensils className="h-4 w-4" />
              <span className="text-foreground">Meta de Ticket</span>
            </TabsTrigger>
            <TabsTrigger 
              value="meus-premios" 
              className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
              onClick={() => handleTabChange("meus-premios")}
            >
              <Gift className="h-4 w-4" />
              <span className="text-foreground">Meus Prêmios</span>
            </TabsTrigger>
            <TabsTrigger 
              value="historicos" 
              className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
              onClick={() => handleTabChange("historicos")}
            >
              <History className="h-4 w-4" />
              <span className="text-foreground">Históricos</span>
              {isNewHistorico && <span className="text-destructive font-bold">N</span>}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ajustes-metas" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
            <AjustesMetas
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
              setBonusPerdidoAtivado={setBonusPerdidoAtivado}
            />
          </TabsContent>
          <TabsContent value="meta-fiado" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
            <MetaFiado 
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
              setRecebidoHoje={setRecebidoHoje}
            />
          </TabsContent>
          <TabsContent value="meta-desafio" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
            <MetaDesafio 
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
            />
          </TabsContent>
          <TabsContent value="meta-perdido" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
            {bonusPerdidoAtivado && (
              <MetaPerdido 
                userData={userData}
                updateUserData={updateUserData}
                diasSemExpediente={diasSemExpediente}
                updateDiasSemExpediente={updateDiasSemExpediente}
                diasRestantesCalculados={diasRestantesCalculados}
                isLoading={isLoading}
                bonusPerdidoAtivado={bonusPerdidoAtivado}
              />
            )}
          </TabsContent>
          <TabsContent value="meta-alimentacao" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
            <MetaAlimentacao 
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
            />
          </TabsContent>
          <TabsContent value="meus-premios" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
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
                setTotalGanhos={setTotalGanhos}
              />
            ) : (
              <div className="text-foreground">Carregando dados...</div>
            )}
          </TabsContent>
          <TabsContent value="historicos" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
            <Historicos 
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
              recebido={recebidoHoje}
              totalGanhos={totalGanhos}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-card shadow-md mt-6 p-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 blink-slow" style={{ animation: "blink-slow 2s infinite" }}>
            <FaWhatsapp className="h-5 w-5 text-success" />
            <a
              href="https://chat.whatsapp.com/GTc7DQBgrzqG1fmmHAcmPl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-xs"
            >
              Ajuda, Dicas e Sugestões entre no grupo e fique atualizado sobre novas funções!
            </a>
          </div>
          <div className="flex items-center gap-2 relative">
            <Instagram 
              className="h-5 w-5 text-pink-600 cursor-pointer"
              onClick={handleInstagramClick}
            />
            {showInstagramUsername && (
              <span className="absolute right-0 top-full mt-1 text-pink-600 text-xs bg-card p-1 rounded shadow-md">
                @renato_alme1da
              </span>
            )}
          </div>
        </div>
        <style>
          {`
            @keyframes blink-slow {
              0% { opacity: 1; }
              50% { opacity: 0.3; }
              100% { opacity: 1; }
            }
          `}
        </style>
      </footer>

      <style>
        {`
          .custom-dialog-no-close .radix-dialog-close {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default DashboardLayout;
