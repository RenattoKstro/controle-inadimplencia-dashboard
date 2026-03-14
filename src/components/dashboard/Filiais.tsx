// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Zap, Store, Phone, Instagram, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface RankingFilial {
  idfilial: number;
  filial: string;
  regional: string;
  total_vencido: number;
  total_meta_fiado: number;
  total_meta_desafio: number;
  pct_fiado: number;
  pct_desafio: number;
  total_usuarios: number;
  total_abertura_vencido_mes: number;
  usuario_principal: {
    user_id: string;
    nome_usuario: string;
    avatar_url: string;
    whatsapp: string;
    instagram: string;
    updated_at: string | null;
  } | null;
}

const Filiais = () => {
  const [ranking, setRanking] = useState<RankingFilial[]>([]);
  const [regionais, setRegionais] = useState<string[]>([]);
  const [filtroRegional, setFiltroRegional] = useState<string>("Membros");
  const [ocultarZeradas, setOcultarZeradas] = useState(true);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from("vw_ranking_filiais")
        .select("*");

      if (!error && data) {
        const lista = data as RankingFilial[];
        const regs = [...new Set(lista.map(f => f.regional || "Sem regional"))].sort();
        if (!regs.includes("Membros")) regs.unshift("Membros");
        setRegionais(regs);
        setRanking(lista);
      }
      setLoading(false);
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, 30000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    setFiltroRegional("Membros");
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  let dadosFiltrados = ranking;

  if (filtroRegional !== "todas") {
    dadosFiltrados = dadosFiltrados.filter(f => (f.regional || "Sem regional") === filtroRegional);
  }

  if (ocultarZeradas) {
    dadosFiltrados = dadosFiltrados.filter(f =>
      f.total_meta_fiado > 0 || f.total_meta_desafio > 0
    );
  }

  if (loading) {
    return <p className="text-center py-20 text-xl text-zinc-200">Carregando Filiais %...</p>;
  }

  const getInitials = (nome: string | null | undefined): string => {
    if (!nome) return "U";
    const names = nome.trim().split(" ");
    if (names.length === 1) return names[0].slice(0, 2).toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };

  const getPercentColor = (pct: number) => {
    if (pct >= 100) return "text-emerald-400 font-bold";
    if (pct >= 94) return "text-amber-400 font-bold";
    if (pct >= 90) return "text-rose-400 font-bold";
    return "text-zinc-300";
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "bg-green-500";
    if (pct >= 94) return "bg-yellow-500";
    if (pct >= 90) return "bg-red-500";
    return "bg-gray-400";
  };

  const calcularRecebidoMeta = (f: RankingFilial) => {
    const abertura = f.total_abertura_vencido_mes || 0;
    const vencidoAtual = f.total_vencido || 0;
    const metaMes = f.total_meta_fiado || 0;
    const recebidosMes = abertura - vencidoAtual;
    const aReceber = abertura - metaMes;
    const restante = recebidosMes - aReceber;

    const format = (n: number) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(n);

    // Cálculo do restante com cor
    const restanteText = format(restante);
    let restanteClass = "text-zinc-400 text-xs mt-1";
    if (restante < 0) restanteClass = "text-rose-400 font-medium text-xs mt-1";
    if (restante > 0) restanteClass = "text-emerald-400 font-medium text-xs mt-1";

    return (
      <div className="flex flex-col items-center">
        <p className="font-bold text-sm">
          {format(recebidosMes)} / {format(aReceber)}
        </p>
        <p className={restanteClass}>
          Restante: {restanteText}
        </p>
      </div>
    );
  };

  const getUpdatedText = (updatedAt: string | null) => {
    if (!updatedAt) return "Nunca atualizado";

    const updatedDate = new Date(updatedAt);
    const diffMs = now.getTime() - updatedDate.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Atualizado agora";
    if (diffMin === 1) return "Atualizado há 1 min";
    if (diffMin < 60) return `Atualizado há ${diffMin} min`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr === 1) return "Atualizado há 1 hora";
    if (diffHr < 24) return `Atualizado há ${diffHr} horas`;
    const diffDays = Math.floor(diffHr / 24);
    return `Atualizado há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6 text-zinc-100">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <p className="text-muted-foreground mt-2">
          {dadosFiltrados.length} filiais • Atualizado a cada 30s
        </p>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="w-full max-w-xs">
          <Select value={filtroRegional} onValueChange={setFiltroRegional}>
            <SelectTrigger className="bg-zinc-900 border-white/10 text-zinc-100">
              <SelectValue placeholder="Todas as regionais" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-zinc-100">
              <SelectItem value="Membros">Membros</SelectItem>
              <SelectItem value="todas">Todas as regionais</SelectItem>
              {regionais.filter((reg) => reg !== "Membros").map(reg => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900/90 px-6 py-3 rounded-lg border border-white/10">
          <Switch
            id="ocultar-zeradas"
            checked={ocultarZeradas}
            onCheckedChange={setOcultarZeradas}
          />
          <Label htmlFor="ocultar-zeradas" className="cursor-pointer font-medium text-zinc-200">
            Ocultar filiais zeradas
          </Label>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-zinc-950/90 rounded-xl shadow-lg border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-indigo-700 to-violet-700 text-zinc-100 text-xs">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Filial</th>
              <th className="px-4 py-2 text-center">Recebido / A Receber</th>
              <th className="px-4 py-2 text-center">Meta Fiado</th>
              <th className="px-4 py-2 text-center">Meta Desafio</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-zinc-400">
                  <Store className="h-20 w-20 mx-auto mb-4" />
                  <p className="text-xl">
                    {ocultarZeradas
                      ? "Nenhuma filial com meta ativa."
                      : "Nenhuma filial cadastrada."}
                  </p>
                </td>
              </tr>
            ) : (
              dadosFiltrados.map((f, i) => {
                const user = f.usuario_principal;
                const initials = getInitials(user?.nome_usuario);
                const updatedText = getUpdatedText(user?.updated_at);

                return (
                  <tr key={f.idfilial} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {i < 3 && (
                          <Trophy className={`h-5 w-5 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-orange-600"}`} />
                        )}
                        <span className="font-bold">{i + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <HoverCard openDelay={200}>
                            <HoverCardTrigger asChild>
                              <div className="cursor-pointer">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 flex items-center justify-center">
                                  {user?.avatar_url ? (
                                    <img
                                      src={user.avatar_url}
                                      alt="Perfil"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm ${user?.avatar_url ? "hidden" : ""}`}>
                                    {initials !== "U" ? initials : <User className="h-6 w-6" />}
                                  </div>
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 bg-zinc-900 text-zinc-100 border-white/10">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-purple-500 flex items-center justify-center">
                                  {user?.avatar_url ? (
                                    <img
                                      src={user.avatar_url}
                                      alt="Perfil"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-2xl ${user?.avatar_url ? "hidden" : ""}`}>
                                    {initials !== "U" ? initials : <User className="h-10 w-10" />}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-bold text-lg">{user?.nome_usuario || "Usuário"}</p>
                                  <p className="text-sm text-zinc-400">Filial {f.filial}</p>
                                </div>
                              </div>
                              <div className="mt-4 space-y-2">
                                {user?.whatsapp && (
                                  <a
                                    href={`https://wa.me/55${user.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-emerald-400 hover:underline"
                                  >
                                    <Phone className="h-4 w-4" /> WhatsApp
                                  </a>
                                )}
                                {user?.instagram && (
                                  <a
                                    href={`https://instagram.com/${user.instagram.replace("@", "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-pink-400 hover:underline"
                                  >
                                    <Instagram className="h-4 w-4" /> Instagram
                                  </a>
                                )}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <div>
                            <p className="font-medium">{f.filial}</p>
                            <p className="text-xs text-zinc-400">{f.regional}</p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 italic mt-1">
                          {getUpdatedText(user?.updated_at)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {calcularRecebidoMeta(f)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <p className={`text-lg ${getPercentColor(f.pct_fiado)}`}>
                          {f.pct_fiado.toFixed(2)}%
                        </p>
                        <Progress
                          value={f.pct_fiado}
                          className="h-3 bg-zinc-800"
                          indicatorClassName={getProgressColor(f.pct_fiado)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <p className={`text-lg flex items-center justify-center gap-1 ${getPercentColor(f.pct_desafio)}`}>
                          <Zap className="h-4 w-4 text-yellow-500" />
                          {f.pct_desafio.toFixed(2)}%
                        </p>
                        <Progress
                          value={f.pct_desafio}
                          className="h-3 bg-zinc-800"
                          indicatorClassName={getProgressColor(f.pct_desafio)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Filiais;
