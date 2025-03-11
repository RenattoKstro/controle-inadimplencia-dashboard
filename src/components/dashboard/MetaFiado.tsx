
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
  Building 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

const MetaFiado = ({ userData, updateUserData, isLoading }: DashboardProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formState, setFormState] = useState({
    abertura_vencido_mes: userData.abertura_vencido_mes,
    abertura_dia: userData.abertura_dia,
    meta_mes: userData.meta_mes,
    vencido_atual: userData.vencido_atual,
    dias_restantes: userData.dias_restantes
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
      dias_restantes: userData.dias_restantes
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
          {[...Array(9)].map((_, i) => (
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Cards Editáveis */}
        <CardItem 
          title="Abertura de Vencido do Mês" 
          value={formState.abertura_vencido_mes} 
          icon={<Calendar size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('abertura_vencido_mes', value)}
          color="bg-purple-500"
          isEditMode={isEditMode}
        />
        
        <CardItem 
          title="Abertura do Dia" 
          value={formState.abertura_dia} 
          icon={<Building size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('abertura_dia', value)}
          color="bg-indigo-500"
          isEditMode={isEditMode}
        />
        
        <CardItem 
          title="Meta do Mês" 
          value={formState.meta_mes} 
          icon={<Wallet size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('meta_mes', value)}
          color="bg-blue-500"
          isEditMode={isEditMode}
        />
        
        <CardItem 
          title="Vencido Atual" 
          value={formState.vencido_atual} 
          icon={<AlertTriangle size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('vencido_atual', value)}
          color="bg-yellow-500"
          isEditMode={isEditMode}
        />
        
        <CardItem 
          title="Dias Restantes" 
          value={formState.dias_restantes} 
          icon={<Calendar size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('dias_restantes', value)}
          color="bg-gray-500"
          isEditMode={isEditMode}
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
