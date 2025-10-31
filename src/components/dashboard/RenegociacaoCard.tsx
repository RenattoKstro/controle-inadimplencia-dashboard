import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// arredondamento padrão (2 casas decimais)
function round2(v: number) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

// Função principal de cálculo
function calcParcelamento(totalCorrigido: number, taxaMensalPercent: number, n: number) {
  const r = taxaMensalPercent / 100;
  const jurosTotal = round2(totalCorrigido * r * n);
  const totalPagar = round2(totalCorrigido + jurosTotal);
  const parcela = round2(totalPagar / n);

  return {
    jurosTotal,
    totalPagar,
    parcela,
  };
}

export default function RenegociacaoCard() {
  const [totalSemJuros, setTotalSemJuros] = useState(5375.46);
  const [totalCorrigido, setTotalCorrigido] = useState(5519.5);
  const [taxaMensal, setTaxaMensal] = useState(2); // 2% padrão
  const [parcelas, setParcelas] = useState(20);

  const { jurosTotal, totalPagar, parcela } = calcParcelamento(totalCorrigido, taxaMensal, parcelas);

  const scrollStyle = "w-full overflow-y-auto max-h-[70vh]";

  return (
    <Card className="w-[1100px] max-h-[85vh] overflow-y-auto p-6 rounded-2xl shadow-xl mx-auto">
      <CardHeader>
        <CardTitle>Renegociação — Gerador de Mensagem</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Total sem juros */}
          <div>
            <Label>Total sem Juros</Label>
            <Input
              type="number"
              value={totalSemJuros}
              onChange={(e) => setTotalSemJuros(parseFloat(e.target.value))}
            />
          </div>

          {/* Total corrigido */}
          <div>
            <Label>Total Corrigido</Label>
            <Input
              type="number"
              value={totalCorrigido}
              onChange={(e) => setTotalCorrigido(parseFloat(e.target.value))}
            />
          </div>

          {/* Taxa mensal */}
          <div>
            <Label>Taxa Mensal (%)</Label>
            <Input
              type="number"
              value={taxaMensal}
              onChange={(e) => setTaxaMensal(parseFloat(e.target.value))}
            />
          </div>

          {/* Parcelas */}
          <div>
            <Label>Quantidade de Parcelas</Label>
            <Input
              type="number"
              value={parcelas}
              onChange={(e) => setParcelas(parseInt(e.target.value))}
            />
          </div>
        </div>

        <Separator />

        {/* RESULTADOS */}
        <div className="text-lg font-medium">
          <p>Total sem Juros: {totalSemJuros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p>Total Corrigido: {totalCorrigido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p>Qtd Parcelas: {parcelas}</p>
          <p>Juros Parcelamento: {jurosTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p>Total Pagar: {totalPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p>
            Valor da Parcela: {parcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({parcelas}x)
          </p>
        </div>

        <Separator />

        {/* LISTA DE PARCELAS (20x, 19x, 18x...) */}
        <div className={scrollStyle}>
          <div className="space-y-2">
            {Array.from({ length: parcelas }).map((_, i) => {
              const qtd = parcelas - i;
              const valor = round2(totalPagar / qtd);
              return (
                <p key={i} className="text-base">
                  {qtd}x de {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* MENSAGEM FORMATADA PARA COPIAR */}
        <div>
          <Label>Mensagem pronta</Label>
          <textarea
            className="w-full h-40 bg-white border rounded p-3 text-black"
            value={`Olá! Segue sua proposta de renegociação:

Total sem Juros: ${totalSemJuros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Total Corrigido: ${totalCorrigido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Qtd Parcelas: ${parcelas}
Juros Parcelamento: ${jurosTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Total Pagar: ${totalPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Parcela: ${parcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${parcelas}x)`}
            readOnly
          />
        </div>

        <Button
          onClick={() => navigator.clipboard.writeText(
            `Olá! Segue sua proposta de renegociação:

Total sem Juros: ${totalSemJuros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Total Corrigido: ${totalCorrigido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Qtd Parcelas: ${parcelas}
Juros Parcelamento: ${jurosTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Total Pagar: ${totalPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Parcela: ${parcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${parcelas}x)`
          )}
        >
          Copiar Mensagem
        </Button>
      </CardContent>
    </Card>
  );
}
export type ResultadoParcelamento = {
  jurosTotal: number;        // juros total (precisão)
  totalPagar: number;       // total a pagar
  parcela: number;          // valor por parcela (precisão)
  parcelas: { qtd:number; valor:number }[]; // lista N..1
};

// arredonda para 2 casas
function round2(v:number){ return Math.round((v + Number.EPSILON)*100)/100; }

/**
 * Calcula parcelamento com juros fixos por parcela (taxa mensal * totalCorrigido).
 * @param totalCorrigido valor base
 * @param taxaMensalPercent ex: 2  (para 2%)
 * @param n parcelas (ex: 20)
 * @param mode 'precise' | 'perParcelRounded'
 *    - 'precise': calcula juros total em alta precisão e só depois arredonda
 *    - 'perParcelRounded': arredonda juros mensal para 2 casas e soma (pode gerar centavos extras)
 */
export function calcParcelamento(
  totalCorrigido:number,
  taxaMensalPercent:number,
  n:number,
  mode:'precise'|'perParcelRounded' = 'precise'
): ResultadoParcelamento {
  const r = taxaMensalPercent / 100;
  if (mode === 'perParcelRounded') {
    const jMensal = round2(totalCorrigido * r);          // arredonda cada parcela de juros
    const jurosTotal = round2(jMensal * n);
    const totalPagar = round2(totalCorrigido + jurosTotal);
    const parcela = round2(totalPagar / n);
    const parcelas = Array.from({length:n}, (_,i) => ({qtd: n - i, valor: round2(totalPagar / (n - i))}));
    return { jurosTotal, totalPagar, parcela, parcelas };
  } else {
    // modo precise
    const jurosTotalRaw = totalCorrigido * r * n;        // alta precisão
    const jurosTotal = round2(jurosTotalRaw);
    const totalPagarRaw = totalCorrigido + jurosTotalRaw;
    const totalPagar = round2(totalPagarRaw);
    const parcela = round2(totalPagarRaw / n);
    const parcelas = Array.from({length:n}, (_,i) => {
      const qtd = n - i;
      const valor = round2(totalPagarRaw / qtd);
      return {qtd, valor};
    });
    return { jurosTotal, totalPagar, parcela, parcelas };
  }
}
