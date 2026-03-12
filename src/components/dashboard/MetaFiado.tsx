import { useEffect, useState } from "react";
import { DashboardProps } from "../DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calculator, Building, Wallet, ArrowDown, Check, Target, Handshake } from "lucide-react";
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
  showProgress = false,
  progressValue = 0,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  showProgress?: boolean;
  progressValue?: number;
}) => {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 border border-border/60 ${color} bg-opacity-15 overflow-hidden`}>
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{title}</h3>
          <span className={`p-2 rounded-full ${color} text-white`}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-base sm:text-lg md:text-xl font-semibold text-foreground break-words leading-tight">{formatCurrency(value)}</div>
          {showProgress && (
            <div className="text-sm sm:text-base font-semibold text-red-600 whitespace-nowrap">
              {progressValue.toFixed(2)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProgressCard = ({ title, current, target, icon, userData }: {
  title: string;
  current: number;
  target: number;
  icon: React.ReactNode;
  userData: { vencido_atual: number; meta_mes: number };
}) => {
  const isMobile = useIsMobile();

  let percentageComplete = 0;
  if (userData.vencido_atual > 0) {
    percentageComplete = (userData.meta_mes / userData.vencido_atual) * 100;
  } else {
    console.log(`[MetaFiado] Meta Fiado - Vencido Atual é zero ou negativo: ${userData.vencido_atual}`);
  }
  percentageComplete = Math.max(0, percentageComplete);

  const percentuaisAlvo = [94, 96, 98, 99, 100, 101, 103, 105];
  const valoresRestantes = percentuaisAlvo.map((percentual) => {
    const vencidoNecessario = userData.meta_mes / (percentual / 100);
    let diferenca = userData.vencido_atual - vencidoNecessario;
    const atingido = percentageComplete >= percentual;
    diferenca = atingido ? Math.abs(diferenca) : -Math.abs(diferenca);
    return { percentual, diferenca, atingido };
  });

  const getProgressStyle = (value: number) => {
    if (value < 94) return { background: "#ff0000" };
    if (value < 100) return { background: "#facc15" };
    return { background: "#22c55e" };
  };

  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-shadow duration-200 border border-border/60 bg-primary/5 overflow-hidden ${
        isMobile ? "col-span-1" : "col-span-1 md:col-span-3"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col items-center gap-2">
          <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2 text-center">
            {icon}
            {title}
          </CardTitle>
          <div className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground break-words text-center">
            {percentageComplete.toFixed(2)}% concluído
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm mt-1 text-center text-muted-foreground">
          <div className="flex flex-col md:flex-row md:gap-4 justify-center">
            <span>Meta: {formatCurrency(target)}</span>
            <span>Atual: {formatCurrency(current)}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div
            className="w-full h-8 sm:h-9 md:h-10 rounded-full bg-muted overflow-hidden relative"
            style={{ boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <div
              className="h-full rounded-l-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(percentageComplete, 105)}%`,
                ...getProgressStyle(percentageComplete),
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2 mt-2 justify-center">
            {valoresRestantes.map(({ percentual, diferenca, atingido }, index) => (
              <div key={percentual} className="flex items-center gap-2">
                <div
                  className={cn(
                    "text-xs sm:text-sm md:text-base font-medium break-words",
                    atingido ? "text-green-600" : "text-red-600"
                  )}
                >
                  {percentual}%: {formatCurrency(diferenca)}
                </div>
                {index < valoresRestantes.length - 1 && <span className="text-gray-400">|</span>}
              </div>
            ))}
          </div>
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
    if (today.getDay() === 0) workedDays--; // Remove domingo se for o dia atual
    return workedDays;
  };

  const diasUteisRestantes = userData.dias_restantes || diasRestantesCalculados || 0;
  const totalWorkDaysInMonth = calculateTotalWorkDays(); // Dinâmico agora
  const diasUteisTrabalhados = userData.dias_trabalhados || calculateWorkedDays(); // Usa userData se disponível
  const valorPorDia = aReceber > 0 && totalWorkDaysInMonth > 0 ? aReceber / totalWorkDaysInMonth : 0;
  const valorEsperadoAcumulado = diasUteisTrabalhados > 0 ? valorPorDia * diasUteisTrabalhados : 0;
  const gap = recebidosMes - valorEsperadoAcumulado;
  const receberPorDia = diasUteisRestantes > 0 ? faltaReceberMes / diasUteisRestantes : 0;
  const progressoDiario = receberPorDia > 0 ? (recebidoHoje / receberPorDia) * 100 : 0;
  const faltaParaMetaDiaria = Math.max(0, receberPorDia - recebidoHoje);

  // Nova função para calcular os dias acima da meta
  const calcularDiasAcimaDaMeta = (): number => {
    if (valorPorDia <= 0) return 0;
    const diasAcima = gap > 0 ? Math.floor(gap / valorPorDia) : 0;
    return diasAcima;
  };

  const diasAcimaDaMeta = calcularDiasAcimaDaMeta();

  useEffect(() => {
    if (setRecebidoHoje) {
      setRecebidoHoje(recebidoHoje);
    }
  }, [recebidoHoje, setRecebidoHoje]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/4" />
        </div>
        <div
          className={`grid grid-cols-1 ${
            isMobile ? "" : "md:grid-cols-2 lg:grid-cols-3"
          } gap-4`}
        >
          {[...Array(isMobile ? 4 : 8)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-red-600 flex items-center gap-2">
          <Handshake className="h-5 w-5 text-red-600" />
          Meta Fiado
        </h2>
      </div>
      <div
        className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-3 gap-4"}`}
      >
        <ProgressCard
          title="Progresso da Meta Mensal"
          current={userData.vencido_atual || 0}
          target={userData.meta_mes || 0}
          icon={<Target className="h-5 w-5 text-blue-500" />}
          userData={userData}
        />
        <CardItem
          title="A Receber"
          value={aReceber}
          icon={<ArrowDown size={16} />}
          color="bg-cyan-500"
        />
        <CardItem
          title="Falta Receber/Mês"
          value={faltaReceberMes}
          icon={<ArrowDown size={16} />}
          color="bg-red-500"
        />
        <CardItem
          title="Recebido Mês"
          value={recebidosMes}
          icon={<Check size={16} />}
          color="bg-green-500"
        />
        <CardItem
          title="Recebido Hoje"
          value={recebidoHoje}
          icon={<Building size={16} />}
          color="bg-green-500"
          showProgress={true}
          progressValue={progressoDiario}
        />
        <CardItem
          title="Receber por Dia"
          value={receberPorDia}
          icon={<Calculator size={16} />}
          color="bg-orange-500"
        />
        <CardItem
          title="Falta para Meta Diária"
          value={faltaParaMetaDiaria}
          icon={<Target size={16} />}
          color="bg-yellow-500"
        />
        <Card
          className={`shadow-sm hover:shadow-md transition-shadow duration-200 border border-border/60 ${gap >= 0 ? "bg-green-500" : "bg-red-500"} bg-opacity-15 overflow-hidden`}
        >
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">{gap >= 0 ? "GAP (Positivo)" : "GAP (Negativo)"}</h3>
              <span
                className={`p-2 rounded-full ${gap >= 0 ? "bg-green-500" : "bg-red-500"} text-white`}
              >
                <Wallet size={16} />
              </span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground break-words text-center">{formatCurrency(gap)}</div>
            <div className="mt-2 text-sm text-foreground">
              {gap >= 0 ? "Acima da meta" : "Abaixo da meta"}
            </div>
            <div className="mt-1 text-xs text-foreground">
              Dias úteis trabalhados: {diasUteisTrabalhados}
            </div>
            <div className="mt-1 text-xs text-foreground">
              Dias úteis restantes: {diasUteisRestantes}
            </div>
            {gap > 0 && (
              <div className="mt-1 text-xs text-foreground">
                Dias acima da meta: {diasAcimaDaMeta}
              </div>
            )}
            <div className="mt-1 text-xs text-foreground">
              Valor esperado acumulado: {formatCurrency(valorEsperadoAcumulado)}
            </div>
            <div className="mt-1 text-xs text-foreground">
              Recebido no mês: {formatCurrency(recebidosMes)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetaFiado;
