// src/dashboard/CalculadoraVendedor90.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CalculadoraVendedor90 = () => {
  const [aReceber, setAReceber] = useState<number | "">(0);
  const [recebido, setRecebido] = useState<number | "">(0);
  const [recRefMes, setRecRefMes] = useState<number | "">(0);
  const [resultado, setResultado] = useState("0,00");

  // Função para formatar valor em reais
  const formatCurrency = (value: number): string => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  // Função para calcular o resultado
  const calculateResult = () => {
    const aReceberNum = typeof aReceber === "number" ? aReceber : 0;
    const recebidoNum = typeof recebido === "number" ? recebido : 0;
    const recRefMesNum = typeof recRefMes === "number" ? recRefMes : 0;

    if (aReceberNum <= 0 || recebidoNum < 0 || recRefMesNum < 0) return "0,00";

    const aReceber90 = aReceberNum * 0.9;
    const totalRecebido = recebidoNum + recRefMesNum;
    const diff = aReceber90 - totalRecebido;

    return formatCurrency(Math.max(0, diff));
  };

  useEffect(() => {
    const newResult = calculateResult();
    setResultado(newResult);
  }, [aReceber, recebido, recRefMes]);

  const handleInputChange = (setter: (value: number | "") => void, value: string) => {
    const parsedValue = value === "" ? "" : Math.abs(parseFloat(value)) || 0;
    setter(parsedValue);
  };

  return (
    <Card className="bg-gray-800 text-white shadow-md w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">AVG - Evolução de Recebimento CCG</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div>
          <label className="text-sm font-medium">À Receber</label>
          <Input
            type="number"
            value={aReceber === 0 ? "" : aReceber}
            onChange={(e) => handleInputChange(setAReceber, e.target.value)}
            className="mt-1 bg-gray-700 text-white border-gray-600 w-full"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Recebido</label>
          <Input
            type="number"
            value={recebido === 0 ? "" : recebido}
            onChange={(e) => handleInputChange(setRecebido, e.target.value)}
            className="mt-1 bg-gray-700 text-white border-gray-600 w-full"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Rec. Ref. Mes em Meses</label>
          <Input
            type="number"
            value={recRefMes === 0 ? "" : recRefMes}
            onChange={(e) => handleInputChange(setRecRefMes, e.target.value)}
            className="mt-1 bg-gray-700 text-white border-gray-600 w-full"
            placeholder="0.00"
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
        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-white border-gray-600 hover:bg-green-600"
                style={{ backgroundColor: "#2fc555" }}
              >
                Como Calcular?
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl bg-card"> {/* Ajustado para suportar 1300px */}
              <img
                src="https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/CCG%20EVOL.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NDRyBFVk9MLnBuZyIsImlhdCI6MTc1MzczODkzMCwiZXhwIjoxNzg1Mjc0OTMwfQ.IgoCpozOizGKubCcctvl5kVonakAFYkvXy6qxitQ0qg"
                alt="Como Calcular CCG"
                style={{ width: "1300px", height: "560px" }} // Tamanho fixo em pixels
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculadoraVendedor90;
