import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Utensils, Check, AlertTriangle, Calendar, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

const formataDinheiro = (valor: number | null): string => {
  if (valor === null) {
    return "R$ 0,00";
  }
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const isPastDay15 = (): boolean => {
  const today = new Date();
  return today.getDate() > 15;
};

const calcularDiasUteisAte15 = (diasRestantes: number): number => {
  const today = new Date();
  if (today.getDate() > 15) {
    return 0;
  }
  const diasAte15 = 15 - today.getDate();
  return Math.min(diasRestantes, diasAte15);
};

const MetaAlimentacao = ({
  userData,
  diasRestantesCalculados,
  isLoading,
}: DashboardProps) => {
  const [diasUteisAte15, setDiasUteisAte15] = useState(0);
  const [progressoCongelado, setProgressoCongelado] = useState<number | null>(null);
  const [mesCongelado, setMesCongelado] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const dias = calcularDiasUteisAte15(userData.dias_restantes || diasRestantesCalculados);
    setDiasUteisAte15(dias);
  }, [userData.dias_restantes, diasRestantesCalculados]);

  const passouDia15 = isPastDay15();
  const today = new Date();
  const mesAtual = today.getMonth();

  const aReceber = userData.abertura_vencido_mes - userData.meta_mes;
  const recebidoMes = userData.abertura_vencido_mes - userData.vencido_atual;
  const metaTicket = aReceber * 0.8;

  // Cálculo do progresso atual
  const progressoTicketAtual = metaTicket > 0 ? (recebidoMes / metaTicket) * 100 : 0;
  console.log(`Meta Ticket - Recebido: ${recebidoMes}, Meta: ${metaTicket}, Progresso Atual: ${progressoTicketAtual}%`);

  // Determinar o progresso a ser exibido
  let progressoExibido: number;

  useEffect(() => {
    // Se o mês mudou desde o último congelamento, resetar o progresso congelado
    if (mesCongelado !== null && mesCongelado !== mesAtual) {
      setProgressoCongelado(null);
      setMesCongelado(null);
      console.log(`[MetaAlimentacao] Mês mudou (de ${mesCongelado} para ${mesAtual}). Resetando progresso congelado.`);
    }

    // Se estamos no dia 15 ou após, e ainda não congelamos o progresso, congelar
    if (passouDia15 && progressoCongelado === null) {
      const progressoNoDia15 = Math.min(100, progressoTicketAtual); // Limitar a 100%
      setProgressoCongelado(progressoNoDia15);
      setMesCongelado(mesAtual);
      console.log(`[MetaAlimentacao] Congelando progresso no dia 15: ${progressoNoDia15}% (Mês: ${mesAtual})`);
    }
  }, [passouDia15, progressoTicketAtual, mesAtual, mesCongelado]);

  // Determinar o progresso a ser exibido
  if (progressoCongelado !== null) {
    // Se o progresso foi congelado, usar o valor congelado
    progressoExibido = progressoCongelado;
    console.log(`[MetaAlimentacao] Usando progresso congelado: ${progressoExibido}%`);
  } else {
    // Caso contrário, usar o progresso atual, limitado a 100%
    progressoExibido = Math.min(100, progressoTicketAtual);
    console.log(`[MetaAlimentacao] Usando progresso atual: ${progressoExibido}%`);
  }

  // FIX: Correção da lógica para considerar a meta batida mesmo após o dia 15,
  // desde que tenha sido atingida antes do prazo
  const metaMesAtingida = recebidoMes >= metaTicket;
  const metaTicketBatida = metaMesAtingida;

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  const getProgressColor = (isComplete: boolean, isPastDeadline: boolean) => {
    if (isComplete) return "bg-green-500";
    return isPastDeadline ? "bg-red-500" : "bg-yellow-500";
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
        <Utensils className="h-5 w-5 text-green-500" />
        Meta de Ticket
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Target className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              Meta de Ticket
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              80% de "A Receber" até o dia 15 do mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Valor da Meta (80%)
                  </p>
                  <p className="text-base md:text-2xl font-bold text-gray-900">
                    {formataDinheiro(metaTicket)}
                  </p>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Recebido até agora
                  </p>
                  <p className="text-base md:text-2xl font-bold text-gray-900">
                    {formataDinheiro(recebidoMes)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Progresso da Meta
                  </p>
                  <p className="text-xs md:text-sm font-medium text-gray-700">
                    {progressoExibido.toFixed(2)}%
                  </p>
                </div>
                <Progress
                  value={progressoExibido}
                  className={cn(
                    "h-2 md:h-3 rounded-full bg-gray-100",
                    getProgressColor(metaTicketBatida, passouDia15)
                  )}
                />
              </div>

              <div className="space-y-2 md:space-y-3">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Valor Restante
                    </p>
                    <p className="text-sm md:text-lg font-semibold text-gray-900">
                      {formataDinheiro(Math.max(0, metaTicket - recebidoMes))}
                    </p>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Por Dia até o Dia 15
                    </p>
                    <p className="text-sm md:text-lg font-semibold text-gray-900">
                      {formataDinheiro(
                        diasUteisAte15 > 0
                          ? (metaTicket - recebidoMes) / diasUteisAte15
                          : 0
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 md:pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 md:gap-2">
                    {metaTicketBatida ? (
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="bg-amber-100 p-1 rounded-full">
                        <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-amber-600" />
                      </div>
                    )}
                    <span className="text-xs md:text-sm font-medium">
                      {metaTicketBatida
                        ? "Meta atingida! Vale alimentação garantido"
                        : "Meta ainda não atingida"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              Detalhes do Período
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Informações sobre o período de avaliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Dias Úteis Restantes até o dia 15
                  </p>
                  <div className="bg-blue-50 rounded-lg p-2 md:p-4 flex justify-center items-center">
                    <p className="text-xl md:text-3xl font-bold text-blue-700">
                      {diasUteisAte15}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Status do Período
                  </p>
                  <div
                    className={cn(
                      "rounded-lg p-2 md:p-4 flex justify-center items-center",
                      passouDia15 ? "bg-blue-50" : "bg-amber-50"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm md:text-lg font-semibold",
                        passouDia15 ? "text-blue-700" : "text-amber-700"
                      )}
                    >
                      {passouDia15 ? "Período encerrado" : "Em andamento"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 md:pt-4 space-y-2 md:space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Dia Atual
                  </p>
                  <p className="text-xs md:text-sm font-medium text-gray-700">
                    {new Date().getDate()}
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 md:h-2">
                  <div
                    className="bg-blue-500 h-1.5 md:h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (new Date().getDate() / 15) * 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  Dias até 15 do mês
                </p>
              </div>
              <div className="pt-2 md:pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-xs md:text-sm font-medium text-blue-600">
                      Meta: 80% de "A Receber" ({formataDinheiro(aReceber)}) ={" "}
                      {formataDinheiro(metaTicket)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetaAlimentacao;
