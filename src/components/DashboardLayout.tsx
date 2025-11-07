// src/app/dashboard/page.tsx
import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet, Trophy, Utensils, Gift, Sliders, LogOut, Menu,
  Calendar, AlertTriangle, History, Instagram, File, FileText,
  Heart
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
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";
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

  // Verifica sessão
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

  // Dados do dia
  useEffect(() => {
    if (userData?.abertura_vencido_mes && userData?.vencido_atual) {
      const days = new Date().getDate();
      const received = userData.abertura_vencido_mes - userData.vencido_atual;
      setRecebidoHoje(received > 0 ? received / days : 0);
    }
    setIsNewHistorico(!localStorage.getItem("hasVisitedHistorico"));
    document.body.classList.toggle("dark", isDarkMode);
  }, [userData, isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => {
    const novo = !prev;
    document.body.classList.toggle("dark", novo);
    return novo;
  });

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

  const calendar = {
    daysInMonth: (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(),
    firstDay: (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay(),
    cells: (d: Date) => {
      const cells = [];
      for (let i = 0; i < calendar.firstDay(d); i++) cells.push(null);
      for (let i = 1; i <= calendar.daysInMonth(d); i++) cells.push(new Date(d.getFullYear(), d.getMonth(), i));
      return cells;
    },
    color: (day: Date | null) => {
      if (!day) return "text-gray-400";
      const w = day.getDay();
      return w === 0 ? "text-red-500" : w === 6 ? "text-yellow-500" : "text-green-500";
    }
  };

  const navMonth = (dir: "prev" | "next") => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + (dir === "next" ? 1 : -1), 1));
  };

  if (!userData && !isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Carregando...</p>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background dark' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`} ref={contentRef}>
      {/* HEADER */}
      <header className="bg-card shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {isMobile ? (
            <>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Inadimplência {percentual && `${percentual}%`}
              </h1>
              <div className="flex gap-2">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon"><Menu /></Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="py-6 border-b"><h2 className="text-lg font-bold">Apps</h2></div>
                    <Apps />
                    <div className="py-4 border-t">
                      <Button variant="destructive" className="w-full" onClick={handleLogout}>Sair</Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun /> : <Moon />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCalendar(!showCalendar)}>
                  <Calendar className="mr-1" />
                  {today.toLocaleDateString("pt-BR")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Controle de Inadimplência {percentual && `${percentual}%`}
              </h1>
              <div className="flex gap-3">
                {/* PRINT + APOIAR */}
                <div className="flex gap-3">
                  <Button onClick={print} variant="outline" className="gap-2">
                    <RiScreenshot2Fill className="w-5 h-5" /> Print
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg">
                        <Heart className="w-5 h-5 fill-white" />
                        Apoiar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="max-h-[80vh] overflow-y-auto">
                        <AvisoApoio />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2"><File /> Anexos</Button>
                  </DialogTrigger>
                  <DialogContent><Anexos /></DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2"><BiSolidReport /> Relatórios</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl"><RelatoriosSabium /></DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={() => set  setShowCalendar(!showCalendar)} className="gap-2">
                  <Calendar /> {today.toLocaleDateString("pt-BR")}
                </Button>

                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon"><Menu /></Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <Apps />
                    <div className="mt-8">
                      <Button variant="destructive" className="w-full" onClick={handleLogout}>Sair</Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun /> : <Moon />}
                </Button>

                <Button variant="outline" size="sm" onClick={() => setLayoutVersion(p => p === "V1" ? "V2" : "V1")}>
                  {layoutVersion === "V1" ? "V2" : "V1"}
                </Button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* CALENDÁRIO */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCalendar(false)}>
          <div className="bg-card p-6 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <Button variant="ghost" onClick={() => navMonth("prev")}>{"<"}</Button>
              <span className="font-bold">
                {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>
              <Button variant="ghost" onClick={() => navMonth("next")}>{">"}</Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(d => (
                <div key={d} className="text-xs text-muted-foreground">{d}</div>
              ))}
              {calendar.cells(calendarMonth).map((day, i) => (
                <div key={i} className={`w-9 h-9 flex items-center justify-center rounded-full text-sm ${calendar.color(day)}`}>
                  {day?.getDate()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-7 w-full p-1 bg-card rounded-xl">
            <TabsTrigger value="ajustes-metas" className="gap-1"><Sliders className="h-4 w-4" /> Ajustes</TabsTrigger>
            {layoutVersion === "V1" ? (
              <>
                <TabsTrigger value="meta-fiado" className="gap-1"><Wallet className="h-4 w-4" /> Fiado</TabsTrigger>
                <TabsTrigger value="meta-desafio" className="gap-1"><Trophy className="h-4 w-4" /> Desafio</TabsTrigger>
                <TabsTrigger value="meta-alimentacao" className="gap-1"><Utensils className="h-4 w-4" /> Alimentação</TabsTrigger>
              </>
            ) : (
              <TabsTrigger value="metas" className="gap-1"><Wallet className="h-4 w-4" /> Metas</TabsTrigger>
            )}
            {layoutVersion === "V1" && bonusPerdidoAtivado && (
              <TabsTrigger value="meta-perdido" className="gap-1"><AlertTriangle className="h-4 w-4" /> Perdido</TabsTrigger>
            )}
            <TabsTrigger value="meus-premios" className="gap-1"><Gift className="h-4 w-4" /> Prêmios</TabsTrigger>
            <TabsTrigger value="historicos" className="gap-1">
              <History className="h-4 w-4" /> Histórico
              {isNewHistorico && <span className="ml-1 text-red-600 font-bold">N</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ajustes-metas" className="mt-4">
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

          {layoutVersion === "V1" && (
            <>
              <TabsContent value="meta-fiado">
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
              <TabsContent value="meta-desafio">
                <MetaDesafio
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
              <TabsContent value="meta-alimentacao">
                <MetaAlimentacao
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
            </>
          )}

          {layoutVersion === "V2" && (
            <TabsContent value="metas">
              <Metas
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
          )}

          {layoutVersion === "V1" && bonusPerdidoAtivado && (
            <TabsContent value="meta-perdido">
              <MetaPerdido
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
          )}

          <TabsContent value="meus-premios">
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
              recebido={recebidoHoje}
              totalGanhos={totalGanhos}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* FOOTER */}
      <footer className="bg-card shadow-md mt-8 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <FaWhatsapp className="text-green-600" />
            <a href="https://chat.whatsapp.com/GTc7DQBgrzqG1fmmHAcmPl" target="_blank" className="text-primary hover:underline">
              Grupo de Ajuda
            </a>
          </div>
          <Instagram className="text-pink-600 cursor-pointer" onClick={instagram} />
          {showInstagramUsername && (
            <span className="text-pink-600 text-xs bg-card px-2 py-1 rounded shadow">@renato_alme1da</span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
