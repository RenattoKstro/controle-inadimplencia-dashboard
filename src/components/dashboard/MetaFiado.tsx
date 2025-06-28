import { useEffect } from "react";
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

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
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
  const getProgressStyle = (value: number) => {
    if (value < 94) return { background: "linear-gradient(90deg, #ef4444, #dc2626)" };
    if (value < 100) return { background: "linear-gradient(90deg, #facc15, #f59e0b)" };
    return { background: "linear-gradient(90deg, #22c55e, #16a34a)" };
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <span className={`p-2 rounded-full ${color} text-white`}>{icon}</span>
        </div>
        <div className="text-xl md:text-2xl font-bold">{formatCurrency(value)}</div>
        {showProgress && (
          <div className="mt-4 space-y-2">
            <div
              className="w-full h-10 md:h-12 rounded-full bg-gradient-radial from-gray-100 to-gray-300 overflow-hidden relative"
              style={{ boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.1)" }}
            >
              <div
                className="h-full rounded-l-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(progressValue, 105)}%`,
                  ...getProgressStyle(progressValue),
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
              />
            </div>
            <div className="text-xs text-right text-gray-600">
              {progressValue.toFixed(2)}% do objetivo diário
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProgressCard = ({ title, current, target, icon, userData }: {
  title: string;
  current: number;
  target: number;
  icon: React.ReactNode;
  userData: any;
}) => {
  const isMobile = useIsMobile();
  let percentageComplete = 0;

  if (userData.vencido_atual > 0) {
    percentageComplete = (userData.meta_mes / userData.vencido_atual) * 100;
    console.log(`[MetaFiado] Meta Fiado - Meta Mes: ${userData.meta_mes}, Vencido Atual: ${userData.vencido_atual}, Progresso Calculado: ${percentageComplete.toFixed(2)}%`);
  } else {
    console.log(`[MetaFiado] Meta Fiado - Vencido Atual é zero ou negativo: ${userData.vencido_atual}`);
  }

  percentageComplete = Math.max(0, percentageComplete);

  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${isMobile ? "col-span-1" : "col-span-1 md:col-span-3"}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col items-center gap-2">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="text-xl md:text-2xl font-bold text-gray-700">
            {percentageComplete.toFixed(2)}% concluído
          </div>
        </div>
        <CardDescription className="text-sm mt-1 text-center">
          <div className="flex flex-col md:flex-row md:gap-4 justify-center">
            <span>Meta: {formatCurrency(target)}</span>
            <span>Atual: {formatCurrency(current)}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div
            className="w-full h-10 md:h-12 rounded-full bg-gradient-radial from-gray-100 to-gray-300 overflow-hidden relative"
            style={{ boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <div
              className="h-full rounded-l-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(percentageComplete, 105)}%`,
                ...(percentageComplete < 94 ? { background: "linear-gradient(90deg, #ef4444, #dc2626)" } :
                  percentageComplete < 100 ? { background: "linear-gradient(90deg, #facc15, #f59e0b)" } :
                  { background: "linear-gradient(90deg, #22c55e, #16a34a)" }),
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetaFiado = ({ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado, onMetaDataUpdate }: DashboardProps) => {
  const isMobile = useIsMobile();

  const aReceber = userData.abertura_vencido_mes - userData.meta_mes || 0;
  const faltaReceberMes = Math.max(0, (userData.vencido_atual || 0) - (userData.meta_mes || 0));
  const recebidosMes = (userData.abertura_vencido_mes || 0) - (userData.vencido_atual || 0);
  const recebidoHoje = Math.max(0, (userData.abertura_dia || 0) - (userData.vencido_atual || 0));
  console.log(`[MetaFiado] Calculado recebidoHoje: ${recebidoHoje}, abertura_dia=${userData.abertura_dia}, vencido_atual=${userData.vencido_atual}`);
  const receberPorDia = ((userData.dias_restantes || diasRestantesCalculados) > 0)
    ? faltaReceberMes / (userData.dias_restantes || diasRestantesCalculados)
    : 0;
  const progressoDiario = receberPorDia > 0 ? (recebidoHoje / receberPorDia) * 100 : 0;
  const faltaParaMetaDiaria = Math.max(0, receberPorDia - recebidoHoje);

  useEffect(() => {
    if (onMetaDataUpdate) {
      onMetaDataUpdate({
        title: "Meta Fiado",
        data: [
          { item: "Meta Mensal", value: formatCurrency(userData.meta_mes || 0) },
          { item: "Vencido Atual", value: formatCurrency(userData.vencido_atual || 0) },
          { item: "Progresso Mensal", value: `${percentageComplete.toFixed(2)}%` },
          { item: "A Receber", value: formatCurrency(aReceber) },
          { item: "Falta Receber/Mês", value: formatCurrency(faltaReceberMes) },
          { item: "Recebido Mês", value: formatCurrency(recebidosMes) },
          { item: "Recebido Hoje", value: formatCurrency(recebidoHoje) },
          { item: "Receber por Dia", value: formatCurrency(receberPorDia) },
          { item: "Falta para Meta Diária", value: formatCurrency(faltaParaMetaDiaria) },
        ],
      });
    }
  }, [userData, diasRestantesCalculados, onMetaDataUpdate]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/4" />
        </div>
        <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
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
        <h2 className="text-xl md:text-2xl font-bold">Meta Fiado</h2>
      </div>
      <div className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-3 gap-4"}`}>
        <ProgressCard
          title="Progresso da Meta Mensal"
          current={userData.vencido_atual || 0}
          target={userData.meta_mes || 0}
          icon={<Target className="h-5 w-5 text-blue-600" />}
          userData={userData}
        />
        <CardItem title="A Receber" value={aReceber} icon={<ArrowDown size={16} />} color="bg-cyan-500" />
        <CardItem title="Falta Receber/Mês" value={faltaReceberMes} icon={<ArrowDown size={16} />} color="bg-red-500" />
        <CardItem title="Recebido Mês" value={recebidosMes} icon={<Check size={16} />} color="bg-green-500" />
        <CardItem title="Recebido Hoje" value={recebidoHoje} icon={<Building size={16} />} color="bg-green-500" />
        <CardItem title="Receber por Dia" value={receberPorDia} icon={<Calculator size={16} />} color="bg-orange-500" />
        <CardItem title="Falta para Meta Diária" value={faltaParaMetaDiaria} icon={<Target size={16} />} color="bg-yellow-500" />
      </div>
    </div>
  );
};

export default MetaFiado;