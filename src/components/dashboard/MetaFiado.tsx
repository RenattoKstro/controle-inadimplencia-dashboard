
import { useState } from "react";
import { DashboardProps } from "../DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Calculator, 
  Calendar, 
  Wallet, 
  AlertTriangle, 
  ArrowDown, 
  Check, 
  Building,
  Target
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CardItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isEditable?: boolean;
  onChange?: (value: number) => void;
  color?: string;
  isEditMode?: boolean;
  showProgress?: boolean;
  progressValue?: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
};

const CardItem = ({ 
  title, 
  value, 
  icon, 
  isEditable = false, 
  onChange, 
  color = "bg-blue-500",
  isEditMode = false,
  showProgress = false,
  progressValue = 0
}: CardItemProps) => {
  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <span className={`p-2 rounded-full ${color} text-white`}>
            {icon}
          </span>
        </div>
        
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
        
        {showProgress && (
          <div className="mt-3 space-y-1">
            <Progress 
              value={progressValue} 
              className="h-2 rounded-full bg-gray-100"
            />
            <div className="text-xs text-right text-gray-500">
              {progressValue.toFixed(2)}% do objetivo diário
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProgressCard = ({ title, current, target, icon, userData }) => {
  const percentageComplete = (() => {
    if (current <= target) return 100; // Already achieved target
    
    const totalReduction = userData.abertura_vencido_mes - target;
    const actualReduction = userData.abertura_vencido_mes - current;
    
    if (totalReduction <= 0) return 0;
    return Math.min(100, Math.max(0, (actualReduction / totalReduction) * 100));
  })();

  const isComplete = current <= target;
  
  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200 col-span-1 md:col-span-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="text-sm font-medium">
            {percentageComplete.toFixed(2)}% concluído
          </div>
        </div>
        <CardDescription>
          Meta: {formatCurrency(target)} | Atual: {formatCurrency(current)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress 
            value={percentageComplete} 
            className={cn(
              "h-3 rounded-full",
              isComplete ? "bg-gray-100" : "bg-gray-100",
            )}
          />
          <div className="flex justify-end">
            <div className="flex items-center gap-1 text-sm">
              {isComplete ? (
                <>
                  <span className="text-green-600 font-medium">Meta atingida!</span>
                  <Check className="h-4 w-4 text-green-600" />
                </>
              ) : (
                <span className="text-blue-600 font-medium">
                  Faltam {formatCurrency(current - target)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetaFiado = ({ userData, isLoading }: DashboardProps) => {
  const aReceber = userData.abertura_vencido_mes - userData.meta_mes;
  const faltaReceberMes = userData.vencido_atual - userData.meta_mes;
  const recebidoMes = userData.abertura_vencido_mes - userData.vencido_atual;
  const recebidoHoje = userData.abertura_dia - userData.vencido_atual;
  
  const receberPorDia = userData.dias_restantes > 0 
    ? faltaReceberMes / userData.dias_restantes 
    : 0;
  
  const progressoDiario = receberPorDia > 0
    ? Math.min(100, (recebidoHoje / receberPorDia) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-6">
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
        <h2 className="text-2xl font-bold">Meta Fiado</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          value={recebidoMes} 
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
      </div>
    </div>
  );
};

export default MetaFiado;
