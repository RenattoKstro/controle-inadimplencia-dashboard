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
  const getProgressColor = (value: number) => {
    if (value < 94) return "#ef4444"; // Vermelho
    if (value < 100) return "#facc15"; // Amarelo
    return "#22c55e"; // Verde
  };

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <span className={`p-2 rounded-full ${color} text-white`}>{icon}</span>
        </div>
        <div className="text-xl md:text-2xl font-bold">{formatCurrency(value)}</div>
        {showProgress && (
          <div className="mt-3 space-y-2 relative">
            <div
              className="w-full h-8 md:h-10 rounded-full bg-gray-200 overflow-hidden relative"
              style={{
                background: "linear-gradient(90deg, #e5e7eb, #d1d5db)",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                className="h-full rounded-l-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(progressValue, 105)}%`, // Suporta até 105%
                  background: getProgressColor(progressValue),
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                }}
              />
              {/* Linhas de marco */}
              {[94, 96, 98, 99, 100, 101, 103, 105].map((mark, index) => (
                <div
                  key={index}
                  className="absolute h-4 w-0.5 bg-gray-600"
                  style={{
                    left: `${mark}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              ))}
            </div>
            {/* Rótulos dos marcos */}
            <div className="flex justify-between text-xs text-gray-600">
              {[94, 96, 98, 99, 100, 101, 103, 105].map((mark, index) => (
                <span
                  key={index}
                  className="w-1/8 text-center"
                  style={{ left: `${mark * 0.94}%`, position: "relative" }} // Ajuste para alinhamento
                >
                  {mark}%
                </span>
              ))}
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

const ProgressCard = ({ title, current, target, icon, userData }: ProgressCardProps) => {
  const isMobile = useIsMobile();

  let percentageComplete = 0;

  if (userData.vencido_atual > 0) {
    percentageComplete = (userData.meta_mes / userData.vencido_atual) * 100;
    console.log(`[MetaFiado] Meta Fiado - Meta Mes: ${userData.meta_mes}, Vencido Atual: ${userData.vencido_atual}, Progresso Calculado: ${percentageComplete.toFixed(2)}%`);
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

  const getProgressColor = (value: number) => {
    if (value < 94) return "#ef4444"; // Vermelho
    if (value < 100) return "#facc15"; // Amarelo
    return "#22c55e"; // Verde
  };

  return (
    <Card
      className={`shadow-sm hover:shadow transition-shadow duration-200 ${
        isMobile ? "col-span-1" : "col-span-1 md:col-span-3"
      }`}
    >
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
            className="w-full h-8 md:h-10 rounded-full bg-gray-200 overflow-hidden relative"
            style={{
              background: "linear-gradient(90deg, #e5e7eb, #d1d5db)",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              className="h-full rounded-l-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(percentageComplete, 105)}%`, // Suporta até 105%
                background: getProgressColor(percentageComplete),
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
              }}
            />
            {/* Linhas de marco */}
            {[94, 96, 98, 99, 100, 101, 103, 105].map((mark, index) => (
              <div
                key={index}
                className="absolute h-4 w-0.5 bg-gray-600"
                style={{
                  left: `${mark}%`,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            ))}
          </div>
          {/* Rótulos dos marcos */}
          <div className="flex justify-between text-xs text-gray-600">
            {[94, 96, 98, 99, 100, 101, 103, 105].map((mark, index) => (
              <span
                key={index}
                className="w-1/8 text-center"
                style={{ left: `${mark * 0.94}%`, position: "relative" }} // Ajuste para alinhamento
              >
                {mark}%
              </span>
            ))}
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

  const aReceber = userData.abertura_vencido_mes - userData.meta_mes;
  const faltaReceberMes = Math.max(0, userData.vencido_atual - userData.meta_mes);
  const recebidosMes = userData.abertura_vencido_mes - userData.vencido_atual;
  const recebidoHoje = Math.max(0, (userData.abertura_dia || 0) - userData.vencido_atual);
  console.log(`[MetaFiado] Calculado recebidoHoje: ${recebidoHoje}, abertura_dia=${userData.abertura_dia}, vencido_atual=${userData.vencido_atual}`);
  const receberPorDia = (userData.dias_restantes || diasRestantesCalculados) > 0
    ? faltaReceberMes / (userData.dias_restantes || diasRestantesCalculados)
    : 0;
  const progressoDiario = receberPorDia > 0 ? (recebidoHoje / receberPorDia) * 100 : 0;
  const faltaParaMetaDiaria = Math.max(0, receberPorDia - recebidoHoje);

  useEffect(() => {
    if (setRecebidoHoje) {
      console.log(`[MetaFiado] Atualizando recebidoHoje no MetaFiado: ${recebidoHoje}`);
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
      <div
        className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-3 gap-4"}`}
      >
        <ProgressCard
          title="Progresso da Meta Mensal"
          current={userData.vencido_atual}
          target={userData.meta_mes}
          icon={<Target className="h-5 w-5 text-blue-600" />}
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
        />
        <CardItem
          title="Receber por Dia"
          value={receberPorDia}
          icon={<Calculator size={16} />}
          color="bg-orange-500"
          showProgress={true}
          progressValue={progressoDiario}
        />
        <CardItem
          title="Falta para Meta Diária"
          value={faltaParaMetaDiaria}
          icon={<Target size={16} />}
          color="bg-yellow-500"
          showProgress={true}
          progressValue={100 - progressoDiario}
        />
      </div>
    </div>
  );
};

export default MetaFiado;
