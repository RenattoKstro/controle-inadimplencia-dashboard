import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function formatBRL(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value || "0") : value || 0;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export default function RenegociacaoCard() {
  const [totalSemJuros, setTotalSemJuros] = useState<string>("5375.46");
  const [percentualIsencao, setPercentualIsencao] = useState<string>("15");
  const [entrada, setEntrada] = useState<string>("806.32");
  const [jurosTotal, setJurosTotal] = useState<string>("220.78");
  const [descontoJuros, setDescontoJuros] = useState<string>("100");
  const [maxParcelas, setMaxParcelas] = useState<string>("20");

  const entradaMinima = useMemo(() => {
    const t = parseFloat(totalSemJuros || "0");
    const p = parseFloat(percentualIsencao || "0");
    return Number.isFinite(t) && Number.isFinite(p) ? +(t * (p / 100)) : 0;
  }, [totalSemJuros, percentualIsencao]);

  const carteiraPropria = useMemo(() => {
    const t = parseFloat(totalSemJuros || "0");
    const e = parseFloat(entrada || "0");
    return Number.isFinite(t) && Number.isFinite(e) ? Math.max(0, t - e) : 0;
  }, [totalSemJuros, entrada]);

  const jurosAplicado = useMemo(() => {
    const j = parseFloat(jurosTotal || "0");
    const d = parseFloat(descontoJuros || "0");
    if (!Number.isFinite(j)) return 0;
    if (!Number.isFinite(d)) return j;
    const applied = j * (1 - Math.max(0, Math.min(100, d)) / 100);
    return +(applied);
  }, [jurosTotal, descontoJuros]);

  const totalPagar = useMemo(() => +(carteiraPropria + jurosAplicado), [carteiraPropria, jurosAplicado]);

  const parcelasList = useMemo(() => {
    const max = Math.max(1, parseInt(maxParcelas || "20"));
    const list = [] as { qtd: number; valor: number }[];
    for (let i = max; i >= 1; i--) {
      list.push({ qtd: i, valor: +(totalPagar / i) });
    }
    return list;
  }, [totalPagar, maxParcelas]);

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
      alert("Mensagem copiada para a área de transferência");
    } catch (e) {
      alert("Não foi possível copiar. Verifique permissões do navegador.");
    }
  };

  const podeMostrarDesconto = useMemo(() => {
    const e = parseFloat(entrada || "0");
    return e >= entradaMinima && entradaMinima > 0;
  }, [entrada, entradaMinima]);

  return (
    <Card className="max-w-5xl mx-auto w-full overflow-x-auto bg-surface-50 dark:bg-surface-800">
      {/* Garante largura mínima e permite rolagem horizontal */}
      <div className="min-w-[800px] p-6 space-y-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Renegociação — Gerador de Mensagem</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Total sem Juros */}
          <div>
            <Label>Total sem Juros</Label>
            <Input value={totalSemJuros} onChange={e => setTotalSemJuros(e.target.value)} type="number" />
          </div>

          {/* % Isenção + Entrada Mínima */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>% Isenção (entrada mínima)</Label>
              <Input value={percentualIsencao} onChange={e => setPercentualIsencao(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Entrada mínima calculada</Label>
              <div className="px-3 py-2 rounded-md bg-muted-foreground/5 dark:bg-muted-foreground/10">
                {formatBRL(entradaMinima)}
              </div>
            </div>
          </div>

          {/* Entrada Escolhida */}
          <div>
            <Label>Entrada escolhida</Label>
            <Input value={entrada} onChange={e => setEntrada(e.target.value)} type="number" />
            {entrada && +entrada < entradaMinima && (
              <p className="text-sm text-red-500 mt-1">A entrada é menor que o mínimo exigido.</p>
            )}
          </div>

          {/* Juros Total */}
          <div>
            <Label>Juros Total (antes do desconto)</Label>
            <Input value={jurosTotal} onChange={e => setJurosTotal(e.target.value)} type="number" />
          </div>

          {/* Desconto sobre Juros (condicional) */}
          {podeMostrarDesconto && (
            <div>
              <Label>Desconto sobre Juros (%)</Label>
              <Input value={descontoJuros} onChange={e => setDescontoJuros(e.target.value)} type="number" />
            </div>
          )}

          {/* Máximo Parcelas + Juros Aplicados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Máximo de parcelas</Label>
              <Input value={maxParcelas} onChange={e => setMaxParcelas(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Juros aplicados (após desconto)</Label>
              <div className="px-3 py-2 rounded-md bg-muted-foreground/5 dark:bg-muted-foreground/10">
                {formatBRL(jurosAplicado)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Resumo: Carteira Própria + Total a Pagar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Carteira própria</Label>
              <div className="text-2xl font-bold text-primary">{formatBRL(carteiraPropria)}</div>
            </div>
            <div>
              <Label>Total a pagar</Label>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatBRL(totalPagar)}</div>
            </div>
          </div>

          {/* Opções de Parcelamento */}
          <div>
            <Label>Opções de Parcelamento</Label>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20">
              {parcelasList.map((p) => (
                <div
                  key={p.qtd}
                  className="p-3 rounded-lg border border-border/20 dark:border-border/30 bg-card hover:bg-accent transition-colors text-center"
                >
                  <div className="font-bold text-sm">{p.qtd}x</div>
                  <div className="text-xs text-muted-foreground">{formatBRL(p.valor)}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Mensagem Pronta */}
          <div>
            <Label>Mensagem pronta para enviar</Label>
            <textarea
              readOnly
              value={mensagem}
              className="w-full mt-2 min-h-[160px] p-4 rounded-md bg-muted/5 dark:bg-muted/10 text-sm font-mono resize-none border border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 scrollbar-thin"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                setTotalSemJuros("");
                setPercentualIsencao("15");
                setEntrada("");
                setJurosTotal("");
                setDescontoJuros("100");
                setMaxParcelas("20");
              }}
              className="flex-1 sm:flex-initial"
            >
              Limpar
            </Button>
            <Button onClick={copiarMensagem} className="flex-1 sm:flex-initial">
              Copiar Mensagem
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={() => alert("Enviar para WhatsApp - implemente a lógica de compartilhamento")}
            className="w-full sm:w-auto"
          >
            Enviar (WhatsApp)
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
