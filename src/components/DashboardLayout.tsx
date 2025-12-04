// src/pages/DashboardLayout.tsx
import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet, Trophy, Utensils, Gift, Sliders, Menu,
  Calendar, AlertTriangle, History, Instagram, File, Store, User, LogOut
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
import Filiais from "./dashboard/Filiais";
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
  const [mostrarHistorico, setMostrarHistorico] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
    diasRestantesCalculados,
  } = useUserData();
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
    <div
      className={`min-h-screen ${isDarkMode ? "bg-background dark" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}
      ref={contentRef}
    >
      {/* HEADER */}
      <header className="bg-card shadow-md sticky top-0 z-50">
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
                      <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        Sair
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun /> : <Moon />}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Controle de Inadimplência {percentual && `${percentual}%`}
              </h1>

              <div className="flex items-center gap-3">
                <Button onClick={print} variant="outline" className="gap-2">
                  <RiScreenshot2Fill className="w-5 h-5" /> Print
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2"><File className="w-4 h-4" /> Anexos</Button>
                  </DialogTrigger>
                  <DialogContent><Anexos /></DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2"><BiSolidReport className="w-5 h-5" /> Relatórios</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl"><RelatoriosSabium /></DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => setShowCalendar(!showCalendar)} className="gap-2">
                  <Calendar className="h-4 w-4" /> {today.toLocaleDateString("pt-BR")}
                </Button>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon"><Menu className="h-5 w-5" /></Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <Apps />
                    <div className="mt-8">
                      <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        Sair
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* BOTÃO DE PERFIL COM FOTO + UPLOAD */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full overflow-hidden border-2 border-purple-500 hover:border-purple-600 transition-all"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    {userData?.avatar_url ? (
                      <img
                        src={userData.avatar_url}
                        alt="Perfil"
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </Button>

                  {/* MENU EXPANSÍVEL */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-purple-200 p-6 z-50">
                      <div className="flex items-center gap-5 mb-6">
                        <label htmlFor="upload-foto" className="cursor-pointer group">
                          {userData?.avatar_url ? (
                            <img
                              src={userData.avatar_url}
                              alt="Perfil"
                              className="h-24 w-24 rounded-full object-cover border-4 border-purple-500 group-hover:opacity-80 transition"
                            />
                          ) : (
                            <div className="h-24 w-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-purple-500 group-hover:opacity-80 transition">
                              <User className="h-14 w-14 text-white" />
                            </div>
                          )}
                          <input
                            id="upload-foto"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !userData?.user_id) return;

                              const fileExt = file.name.split(".").pop();
                              const fileName = `${userData.user_id}.${fileExt}`;

                              const { error } = await supabase.storage
                                .from("perfis")
                                .upload(fileName, file, { upsert: true });

                              if (error) {
                                console.error("Erro no upload:", error);
                                toast({ title: "Erro ao fazer upload da foto", variant: "destructive" });
                                return;
                              }

                              const { data: { publicUrl } } = supabase.storage
                                .from("perfis")
                                .getPublicUrl(fileName);

                              await updateUserData({ avatar_url: publicUrl });
                              toast({ title: "Foto atualizada com sucesso!" });
                            }}
                          />
                        </label>

                        <div>
                          <p className="text-2xl font-bold text-gray-800">
                            {userData?.nome_usuario || "Usuário"}
                          </p>
                          <p className="text-lg text-purple-600 font-medium">
                            {userData?.filial
                              ? `Filial ${String(userData.filial).padStart(5, "0")}`
                              : "Sem filial"}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Clique na foto para alterar
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        className="w-full mt-4 flex items-center justify-center gap-3 text-lg"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-6 w-6" />
                        Sair
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* RESTO DO DASHBOARD (100% IGUAL) */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="hidden lg:block w-80 bg-gradient-to-b from-purple-50 to-pink-50 border-r-4 border-purple-300 fixed left-0 top-20 bottom-0 overflow-y-auto z-30">
          <div className="p-6">
            <RankingApoiadores />
          </div>
        </aside>
        <main className="flex-1 lg:ml-80 pt-6 pb-20">
          <div className="max-w-5xl mx-auto px-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 w-full p-1 bg-card rounded-xl mb-6 gap-1">
                <TabsTrigger value="ajustes-metas" className="gap-1 text-xs sm:text-sm"><Sliders className="h-4 w-4" /> Ajustes</TabsTrigger>
                <TabsTrigger value="meta-fiado" className="gap-1 text-xs sm:text-sm"><Wallet className="h-4 w-4" /> Fiado</TabsTrigger>
                <TabsTrigger value="meta-desafio" className="gap-1 text-xs sm:text-sm"><Trophy className="h-4 w-4" /> Desafio</TabsTrigger>
                <TabsTrigger value="meta-alimentacao" className="gap-1 text-xs sm:text-sm"><Utensils className="h-4 w-4" /> Alimentação</TabsTrigger>
                {bonusPerdidoAtivado && (
                  <TabsTrigger value="meta-perdido" className="gap-1 text-xs sm:text-sm"><AlertTriangle className="h-4 w-4" /> Perdido</TabsTrigger>
                )}
                <TabsTrigger value="meus-premios" className="gap-1 text-xs sm:text-sm"><Gift className="h-4 w-4" /> Prêmios</TabsTrigger>
                {mostrarHistorico && (
                  <TabsTrigger value="historicos" className="gap-1 text-xs sm:text-sm"><History className="h-4 w-4" /> Histórico</TabsTrigger>
                )}
                <TabsTrigger value="filiais" className="gap-1 text-xs sm:text-sm"><Store className="h-4 w-4" /> Filiais %</TabsTrigger>
              </TabsList>

              <TabsContent value="ajustes-metas">
                <AjustesMetas
                  userData={userData}
                  updateUserData={updateUserData}
                  diasSemExpediente={diasSemExpediente}
                  updateDiasSemExpediente={updateDiasSemExpediente}
                  diasRestantesCalculados={diasRestantesCalculados}
                  isLoading={isLoading}
                  bonusPerdidoAtivado={bonusPerdidoAtivado}
                  setBonusPerdidoAtivado={setBonusPerdidoAtivado}
                  mostrarHistorico={mostrarHistorico}
                  setMostrarHistorico={setMostrarHistorico}
                />
              </TabsContent>
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
                  setRecebidoHoje={() => {}}
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
                  setRecebidoHoje={() => {}}
                />
              </TabsContent>
              {bonusPerdidoAtivado && (
                <TabsContent value="meta-perdido">
                  <MetaPerdido
                    userData={userData}
                    updateUserData={updateUserData}
                    diasSemExpediente={diasSemExpediente}
                    updateDiasSemExpediente={updateDiasSemExpediente}
                    diasRestantesCalculados={diasRestantesCalculados}
                    isLoading={isLoading}
                    bonusPerdidoAtivado={bonusPerdidoAtivado}
                    setRecebidoHoje={() => {}}
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
                  setTotalGanhos={() => {}}
                />
              </TabsContent>
              {mostrarHistorico && (
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
                  />
                </TabsContent>
              )}
              <TabsContent value="filiais">
                <Filiais />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <div className="lg:hidden mt-8 px-4">
        <RankingApoiadores />
      </div>

      <footer className="bg-card shadow-md p-4 mt-8">
        <div className="max-w-7xl mx-auto flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FaWhatsapp className="text-green-600" />
            <a
              href="https://gazinassisbrasil.shop/busca/renato"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Suporte
            </a>
          </div>
          <Instagram className="text-pink-600 cursor-pointer" onClick={instagram} />
          {showInstagramUsername && (
            <span className="text-pink-600 text-xs bg-card px-2 py-1 rounded shadow">
              @renato_alme1da
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
