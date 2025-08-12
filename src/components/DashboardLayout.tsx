import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Utensils, Gift, Sliders, LogOut, Menu, Calendar, AlertTriangle, History, Instagram, Video, File, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Metas from "./dashboard/Metas";
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
import Anexos from "./Anexos";
import Apps from "./Apps";

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
  const [activeTab, setActiveTab] = useState("metas");
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

  // Verificação de sessão aprimorada
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!data.session || error) {
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Você será redirecionado para a autenticação.",
          variant: "destructive",
        });
        await supabase.auth.signOut(); // Limpa sessão local e servidor
        navigate("/auth");
      } else {
        // Atualiza o estado da sessão localmente
        const { user, session } = data;
        if (user && session) {
          updateUserData({ ...userData, session });
        }
      }
    };

    // Verifica imediatamente ao carregar
    checkSession();

    // Intervalo de verificação (ajustado para 10 minutos, pode mudar conforme necessário)
    const intervalId = setInterval(checkSession, 10 * 60 * 1000); // 10 minutos

    // Limpa o intervalo ao desmontar
    return () => clearInterval(intervalId);
  }, [navigate, toast, updateUserData, userData]);

  useEffect(() => {
    const fetchReceivedToday = async () => {
      if (userData && userData.abertura_vencido_mes && userData.vencido_atual) {
        const currentDate = new Date();
        const daysPassed = currentDate.getDate();
        const receivedSoFar = userData.abertura_vencido_mes - userData.vencido_atual;
        const dailyAverage = receivedSoFar > 0 ? receivedSoFar / daysPassed : 0;
        setRecebidoHoje(dailyAverage);
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
        <div className="max-w-7xl mx-auto px-2 py-4 flex items-center justify-between">
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
                      <Apps />
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
              <h1 className="text-2xl font-bold flex items-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent flex-shrink-0">
                <span>Controle de Inadimplência</span>
                {percentualVencido !== null && (
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text ml-2">
                    {percentualVencido}%
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-4">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="space-x-2">
                  <TabsList>
                    <TabsTrigger value="metas" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" /> Metas
                    </TabsTrigger>
                    <TabsTrigger value="meuspremios" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" /> Meus Prêmios
                    </TabsTrigger>
                    <TabsTrigger value="ajustesmetas" className="flex items-center gap-2">
                      <Sliders className="h-4 w-4" /> Ajustes de Metas
                    </TabsTrigger>
                    <TabsTrigger value="historicos" className="flex items-center gap-2">
                      <History className="h-4 w-4" /> Históricos
                    </TabsTrigger>
                    <TabsTrigger value="relatorios" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Relatórios
                    </TabsTrigger>
                    <TabsTrigger value="anexos" className="flex items-center gap-2">
                      <File className="h-4 w-4" /> Anexos
                    </TabsTrigger>
                    <TabsTrigger value="scripts" className="flex items-center gap-2">
                      <Video className="h-4 w-4" /> Scripts
                    </TabsTrigger>
                    {bonusPerdidoAtivado && (
                      <TabsTrigger value="metaperdido" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" /> Meta Perdido
                      </TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <VersaoLog />
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 flex items-center gap-2">
                      <RiScreenshot2Fill size={18} /> Print Screen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-foreground">Captura de tela salva como PNG!</p>
                      <Button
                        variant="default"
                        onClick={handlePrintScreen}
                        className="w-full"
                      >
                        Confirmar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 flex items-center gap-2"
                  onClick={handleInstagramClick}
                >
                  <Instagram size={18} />
                  <span>Instagram</span>
                  {showInstagramUsername && (
                    <span className="absolute -bottom-6 left-0 bg-card border border-border rounded p-1 text-xs text-foreground">
                      @sbsistemasoficial
                    </span>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Sair
                </Button>
              </div>
            </>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-2 py-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsContent value="metas">
            <Metas
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
              setBonusPerdidoAtivado={setBonusPerdidoAtivado}
              setTotalGanhos={setTotalGanhos}
              totalGanhos={totalGanhos}
              setRecebidoHoje={setRecebidoHoje}
            />
          </TabsContent>
          <TabsContent value="meuspremios">
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
              totalGanhos={totalGanhos}
            />
          </TabsContent>
          <TabsContent value="ajustesmetas">
            <AjustesMetas
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
              setBonusPerdidoAtivado={setBonusPerdidoAtivado}
              setTotalGanhos={setTotalGanhos}
              totalGanhos={totalGanhos}
            />
          </TabsContent>
          <TabsContent value="historicos">
            <Historicos
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
              setBonusPerdidoAtivado={setBonusPerdidoAtivado}
              setTotalGanhos={setTotalGanhos}
              totalGanhos={totalGanhos}
            />
          </TabsContent>
          <TabsContent value="relatorios">
            <RelatoriosSabium
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
              setBonusPerdidoAtivado={setBonusPerdidoAtivado}
              setTotalGanhos={setTotalGanhos}
              totalGanhos={totalGanhos}
            />
          </TabsContent>
          <TabsContent value="anexos">
            <Anexos
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
              setBonusPerdidoAtivado={setBonusPerdidoAtivado}
              setTotalGanhos={setTotalGanhos}
              totalGanhos={totalGanhos}
            />
          </TabsContent>
          <TabsContent value="scripts">
            <Scripts
              userData={userData}
              updateUserData={updateUserData}
              diasSemExpediente={diasSemExpediente}
              updateDiasSemExpediente={updateDiasSemExpediente}
              diasRestantesCalculados={diasRestantesCalculados}
              isLoading={isLoading}
              bonusPerdidoAtivado={bonusPerdidoAtivado}
              setBonusPerdidoAtivado={setBonusPerdidoAtivado}
              setTotalGanhos={setTotalGanhos}
              totalGanhos={totalGanhos}
              isScriptsOpen={isScriptsOpen}
              setIsScriptsOpen={setIsScriptsOpen}
            />
          </TabsContent>
          {bonusPerdidoAtivado && (
            <TabsContent value="metaperdido">
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Meta Perdido
                </h2>
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <AlertTriangle className="text-red-500" />
                      Meta Perdido
                    </CardTitle>
                    <CardDescription className="text-foreground">
                      Acompanha os valores perdidos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">Valor Perdido</div>
                      <div className="text-xl md:text-2xl font-bold text-foreground">
                        {formatCurrency(userData?.bonus_perdido || 0)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-foreground">Progresso</span>
                        <span className="text-sm font-medium text-foreground">
                          {formatPercentage((userData?.bonus_perdido || 0) / (userData?.meta_mes || 1) * 100)}
                        </span>
                      </div>
                      <div
                        className="w-full bg-white rounded-full h-4 md:h-6 shadow-inner"
                        style={{ backgroundColor: "#ffffff", boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-in-out"
                          style={{
                            width: `${Math.min(100, ((userData?.bonus_perdido || 0) / (userData?.meta_mes || 1)) * 100)}%`,
                            background: "linear-gradient(to right, #ff4d4d, #ff6666)",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

// Função formatCurrency ausente no escopo original, adicionada aqui para evitar erro
const formatCurrency = (value: number | null): string => {
  if (value === null || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Função formatPercentage ausente no escopo original, adicionada aqui para evitar erro
const formatPercentage = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) return "0,00%";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export default DashboardLayout;
