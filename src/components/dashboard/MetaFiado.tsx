
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  isEditMode = false
}: CardItemProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleBlur = () => {
    const numericValue = parseFloat(inputValue.replace(/[^\d.-]/g, ''));
    if (!isNaN(numericValue)) {
      onChange && onChange(numericValue);
    } else {
      setInputValue(value.toString());
    }
  };

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <span className={`p-2 rounded-full ${color} text-white`}>
            {icon}
          </span>
        </div>
        
        {isEditable && isEditMode ? (
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="text-xl font-bold mt-1"
          />
        ) : (
          <div className="text-2xl font-bold">{formatCurrency(value)}</div>
        )}
      </CardContent>
    </Card>
  );
};

const ProgressCard = ({ title, current, target, icon, color = "bg-blue-500" }) => {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const isComplete = current >= target;

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200 col-span-1 md:col-span-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="text-sm font-medium">
            {percentage}% concluído
          </div>
        </div>
        <CardDescription>
          Meta: {formatCurrency(target)} | Realizado: {formatCurrency(current)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress 
            value={percentage} 
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
                  Faltam {formatCurrency(target - current)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetaFiado = ({ userData, updateUserData, isLoading }: DashboardProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formState, setFormState] = useState({
    abertura_vencido_mes: userData.abertura_vencido_mes,
    abertura_dia: userData.abertura_dia,
    meta_mes: userData.meta_mes,
    vencido_atual: userData.vencido_atual,
  });

  // Calculado automaticamente
  const aReceber = userData.abertura_vencido_mes - userData.meta_mes;
  const faltaReceberMes = userData.vencido_atual - userData.meta_mes;
  const recebidoMes = userData.abertura_vencido_mes - userData.vencido_atual;
  const recebidoHoje = userData.abertura_dia - userData.vencido_atual;
  const recebimentoPorDia = userData.dias_restantes > 0 
    ? faltaReceberMes / userData.dias_restantes 
    : 0;

  const handleChange = (field: string, value: number) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    updateUserData(formState);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setFormState({
      abertura_vencido_mes: userData.abertura_vencido_mes,
      abertura_dia: userData.abertura_dia,
      meta_mes: userData.meta_mes,
      vencido_atual: userData.vencido_atual,
    });
    setIsEditMode(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-10 w-28" />
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
        {isEditMode ? (
          <div className="flex gap-2">
            <Button variant="default" onClick={handleSave}>Salvar</Button>
            <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsEditMode(true)}>
            Editar Valores
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <ProgressCard 
          title="Progresso da Meta Mensal" 
          current={recebidoMes}
          target={userData.meta_mes}
          icon={<Target className="h-5 w-5 text-blue-600" />}
        />
        
        {/* Cards Não Editáveis (Calculados) */}
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
          title="Recebimento por Dia" 
          value={recebimentoPorDia} 
          icon={<Calculator size={16} />} 
          color="bg-orange-500"
        />
      </div>
    </div>
  );
};

export default MetaFiado;
