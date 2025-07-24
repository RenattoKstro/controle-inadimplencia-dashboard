import { useEffect, useState } from "react";
import { DashboardProps } from "../DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calculator, Building, Wallet, ArrowDown, Check, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import Previsao from "./Previsao";

interface CardItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  showProgress?: boolean;
  progressValue?: number;
}

interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  icon: React.ReactNode;
  userData: any;
}

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
}: CardItemProps) => {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${color} bg-opacity-50`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <span className={`p-2 rounded-full ${color} text-white`}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl md:text-2xl font-bold text-foreground">{formatCurrency(value)}</div>
          {showProgress && (
            <div className="text-lg font-bold text-red-600">
              {progressValue.toFixed(2)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProgressCard = ({ title, current, target, icon, userData }: ProgressCardProps) => {
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
    return {
      percentual,
      diferenca,
      atingido,
    };
  });

  const getProgressStyle = (value: number) => {
    if (value < 94) return { background: "#ff0000" };
    if (value < 100) return { background: "#facc15" };
    return { background: "#22c55e" };
  };

  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-shadow duration-200 bg-blue-500 bg-opacity-10 ${
        isMobile ? "col-span-1" : "col-span-1 md:col-span-3"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col items-center gap-2">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="text-xl md:text-2xl font-bold text-foreground">
            {percentageComplete.toFixed(2)}% concluído
          </div>
        </div>
        <CardDescription className="text-sm mt-1 text-center text-foreground">
          <div className="flex flex-col md:flex-row md:gap-4 justify-center">
            <span>Meta: {formatCurrency(target)}</span>
            <span>Atual: {formatCurrency(current)}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div
            className="w-full h-10 md:h-12 rounded-full bg-white overflow-hidden relative"
            style={{
              boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
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
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            {valoresRestantes.map(({ percentual, diferenca, atingido }, index) => (
              <div key={percentual} className="flex items-center gap-2">
                <div
                  className={cn(
                    "text-sm md:text-base font-medium",
                    atingido ? "text-green-600" : "text-red-600"
                  )}
                >
                  {percentual}%: {formatCurrency(diferenca)}
                </div>
                {index < valoresRestantes.length - 1 && (
                  <span className="text-gray-400">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetaFiado = ({ userData, isLoading, diasRestantesCalculados, setRecebidoHoje }: DashboardProps & { setRecebidoHoje?: (value: number) => void }) => {
  const isMobile = useIsMobile();
  const [dailyReceipts, setDailyReceipts] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const authUserId = user?.id;
      if (authUserId && userData && (userData.dias_restantes || diasRestantesCalculados)) {
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().slice(0, 10);
        const lastDay = currentDate.toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("historico_diario")
          .select("recebido, data_recebimento")
          .eq("user_id", authUserId)
          .gte("data_recebimento", firstDay)
          .lte("data_recebimento", lastDay);

        if (error) {
          console.error("Erro ao buscar registros diários:", error.message);
          return;
        }

        if (data) {
          const receipts = data.map((record) => ({
            date: record.data_recebimento,
            value: record.recebido || 0,
          }));
          setDailyReceipts(receipts);
        }
      }
    };

    fetchData();
  }, [userData, diasRestantesCalculados]);

  const aReceber = userData.abertura_vencido_mes - userData.meta_mes;
  const faltaReceberMes = Math.max(0, userData.vencido_atual - userData.meta_mes);
  const recebidosMes = userData.abertura_vencido_mes - userData.vencido_atual;
  const recebidoHoje = Math.max(0, Number(((userData.abertura_dia || 0) - userData.vencido_atual).toFixed(2)));

  const calculateWorkedDays = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    let workedDays = 0;
    for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workedDays++; // Exclui sábados e domingos
    }
    return workedDays;
  };

  const calculateRemainingWorkDays = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Último dia do mês
    let remainingDays = 0;
    for (let d = new Date(today); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) remainingDays++; // Exclui sábados e domingos
    }
    return remainingDays;
  };

  const diasUteisTrabalhados = calculateWorkedDays();
  const diasUteisRestantes = calculateRemainingWorkDays();
  const totalWorkDaysInMonth = diasUteisTrabalhados + diasUteisRestantes;
  const valorPorDiaTotal = userData.meta_mes / totalWorkDaysInMonth || 1;
  const valorEsperadoAcumulado = valorPorDiaTotal * diasUteisTrabalhados;
  const valorPorDia = aReceber > 0 && diasUteisRestantes > 0 ? aReceber / diasUteisRestantes : 0;
  const gap = recebidosMes - valorEsperadoAcumulado;
  const diferenca = recebidosMes - userData.meta_mes;

  const receberPorDia = (userData.dias_restantes || diasRestantesCalculados) > 0
    ? faltaReceberMes / (userData.dias_restantes || diasRestantesCalculados)
    : 0;
  const progressoDiario = receberPorDia > 0 ? (recebidoHoje / receberPorDia) * 100 : 0;
  const faltaParaMetaDiaria = Math.max(0, receberPorDia - recebidoHoje);

  useEffect(() => {
    if (setRecebidoHoje) {
      setRecebidoHoje(recebidoHoje);
    }
  }, [recebidoHoje, setRecebidoHoje]);

  const previsaoData = Previsao({
    abertura_vencido_mes: userData.abertura_vencido_mes,
    meta_mes: userData.meta_mes,
    vencido_atual: userData.vencido_atual,
    dias_trabalhados: diasUteisTrabalhados,
    dias_restantes: diasRestantesCalculados || userData.dias_restantes || 0,
    dailyReceipts,
  });

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
              <CardContent className="p-4 md:p-6">
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
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Meta Fiado</h2>
      </div>
      <div
        className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-3 gap-4"}`}
      >
        <ProgressCard
          title="Progresso da Meta Mensal"
          current={userData.vencido_atual}
          target={userData.meta_mes}
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
          className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${gap >= valorEsperadoAcumulado ? "bg-green-500" : "bg-red-500"} bg-opacity-50`}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">{gap >= valorEsperadoAcumulado ? "GAP (Positivo)" : "GAP (Negativo)"}</h3>
              <span
                className={`p-2 rounded-full ${gap >= valorEsperadoAcumulado ? "bg-green-500" : "bg-red-500"} text-white`}
              >
                <Wallet size={16} />
              </span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">{formatCurrency(gap)}</div>
            <div className="mt-2 text-sm text-foreground">
              {gap >= valorEsperadoAcumulado ? "Acima da meta" : "Abaixo da meta"}
            </div>
            <div className="mt-1 text-xs text-foreground">
              Dias úteis trabalhados: {diasUteisTrabalhados}
            </div>
            <div className="mt-1 text-xs text-foreground">
              Dias úteis restantes: {diasUteisRestantes}
            </div>
            <div className="mt-1 text-xs text-foreground">
              Valor esperado acumulado: {formatCurrency(valorEsperadoAcumulado)}
            </div>
            <div className="mt-1">
              <span className="text-sm font-medium text-foreground">Diferença: </span>
              <span className={diferenca >= 0 ? "text-black" : "text-red-600"}>
                {formatCurrency(diferenca)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${previsaoData.metaStatus.text === 'Meta será atingida!' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'} text-white`}>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-200">Média Diária de Recebimento</h3>
            <div className="text-2xl font-bold mt-2 text-white">{previsaoData.formatCurrency(previsaoData.mediaDiaria)}</div>
            <div className="text-gray-300 text-sm mt-1">Baseado em {dailyReceipts.length} dias com recebimento</div>
            <div className="text-gray-300 text-sm mt-1">Total recebido (diário): {previsaoData.formatCurrency(dailyReceipts.reduce((acc, receipt) => acc + receipt.value, 0))}</div>
          </CardContent>
        </Card>
        <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${previsaoData.metaStatus.text === 'Meta será atingida!' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'} text-white`}>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-200">Previsão de Recebimento (teste)</h3>
            <div className="text-2xl font-bold mt-2 text-white">{previsaoData.formatCurrency(previsaoData.previsaoRecebimentoTotal)}</div>
            <div className="text-gray-300 text-sm mt-1">Total estimado para o mês</div>
            <div className="text-gray-300 text-sm mt-1">Já recebido: {previsaoData.formatCurrency(dailyReceipts.reduce((acc, receipt) => acc + receipt.value, 0))}</div>
            <div className="text-gray-300 text-sm mt-1">Previsão restante: {previsaoData.formatCurrency(previsaoData.previsaoRecebimentoTotal - dailyReceipts.reduce((acc, receipt) => acc + receipt.value, 0))}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetaFiado;
