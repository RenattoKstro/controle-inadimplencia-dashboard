import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RenegociacaoCard() {
  const [valorOriginal, setValorOriginal] = useState<number>(0);
  const [jurosMensal, setJurosMensal] = useState<number>(0);
  const [parcelas, setParcelas] = useState<number>(1);

  // --- Cálculos ---
  const totalSemJuros = valorOriginal;

  // JUROS COMPOSTOS = valor * ((1+taxa)^parcelas - 1)
  const jurosTotal = valorOriginal * (Math.pow(1 + jurosMensal / 100, parcelas) - 1);

  const totalCorrigido = valorOriginal + jurosTotal;
  const valorParcela = parcelas > 0 ? totalCorrigido / parcelas : 0;

  return (
    <Card
      className="
        w-full 
        max-w-[750px] 
        max-h-[85vh] 
        overflow-y-auto 
        rounded-2xl 
        shadow-lg 
        mx-auto 
        p-6
      "
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">
          Renegociação — Gerador de Mensagem
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">

        {/* GRID DOS INPUTS */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label>Valor Original</Label>
            <Input
              type="number"
              value={valorOriginal}
              onChange={(e) => setValorOriginal(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Juros Mensal (%)</Label>
            <Input
              type="number"
              value={jurosMensal}
              onChange={(e) => setJurosMensal(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Parcelas</Label>
            <Input
              type="number"
              min={1}
              value={parcelas}
              onChange={(e) => setParcelas(Number(e.target.value))}
            />
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner space-y-2">
          <p><strong>Total sem Juros:</strong> R$ {totalSemJuros.toFixed(2)}</p>
          <p><strong>Total Corrigido:</strong> R$ {totalCorrigido.toFixed(2)}</p>
          <p><strong>Juros Total:</strong> R$ {jurosTotal.toFixed(2)}</p>
          <p><strong>Total a Pagar:</strong> R$ {totalCorrigido.toFixed(2)}</p>
        </div>

        {/* SIMULAÇÃO DE PARCELAMENTO */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          <h3 className="font-semibold text-lg mb-3">Simulação</h3>
          <p><strong>{parcelas}x</strong> de <strong>R$ {valorParcela.toFixed(2)}</strong></p>
        </div>
      </CardContent>
    </Card>
  );
}
