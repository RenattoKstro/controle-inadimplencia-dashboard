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
    updated_at: string; // ← Novo campo (timestamp ISO)
  } | null;
}

const Filiais = () => {
  const [ranking, setRanking] = useState<RankingFilial[]>([]);
  const [regionais, setRegionais] = useState<string[]>([]);
  const [filtroRegional, setFiltroRegional] = useState<string>("todas");
  const [ocultarZeradas, setOcultarZeradas] = useState(true);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date()); // Para atualizar o contador a cada minuto

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from("vw_ranking_filiais")
        .select("*");

      if (!error && data) {
        const lista = data as RankingFilial[];
        const regs = [...new Set(lista.map(f => f.regional || "Sem regional"))].sort();
        setRegionais(regs);
        setRanking(lista);
      }
      setLoading(false);
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, 30000); // atualiza ranking a cada 30s
    return () => clearInterval(interval);
  }, []);

  // Atualiza o "agora" a cada 60 segundos para recalcular "há X min"
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
    return <p className="text-center py-20 text-xl">Carregando Filiais %...</p>;
  }

  const getInitials = (nome: string | null | undefined): string => {
    if (!nome) return "U";
    const names = nome.trim().split(" ");
    if (names.length === 1) return names[0].slice(0, 2).toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };

  const getPercentColor = (pct: number) => {
    if (pct >= 100) return "text-green-600 font-bold";
    if (pct >= 94) return "text-yellow-600 font-bold";
    if (pct >= 90) return "text-red-600 font-bold";
    return "text-foreground";
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
    const format = (n: number) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(n);
    return `${format(recebidosMes)} / ${format(aReceber)}`;
  };

  // Função para calcular "Atualizado há X min"
  const getUpdatedText = (updatedAt: string | null) => {
  if (!updatedAt) return "Nunca atualizado";

  const updatedDate = new Date(updatedAt);
  const diffMs = now.getTime() - updatedDate.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Atualizado agora"; // só se for MUITO recente
  if (diffMin === 1) return "Atualizado há 1 min";
  if (diffMin < 60) return `Atualizado há ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return "Atualizado há 1 hora";
  if (diffHr < 24) return `Atualizado há ${diffHr} horas`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Atualizado há 1 dia";
  return `Atualizado há ${diffDays} dias`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
            <SelectTrigger>
              <SelectValue placeholder="Todas as regionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as regionais</SelectItem>
              {regionais.map(reg => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow border">
          <Switch
            id="ocultar-zeradas"
            checked={ocultarZeradas}
            onCheckedChange={setOcultarZeradas}
          />
          <Label htmlFor="ocultar-zeradas" className="cursor-pointer font-medium">
            Ocultar filiais zeradas
          </Label>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
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
                <td colSpan={5} className="text-center py-16 text-gray-500">
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
                  <tr key={f.idfilial} className="border-b hover:bg-gray-50 transition-colors">
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
                            <HoverCardContent className="w-80">
                              {/* ... conteúdo do hover igual ao seu ... */}
                            </HoverCardContent>
                          </HoverCard>
                          <div>
                            <p className="font-medium">{f.filial}</p>
                            <p className="text-xs text-gray-600">{f.regional}</p>
                          </div>
                        </div>
                        {/* Mensagem de atualização */}
                        <p className="text-xs text-gray-500 italic mt-1">
                          {updatedText}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="font-bold text-sm">
                        {calcularRecebidoMeta(f)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <p className={`text-lg ${getPercentColor(f.pct_fiado)}`}>
                          {f.pct_fiado.toFixed(2)}%
                        </p>
                        <Progress
                          value={f.pct_fiado}
                          className="h-3"
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
                          className="h-3"
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
