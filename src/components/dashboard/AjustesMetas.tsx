
import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Building, AlertTriangle, Target, Pencil, CalendarIcon } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface CardItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isEditable?: boolean;
  onChange?: (value: number) => void;
  color?: string;
  isEditMode?: boolean;
  formatAsCurrency?: boolean;
  onEdit?: () => void;
}

const AjustesMetas = ({ 
  userData, 
  updateUserData, 
  diasSemExpediente, 
  updateDiasSemExpediente, 
  isLoading 
}: DashboardProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
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
    if (diasSemExpediente && diasSemExpediente.length > 0) {
      const formattedDates = diasSemExpediente.map(date => 
        new Date(date)
      );
      setSelectedDates(formattedDates);
    } else {
      setSelectedDates([]);
    }
  }, [diasSemExpediente]);

  useEffect(() => {
    const hoje = new Date();
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    let dias = 0;
    const currentDate = new Date(hoje);
    
    while (currentDate <= ultimoDiaMes) {
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      
      if (!isWeekend) {
        const isDiaSemExpediente = selectedDates.some(date => 
          date.getDate() === currentDate.getDate() &&
          date.getMonth() === currentDate.getMonth() &&
          date.getFullYear() === currentDate.getFullYear()
        );
        
        if (!isDiaSemExpediente) {
          dias++;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setDiasRestantesCalculados(dias);
  }, [selectedDates]);

  const CardItem = ({ 
    title, 
    value, 
    icon, 
    isEditable = false, 
    onChange, 
    color = "bg-blue-500",
    isEditMode = false,
    formatAsCurrency = true,
    onEdit,
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
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <div className="flex items-center gap-2">
              {isEditable && !isEditMode && onEdit && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={onEdit} 
                  className="h-7 w-7 rounded-full hover:bg-blue-50"
                >
                  <Pencil className="h-3.5 w-3.5 text-blue-500" />
                </Button>
              )}
              <span className={`p-2 rounded-full ${color} text-white`}>
                {icon}
              </span>
            </div>
          </div>
          
          {isEditable && isEditMode ? (
            formatAsCurrency ? (
              <CurrencyInput
                value={value}
                onValueChange={handleChange}
                className="text-lg font-bold mt-1"
              />
            ) : (
              <Input
                type="number"
                value={value}
                onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
                className="text-lg font-bold mt-1"
              />
            )
          ) : (
            <div className="text-xl font-bold">{formatValue(value)}</div>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleSave = () => {
    const updatedForm = {
      ...formState,
      dias_restantes: diasRestantesCalculados
    };
    
    const formattedDates = selectedDates.map(date => {
      const dateObj = new Date(date);
      return dateObj;
    });
    
    updateUserData(updatedForm);
    updateDiasSemExpediente(formattedDates);
    setIsEditing(false);
    setFormState(updatedForm);
    setCalendarOpen(false);
  };

  const handleCancel = () => {
    setSelectedDates(diasSemExpediente.map(date => new Date(date)));
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

  const handleItemEdit = () => {
    setIsEditing(true);
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
    <div className="space-y-6">
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
              Salvar
            </Button>
            <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            Editar
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-2 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-blue-500" />
              Calendário de Expediente
            </CardTitle>
            <CardDescription>
              Selecione os dias sem expediente para calcular os dias úteis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <Popover open={calendarOpen && isEditing} onOpenChange={(open) => isEditing && setCalendarOpen(open)}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full mb-4 flex justify-between items-center"
                    disabled={!isEditing}
                  >
                    <span>Selecionar dias sem expediente ({selectedDates.length})</span>
                    <CalendarIcon className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={setSelectedDates}
                    className="rounded-md border p-3 pointer-events-auto"
                    disabled={(date) => {
                      // Disable only past dates
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const compareDate = new Date(date);
                      compareDate.setHours(0, 0, 0, 0);
                      return compareDate < today;
                    }}
                    locale={ptBR}
                    classNames={{
                      day_selected: "bg-red-500 text-white hover:bg-red-600 focus:bg-red-600",
                    }}
                  />
                </PopoverContent>
              </Popover>
              
              <div className="mt-4 text-sm text-gray-600 w-full">
                <div className="flex justify-between items-center">
                  <span>Dias sem expediente:</span>
                  <span className="font-medium">{selectedDates.length}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Dias úteis restantes:</span>
                  <span className="font-medium text-blue-600">{diasRestantesCalculados}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <CardItem 
          title="Abertura de Vencido do Mês" 
          value={formState.abertura_vencido_mes} 
          icon={<Wallet size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('abertura_vencido_mes', value)}
          color="bg-purple-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        
        <CardItem 
          title="Abertura do Dia" 
          value={formState.abertura_dia} 
          icon={<Building size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('abertura_dia', value)}
          color="bg-indigo-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        
        <CardItem 
          title="Meta do Mês" 
          value={formState.meta_mes} 
          icon={<Target size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('meta_mes', value)}
          color="bg-blue-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        
        <CardItem 
          title="Vencido Atual" 
          value={formState.vencido_atual} 
          icon={<AlertTriangle size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('vencido_atual', value)}
          color="bg-yellow-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        
        <CardItem 
          title="Meta Desafio" 
          value={formState.meta_desafio} 
          icon={<Target size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('meta_desafio', value)}
          color="bg-green-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        
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
