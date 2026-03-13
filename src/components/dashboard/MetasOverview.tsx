import { useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Wallet,
} from "lucide-react";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

const CircleProgress = ({ value, color, label, amount, subtitle }: { value: number; color: string; label: string; amount: string; subtitle: string }) => {
  const normalized = Math.max(0, Math.min(100, value));
  const radius = 52;
  const size = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-zinc-100 text-base font-semibold flex items-center gap-2">{label}</div>
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth="6" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-zinc-100">
          {Math.round(normalized)}%
        </div>
      </div>
      <p className="text-2xl font-semibold text-zinc-50">{amount}</p>
      <p className="text-zinc-400 text-sm">{subtitle}</p>
    </div>
  );
};

const Metric = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) => (
  <div>
    <div className="flex items-center gap-2 text-sm text-zinc-400">{icon} {label}</div>
    <div className={`text-4xl font-semibold break-words ${accent || "text-zinc-50"}`}>{value}</div>
  </div>
);

const SmallCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="bg-zinc-900/80 border border-white/10">
    <CardContent className="p-4">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-2xl font-semibold text-zinc-100 mt-1 break-words">{value}</p>
    </CardContent>
  </Card>
);

const MetasOverview = ({ userData, diasRestantesCalculados, diasSemExpediente, setRecebidoHoje }: DashboardProps) => {
  const aberturaMes = userData.abertura_vencido_mes || 0;
  const metaFiado = userData.meta_mes || 0;
  const metaDesafio = userData.meta_desafio || 0;
  const vencidoAtual = userData.vencido_atual || 0;
  const recebidosMes = aberturaMes - vencidoAtual;
  const aReceber = aberturaMes - metaFiado;
  const restanteFiado = Math.max(0, vencidoAtual - metaFiado);

  const diasRestantes = userData.dias_restantes || diasRestantesCalculados || 0;
  const metaDiaria = diasRestantes > 0 ? restanteFiado / diasRestantes : 0;

  const fiadoPercent = vencidoAtual > 0 ? (metaFiado / vencidoAtual) * 100 : 0;
  const desafioPercent = vencidoAtual > 0 && metaDesafio > 0 ? (metaDesafio / vencidoAtual) * 100 : 0;
  const desafioAtingida = desafioPercent >= 100;

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  let diasTrabalhados = 0;
  for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
    const isSunday = d.getDay() === 0;
    const isOffDay = diasSemExpediente?.some((date) => date.toDateString() === d.toDateString());
    if (!isSunday && !isOffDay) diasTrabalhados++;
  }

  useEffect(() => {
    const recebidoHoje = Math.max(0, Number(((userData.abertura_dia || 0) - vencidoAtual).toFixed(2)));
    setRecebidoHoje?.(recebidoHoje);
  }, [setRecebidoHoje, userData.abertura_dia, vencidoAtual]);

  return (
    <div className="space-y-5">
      <Card className="bg-zinc-950 border border-indigo-500/25 shadow-2xl">
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            <div className="space-y-4">
              <CircleProgress
                value={fiadoPercent}
                color="#4f46e5"
                label="◎ Meta Fiado"
                amount={formatCurrency(metaFiado)}
                subtitle="Meta Fiado"
              />
              <div className="grid grid-cols-2 gap-5">
                <Metric icon={<Wallet className="h-4 w-4" />} label="À Receber" value={formatCurrency(aReceber)} />
                <Metric icon={<TrendingUp className="h-4 w-4 text-indigo-400" />} label="Recebido" value={formatCurrency(recebidosMes)} />
                <Metric icon={<Target className="h-4 w-4 text-indigo-400" />} label="Restante" value={formatCurrency(restanteFiado)} />
                <Metric icon={<Flame className="h-4 w-4 text-rose-400" />} label="Meta Diária" value={formatCurrency(metaDiaria)} />
              </div>
            </div>

            <div className="hidden lg:block w-px h-full bg-white/10" />

            <div className="space-y-4">
              <CircleProgress
                value={desafioPercent}
                color="#10b981"
                label="◔ Meta Desafio"
                amount={formatCurrency(metaDesafio)}
                subtitle="Meta Desafio"
              />
              <div className="grid grid-cols-2 gap-5">
                <Metric icon={<Target className="h-4 w-4 text-indigo-400" />} label="Meta Desafio" value={formatCurrency(metaDesafio)} />
                <Metric icon={<TrendingUp className="h-4 w-4 text-indigo-400" />} label="Recebido" value={formatCurrency(recebidosMes)} />
                <Metric icon={<AlertTriangle className="h-4 w-4 text-rose-400" />} label="Vencido Atual" value={formatCurrency(vencidoAtual)} />
                <Metric
                  icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  label="Status"
                  value={desafioAtingida ? "Atingida ✓" : "Em andamento"}
                  accent={desafioAtingida ? "text-emerald-300" : "text-zinc-100"}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <SmallCard title="Abertura Mês" value={formatCurrency(aberturaMes)} />
        <SmallCard title="Vencido Atual" value={formatCurrency(vencidoAtual)} />
        <SmallCard title="Dias Trabalhados" value={String(diasTrabalhados)} />
        <SmallCard title="Dias Restantes" value={String(diasRestantes)} />
      </div>
    </div>
  );
};

export default MetasOverview;
