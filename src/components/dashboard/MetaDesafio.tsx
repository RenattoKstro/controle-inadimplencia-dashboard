import { useEffect, useState } from "react";
import { DashboardProps } from "../DashboardLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { useIsMobile } from "../../hooks/use-mobile";
import { Flame, CircleCheckBig, Target, TrendingUp, AlertTriangle } from "lucide-react";

const formatCurrency = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

const MetaDesafio = ({
  userData,
  updateUserData,
  isLoading,
  diasRestantesCalculados,
}: DashboardProps) => {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [metaDesafio, setMetaDesafio] = useState(userData?.meta_desafio || 0);
  const [diasRestantes, setDiasRestantes] = useState(
    userData?.dias_restantes || diasRestantesCalculados || 1
  );

  useEffect(() => {
    if (userData?.dias_restantes !== undefined) {
      setDiasRestantes(userData.dias_restantes);
    }
  }, [userData?.dias_restantes]);

  if (!userData) {
    return null;
  }

  const vencidoAtual = Number(userData.vencido_atual) || 0;
  const metaDesafioValor = Number(userData.meta_desafio) || 0;
  const recebidoMes = (userData.abertura_vencido_mes || 0) - (userData.vencido_atual || 0);
  const valorRestante = Math.max(0, vencidoAtual - metaDesafioValor);
  const valorPorDia = diasRestantes > 0 ? valorRestante / diasRestantes : 0;

  const progressoBruto = metaDesafioValor > 0 && vencidoAtual > 0
    ? (metaDesafioValor / vencidoAtual) * 100
    : 0;
  const progresso = Math.max(0, Math.min(100, Number(progressoBruto.toFixed(2))));
  const desafioAtingido = progresso >= 100;

  const handleSave = () => {
    updateUserData({ meta_desafio: metaDesafio });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMetaDesafio(userData?.meta_desafio || 0);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card className="border border-emerald-500/30 bg-zinc-950 text-zinc-100">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-emerald-500/35 bg-gradient-to-r from-zinc-950 via-zinc-950 to-emerald-950/50 text-zinc-100 shadow-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6 lg:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-zinc-50">
            <Flame className="h-5 w-5 text-indigo-400" />
            Meta Desafio
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              <Button size={isMobile ? "sm" : "default"} onClick={handleSave}>Salvar</Button>
              <Button size={isMobile ? "sm" : "default"} variant="outline" onClick={handleCancel}>Cancelar</Button>
            </div>
          ) : (
            <Button size={isMobile ? "sm" : "default"} variant="outline" onClick={() => setIsEditing(true)}>
              Editar Meta
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base sm:text-2xl">
          <CircleCheckBig className="h-5 w-5" />
          {desafioAtingido ? "Meta Desafio atingida!" : "Meta Desafio em andamento"}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <div className="flex items-center gap-2 text-zinc-300 text-sm"><Target className="h-4 w-4 text-indigo-400" /> Meta Desafio</div>
            {isEditing ? (
              <Input
                value={metaDesafio}
                onChange={(e) => setMetaDesafio(parseFloat(e.target.value) || 0)}
                className="mt-2 h-11 text-lg font-semibold"
              />
            ) : (
              <div className="text-2xl font-semibold text-zinc-50 break-words">{formatCurrency(metaDesafioValor)}</div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-zinc-300 text-sm"><TrendingUp className="h-4 w-4 text-emerald-400" /> Recebido no Mês</div>
            <div className="text-2xl font-semibold text-zinc-50 break-words">{formatCurrency(recebidoMes)}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-zinc-300 text-sm"><AlertTriangle className="h-4 w-4 text-rose-400" /> Vencido Atual</div>
            <div className="text-2xl font-semibold text-zinc-50 break-words">{formatCurrency(vencidoAtual)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-300">{progresso.toFixed(1)}%</span>
            <span className="text-zinc-400">{formatCurrency(metaDesafioValor)}</span>
          </div>
          <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">Valor restante: <strong className="text-zinc-100">{formatCurrency(valorRestante)}</strong></div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">Média necessária/dia: <strong className="text-zinc-100">{formatCurrency(valorPorDia)}</strong></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaDesafio;
