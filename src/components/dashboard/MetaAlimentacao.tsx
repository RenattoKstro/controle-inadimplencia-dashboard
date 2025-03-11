
import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Utensils, Check, AlertTriangle, TrendingUp, Calendar, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formataDinheiro = (valor: number | null): string => {
  if (valor === null) {
    return "R$ 0,00";
  }
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const isPastDay15 = (): boolean => {
  const today = new Date();
  return today.getDate() > 15;
};

const calcularDiasUteisAte15 = (diasSemExpediente: Date[]): number => {
  const today = new Date();
  const ano = today.getFullYear();
  const mes = today.getMonth();
  let diasUteis = 0;

  for (let dia = 1; dia <= 15; dia++) {
    const data = new Date(ano, mes, dia);
    const diaDaSemana = data.getDay(); // 0 (Domingo) a 6 (Sábado)

    // Verifica se é um dia útil (segunda a sexta)
    if (diaDaSemana >= 1 && diaDaSemana <= 5) {
      // Verifica se o dia não está na lista de dias sem expediente
      const isDiaSemExpediente = diasSemExpediente.some(
        (d) =>
          d.getFullYear() === ano &&
          d.getMonth() === mes &&
          d.getDate() === dia
      );

      if (!isDiaSemExpediente) {
        diasUteis++;
      }
    }
  }

  return diasUteis;
};

const MetaAlimentacao = ({
  userData,
  updateUserData,
  diasSemExpediente,
  isLoading
}: DashboardProps) => {
  const [diasUteisAte15, setDiasUteisAte15] = useState(0);
  
  useEffect(() => {
    // Calcula os dias úteis até o dia 15 do mês atual
    const dias = calcularDiasUteisAte15(diasSemExpediente);
    setDiasUteisAte15(dias);
  }, [userData, diasSemExpediente]);

  const passouDia15 = isPastDay15();
  
  // Calculado usando A Receber como base
  const aReceber = userData.abertura_vencido_mes - userData.meta_mes;
  const recebidoMes = userData.abertura_vencido_mes - userData.vencido_atual;
  
  // Calculando meta de ticket (80% da meta "A Receber" até o dia 15)
  const metaTicket = aReceber * 0.8;
  const metaTicketBatida = recebidoMes >= metaTicket && !passouDia15;
  const progressoTicket = metaTicket > 0 ? Math.min(1, recebidoMes / metaTicket) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid md:grid-cols-2 gap-6">
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
        <Utensils className="h-6 w-6 text-green-500" />
        Meta de Ticket
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Meta de Ticket (Vale Alimentação)
            </CardTitle>
            <CardDescription>
              80% de "A Receber" até o dia 15 do mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Valor da Meta (80%)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formataDinheiro(metaTicket)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Recebido até agora</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formataDinheiro(recebidoMes)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-500">Progresso da Meta</p>
                  <p className="text-sm font-medium text-gray-700">
                    {Math.round(progressoTicket * 100)}%
                  </p>
                </div>
                <Progress 
                  value={progressoTicket * 100} 
                  className={cn(
                    "h-3 rounded-full bg-gray-100",
                    getProgressColor(metaTicketBatida, passouDia15)
                  )}
                />
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {metaTicketBatida ? (
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="bg-amber-100 p-1 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {metaTicketBatida 
                        ? "Meta atingida! Vale alimentação garantido" 
                        : passouDia15 
                          ? "Meta não atingida no prazo" 
                          : "Meta em andamento"}
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
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Detalhes do Período
            </CardTitle>
            <CardDescription>
              Informações sobre o período de avaliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Dias Úteis até o dia 15
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 flex justify-center items-center">
                    <p className="text-3xl font-bold text-blue-700">{diasUteisAte15}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Status do Período
                  </p>
                  <div className={cn(
                    "rounded-lg p-4 flex justify-center items-center",
                    passouDia15 ? "bg-red-50" : "bg-amber-50"
                  )}>
                    <p className={cn(
                      "text-lg font-semibold",
                      passouDia15 ? "text-red-700" : "text-amber-700"
                    )}>
                      {passouDia15 ? "Período encerrado" : "Em andamento"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-500">Dia Atual</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date().getDate()}
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (new Date().getDate() / 30) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right">Dias do mês</p>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">
                      Meta: 80% de "A Receber" até dia 15 = {formataDinheiro(metaTicket)}
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
