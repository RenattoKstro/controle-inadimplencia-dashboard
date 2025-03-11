
import { useState } from "react";
import { DashboardProps } from "../DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarioInicial = ({ 
  diasSemExpediente, 
  updateDiasSemExpediente, 
  isLoading 
}: DashboardProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>(diasSemExpediente || []);
  const [isEditing, setIsEditing] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDates(prev => {
      // Verificar se a data já está selecionada
      const isAlreadySelected = prev.some(
        d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      // Se já estiver selecionada, remover da lista
      if (isAlreadySelected) {
        return prev.filter(
          d => format(d, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')
        );
      }
      
      // Se não estiver selecionada, adicionar à lista
      return [...prev, date];
    });
  };

  const handleSave = () => {
    updateDiasSemExpediente(selectedDates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedDates(diasSemExpediente);
    setIsEditing(false);
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
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Calendário Inicial</CardTitle>
        <CardDescription>
          Selecione os dias sem expediente para calcular os dias úteis para as metas
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="mb-4">
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="default" onClick={handleSave}>Salvar</Button>
              <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Editar Dias Sem Expediente
            </Button>
          )}
        </div>
        
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={isEditing ? handleSelect : undefined}
          className="rounded-md border"
          disabled={!isEditing}
          locale={ptBR}
          classNames={{
            day_selected: "bg-red-500 text-white hover:bg-red-600 focus:bg-red-600",
          }}
        />
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Dias sem expediente selecionados: {selectedDates.length}</p>
          <p>
            {selectedDates.length > 0 
              ? selectedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .map(date => format(date, 'dd/MM/yyyy'))
                .join(', ')
              : 'Nenhum dia selecionado'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarioInicial;
