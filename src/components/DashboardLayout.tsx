import { useEffect, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog"; // Supondo que você tenha Dialog
import RelatoriosSabium from "./RelatoriosSabium";

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

  useEffect(() => {
    console.log("userData:", userData);
    if (userData) {
      setBonusPerdidoAtivado(!!userData.bonusPerdidoAtivado);
    }
  }, [userData]);

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

  const renderTabs = () => (
    <TabsList className={`grid grid-cols-6 w-full p-1 bg-white shadow-sm rounded-xl ${isMobile ? 'grid-cols-1 gap-2' : ''}`}>
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
      {bonusPerdidoAtivado && (
        <TabsTrigger 
          value="meta-perdido" 
          className="flex items-center gap-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-600"
          onClick={() => handleTabChange("meta-perdido")}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Meta Perdido</span>
        </TabsTrigger>
      )}
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
          bonusPerdidoAtivado={bonusPerdidoAtivado}
          setBonusPerdidoAtivado={setBonusPerdidoAtivado}
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
          bonusPerdidoAtivado={bonusPerdidoAtivado}
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
          bonusPerdidoAtivado={bonusPerdidoAtivado}
        />
      </TabsContent>
      <TabsContent value="meta-perdido" className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
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
      <TabsContent value="meta-alimentacao" className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
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
      <TabsContent value="meus-premios" className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
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
                          {["ajustes-metas", "meta-fiado", "meta-desafio", "meta-perdido", "meta-alimentacao", "meus-premios"].map((tab) => (
                            <Button
                              key={tab}
                              variant="ghost"
                              className={`w-full justify-start ${activeTab === tab ? 'text-blue-600' : ''}`}
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
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex items-center gap-2 text-gray-600 hover:text-gray-900"
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
                    <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 w-72">
                      <div className="flex justify-between items-center mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lg font-bold"
                          onClick={() => handleMonthNavigation("prev")}
                        >
                          {"<"}
                        </Button>
                        <span className="text-base font-semibold">
                          {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lg font-bold"
                          onClick={() => handleMonthNavigation("next")}
                        >
                          {">"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                          <div key={day} className="text-sm font-medium text-gray-700">
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
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
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
                      <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 w-72">
                        <div className="flex justify-between items-center mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-lg font-bold"
                            onClick={() => handleMonthNavigation("prev")}
                          >
                            {"<"}
                          </Button>
                          <span className="text-base font-semibold">
                            {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-lg font-bold"
                            onClick={() => handleMonthNavigation("next")}
                          >
                            {">"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center">
                          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                            <div key={day} className="text-sm font-medium text-gray-700">
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
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      Relatórios Sabium
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <RelatoriosSabium />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <LogOut size={16} />
                  <span>Sair</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-blue-50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-3 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <a
              href="https://wa.me/68992237305"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Suporte WhatsApp: (68) 99223-7305
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-600" />
            <a
              href="https://instagram.com/renato_alme1da"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:underline font-medium"
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
