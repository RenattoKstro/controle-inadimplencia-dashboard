import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RenegociacaoCard() {
  const [valorOriginal, setValorOriginal] = useState(0);
  const [jurosMensal, setJurosMensal] = useState(0);
  const [parcelas, setParcelas] = useState(1);

  const calcular = () => {
    const totalSemJuros = valorOriginal;
    const fator = Math.pow(1 + jurosMensal / 100, parcelas);
    const valorCorrigido = totalSemJuros * fator;
    const totalJuros = valorCorrigido - totalSemJuros;
    return { totalSemJuros, valorCorrigido, totalJuros };
  };

  const resultados = calcular();

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-[1100px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl border p-6 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Renegociação — Gerador de Mensagem
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold mb-1">Valor Original</p>
              <Input
                type="number"
                placeholder="Digite o valor"
                value={valorOriginal}
                onChange={(e) => setValorOriginal(parseFloat(e.target.value))}
                className="font-medium"
              />
            </div>

            <div>
              <p className="font-semibold mb-1">Juros Mensal (%)</p>
              <Input
                type="number"
                placeholder="Ex: 2"
                value={jurosMensal}
                onChange={(e) => setJurosMensal(parseFloat(e.target.value))}
                className="font-medium"
              />
            </div>

            <div>
              <p className="font-semibold mb-1">Parcelas</p>
              <Input
                type="number"
                placeholder="Ex: 20"
                value={parcelas}
                onChange={(e) => setParcelas(parseInt(e.target.value))}
                className="font-medium"
              />
            </div>
          </div>

          {/* RESULTADOS */}
          <div className="bg-zinc-100 p-5 rounded-xl space-y-2 text-lg font-medium border">
            <p>Total sem Juros: R$ {resultados.totalSemJuros.toFixed(2)}</p>
            <p>Total Corrigido: R$ {resultados.valorCorrigido.toFixed(2)}</p>
            <p>Juros Total: R$ {resultados.totalJuros.toFixed(2)}</p>
            <p>Total a Pagar: R$ {(resultados.valorCorrigido).toFixed(2)}</p>
          </div>

          {/* LISTA DE PARCELAS */}
          <div className="bg-zinc-100 p-5 rounded-xl border max-h-[300px] overflow-y-auto">
            <p className="font-bold mb-3 text-lg">Simulação de Parcelamento</p>
            <div className="space-y-2">
              {Array.from({ length: parcelas }, (_, i) => {
                const n = parcelas - i;
                const fator = Math.pow(1 + jurosMensal / 100, n);
                const total = valorOriginal * fator;
                const valorParcela = total / n;

                return (
                  <p key={i} className="bg-white p-2 rounded shadow text-sm">
                    {n}x de R$ {valorParcela.toFixed(2)}
                  </p>
                );
              })}
            </div>
          </div>

          <Button className="w-full text-lg py-6 rounded-xl">Gerar Mensagem</Button>
        </CardContent>
      </Card>
    </div>
  );
}
