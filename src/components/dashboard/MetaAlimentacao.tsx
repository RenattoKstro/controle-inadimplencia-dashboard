// src/components/dashboard/MetaAlimentacao.tsx
import { useState } from "react";
import { DashboardProps } from "../DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Utensils } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "@/components/ui/button";

const formataDinheiro = (valor: number | null): string => {
  if (valor === null) return "R$ 0,00";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const MetaAlimentacao = ({
  userData,
  updateUserData,
  diasSemExpediente,
  updateDiasSemExpediente,
  diasRestantesCalculados,
  isLoading,
}: DashboardProps) => {
  const { addDailyReceipt } = useUserData();
  const [newAmount, setNewAmount] = useState(0);
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-700">Adicionar Recebimento Diário</h3>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            placeholder="Valor (R$)"
            className="p-2 border rounded"
            value={newAmount || ""}
            onChange={(e) => setNewAmount(Number(e.target.value) || 0)}
            min="0"
          />
          <Button
            onClick={() => {
              if (newAmount > 0) {
                addDailyReceipt(new Date().toISOString().split("T")[0], newAmount);
                setNewAmount(0);
              }
            }}
            disabled={isLoading || newAmount <= 0}
          >
            Salvar
          </Button>
        </div>
      </div>
      <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
        <Utensils className="h-5 w-5 text-green-500" />
        Meta de Ticket
      </h2>
      <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Utensils className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
            Informações da Meta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 md:space-y-6">
            <p className="text-sm md:text-base text-gray-600">
              Use a seção acima para registrar os recebimentos diários. Os totais mensais e comparações estão disponíveis na aba "Recebimentos Anteriores".
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaAlimentacao;
