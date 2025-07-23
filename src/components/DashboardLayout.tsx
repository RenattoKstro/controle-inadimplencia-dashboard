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
import CalculadoraRentabilidade from "./dashboard/CalculadoraRentabilidade";
import { Calculator, Moon, Sun } from "lucide-react";
import VersaoLog from "./VersaoLog";
import Scripts from "./dashboard/Scripts";
import { RiScreenshot2Fill } from "react-icons/ri";
import { BiSolidReport } from "react-icons/bi";
import { Card, CardContent } from "@/components/ui/card";

export interface DashboardProps {
  userData: any;
  updateUserData: (data: any) => void;
  diasSemExpediente: Date[];
  updateDiasSemExpediente: (dias: Date[]) => void;
  diasRestantesCalculados: number;
  isLoading: boolean;
  bonusPerdidoAtivado: boolean;
  setBonusPerdidoAtivado: (value: boolean) => void;
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
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showCalendar, setShowCalendar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isNewHistorico, setIsNewHistorico] = useState(true);
  const [showInstagramUsername, setShowInstagramUsername] = useState(false);
  const [isScriptsOpen, setIsScriptsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("Analisando dados..."); // Estado para sugestão

  useEffect(() => {
    const fetchReceivedToday = async () => {
      if (userData && userData.abertura_vencido_mes && userData.vencido_atual) {
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().slice(0, 10);
        const lastDay = currentDate.toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("historico_diario")
          .select("recebido, data_recebimento")
          .eq("user_id", userData.id)
          .gte("data_recebimento", firstDay)
          .lte("data_recebimento", lastDay);

        if (error) {
          console.error("Erro ao buscar histórico diário:", error.message);
          return;
        }

        if (data && data.length > 0) {
          const todayData = data.find((record) => record.data_recebimento === lastDay);
          const receivedToday = todayData ? todayData.recebido || 0 : 0;
          const receivedSoFar = userData.abertura_vencido_mes - userData.vencido_atual;
          const daysPassed = currentDate.getDate();
          const dailyAverage = receivedSoFar > 0 ? receivedSoFar / daysPassed : 0;
          const adjustedReceivedToday = Math.max(0, receivedToday || dailyAverage);
          setRecebidoHoje(adjustedReceivedToday);
        }
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

  useEffect(() => {
    if (userData && recebidoHoje > 0 && window.ml5) {
      generateSuggestions();
    }
  }, [userData, recebidoHoje]);

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

  const pdfList = [
    // ... (mantém a lista original)
  ];

  const apps = [
    { id: "calculadora", name: "Calculadora de Rentabilidade", icon: Calculator, component: CalculadoraRentabilidade },
    { id: "external-calculator", name: "Calculadora Rentabilidade (Externa)", icon: Calculator, url: "https://abre.ai/calrent" },
  ];

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

  const generateSuggestions = () => {
    if (!window.ml5 || !userData || !userData.abertura_vencido_mes || !userData.vencido_atual) {
      setSuggestion("Erro: ml5.js não carregado ou dados indisponíveis.");
      return;
    }

    const neuralNetwork = new ml5.neuralNetwork();
    const dailyReceipts = userData.historico_diario || [];
    const data = dailyReceipts.map(item => ({
      date: item.data_recebimento,
      value: item.recebido || 0,
      average: userData.meta_mes / 27,
      target: userData.meta_mes
    }));

    data.forEach(item => {
      neuralNetwork.addData({
        input: [item.value, item.average, item.target],
        output: { category: categorizePerformance(item.value, item.average, item.target) }
      });
    });

    function categorizePerformance(value, average, target) {
      if (value > average * 1.2) return "above";
      if (value < average * 0.8) return "below";
      if (isTrendingDown(data)) return "downtrend";
      if (isTrendingUp(data)) return "uptrend";
      if (target - value < target * 0.1) return "near_target";
      return "neutral";
    }

    function isTrendingDown(data) {
      const lastThree = data.slice(-3).map(d => d.value || 0);
      return lastThree[0] > lastThree[1] && lastThree[1] > lastThree[2];
    }

    function isTrendingUp(data) {
      const lastThree = data.slice(-3).map(d => d.value || 0);
      return lastThree[0] < lastThree[1] && lastThree[1] < lastThree[2];
    }

    neuralNetwork.train({ epochs: 50 }, () => {
      neuralNetwork.predict([recebidoHoje, userData.meta_mes / 27, userData.meta_mes], (err, results) => {
        if (err) {
          console.error("Erro na previsão:", err);
          setSuggestion("Erro ao gerar sugestão.");
          return;
        }
        const category = results[0].category;
        const daysLeft = userData.dias_restantes || diasRestantesCalculados;
        const remaining = Math.max(0, userData.meta_mes - userData.vencido_atual);
        const suggestions = {
          below: [
            "Você está abaixo da média nos últimos dias. Reforce as abordagens com os clientes recorrentes.",
            "Muitos dias consecutivos com baixo desempenho. Reavalie suas estratégias de cobrança.",
            "Evite deixar o desempenho fraco para o final do mês. Antecipe as ações.",
            "O valor médio diário caiu. Que tal revisar sua carteira de clientes?"
          ],
          above: [
            "Excelente! Seu desempenho ultrapassou a média. Continue com esse ritmo!",
            "Dias acima da meta detectados. Parabéns pela consistência!",
            "Você teve um pico de performance. Aproveite o momento para avançar mais.",
            "Resultados fortes! Use esse impulso para adiantar metas."
          ],
          downtrend: [
            "Houve uma queda no ritmo nos últimos 3 dias. Verifique se há atrasos acumulados.",
            "Tendência negativa detectada. É hora de ajustar o foco.",
            "Diminuição contínua nos valores recebidos. Reforce os contatos pendentes.",
            "O desempenho desacelerou. Considere ações imediatas para recuperar."
          ],
          uptrend: [
            "Sua performance está em alta. Mantenha o ritmo!",
            "A tendência de crescimento é clara. Aproveite para antecipar metas.",
            "Progresso consistente nos últimos dias. Ótimo trabalho!",
            "O gráfico mostra melhora. Continue com as estratégias atuais."
          ],
          near_target: [
            "Você está bem perto da meta! Foco total nos detalhes finais.",
            "Com mais um bom dia, você pode garantir sua meta. Força!",
            "Meta quase batida! Use isso como motivação extra.",
            "Reta final! Um pequeno esforço te separa do objetivo."
          ],
          neutral: daysLeft < 5
            ? [
                "Faltam poucos dias! Reforce as cobranças para garantir a meta.",
                "O prazo está acabando. Concentre-se nos clientes de maior valor.",
                "A reta final chegou. Foco total nos próximos dias!",
                "Use os últimos dias com inteligência: priorize os contatos com maior chance de retorno."
              ]
            : remaining > 0
            ? [
                "A meta ainda está longe. Divida-a em etapas e avance diariamente.",
                `R$ ${(remaining).toFixed(2)} ainda faltam para a meta. Planeje bem os próximos dias.`,
                "Com o ritmo atual, você pode não alcançar a meta. Que tal aumentar a média diária?",
                "Há tempo, mas será preciso intensificar os recebimentos."
              ]
            : []
        };

        const selectedSuggestion = suggestions[category]?.[Math.floor(Math.random() * suggestions[category].length)] || "Sem sugestões no momento.";
        setSuggestion(selectedSuggestion);
      });
    });
  };

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
                      <div className="py-4 flex-1 space-y-2">
                        {apps.map((app) => (
                          app.url ? (
                            <a
                              key={app.id}
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-foreground hover:text-primary"
                              >
                                <app.icon className="h-4 w-4 mr-2" />
                                {app.name}
                              </Button>
                            </a>
                          ) : (
                            <Dialog key={app.id}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-foreground hover:text-primary"
                                >
                                  <app.icon className="h-4 w-4 mr-2" />
                                  {app.name}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md bg-card">
                                <app.component />
                              </DialogContent>
                            </Dialog>
                          )
                        ))}
                      </div>
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
                    <h3 className="text-lg font-semibold text-foreground mb-4">Lista de Anexos</h3>
                    <ul className="space-y-2">
                      {pdfList.map((pdf) => (
                        <li key={pdf.id} className="flex items-center gap-2">
                          <File className="h-4 w-4 text-gray-500" />
                          <a
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {pdf.name}
                          </a>
                        </li>
                      ))}
                      <li className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-gray-500" />
                        <a
                          href="https://archive.org/embed/tuto-cobranca-com-nome"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          TUTO DE COBRANÇA COM O NOME DO CLIENTE
                        </a>
                      </li>
                    </ul>
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
                      <div className="py-4 flex-1 space-y-2">
                        {apps.map((app) => (
                          app.url ? (
                            <a
                              key={app.id}
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-foreground hover:text-primary"
                              >
                                <app.icon className="h-4 w-4 mr-2" />
                                {app.name}
                              </Button>
                            </a>
                          ) : (
                            <Dialog key={app.id}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-foreground hover:text-primary"
                                >
                                  <app.icon className="h-4 w-4 mr-2" />
                                  {app.name}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md bg-card">
                                <app.component />
                              </DialogContent>
                            </Dialog>
                          )
                        ))}
                      </div>
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
        <Card className="bg-card p-4 rounded-lg shadow-sm mb-6">
          <CardContent className="p-0">
            <p className="text-foreground">{suggestion}</p>
          </CardContent>
        </Card>

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
