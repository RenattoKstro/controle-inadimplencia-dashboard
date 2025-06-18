// src/components/dashboard/RecebimentosMensais.tsx
import { useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const RecebimentosMensais = ({
  userData,
  updateUserData,
  isLoading,
}: DashboardProps) => {
  useEffect(() => {
    const calculateMonthlyTotals = () => {
      const monthlyTotals: { [key: string]: number } = {};
      userData.dailyReceipts.forEach((receipt: { date: string; amount: number }) => {
        const monthKey = receipt.date.split("-").slice(0, 2).join("-"); // e.g., "2025-06"
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + receipt.amount;
      });

      if (Object.keys(monthlyTotals).length > 0) {
        updateUserData({ monthlyReceipts: monthlyTotals });
      }
    };

    calculateMonthlyTotals();
  }, [userData.dailyReceipts, updateUserData]);

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
          <CardTitle>Recebimentos Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Totais Mensais</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Mês</th>
                    <th className="p-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(userData.monthlyReceipts || {}).map(([month, total]: [string, number], index: number) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{new Date(month + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</td>
                      <td className="p-2">R${total.toFixed(2)}</td>
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

export default RecebimentosMensais;
