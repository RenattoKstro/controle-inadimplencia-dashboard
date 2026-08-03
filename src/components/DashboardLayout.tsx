// src/pages/DashboardLayout.tsx
import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy, Utensils, Gift, Sliders,
  CalendarDays, AlertTriangle, Instagram, Store, MoreHorizontal, User, Sun, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import MetasOverview from "./dashboard/MetasOverview";
import MetaAlimentacao from "./dashboard/MetaAlimentacao";
import MeusPremios from "./dashboard/MeusPremios";
import AjustesMetas from "./dashboard/AjustesMetas";
import Filiais from "./dashboard/Filiais";
import { useUserData } from "@/hooks/useUserData";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import html2canvas from "html2canvas";
import { FaWhatsapp } from "react-icons/fa";
import { RiScreenshot2Fill } from "react-icons/ri";
import MetaPerdido from "./dashboard/MetaPerdido";
import MatrizLinks from "./MatrizLinks";
import MemberChatWidget from "./MemberChatWidget";
import { Calendar } from "@/components/ui/calendar";

const normalizeOperatorRole = (role?: string | null) => {
  const normalizedRole = (role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedRole === "lider") return "líder";
  if (normalizedRole === "auxiliar") return "auxiliar";
  return "";
};

const getFirstNameAndLastSurname = (name?: string | null) => {
  const normalizedName = (name || "").trim().replace(/\s+/g, " ");
  if (!normalizedName) return "Usuário";

  const parts = normalizedName.split(" ");
  if (parts.length === 1) return parts[0];

  return `${parts[0]} ${parts[parts.length - 1]}`;
};

/** Converte qualquer imagem para JPEG válido (evita HEIC/WebP problemático e arquivos corrompidos). */
const convertImageToJpegBlob = (file: File, maxSize = 512, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Não foi possível processar a imagem."));
          return;
        }

        // Fundo branco (JPEG não tem transparência)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error("Falha ao converter a imagem para JPEG."));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Arquivo de imagem inválido ou não suportado pelo navegador."));
    };

    img.src = objectUrl;
  });
};

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("metas");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [calendarOpen, setCalendarOpen] = useState(false);
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
  const [avatarBroken, setAvatarBroken] = useState(false);
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

  useEffect(() => {
    setAvatarBroken(false);
  }, [userData?.avatar_url]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Tchau!" });
    navigate("/auth");
  };

  const handleTabChange = (v: string) => {
    if (v === "matriz") {
      console.log("[DashboardLayout] guia mais selecionada");
    }
    setActiveTab(v);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // limpa o input para permitir reenviar a mesma foto
    e.target.value = "";

    if (!file || !userData?.user_id) {
      toast({ title: "Erro: arquivo ou usuário não encontrado", variant: "destructive" });
      return;
    }

    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(file.name)) {
      toast({ title: "Selecione um arquivo de imagem válido", variant: "destructive" });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Use uma foto de até 8 MB.", variant: "destructive" });
      return;
    }

    try {
      toast({ title: "Processando foto..." });

      // Sempre gera JPEG válido — evita HEIC do iPhone e content-type errado
      const jpegBlob = await convertImageToJpegBlob(file, 512, 0.85);
      const fileName = `${userData.user_id}.jpg`;

      const { error } = await supabase.storage
        .from("perfis")
        .upload(fileName, jpegBlob, {
          contentType: "image/jpeg",
          upsert: true,
          cacheControl: "3600",
        });

      if (error) {
        console.error("Erro no upload:", error);
        toast({
          title: "Erro ao enviar foto",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const { data: publicData } = supabase.storage.from("perfis").getPublicUrl(fileName);
      const novaUrl = `${publicData.publicUrl}?t=${Date.now()}`;

      await updateUserData({ avatar_url: novaUrl });
      setAvatarBroken(false);
      toast({ title: "Foto atualizada com sucesso!" });
    } catch (err: any) {
      console.error("Erro ao processar foto:", err);
      toast({
        title: "Erro ao processar foto",
        description: err?.message || "Não foi possível ler esta imagem. Tente outra foto (JPG ou PNG).",
        variant: "destructive",
      });
    }
  };

  const percentual = userData?.carteira_total > 0
    ? ((userData.vencido_atual / userData.carteira_total) * 100).toFixed(1)
    : null;
  const isDark = theme === "dark";
  const operatorRole = normalizeOperatorRole(userData?.role);
  const profileDisplayName = getFirstNameAndLastSurname(userData?.nome_usuario);
  const showAvatar = Boolean(userData?.avatar_url) && !avatarBroken;

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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {isMobile ? (
            <>
              <h1 className={isDark ? "min-w-0 flex-1 text-lg font-semibold text-zinc-100 flex flex-wrap items-center gap-2" : "min-w-0 flex-1 text-lg font-semibold text-slate-900 flex flex-wrap items-center gap-2"}>
                <span>Meu Fiado</span>
                <span>{percentual ? `${percentual}%` : "0.0%"}</span>
              </h1>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={toggleTheme} className={isDark ? "border-white/20 text-zinc-100 hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-100"}>
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="px-3">
                  Sair
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className={isDark ? "text-2xl font-semibold text-zinc-100 flex items-center gap-3" : "text-2xl font-semibold text-slate-900 flex items-center gap-3"}>
                <span>Meu Fiado</span>
                <span>{percentual ? `${percentual}%` : "0.0%"}</span>
              </h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={toggleTheme} className={isDark ? "border-white/20 text-zinc-100 hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-100"}>
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button onClick={print} variant="ghost" size="icon" className="text-zinc-300 hover:text-white hover:bg-white/10">
                  <RiScreenshot2Fill className="w-5 h-5" />
                </Button>
                <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white hover:bg-white/10">
                      <CalendarDays className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-fit p-0 overflow-hidden">
                    <Calendar mode="single" selected={today} className={isDark ? "bg-zinc-900 text-zinc-100" : "bg-white text-slate-900"} />
                  </DialogContent>
                </Dialog>

                {/* BOTÃO DE PERFIL */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    title={userData?.nome_usuario || "Usuário"}
                  >
                    {showAvatar ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={userData.avatar_url}
                          alt="Perfil"
                          className="w-full h-full object-cover"
                          onError={() => setAvatarBroken(true)}
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
                          {showAvatar ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 group-hover:opacity-80 transition">
                              <img
                                src={userData.avatar_url}
                                alt="Perfil"
                                className="w-full h-full object-cover"
                                onError={() => setAvatarBroken(true)}
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
                            accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </label>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={isDark ? "text-2xl font-bold text-zinc-100" : "text-2xl font-bold text-slate-900"}>
                              <span title={userData?.nome_usuario || "Usuário"}>{profileDisplayName}</span>
                            </p>
                            {operatorRole === "líder" && (
                              <span className="inline-flex items-center rounded-full border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                                Op. Líder
                              </span>
                            )}
                            {operatorRole === "auxiliar" && (
                              <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                                Op. Auxiliar
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
          <div className="max-w-5xl mx-auto px-3 sm:px-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className={isDark ? "flex h-auto w-full justify-start overflow-x-auto p-1 bg-zinc-900/90 border border-white/10 rounded-xl mb-6 gap-1 lg:grid lg:grid-cols-7" : "flex h-auto w-full justify-start overflow-x-auto p-1 bg-white border border-slate-300 rounded-xl mb-6 gap-1 lg:grid lg:grid-cols-7"}>
                <TabsTrigger value="ajustes-metas" className={isDark ? "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Sliders className="h-4 w-4" /> Ajustes
                </TabsTrigger>
                <TabsTrigger value="metas" className={isDark ? "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Gift className="h-4 w-4" /> Metas
                </TabsTrigger>
                <TabsTrigger value="meta-alimentacao" className={isDark ? "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Utensils className="h-4 w-4" /> Alimentação
                </TabsTrigger>
                {bonusPerdidoAtivado && (
                  <TabsTrigger value="meta-perdido" className={isDark ? "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                    <AlertTriangle className="h-4 w-4" /> Perdido
                  </TabsTrigger>
                )}
                <TabsTrigger value="meus-premios" className={isDark ? "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Trophy className="h-4 w-4" /> Prêmios
                </TabsTrigger>
                <TabsTrigger value="filiais" className={isDark ? "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <Store className="h-4 w-4" /> Filiais %
                </TabsTrigger>
                <TabsTrigger value="matriz" className={isDark ? "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 rounded-lg px-2 py-2" : "shrink-0 gap-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-700 rounded-lg px-2 py-2"}>
                  <MoreHorizontal className="h-4 w-4" /> Mais
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


              <TabsContent value="filiais">
                <Filiais />
              </TabsContent>

              <TabsContent value="matriz">
                <MatrizLinks
                  userId={userData?.user_id}
                  receivedAmount={recebidoHoje}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <MemberChatWidget
        viewer={{
          user_id: userData?.user_id,
          nome_usuario: userData?.nome_usuario,
          avatar_url: userData?.avatar_url,
          filial: userData?.filial,
        }}
      />

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
              @renato_lmd
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
