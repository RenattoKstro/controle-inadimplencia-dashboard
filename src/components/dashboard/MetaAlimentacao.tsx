
import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { Utensils, AlertTriangle, Calendar, Calculator } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Função para verificar se a data atual é depois do dia 15 do mês corrente
const isPastDay15 = () => {
  const today = new Date();
  return today.getDate() > 15;
};

// Função para calcular dias úteis até o dia 15
const calcularDiasUteisAte15 = (diasSemExpediente: Date[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Se já passamos do dia 15, retorna 0
  if (today.getDate() > 15) return 0;
  
  const ultimoDia = new Date(today.getFullYear(), today.getMonth(), 15);
  ultimoDia.setHours(0, 0, 0, 0);
  
  let diasUteis = 0;
  const currentDate = new Date(today);
  
  while (currentDate <= ultimoDia) {
    const diaSemana = currentDate.getDay();
    const isWeekend = diaSemana === 0 || diaSemana === 6;
    const isFeriado = diasSemExpediente.some(
      d => d.getDate() === currentDate.getDate() && 
           d.getMonth() === currentDate.getMonth() && 
           d.getFullYear() === currentDate.getFullYear()
    );
    
    if (!isWeekend && !isFeriado) {
      diasUteis++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return diasUteis;
};

const MetaAlimentacao = ({ userData, diasSemExpediente, isLoading }: DashboardProps) => {
  const [diasUteisAte15, setDiasUteisAte15] = useState(0);
  const [metaBatida, setMetaBatida] = useState(false);
  
  useEffect(() => {
    // Calcular dias úteis até o dia 15
    setDiasUteisAte15(calcularDiasUteisAte15(diasSemExpediente));
    
    // Verificar se a meta foi batida
    const metaAlimentacao = userData.meta_mes * 0.8;
    const recebidoMes = userData.abertura_vencido_mes - userData.vencido_atual;
    setMetaBatida(recebidoMes >= metaAlimentacao);
  }, [userData, diasSemExpediente]);
  
  // Cálculos da meta de alimentação
  const metaAlimentacao = userData.meta_mes * 0.8;
  const recebidoMes = userData.abertura_vencido_mes - userData.vencido_atual;
  const progresso = metaAlimentacao > 0 ? recebidoMes / metaAlimentacao : 0;
  const valorNecessario = Math.max(0, metaAlimentacao - recebidoMes);
  const valorPorDia = diasUteisAte15 > 0 ? valorNecessario / diasUteisAte15 : 0;
  
  // Verificar se já passou do dia 15
  const passouDia15 = isPastDay15();
  
  // Status da meta
  const statusMeta = passouDia15 && !metaBatida 
    ? "Meta Não Batida" 
    : metaBatida 
      ? "Meta Batida!" 
      : "Meta em Andamento";

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-16 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Utensils className="text-green-500" /> Meta Vale Alimentação
        </CardTitle>
        <CardDescription>
          O objetivo é atingir 80% da meta até o dia 15 do mês
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-gray-50 p-4 border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Status da Meta</span>
            <div className={`flex items-center gap-1 ${
              metaBatida ? "text-green-600" : 
              passouDia15 && !metaBatida ? "text-red-600" : "text-yellow-600"
            }`}>
              {metaBatida ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">✅ Meta Batida!</span>
                </div>
              ) : passouDia15 && !metaBatida ? (
                <div className="flex items-center gap-1">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-bold">🚫 Meta Não Batida</span>
                </div>
              ) : (
                <span className="text-sm font-bold">⏳ Meta em Andamento</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progresso</span>
              <span>{formatPercentage(progresso)}</span>
            </div>
            <Progress 
              value={progresso * 100} 
              className="h-2" 
              indicatorClassName={
                metaBatida ? "bg-green-500" : 
                passouDia15 && !metaBatida ? "bg-red-500" : "bg-yellow-500"
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calculator className="h-4 w-4 text-blue-500" />
              <span>Valor necessário para bater a meta (80%)</span>
            </div>
            <div className="text-xl font-bold">{formatCurrency(metaAlimentacao)}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>Dias úteis restantes até o dia 15</span>
            </div>
            <div className="text-xl font-bold">{diasUteisAte15}</div>
          </div>

          {!passouDia15 && !metaBatida && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calculator className="h-4 w-4 text-blue-500" />
                <span>Valor necessário por dia até o dia 15</span>
              </div>
              <div className="text-xl font-bold">{formatCurrency(valorPorDia)}</div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="w-full p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Regras:</strong> Se atingir 80% da meta ({formatCurrency(metaAlimentacao)}) até o dia 15, você ganha o vale alimentação de R$ 100,00.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MetaAlimentacao;
