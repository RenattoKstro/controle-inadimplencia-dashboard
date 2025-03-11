
import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, differenceInBusinessDays, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Building, AlertTriangle, Target } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";

interface CardItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isEditable?: boolean;
  onChange?: (value: number) => void;
  color?: string;
  isEditMode?: boolean;
  formatAsCurrency?: boolean;
}

const AjustesMetas = ({ 
  userData, 
  updateUserData, 
  diasSemExpediente, 
  updateDiasSemExpediente, 
  isLoading 
}: DashboardProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>(diasSemExpediente || []);
  const [isEditing, setIsEditing] = useState(false);
  const [diasRestantesCalculados, setDiasRestantesCalculados] = useState(0);
  const [formState, setFormState] = useState({
    abertura_vencido_mes: userData.abertura_vencido_mes || 0,
    abertura_dia: userData.abertura_dia || 0,
    meta_mes: userData.meta_mes || 0,
    vencido_atual: userData.vencido_atual || 0,
    dias_restantes: userData.dias_restantes || 0,
    meta_desafio: userData.meta_desafio || 0,
  });

  useEffect(() => {
    // Calcula dias úteis restantes no mês
    const hoje = new Date();
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    // Calcular dias úteis entre hoje e o fim do mês, excluindo finais de semana e dias sem expediente
    let dias = 0;
    const dataAtual = new Date(hoje);
    
    while (dataAtual <= ultimoDiaMes) {
      if (!isWeekend(dataAtual)) {
        // Verifica se não é um dia sem expediente
        const isDiaSemExpediente = diasSemExpediente.some(
          (d) => 
            d.getDate() === dataAtual.getDate() &&
            d.getMonth() === dataAtual.getMonth() &&
            d.getFullYear() === dataAtual.getFullYear()
        );
        
        if (!isDiaSemExpediente) {
          dias++;
        }
      }
      
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    setDiasRestantesCalculados(dias);
  }, [diasSemExpediente]);

  const CardItem = ({ 
    title, 
    value, 
    icon, 
    isEditable = false, 
    onChange, 
    color = "bg-blue-500",
    isEditMode = false,
    formatAsCurrency = true,
  }: CardItemProps) => {
    const formatValue = (value: number): string => {
      if (formatAsCurrency) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
        }).format(value);
      }
      return value.toString();
    };

    const handleChange = (value: number) => {
      onChange && onChange(value);
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
            formatAsCurrency ? (
              <CurrencyInput
                value={value}
                onValueChange={handleChange}
                className="text-xl font-bold mt-1"
              />
            ) : (
              <Input
                type="number"
                value={value}
                onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
                className="text-xl font-bold mt-1"
              />
            )
          ) : (
            <div className="text-2xl font-bold">{formatValue(value)}</div>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleSave = () => {
    // Atualiza formState com o valor calculado de dias_restantes
    const updatedForm = {
      ...formState,
      dias_restantes: diasRestantesCalculados
    };
    
    updateUserData(updatedForm);
    updateDiasSemExpediente(selectedDates);
    setIsEditing(false);
    setFormState(updatedForm);
  };

  const handleCancel = () => {
    setSelectedDates(diasSemExpediente);
    setFormState({
      abertura_vencido_mes: userData.abertura_vencido_mes || 0,
      abertura_dia: userData.abertura_dia || 0,
      meta_mes: userData.meta_mes || 0,
      vencido_atual: userData.vencido_atual || 0,
      dias_restantes: userData.dias_restantes || 0,
      meta_desafio: userData.meta_desafio || 0,
    });
    setIsEditing(false);
  };

  const handleChange = (field: string, value: number) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Skeleton className="h-[300px] w-full max-w-[350px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Ajustes de Metas
        </h2>
        {isEditing ? (
          <div className="flex gap-2">
            <Button 
              variant="default" 
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Salvar Alterações
            </Button>
            <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            Editar Valores
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 xl:col-span-1 shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-blue-500" />
              Calendário de Expediente
            </CardTitle>
            <CardDescription>
              Selecione os dias sem expediente para calcular os dias úteis
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={isEditing ? setSelectedDates : undefined}
              className="rounded-md border"
              disabled={!isEditing}
              locale={ptBR}
              classNames={{
                day_selected: "bg-red-500 text-white hover:bg-red-600 focus:bg-red-600",
              }}
            />
            
            <div className="mt-6 text-sm text-gray-600 w-full">
              <div className="flex justify-between items-center">
                <span>Dias sem expediente:</span>
                <span className="font-medium">{selectedDates.length}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Dias úteis restantes:</span>
                <span className="font-medium text-blue-600">{diasRestantesCalculados}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Card Abertura Vencido Mês */}
        <CardItem 
          title="Abertura de Vencido do Mês" 
          value={formState.abertura_vencido_mes} 
          icon={<Wallet size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('abertura_vencido_mes', value)}
          color="bg-purple-500"
          isEditMode={isEditing}
        />
        
        {/* Card Abertura do Dia */}
        <CardItem 
          title="Abertura do Dia" 
          value={formState.abertura_dia} 
          icon={<Building size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('abertura_dia', value)}
          color="bg-indigo-500"
          isEditMode={isEditing}
        />
        
        {/* Card Meta do Mês */}
        <CardItem 
          title="Meta do Mês" 
          value={formState.meta_mes} 
          icon={<Target size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('meta_mes', value)}
          color="bg-blue-500"
          isEditMode={isEditing}
        />
        
        {/* Card Vencido Atual */}
        <CardItem 
          title="Vencido Atual" 
          value={formState.vencido_atual} 
          icon={<AlertTriangle size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('vencido_atual', value)}
          color="bg-yellow-500"
          isEditMode={isEditing}
        />
        
        {/* Card Meta Desafio */}
        <CardItem 
          title="Meta Desafio" 
          value={formState.meta_desafio} 
          icon={<Target size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('meta_desafio', value)}
          color="bg-green-500"
          isEditMode={isEditing}
        />
        
        {/* Card Dias Restantes (readonly) */}
        <CardItem 
          title="Dias Restantes (Calculado)" 
          value={diasRestantesCalculados} 
          icon={<Target size={16} />}
          color="bg-gray-500"
          formatAsCurrency={false}
        />
      </div>
    </div>
  );
};

export default AjustesMetas;
