import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CalculadoraRentabilidade = () => {
  const [custo, setCusto] = useState<number | "">(0);
  const [venda, setVenda] = useState<number | "">(0);
  const [percentual, setPercentual] = useState<number | "">(0); // Percentual de margem
  const [isPercentageMode, setIsPercentageMode] = useState(false);
  const [resultado, setResultado] = useState("0,00%");

  // Função para formatar percentual
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2).replace(".", ",")}%`;
  };

  // Função para formatar valor em reais
  const formatCurrency = (value: number): string => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  // Função para calcular a margem de lucro
  const calculateMarginPercentage = (costPrice: number, salePrice: number): string => {
    if (!costPrice || costPrice <= 0 || !salePrice || salePrice <= 0 || salePrice <= costPrice) {
      console.log("Invalid input for margin calculation:", { costPrice, salePrice });
      return "0,00%";
    }
    const marginPercentage = ((salePrice - costPrice) / salePrice) * 100;
    return formatPercentage(Math.max(0, marginPercentage));
  };

  // Função para calcular o preço de venda baseado na margem de lucro
  const calculateSalePrice = (costPrice: number, marginPercentage: number): number => {
    if (!costPrice || costPrice <= 0 || !marginPercentage || marginPercentage <= 0) {
      console.log("Invalid input for sale price calculation:", { costPrice, marginPercentage });
      return costPrice;
    }
    const marginValue = Math.max(0, marginPercentage) / 100;
    return costPrice / (1 - marginValue);
  };

  useEffect(() => {
    console.log("useEffect triggered:", { custo, venda, percentual, isPercentageMode });
    let newResult = "";
    if (isPercentageMode && typeof custo === "number" && custo > 0 && typeof percentual === "number" && percentual > 0) {
      const salePrice = calculateSalePrice(custo, percentual);
      newResult = formatCurrency(salePrice);
      setVenda(salePrice);
    } else if (typeof custo === "number" && custo > 0 && typeof venda === "number" && venda > 0) {
      newResult = calculateMarginPercentage(custo, venda);
    } else {
      newResult = isPercentageMode ? "R$ 0,00" : "0,00%";
    }
    setResultado(newResult);
    console.log("Result set to:", newResult);
  }, [custo, venda, percentual, isPercentageMode]);

  const handleInputChange = (setter: (value: number | "") => void, value: string) => {
    const parsedValue = value === "" ? "" : Math.abs(parseFloat(value)) || 0;
    setter(parsedValue);
  };

  return (
    <Card className="bg-gray-800 text-white shadow-md w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">Calculadora de Rentabilidade</CardTitle>
        <p className="text-xs text-gray-400">* Caso o app não funcione, feche e abra novamente.</p>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div>
          <label className="text-sm font-medium">Preço de Custo</label>
          <Input
            type="number"
            value={custo === 0 ? "" : custo}
            onChange={(e) => handleInputChange(setCusto, e.target.value)}
            className="mt-1 bg-gray-700 text-white border-gray-600 w-full"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium">{isPercentageMode ? "Percentual" : "Preço de Venda"}</label>
          <Input
            type="number"
            value={isPercentageMode ? (percentual === 0 ? "" : percentual) : (venda === 0 ? "" : venda)}
            onChange={(e) => {
              const value = e.target.value === "" ? "" : Math.abs(parseFloat(e.target.value)) || 0;
              if (isPercentageMode) {
                handleInputChange(setPercentual, value.toString());
              } else {
                handleInputChange(setVenda, value.toString());
              }
            }}
            className="mt-1 bg-gray-700 text-white border-gray-600 w-full"
            placeholder={isPercentageMode ? "Ex: 28,57" : "0.00"}
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Resultado</label>
          <Input
            type="text"
            value={resultado}
            readOnly
            className="mt-1 bg-gray-700 text-white border-gray-600 w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={isPercentageMode}
            onCheckedChange={setIsPercentageMode}
            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
          />
          <Label>Modo Percentual</Label>
        </div>
        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-white border-gray-600 hover:bg-green-600"
                style={{ backgroundColor: "#2fc555" }}
              >
                Rentabilidade Permitida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <img
                src="https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Rentabilidade%20permitida.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL1JlbnRhYmlsaWRhZGUgcGVybWl0aWRhLmpwZyIsImlhdCI6MTc1MTkxMzA3MCwiZXhwIjoxNzgzNDQ5MDcwfQ.1b_d4oSG2TtDmypVA24nyfZecS6jfNT6qpCDNzTHJGo"
                alt="Rentabilidade Permitida"
                className="w-full h-auto"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculadoraRentabilidade;
