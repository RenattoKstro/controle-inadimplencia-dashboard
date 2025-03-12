import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

// Função para calcular o valor por dia (usando dias úteis)
const calcularValorPorDia = (valorRestante: number, diasRestantes: number): number => {
  return diasRestantes > 0 ? valorRestante / diasRestantes : 0;
};

// Função para determinar a cor da barra com base no progresso
const getProgressColor = (progressoPercentual: number): string => {
  if (progressoPercentual <= 50) {
    // Vermelho para 0% a 50%
    return 'linear-gradient(to right, #ff4d4d, #ff6666)';
  } else if (progressoPercentual <= 90) {
    // Amarelo para 51% a 90%
    return 'linear-gradient(to right, #ffeb3b, #ffcc00)';
  } else {
    // Verde para 91% a 100%
    return 'linear-gradient(to right, #4caf50, #66bb6a)';
  }
};

const MetaDesafio = ({ userData, updateUserData, isLoading, diasRestantesCalculados, diasSemExpediente }: DashboardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [metaDesafio, setMetaDesafio] = useState(userData.meta_desafio);

  // Cálculos corrigidos
  const aberturaInicial = userData.abertura_vencido_mes || userData.vencido_atual; // Usar abertura_vencido_mes como referência inicial
  const progresso = aberturaInicial > userData.meta_desafio 
    ? Math.min(1, (aberturaInicial - userData.vencido_atual) / (aberturaInicial - userData.meta_desafio)) 
    : 0;
  const progressoPercentual = progresso * 100;

  // Calcular valor restante (quanto o Vencido Atual precisa descer)
  const valorRestante = Math.max(0, userData.vencido_atual - userData.meta_desafio);

  // Calcular valor por dia usando dias úteis restantes
  const valorPorDia = calcularValorPorDia(valorRestante, diasRestantesCalculados || 0);

  const handleSave = () => {
    updateUserData({ meta_desafio: metaDesafio });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMetaDesafio(userData.meta_desafio);
    setIsEditing(false);
  };

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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-500" /> Meta Desafio
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso para reduzir o Vencido Atual até a Meta Desafio
            </CardDescription>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="default" onClick={handleSave}>Salvar</Button>
              <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Editar Meta
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-medium">Meta Desafio</div>
          {isEditing ? (
            <Input
              value={metaDesafio}
              onChange={(e) => setMetaDesafio(parseFloat(e.target.value) || 0)}
              className="font-bold text-lg"
            />
          ) : (
            <div className="text-2xl font-bold">{formatCurrency(userData.meta_desafio)}</div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm font-medium">{formatPercentage(progresso)}</span>
          </div>
          <div 
            className="w-full bg-white rounded-full h-6 shadow-inner"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div 
              className="h-full rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${progressoPercentual}%`,
                background: getProgressColor(progressoPercentual),
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
        </div>

        {/* Nova seção para Valor Restante e Valor por Dia */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Valor Restante</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(valorRestante)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Por Dia até Fim do Mês</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(valorPorDia)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaDesafio;
