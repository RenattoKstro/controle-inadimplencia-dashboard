// src/components/dashboard/RecebimentosAnteriores.tsx
import { useUserData } from "@/hooks/useUserData";

const RecebimentosAnteriores = () => {
  const { userData, getPreviousMonthComparison } = useUserData();
  const { currentTotal, prevTotal, difference, percentageChange } = getPreviousMonthComparison();
  const currentMonth = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });
  const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Recebimentos Anteriores</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-700">{currentMonth}</h3>
          <p className="text-2xl font-bold text-green-600">
            R${currentTotal.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-700">{prevMonth}</h3>
          <p className="text-2xl font-bold text-blue-600">
            R${prevTotal.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-700">Diferença</h3>
        <p className="text-xl font-bold text-gray-900">
          {difference > 0 ? "+" : ""}
          R${difference.toFixed(2)} ({percentageChange.toFixed(2)}%)
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left text-gray-600">Data</th>
              <th className="p-2 text-left text-gray-600">Valor</th>
            </tr>
          </thead>
          <tbody>
            {userData.dailyReceipts.map((receipt, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{new Date(receipt.date).toLocaleDateString("pt-BR")}</td>
                <td className="p-2">R${receipt.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecebimentosAnteriores;
