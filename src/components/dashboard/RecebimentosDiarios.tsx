// src/components/dashboard/RecebimentosDiarios.tsx
import { useState } from "react";
import { DashboardProps } from "../DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecebimentosDiariosProps extends DashboardProps {
  addDailyReceipt: (date: string, amount: number) => void;
}

const RecebimentosDiarios = ({
  userData,
  updateUserData,
  addDailyReceipt,
  isLoading,
}: RecebimentosDiariosProps) => {
  const [newAmount, setNewAmount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date("2025-06-18T18:26:00-03:00")); // Atualizado para o horário atual
  const today = new Date("2025-06-18T18:26:00-03:00");

  const handleAddReceipt = () => {
    if (newAmount > 0 && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      addDailyReceipt(dateStr, newAmount);
      setNewAmount(0);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Adicionar Recebimento Diário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                min={format(today, "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Valor (R$)"
                value={newAmount || ""}
                onChange={(e) => setNewAmount(Number(e.target.value) || 0)}
                min="0"
                className="p-2 border rounded"
              />
              <Button onClick={handleAddReceipt} disabled={isLoading || newAmount <= 0}>
                Salvar
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Recebimentos Diários</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {(userData.dailyreceipts || []).map((receipt: { date: string; amount: number }, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{new Date(receipt.date).toLocaleDateString("pt-BR")}</td>
                      <td className="p-2">R${receipt.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecebimentosDiarios;
