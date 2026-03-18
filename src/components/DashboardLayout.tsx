// src/pages/DashboardLayout.tsx
import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet, Trophy, Utensils, Gift, Sliders, Menu,
  Calendar, AlertTriangle, History, Instagram, File, Store, User, LogOut, Shield, Sun, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import MetasOverview from "./dashboard/MetasOverview";
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
import { RiScreenshot2Fill } from "react-icons/ri";
import { BiSolidReport } from "react-icons/bi";
import Anexos from "./Anexos";
import Apps from "./Apps";
import MetaPerdido from "./dashboard/MetaPerdido";
import MatrizLinks from "./MatrizLinks";

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("metas");
  const [mostrarHistorico, setMostrarHistorico] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bonusPerdidoAtivado, setBonusPerdidoAtivado] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const {
    userData,
    updateUserData,
    diasSemExpediente,
    updateDiasSemExpediente,
    isLoading,
    diasRestantesCalculados,
  } = useUserData();
  const [recebidoHoje, setRecebidoHoje] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showInstagramUsername, setShowInstagramUsername] = useState(false);
  const today = new Date();

  // Verificação de sessão
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
    const saved = localStorage.getItem("dashboard-theme");
    setTheme(saved === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    const isDarkTheme = theme === "dark";
    document.body.classList.toggle("dark", isDarkTheme);
    document.documentElement.classList.toggle("dark", isDarkTheme);
    localStorage.setItem("dashboard-theme", theme);
  }, [theme]);

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

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const percentual = userData?.carteira_total > 0
    ? ((userData.vencido_atual / userData.carteira_total) * 100).toFixed(1)
    : null;
  const isMembro = Boolean((userData as { membro?: boolean; role?: string } | null)?.membro)
    || ((userData?.role || "").toLowerCase() === "membro");
  const isDark = theme === "dark";

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div
      className={isDark ? "min-h-screen bg-zinc-950 text-zinc-100" : "min-h-screen bg-slate-100 text-slate-900"}
      ref={contentRef}
    >
      {/* HEADER */}
      <header className={isDark ? "bg-zinc-950/95 border-b border-white/10 backdrop-blur-xl shadow-md sticky top-0 z-50" : "bg-white/95 border-b border-slate-200 backdrop-blur-xl shadow-sm sticky top-0 z-50"}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {isMobile ? (
            <>
              <h1 className={isDark ? "text-lg font-semibold text-zinc-100 flex items-center gap-2" : "text-lg font-semibold text-slate-900 flex items-center gap-2"}>
                <Shield className="h-4 w-4 text-indigo-500" /> Inadimplência <span className="text-indigo-500 text-sm">{percentual && `${percentual}%`}</span>
              </h1>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={toggleTheme} className={isDark ? "border-white/20 text-zinc-100 hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-100"}>
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/10" size="icon"><Menu /></Button>
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
              </div>
            </>
          ) : (
            <>
              <h1 className={isDark ? "text-2xl font-semibold text-zinc-100 flex items-center gap-3" : "text-2xl font-semibold text-slate-900 flex items-center gap-3"}>
                <Shield className="h-5 w-5 text-indigo-500" /> Meu Fiado <span className="text-indigo-500 text-base">{percentual && `${percentual}%`}</span>
              </h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={toggleTheme} className={isDark ? "border-white/20 text-zinc-100 hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-100"}>
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button onClick={print} variant="ghost" size="icon" className="text-zinc-300 hover:text-white hover:bg-white/10">
                  <RiScreenshot2Fill className="w-5 h-5" />
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
                <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white hover:bg-white/10">
                  <Calendar className="h-4 w-4" />
                </Button>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/10" size="icon"><Menu className="h-5 w-5" /></Button>
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

                {/* BOTÃO DE PERFIL */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    {userData?.avatar_url ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={userData.avatar_url}
                          alt="Perfil"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </Button>
                  {showProfileMenu && (
                    <div className={isDark ? "absolute right-0 mt-2 w-96 bg-zinc-900 text-zinc-100 rounded-2xl shadow-2xl border border-white/10 p-6 z-50" : "absolute right-0 mt-2 w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-6 z-50"}>
                      <div className="flex items-center gap-5 mb-6">
                        <label htmlFor="upload-foto" className="cursor-pointer group">
                          {userData?.avatar_url ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 group-hover:opacity-80 transition">
                              <img
                                src={userData.avatar_url}
                                alt="Perfil"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-purple-500 group-hover:opacity-80 transition">
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
                              if (!file || !userData?.user_id) {
                                toast({ title: "Erro: arquivo ou usuário não encontrado", variant: "destructive" });
                                return;
                              }
                              const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
                              const fileName = `${userData.user_id}.${fileExt}`;
                              await supabase.storage.from("perfis").remove([fileName]);
                              const arrayBuffer = await file.arrayBuffer();
                              const uint8Array = new Uint8Array(arrayBuffer);
                              const { error } = await supabase.storage
                                .from("perfis")
                                .upload(fileName, uint8Array, {
                                  contentType: file.type || "image/jpeg",
                                  upsert: false
                                });
                              if (error) {
                                console.error("Erro no upload:", error);
                                toast({ title: "Erro ao enviar foto", variant: "destructive" });
                                return;
                              }
                              const novaUrl = `https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/public/perfis/${fileName}`;
                              await updateUserData({ avatar_url: novaUrl });
                              toast({ title: "Foto atualizada com sucesso!" });
                            }}
                          />
                        </label>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={isDark ? "text-2xl font-bold text-zinc-100" : "text-2xl font-bold text-slate-900"}>
                              {userData?.nome_usuario || "Usuário"}
                            </p>
                            {isMembro && (
                              <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                                Membro
                              </span>
                            )}
                          </div>
                          <p className="text-lg text-indigo-400 font-medium">
                            Filial {String(userData?.filial || "00000").padStart(5, "0")}
                          </p>
                          <p className={isDark ? "text-sm text-zinc-400 mt-2" : "text-sm text-slate-500 mt-2"}>
                            Clique na foto para alterar
                          </p>
                        </div>
                      </div>
                      <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>
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

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        <main className="flex-1 lg:ml-0 pt-6 pb-20">
          <div className="max-w-5xl mx-auto px-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className={isDark ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 w-full p-1 bg-zinc-900/90 border border-white/10 rounded-xl mb-6 gap-1" : "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 w-full p-1 bg-white border border-slate-300 rounded-xl mb-6 gap-1"}>
                <TabsTrigger value="ajustes-metas" className={isDark ? "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Sliders className="h-4 w-4" /> Ajustes
                </TabsTrigger>
                <TabsTrigger value="metas" className={isDark ? "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Gift className="h-4 w-4" /> Metas
                </TabsTrigger>
                <TabsTrigger value="meta-alimentacao" className={isDark ? "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Utensils className="h-4 w-4" /> Alimentação
                </TabsTrigger>
                {bonusPerdidoAtivado && (
                  <TabsTrigger value="meta-perdido" className={isDark ? "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                    <AlertTriangle className="h-4 w-4" /> Perdido
                  </TabsTrigger>
                )}
                <TabsTrigger value="meus-premios" className={isDark ? "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Trophy className="h-4 w-4" /> Prêmios
                </TabsTrigger>
                {mostrarHistorico && (
                  <TabsTrigger value="historicos" className={isDark ? "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                    <History className="h-4 w-4" /> Histórico
                  </TabsTrigger>
                )}
                <TabsTrigger value="filiais" className={isDark ? "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Store className="h-4 w-4" /> Filiais %
                </TabsTrigger>
                <TabsTrigger value="matriz" className={isDark ? "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Store className="h-4 w-4" /> Matriz
                </TabsTrigger>
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

              <TabsContent value="metas">
                <MetasOverview
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

              <TabsContent value="matriz">
                <MatrizLinks />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-white/10 shadow-md p-4 mt-8">
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
