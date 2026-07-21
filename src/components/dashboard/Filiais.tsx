// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Zap, Store, Phone, Instagram, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ABATEDORES_REGIONAL, isAbatedoresFilial } from "@/constants/abatedores";
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
    role?: string | null;
    membro?: boolean | null;
  } | null;
}

type FilialOperator = {
  user_id?: string | null;
  filial?: number | null;
  nome_usuario?: string | null;
  avatar_url?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  updated_at?: string | null;
  role?: string | null;
  membro?: boolean | null;
  abertura_vencido_mes?: number | null;
  meta_mes?: number | null;
  meta_desafio?: number | null;
  vencido_atual?: number | null;
};

type FiliaisProps = {
  isViewerMembro: boolean;
};

const ADMIN_EMAIL = "rks7ro@gmail.com";
const MEMBROS_MANIFEST_PATH = "membros-filiais.json";
const MEMBROS_MANIFEST_URL = "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/public/perfis/membros-filiais.json";

const normalizeOperatorRole = (role?: string | null) => {
  const normalizedRole = (role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedRole === "lider") return "líder";
  if (normalizedRole === "auxiliar") return "auxiliar";
  return "";
};

const getFirstName = (name?: string | null) => {
  const normalizedName = (name || "").trim();
  return normalizedName ? normalizedName.split(/\s+/)[0] : "Usuário";
};

const isOperatorMember = (user?: Pick<FilialOperator, "membro"> | null) => Boolean(user?.membro);

const sortOperators = (operators: FilialOperator[]) => (
  operators.slice().sort((a, b) => {
    const aMember = isOperatorMember(a);
    const bMember = isOperatorMember(b);
    if (aMember !== bMember) return aMember ? -1 : 1;

    const aRole = normalizeOperatorRole(a.role);
    const bRole = normalizeOperatorRole(b.role);
    if (aRole !== bRole) {
      if (aRole === "líder") return -1;
      if (bRole === "líder") return 1;
    }

    return (a.nome_usuario || "").localeCompare(b.nome_usuario || "", "pt-BR");
  })
);

const getLatestUpdatedAt = (operators: FilialOperator[], fallback?: string | null) => {
  const latestTimestamp = operators.reduce<number | null>((latest, operator) => {
    if (!operator.updated_at) return latest;
    const timestamp = new Date(operator.updated_at).getTime();
    if (Number.isNaN(timestamp)) return latest;
    return latest === null || timestamp > latest ? timestamp : latest;
  }, null);

  if (latestTimestamp !== null) {
    return new Date(latestTimestamp).toISOString();
  }

  return fallback || null;
};

const getLatestMetricSnapshot = (operators: FilialOperator[], fallback: RankingFilial) => {
  const latestOperator = operators.reduce<FilialOperator | null>((latest, operator) => {
    const operatorTimestamp = operator.updated_at ? new Date(operator.updated_at).getTime() : 0;
    const latestTimestamp = latest?.updated_at ? new Date(latest.updated_at).getTime() : 0;

    if (!latest) return operator;
    return operatorTimestamp > latestTimestamp ? operator : latest;
  }, null);

  return {
    abertura_vencido_mes: latestOperator?.abertura_vencido_mes ?? fallback.total_abertura_vencido_mes ?? 0,
    meta_mes: latestOperator?.meta_mes ?? fallback.total_meta_fiado ?? 0,
    meta_desafio: latestOperator?.meta_desafio ?? fallback.total_meta_desafio ?? 0,
    vencido_atual: latestOperator?.vencido_atual ?? fallback.total_vencido ?? 0,
  };
};


const calculateMetaPercentages = (metrics: {
  meta_mes: number;
  meta_desafio: number;
  vencido_atual: number;
}) => ({
  pctMetaFiado: metrics.vencido_atual > 0 ? (metrics.meta_mes / metrics.vencido_atual) * 100 : 0,
  pctMetaDesafio: metrics.vencido_atual > 0 && metrics.meta_desafio > 0 ? (metrics.meta_desafio / metrics.vencido_atual) * 100 : 0,
});

const getFreshnessRank = (updatedAt: string | null, now: Date) => {
  if (!updatedAt) return Number.MAX_SAFE_INTEGER;

  const timestamp = new Date(updatedAt).getTime();
  if (Number.isNaN(timestamp)) return Number.MAX_SAFE_INTEGER;

  const diffMs = Math.max(0, now.getTime() - timestamp);
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
};

const sortFiliaisByPercentualAndFreshness = (
  filiais: RankingFilial[],
  operadoresPorFilial: Record<number, FilialOperator[]>,
  now: Date,
) => (
  filiais.slice().sort((a, b) => {
    const getSortData = (filial: RankingFilial) => {
      const fallbackUser = filial.usuario_principal
        ? [{ ...filial.usuario_principal, filial: filial.idfilial } satisfies FilialOperator]
        : [];
      const operadores = sortOperators(
        (operadoresPorFilial[filial.idfilial] && operadoresPorFilial[filial.idfilial].length > 0)
          ? operadoresPorFilial[filial.idfilial]
          : fallbackUser,
      );
      const metrics = getLatestMetricSnapshot(operadores, filial);
      const { pctMetaFiado, pctMetaDesafio } = calculateMetaPercentages(metrics);
      const latestUpdatedAt = getLatestUpdatedAt(operadores, filial.usuario_principal?.updated_at || null);
      const latestTimestamp = latestUpdatedAt ? new Date(latestUpdatedAt).getTime() : 0;

      return {
        pctMetaFiado,
        pctMetaDesafio,
        freshnessRank: getFreshnessRank(latestUpdatedAt, now),
        latestTimestamp: Number.isNaN(latestTimestamp) ? 0 : latestTimestamp,
      };
    };

    const aData = getSortData(a);
    const bData = getSortData(b);

    if (aData.freshnessRank !== bData.freshnessRank) {
      return aData.freshnessRank - bData.freshnessRank;
    }

    if (bData.pctMetaFiado !== aData.pctMetaFiado) {
      return bData.pctMetaFiado - aData.pctMetaFiado;
    }

    if (bData.pctMetaDesafio !== aData.pctMetaDesafio) {
      return bData.pctMetaDesafio - aData.pctMetaDesafio;
    }

    return bData.latestTimestamp - aData.latestTimestamp;
  })
);

const publishMembrosManifest = async (filiais: Set<number>) => {
  const payload = JSON.stringify({
    updated_at: new Date().toISOString(),
    filiais: Array.from(filiais).sort((a, b) => a - b),
  });

  const file = new TextEncoder().encode(payload);
  await supabase.storage
    .from("perfis")
    .upload(MEMBROS_MANIFEST_PATH, file, {
      contentType: "application/json",
      upsert: true,
    });
};

const Filiais = ({ isViewerMembro }: FiliaisProps) => {
  const [ranking, setRanking] = useState<RankingFilial[]>([]);
  const [operadoresPorFilial, setOperadoresPorFilial] = useState<Record<number, FilialOperator[]>>({});
  const [regionais, setRegionais] = useState<string[]>([]);
  const [filiaisComMembros, setFiliaisComMembros] = useState<Set<number>>(new Set());
  const [filtroRegional, setFiltroRegional] = useState<string>("Membros");
  const [ocultarZeradas, setOcultarZeradas] = useState(true);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const isDark = document.documentElement.classList.contains("dark");

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from("vw_ranking_filiais")
        .select("*");

      if (!error && data) {
        const lista = data as RankingFilial[];
        const regs = [...new Set(lista.map(f => f.regional || "Sem regional"))].sort();
        const regionaisComCategoriasExtras = [
          "Membros",
          ABATEDORES_REGIONAL,
          ...regs.filter((reg) => reg !== "Membros" && reg !== ABATEDORES_REGIONAL),
        ];
        setRegionais(regionaisComCategoriasExtras);
        setRanking(lista);

        const filiaisMarcadasNaView = new Set(
          lista
            .filter((item) => isOperatorMember(item.usuario_principal))
            .map((item) => item.idfilial)
        );

        let operadoresAgrupados: Record<number, FilialOperator[]> = {};
        try {
          const { data: operadoresData, error: operadoresError } = await supabase
            .from("user_dashboard")
            .select("user_id, filial, nome_usuario, avatar_url, whatsapp, instagram, updated_at, role, membro, abertura_vencido_mes, meta_mes, meta_desafio, vencido_atual")
            .not("filial", "is", null)
            .order("updated_at", { ascending: false });

          if (!operadoresError && operadoresData) {
            operadoresAgrupados = (operadoresData as FilialOperator[]).reduce<Record<number, FilialOperator[]>>((acc, operador) => {
              if (typeof operador.filial !== "number") return acc;
              if (!acc[operador.filial]) acc[operador.filial] = [];
              acc[operador.filial].push(operador);
              return acc;
            }, {});
          }
        } catch {
          // fallback silencioso para ambientes em que a leitura total de user_dashboard esteja protegida por RLS.
        }

        setOperadoresPorFilial(operadoresAgrupados);

        const filiaisMarcadasNosPerfis = new Set(
          Object.entries(operadoresAgrupados)
            .filter(([, operadores]) => operadores.some((operador) => isOperatorMember(operador)))
            .map(([filialId]) => Number(filialId))
            .filter((filialId) => Number.isFinite(filialId))
        );

        let filiaisMarcadasNoUserDashboard = new Set<number>();
        const { data: { user } } = await supabase.auth.getUser();
        const isAdminViewer = user?.email === ADMIN_EMAIL;

        if (isAdminViewer) {
          const { data: membrosData, error: membrosError } = await supabase
            .from("user_dashboard")
            .select("filial")
            .eq("membro", true)
            .not("filial", "is", null);

          if (!membrosError && membrosData) {
            filiaisMarcadasNoUserDashboard = new Set(
              (membrosData as Array<{ filial: number | null }>)
                .map((item) => item.filial)
                .filter((filial): filial is number => typeof filial === "number")
            );
          }
        }

        let filiaisManifesto = new Set<number>();
        try {
          const response = await fetch(MEMBROS_MANIFEST_URL, { cache: "no-store" });
          if (response.ok) {
            const manifest = await response.json() as { filiais?: number[] };
            filiaisManifesto = new Set((manifest.filiais || []).filter((item): item is number => typeof item === "number"));
          }
        } catch {
          // fallback silencioso quando o manifesto ainda não existir.
        }

        const filiaisComMarcacaoExplicita = filiaisManifesto.size > 0
          ? filiaisManifesto
          : new Set([
              ...filiaisMarcadasNaView,
              ...filiaisMarcadasNosPerfis,
              ...filiaisMarcadasNoUserDashboard,
            ]);

        if (isAdminViewer && filiaisComMarcacaoExplicita.size > 0) {
          await publishMembrosManifest(filiaisComMarcacaoExplicita);
        }

        setFiliaisComMembros(filiaisComMarcacaoExplicita);
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

  if (filtroRegional === "Membros") {
    dadosFiltrados = dadosFiltrados.filter((f) => filiaisComMembros.has(f.idfilial));
  } else if (filtroRegional === ABATEDORES_REGIONAL) {
    dadosFiltrados = dadosFiltrados.filter((f) => isAbatedoresFilial(f.idfilial));
  } else if (filtroRegional !== "todas") {
    dadosFiltrados = dadosFiltrados.filter(f => (f.regional || "Sem regional") === filtroRegional);
  }

  if (ocultarZeradas) {
    dadosFiltrados = dadosFiltrados.filter(f =>
      f.total_meta_fiado > 0 || f.total_meta_desafio > 0
    );
  }

  dadosFiltrados = sortFiliaisByPercentualAndFreshness(dadosFiltrados, operadoresPorFilial, now);

  if (loading) {
    return <p className={isDark ? "text-center py-20 text-xl text-zinc-200" : "text-center py-20 text-xl text-slate-700"}>Carregando Filiais %...</p>;
  }

  const getInitials = (nome: string | null | undefined): string => {
    if (!nome) return "U";
    const names = nome.trim().split(" ");
    if (names.length === 1) return names[0].slice(0, 2).toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };

  const getPercentColor = (pct: number) => {
    if (pct >= 100) return isDark ? "text-emerald-400 font-bold" : "text-emerald-600 font-bold";
    if (pct >= 94) return isDark ? "text-amber-400 font-bold" : "text-amber-500 font-bold";
    return isDark ? "text-rose-400 font-bold" : "text-rose-600 font-bold";
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "bg-green-500";
    if (pct >= 94) return "bg-yellow-500";
    if (pct >= 90) return "bg-red-500";
    return "bg-gray-400";
  };

  const calcularRecebidoMeta = (metrics: {
    abertura_vencido_mes: number;
    meta_mes: number;
    vencido_atual: number;
  }) => {
    const abertura = metrics.abertura_vencido_mes || 0;
    const vencidoAtual = metrics.vencido_atual || 0;
    const metaMes = metrics.meta_mes || 0;
    const recebidosMes = Math.max(0, abertura - vencidoAtual);
    const aReceber = Math.max(0, abertura - metaMes);
    const restante = Math.max(0, vencidoAtual - metaMes);

    const format = (n: number) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(n);

    const restanteText = format(restante);
    let restanteClass = "text-zinc-400 text-xs mt-1";
    if (restante > 0) restanteClass = "text-rose-400 font-medium text-xs mt-1";
    if (restante === 0) restanteClass = "text-emerald-400 font-medium text-xs mt-1";

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

  const getRoleBadge = (role?: string | null) => {
    const normalizedRole = normalizeOperatorRole(role);

    if (normalizedRole === "líder") {
      return (
        <span className={isDark
          ? "inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-300"
          : "inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"
        }>
          Op. Líder
        </span>
      );
    }

    if (normalizedRole === "auxiliar") {
      return (
        <span className={isDark
          ? "inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300"
          : "inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
        }>
          Op. Auxiliar
        </span>
      );
    }

    return null;
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
    <div className={isDark ? "space-y-6 text-zinc-100 px-1 sm:px-0" : "space-y-6 text-slate-900 px-1 sm:px-0"}>
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <p className="text-muted-foreground mt-2">
          {dadosFiltrados.length} filiais • Atualizado a cada 30s
        </p>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
        <div className="w-full max-w-xs">
          <Select value={filtroRegional} onValueChange={setFiltroRegional}>
            <SelectTrigger className={isDark ? "bg-zinc-900 border-white/10 text-zinc-100" : "bg-white border-slate-300 text-slate-900"}>
              <SelectValue placeholder="Todas as regionais" />
            </SelectTrigger>
            <SelectContent className={isDark ? "bg-zinc-900 border-white/10 text-zinc-100" : "bg-white border-slate-300 text-slate-900"}>
              <SelectItem value="Membros">Membros</SelectItem>
              <SelectItem value={ABATEDORES_REGIONAL}>ABATEDORES</SelectItem>
              <SelectItem value="todas">Todas as regionais</SelectItem>
              {regionais.filter((reg) => reg !== "Membros" && reg !== ABATEDORES_REGIONAL).map(reg => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={isDark ? "flex w-full sm:w-auto items-center justify-center gap-3 bg-zinc-900/90 px-4 sm:px-6 py-3 rounded-lg border border-white/10" : "flex w-full sm:w-auto items-center justify-center gap-3 bg-white px-4 sm:px-6 py-3 rounded-lg border border-slate-300"}>
          <Switch
            id="ocultar-zeradas"
            checked={ocultarZeradas}
            onCheckedChange={setOcultarZeradas}
          />
          <Label htmlFor="ocultar-zeradas" className={isDark ? "cursor-pointer font-medium text-zinc-200" : "cursor-pointer font-medium text-slate-700"}>
            Ocultar filiais zeradas
          </Label>
        </div>
      </div>

      {/* TABELA */}
      <div className={isDark ? "bg-zinc-950/90 rounded-xl shadow-lg border border-white/10 overflow-x-auto" : "bg-white rounded-xl shadow-lg border border-slate-300 overflow-x-auto"}>
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className={isDark ? "bg-gradient-to-r from-indigo-700 to-violet-700 text-zinc-100 text-xs" : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs"}>
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
                const fallbackUser = f.usuario_principal
                  ? [{
                      ...f.usuario_principal,
                      filial: f.idfilial,
                    } satisfies FilialOperator]
                  : [];
                const operadores = sortOperators(
                  (operadoresPorFilial[f.idfilial] && operadoresPorFilial[f.idfilial].length > 0)
                    ? operadoresPorFilial[f.idfilial]
                    : fallbackUser,
                );
                const metrics = getLatestMetricSnapshot(operadores, f);
                const updatedText = getUpdatedText(getLatestUpdatedAt(operadores, f.usuario_principal?.updated_at || null));
                const { pctMetaFiado, pctMetaDesafio } = calculateMetaPercentages(metrics);

                return (
                  <tr key={f.idfilial} className={isDark ? "border-b border-white/10 hover:bg-white/5 transition-colors" : "border-b border-slate-200 hover:bg-slate-50 transition-colors"}>
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
                        <div className="flex flex-col gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{f.filial}</p>
                            </div>
                            <p className="text-xs text-zinc-400">{f.regional}</p>
                          </div>
                          <div className="space-y-2">
                            {operadores.map((user) => {
                              const initials = getInitials(user?.nome_usuario);
                              const displayName = getFirstName(user?.nome_usuario);
                              return (
                                <HoverCard key={`${f.idfilial}-${user.user_id || user.nome_usuario || user.role || "operador"}`} openDelay={200}>
                                  <HoverCardTrigger asChild>
                                    <div className={isDark
                                      ? "flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                                      : "flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                                    }>
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
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="break-words font-semibold leading-tight">{displayName}</p>
                                          {getRoleBadge(user?.role)}
                                        </div>
                                        <p className="mt-1 text-xs text-zinc-400">
                                          {getUpdatedText(user?.updated_at || null)}
                                        </p>
                                      </div>
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className={isDark ? "w-80 bg-zinc-900 text-zinc-100 border-white/10" : "w-80 bg-white text-slate-900 border-slate-300"}>
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
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="font-bold text-lg">{displayName}</p>
                                          {getRoleBadge(user?.role)}
                                        </div>
                                        <p className="text-sm text-zinc-400">Filial {f.filial}</p>
                                      </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                      <div className="flex flex-wrap items-center gap-3">
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
                                      </div>
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
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 italic mt-1">
                          {updatedText}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {calcularRecebidoMeta(metrics)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <p className={`text-lg ${getPercentColor(pctMetaFiado)}`}>
                          {pctMetaFiado.toFixed(2)}%
                        </p>
                        <Progress
                          value={pctMetaFiado}
                          className="h-3 bg-zinc-800"
                          indicatorClassName={getProgressColor(pctMetaFiado)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <p className={`text-lg flex items-center justify-center gap-1 ${getPercentColor(pctMetaDesafio)}`}>
                          <Zap className="h-4 w-4 text-yellow-500" />
                          {pctMetaDesafio.toFixed(2)}%
                        </p>
                        <Progress
                          value={pctMetaDesafio}
                          className="h-3 bg-zinc-800"
                          indicatorClassName={getProgressColor(pctMetaDesafio)}
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
