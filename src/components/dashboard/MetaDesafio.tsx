import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Trophy, Target, Calculator } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "../../lib/utils";

const formatCurrency = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) return "0,00%";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

const calcularValorPorDia = (valorRestante: number, diasRestantes: number): number => {
  if (typeof diasRestantes !== "number" || diasRestantes <= 0) return 0;
  if (typeof valorRestante !== "number" || isNaN(valorRestante)) return 0;
  const valor = Math.max(0, valorRestante / diasRestantes);
  console.log(`[MetaDesafio] Calculando valorPorDia: valorRestante=${valorRestante}, diasRestantes=${diasRestantes}, valorPorDia=${valor}`);
  return valor;
};

const calcularProgressoDiario = (recebidoHoje: number, valorPorDia: number): number => {
  if (typeof valorPorDia !== "number" || valorPorDia <= 0) {
    console.log(`[MetaDesafio] Erro: valorPorDia inválido (${valorPorDia}), progresso=0%`);
    return 0;
  }
  if (typeof recebidoHoje !== "number" || isNaN(recebidoHoje)) {
    console.warn(`[MetaDesafio] Aviso: recebidoHoje inválido (${recebidoHoje}), usando 0, progresso=0%`);
    return 0;
  }
  const progresso = (recebidoHoje / valorPorDia) * 100;
  console.log(`[MetaDesafio] Calculando progressoDiario: recebidoHoje=${recebidoHoje}, valorPorDia=${valorPorDia}, progresso=${progresso}%`);
  return progresso;
};

const MetaDesafio = ({
  userData,
  updateUserData,
  isLoading,
  diasRestantesCalculados,
  onMetaDataUpdate,
}: DashboardProps & { recebidoHoje?: number }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [metaDesafio, setMetaDesafio] = useState(userData?.meta_desafio || 0);
  const isMobile = useIsMobile();
  const [diasRestantes, setDiasRestantes] = useState(userData?.dias_restantes || diasRestantesCalculados || 1);

  useEffect(() => {
    if (userData?.dias_restantes !== undefined) {
      setDiasRestantes(userData.dias_restantes);
    }
    console.log(`[MetaDesafio] useEffect: diasRestantes atualizado para ${diasRestantes}`);
  }, [userData?.dias_restantes]);

  if (!userData) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Meta Desafio
          </CardTitle>
          <CardDescription>Erro: Dados do usuário não disponíveis.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const vencidoAtual = Number(userData?.vencido_atual) || 0;
  const metaDesafioValor = Number(userData?.meta_desafio) || 0;

  let progresso = 0;
  if (metaDesafioValor > 0 && vencidoAtual > 0) {
    progresso = (metaDesafioValor / vencidoAtual) * 100;
    console.log(`[MetaDesafio] Meta Desafio - Vencido Atual: ${vencidoAtual}, Meta: ${metaDesafioValor}, Progresso Calculado (antes de arredondar): ${progresso}`);
    progresso = Number(progresso.toFixed(2));
    console.log(`[MetaDesafio] Meta Desafio - Progresso Calculado (após arredondar): ${progresso}%`);
  }

  const progressoPercentual = Math.max(0, Math.min(100, progresso));
  const valorRestante = Math.max(0, vencidoAtual - metaDesafioValor);
  const valorPorDia = calcularValorPorDia(valorRestante, diasRestantes);
  const progressoDiario = calcularProgressoDiario(0, valorPorDia); // Usando 0 como recebidoHoje por agora

  const percentuaisAlvo = [96, 98, 100];
  const valoresRestantes = percentuaisAlvo.map((percentual) => {
    const vencidoNecessario = metaDesafioValor / (percentual / 100);
    let diferenca = vencidoAtual - vencidoNecessario;
    const atingido = progresso >= percentual;
    diferenca = atingido ? Math.abs(diferenca) : -Math.abs(diferenca);
    return { percentual, diferenca, atingido };
  });

  const handleSave = () => {
    updateUserData({ meta_desafio: metaDesafio });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMetaDesafio(userData?.meta_desafio || 0);
    setIsEditing(false);
  };

  useEffect(() => {
    if (onMetaDataUpdate) {
      onMetaDataUpdate({
        title: "Meta Desafio",
        data: [
          { item: "Meta Desafio", value: formatCurrency(metaDesafioValor) },
          { item: "Vencido Atual", value: formatCurrency(vencidoAtual) },
          { item: "Progresso", value: `${progresso}%` },
          { item: "Valor Restante", value: formatCurrency(valorRestante) },
          { item: "Receber por Dia", value: formatCurrency(valorPorDia) },
          { item: "Progresso Diário", value: `${progressoDiario.toFixed(2)}%` },
          { item: "Dias Restantes", value: diasRestantes.toString() },
        ],
      });
    }
  }, [metaDesafioValor, vencidoAtual, valorRestante, valorPorDia, progressoDiario, diasRestantes, onMetaDataUpdate]);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-60" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              Meta Desafio
            </CardTitle>
            <CardDescription>Acompanha seu progresso</CardDescription>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="default" size={isMobile ? "sm" : "default"} onClick={handleSave}>Salvar</Button>
              <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={handleCancel}>Cancelar</Button>
            </div>
          ) : (
            <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setIsEditing(true)}>Editar Meta</Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-medium">Meta Desafio</div>
          {isEditing ? (
            <Input value={metaDesafio} onChange={(e) => setMetaDesafio(parseFloat(e.target.value) || 0)} className="font-bold text-lg" />
          ) : (
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(userData.meta_desafio)}</div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm font-medium">{formatPercentage(progresso)}</span>
          </div>
          <div className="w-full bg-white rounded-full h-4 md:h-6 shadow-inner" style={{ backgroundColor: "#ffffff", boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)" }}>
            <div className="h-full rounded-full transition-all duration-500 ease-in-out" style={{ width: `${progressoPercentual}%`, background: "linear-gradient(to right, #ff4d4d 0%, #ff6666 25%, #ffeb3b 50%, #ffcc00 75%, #4caf50 100%)", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }} />
          </div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            {valoresRestantes.map(({ percentual, diferenca, atingido }, index) => (
              <div key={percentual} className="flex items-center gap-2">
                <div className={cn("text-sm md:text-base font-medium", atingido ? "text-green-600" : "text-red-600")}>
                  {percentual}%: {formatCurrency(diferenca)}
                </div>
                {index < valoresRestantes.length - 1 && <span className="text-gray-400">|</span>}
              </div>
            ))}
          </div>
        </div>
        <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-3 gap-4"}`}>
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <h3 className="text-sm font-medium text-gray-600">Valor Restante</h3>
                <span className="p-1.5 md:p-2 rounded-full bg-gray-500 text-white"><Target size={isMobile ? 14 : 16} /></span>
              </div>
              <div className="text-lg md:text-xl font-bold">{formatCurrency(valorRestante)}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <h3 className="text-sm font-medium text-gray-600">Receber por Dia</h3>
                <span className="p-1.5 md:p-2 rounded-full bg-orange-500 text-white"><Calculator size={isMobile ? 14 : 16} /></span>
              </div>
              <div className="text-lg md:text-xl font-bold">{formatCurrency(valorPorDia)}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow transition-shadow duration-200">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <h3 className="text-sm font-medium text-gray-600">Dias Restantes</h3>
                <span className="p-1.5 md:p-2 rounded-full bg-gray-500 text-white"><Target size={isMobile ? 14 : 16} /></span>
              </div>
              <div className="text-lg md:text-xl font-bold">{diasRestantes}</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaDesafio;
