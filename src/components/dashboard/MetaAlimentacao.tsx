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
}: DashboardProps) => {
  const [diasUteisAte15, setDiasUteisAte15] = useState(0);
  const [metaBatida, setMetaBatida] = useState(false);
  
  useEffect(() => {
    // Calcula os dias úteis até o dia 15 do mês atual
    const dias = calcularDiasUteisAte15(diasSemExpediente);
    setDiasUteisAte15(dias);

    // Verifica se a meta foi batida
    if (userData.abertura_vencido_mes !== null && userData.meta_mes !== null) {
      setMetaBatida(userData.abertura_vencido_mes >= userData.meta_mes);
    }
  }, [userData, diasSemExpediente]);

  const passouDia15 = isPastDay15();
  const progresso = userData.meta_mes
    ? Math.min(1, (userData.abertura_vencido_mes || 0) / userData.meta_mes)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta de Alimentação</CardTitle>
        <CardDescription>
          Acompanhe o progresso da sua meta mensal.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium leading-none">
                Abertura Vencido Mês
              </p>
              <p className="text-2xl font-bold">
                {formataDinheiro(userData.abertura_vencido_mes)}
              </p>
            </div>
            <div className="grid gap-2">
              <p className="text-sm font-medium leading-none">Meta Mensal</p>
              <p className="text-2xl font-bold">
                {formataDinheiro(userData.meta_mes)}
              </p>
            </div>
            <div className="grid gap-2">
              <p className="text-sm font-medium leading-none">
                Dias Úteis até o dia 15
              </p>
              <p className="text-2xl font-bold">{diasUteisAte15}</p>
            </div>
            <Progress 
              value={progresso * 100} 
              className={cn(
                "h-2",
                metaBatida ? "bg-green-500" : 
                passouDia15 && !metaBatida ? "bg-red-500" : "bg-yellow-500"
              )}
            />
          </div>
        </CardContent>
    </Card>
  );
};

export default MetaAlimentacao;
