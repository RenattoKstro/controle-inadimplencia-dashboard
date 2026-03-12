import { useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calculator,
  Building,
  Wallet,
  ArrowDown,
  Check,
  Target,
  Handshake,
  TrendingUp,
  CircleDollarSign,
  Flag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const CardItem = ({
  title,
  value,
  icon,
  color = "bg-blue-500",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-border/60 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</h3>
          <span className={cn("p-2 rounded-full text-white", color)}>{icon}</span>
        </div>
        <div className="text-base sm:text-lg md:text-xl font-semibold text-foreground break-words leading-tight">
          {formatCurrency(value)}
        </div>
      </CardContent>
    </Card>
  );
};

const MetaFiado = ({ userData, isLoading, diasRestantesCalculados, setRecebidoHoje, diasSemExpediente }: DashboardProps) => {
  const isMobile = useIsMobile();

  const aReceber = userData.abertura_vencido_mes - userData.meta_mes || 0;
  const faltaReceberMes = Math.max(0, (userData.vencido_atual || 0) - (userData.meta_mes || 0));
  const recebidosMes = (userData.abertura_vencido_mes || 0) - (userData.vencido_atual || 0);
  const recebidoHoje = Math.max(0, Number(((userData.abertura_dia || 0) - (userData.vencido_atual || 0)).toFixed(2)));

  const calculateTotalWorkDays = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let totalDays = 0;

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && !diasSemExpediente?.some(date => date.toDateString() === d.toDateString())) {
        totalDays++;
      }
    }
    return totalDays;
  };

  const calculateWorkedDays = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    let workedDays = 0;

    for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && !diasSemExpediente?.some(date => date.toDateString() === d.toDateString())) {
        workedDays++;
      }
    }
    if (today.getDay() === 0) workedDays--;
    return workedDays;
  };

  const diasUteisRestantes = userData.dias_restantes || diasRestantesCalculados || 0;
  const totalWorkDaysInMonth = calculateTotalWorkDays();
  const diasUteisTrabalhados = userData.dias_trabalhados || calculateWorkedDays();
  const valorPorDia = aReceber > 0 && totalWorkDaysInMonth > 0 ? aReceber / totalWorkDaysInMonth : 0;
  const valorEsperadoAcumulado = diasUteisTrabalhados > 0 ? valorPorDia * diasUteisTrabalhados : 0;
  const gap = recebidosMes - valorEsperadoAcumulado;
  const receberPorDia = diasUteisRestantes > 0 ? faltaReceberMes / diasUteisRestantes : 0;
  const progressoDiario = receberPorDia > 0 ? (recebidoHoje / receberPorDia) * 100 : 0;
  const faltaParaMetaDiaria = Math.max(0, receberPorDia - recebidoHoje);

  let progressoPercentual = 0;
  if (userData.vencido_atual > 0) {
    progressoPercentual = (userData.meta_mes / userData.vencido_atual) * 100;
  }
  progressoPercentual = Math.max(0, progressoPercentual);

  const progressForCircle = Math.min(100, progressoPercentual);
  const radius = isMobile ? 64 : 82;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressForCircle / 100) * circumference;

  useEffect(() => {
    if (setRecebidoHoje) {
      setRecebidoHoje(recebidoHoje);
    }
  }, [recebidoHoje, setRecebidoHoje]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-44" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-red-600 flex items-center gap-2">
        <Handshake className="h-5 w-5" />
        Meta Fiado
      </h2>

      <Card className="border border-white/10 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 lg:gap-10 items-center">
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                <svg width={isMobile ? 170 : 220} height={isMobile ? 170 : 220} className="-rotate-90">
                  <circle
                    cx={isMobile ? 85 : 110}
                    cy={isMobile ? 85 : 110}
                    r={radius}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={isMobile ? 10 : 12}
                    fill="none"
                  />
                  <circle
                    cx={isMobile ? 85 : 110}
                    cy={isMobile ? 85 : 110}
                    r={radius}
                    stroke="#4f46e5"
                    strokeWidth={isMobile ? 10 : 12}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="absolute text-2xl sm:text-3xl font-bold">{Math.round(progressoPercentual)}%</div>
              </div>
              <p className="mt-2 text-lg sm:text-xl font-semibold text-zinc-50 text-center break-words">{formatCurrency(userData.meta_mes || 0)}</p>
              <p className="text-sm text-zinc-400">Meta Fiado</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <div className="flex items-center gap-2 text-zinc-300 text-sm"><Wallet className="h-4 w-4" /> A Receber</div>
                <div className="text-2xl font-semibold text-zinc-50 break-words">{formatCurrency(aReceber)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-emerald-300 text-sm"><TrendingUp className="h-4 w-4" /> Recebido</div>
                <div className="text-2xl font-semibold text-zinc-50 break-words">{formatCurrency(recebidosMes)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-indigo-300 text-sm"><Target className="h-4 w-4" /> Meta Restante</div>
                <div className="text-2xl font-semibold text-zinc-50 break-words">{formatCurrency(faltaReceberMes)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-zinc-300 text-sm"><CircleDollarSign className="h-4 w-4" /> Média Diária</div>
                <div className="text-2xl font-semibold text-zinc-50 break-words">{formatCurrency(receberPorDia)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-rose-300 text-sm"><Flag className="h-4 w-4" /> Meta Diária Necessária</div>
                <div className="text-2xl font-semibold text-zinc-50 break-words">{formatCurrency(faltaParaMetaDiaria)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-zinc-300 text-sm"><Building className="h-4 w-4" /> Recebido Hoje</div>
                <div className="text-2xl font-semibold text-zinc-50 break-words">
                  {formatCurrency(recebidoHoje)}
                  <span className={cn("ml-2 text-sm", progressoDiario >= 100 ? "text-emerald-300" : "text-amber-300")}>
                    {progressoDiario.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <CardItem title="Falta Receber/Mês" value={faltaReceberMes} icon={<ArrowDown size={16} />} color="bg-red-500" />
        <CardItem title="Receber por Dia" value={receberPorDia} icon={<Calculator size={16} />} color="bg-orange-500" />
        <CardItem title="Valor Esperado Acumulado" value={valorEsperadoAcumulado} icon={<Target size={16} />} color="bg-indigo-500" />
        <CardItem title={gap >= 0 ? "GAP (Positivo)" : "GAP (Negativo)"} value={gap} icon={<Check size={16} />} color={gap >= 0 ? "bg-green-500" : "bg-red-500"} />
      </div>

      <Card className="border border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Resumo de Dias Úteis</CardTitle>
          <CardDescription>Distribuição de progresso no mês atual.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-muted-foreground">Trabalhados:</span> <strong>{diasUteisTrabalhados}</strong></div>
          <div><span className="text-muted-foreground">Restantes:</span> <strong>{diasUteisRestantes}</strong></div>
          <div><span className="text-muted-foreground">Recebido no mês:</span> <strong>{formatCurrency(recebidosMes)}</strong></div>
          <div><span className="text-muted-foreground">Meta diária:</span> <strong>{formatCurrency(valorPorDia)}</strong></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaFiado;
