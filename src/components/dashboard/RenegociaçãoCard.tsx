import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Componente: RenegociacaoCard
// Stack: Vite + React + TypeScript + Tailwind + shadcn-ui
// Funcionalidades:
// - Recebe Total sem juros (valor base)
// - Permite escolher "% isenção (entrada mínima)" que calcula a entrada mínima
// - Campo de Entrada (pode ser preenchido manualmente)
// - Ao preencher entrada >= entrada mínima aparece o campo "Desconto sobre Juros (%)"
// - Permite informar Juros Total (antes do desconto)
// - Aplica desconto sobre juros (0-100%) e recalcula juros finais
// - Gera lista de opções de parcelamento (N..1) com valores por parcela
// - Gera mensagem formatada e botão para copiar

function formatBRL(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value || "0") : value || 0;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export default function RenegociacaoCard() {
  // Valores iniciais (você pode setar defaults conforme necessário)
  const [totalSemJuros, setTotalSemJuros] = useState<string>("5375.46");
  const [percentualIsencao, setPercentualIsencao] = useState<string>("15"); // % para calcular entrada mínima
  const [entrada, setEntrada] = useState<string>("806.32");
  const [jurosTotal, setJurosTotal] = useState<string>("220.78");
  const [descontoJuros, setDescontoJuros] = useState<string>("100"); // % desconto sobre juros (aparece após entrada válida)
  const [maxParcelas, setMaxParcelas] = useState<string>("20");

  // entrada mínima calculada a partir do totalSemJuros * percentualIsencao%
  const entradaMinima = useMemo(() => {
    const t = parseFloat(totalSemJuros || "0");
    const p = parseFloat(percentualIsencao || "0");
    return Number.isFinite(t) && Number.isFinite(p) ? +(t * (p / 100)) : 0;
  }, [totalSemJuros, percentualIsencao]);

  // carteira propria = totalSemJuros - entrada
  const carteiraPropria = useMemo(() => {
    const t = parseFloat(totalSemJuros || "0");
    const e = parseFloat(entrada || "0");
    return Number.isFinite(t) && Number.isFinite(e) ? Math.max(0, t - e) : 0;
  }, [totalSemJuros, entrada]);

  // juros aplicado depois do desconto
  const jurosAplicado = useMemo(() => {
    const j = parseFloat(jurosTotal || "0");
    const d = parseFloat(descontoJuros || "0");
    if (!Number.isFinite(j)) return 0;
    if (!Number.isFinite(d)) return j;
    const applied = j * (1 - Math.max(0, Math.min(100, d)) / 100);
    return +(applied);
  }, [jurosTotal, descontoJuros]);

  // total a pagar = carteira propria + jurosAplicado
  const totalPagar = useMemo(() => +(carteiraPropria + jurosAplicado), [carteiraPropria, jurosAplicado]);

  // lista de parcelas do maxParcelas até 1
  const parcelasList = useMemo(() => {
    const max = Math.max(1, parseInt(maxParcelas || "20"));
    const list = [] as { qtd: number; valor: number }[];
    for (let i = max; i >= 1; i--) {
      list.push({ qtd: i, valor: +(totalPagar / i) });
    }
    return list;
  }, [totalPagar, maxParcelas]);

  // mensagem formatada pronta para copiar/enviar
  const mensagem = useMemo(() => {
    return `Olá, temos uma proposta de renegociação para você.\n\n` +
      `Total sem Juros: ${formatBRL(parseFloat(totalSemJuros || "0"))}\n` +
      `Valor Entrada: ${formatBRL(parseFloat(entrada || "0"))}\n` +
      `Desconto sobre Juros: ${descontoJuros || "0"}%\n` +
      `Carteira própria: ${formatBRL(carteiraPropria)}\n` +
      `Valor Total Pagar: ${formatBRL(totalPagar)}\n` +
      `Qtd parcelas: ${maxParcelas}\n` +
      `Valor Parcela (ex: ${maxParcelas}x): ${formatBRL(parcelasList[0]?.valor || 0)}\n\n` +
      `Opções de parcelamento:\n` +
      parcelasList.map(p => `${p.qtd}x de ${formatBRL(p.valor)}`).join("\n");
  }, [totalSemJuros, entrada, descontoJuros, carteiraPropria, totalPagar, maxParcelas, parcelasList]);

  const copiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      // você pode trocar para um toast da sua lib
      alert("Mensagem copiada para a área de transferência");
    } catch (e) {
      alert("Não foi possível copiar. Verifique permissões do navegador.");
    }
  };

  // condição para revelar o campo de desconto sobre juros
  const podeMostrarDesconto = useMemo(() => {
    const e = parseFloat(entrada || "0");
    return e >= entradaMinima && entradaMinima > 0;
  }, [entrada, entradaMinima]);

  return (
    <Card className="max-w-3xl mx-auto bg-surface-50 dark:bg-surface-800">
      <CardHeader>
        <CardTitle>Renegociação — Gerador de Mensagem (dark)</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label>Total sem Juros</Label>
          <Input value={totalSemJuros} onChange={e => setTotalSemJuros(e.target.value)} type="number" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>% Isenção (entrada mínima)</Label>
            <Input value={percentualIsencao} onChange={e => setPercentualIsencao(e.target.value)} type="number" />
          </div>

          <div>
            <Label>Entrada mínima calculada</Label>
            <div className="px-3 py-2 rounded-md bg-muted-foreground/5 dark:bg-muted-foreground/10">{formatBRL(entradaMinima)}</div>
          </div>
        </div>

        <div>
          <Label>Entrada escolhida</Label>
          <Input value={entrada} onChange={e => setEntrada(e.target.value)} type="number" />
          {entrada && +entrada < entradaMinima && (
            <p className="text-sm text-red-500 mt-1">A entrada informada é menor que a entrada mínima calculada.</p>
          )}
        </div>

        <div>
          <Label>Juros Total (antes do desconto)</Label>
          <Input value={jurosTotal} onChange={e => setJurosTotal(e.target.value)} type="number" />
        </div>

        {podeMostrarDesconto && (
          <div>
            <Label>Desconto sobre Juros (%)</Label>
            <Input value={descontoJuros} onChange={e => setDescontoJuros(e.target.value)} type="number" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Máximo parcelas</Label>
            <Input value={maxParcelas} onChange={e => setMaxParcelas(e.target.value)} type="number" />
          </div>

          <div>
            <Label>Juros aplicados (após desconto)</Label>
            <div className="px-3 py-2 rounded-md bg-muted-foreground/5 dark:bg-muted-foreground/10">{formatBRL(jurosAplicado)}</div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Carteira própria</Label>
            <div className="px-3 py-2 rounded-md bg-muted-foreground/5 dark:bg-muted-foreground/10">{formatBRL(carteiraPropria)}</div>
          </div>

          <div>
            <Label>Total a pagar</Label>
            <div className="px-3 py-2 rounded-md bg-muted-foreground/5 dark:bg-muted-foreground/10">{formatBRL(totalPagar)}</div>
          </div>
        </div>

        <div>
          <Label>Opções de Parcelamento</Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-auto">
            {parcelasList.map((p) => (
              <div key={p.qtd} className="p-2 rounded border border-border/10 dark:border-border/20">
                <div className="text-sm font-semibold">{p.qtd}x</div>
                <div className="text-xs">{formatBRL(p.valor)}</div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label>Mensagem pronta</Label>
          <textarea readOnly value={mensagem} className="w-full min-h-[120px] p-3 rounded-md bg-muted-foreground/5 dark:bg-muted-foreground/10 text-sm" />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            // reset simples
            setTotalSemJuros("");
            setPercentualIsencao("15");
            setEntrada("");
            setJurosTotal("");
            setDescontoJuros("100");
            setMaxParcelas("20");
          }}>Limpar</Button>

          <Button onClick={copiarMensagem}>Copiar Mensagem</Button>
        </div>

        <div>
          <Button variant="ghost" onClick={() => alert('Enviar para WhatsApp - implemente a lógica de compartilhamento')}>Enviar (WhatsApp)</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
