import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

function formatBRL(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value || "0") : value || 0;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

// === REGRAS DE NEGÓCIO POR GRUPO E CLASSIFICAÇÃO ===
type Classificacao =
  | "Bronze com atraso"
  | "Bronze"
  | "Prata"
  | "Ouro"
  | "Diamante"
  | "Premium";

type Grupo = "1" | "2" | "3";

interface RegraEntrada {
  entradaMinimaPercentual?: number; // % do total sem juros
  entradaIgualParcela?: boolean;    // entrada = valor da parcela
  permiteSemEntrada?: boolean;      // entrada = 0
}

const REGRAS: Record<Grupo, Record<Classificacao, RegraEntrada>> = {
  "1": {
    "Bronze com atraso": { entradaIgualParcela: true },
    "Bronze": { entradaIgualParcela: true },
    "Prata": { permiteSemEntrada: true },
    "Ouro": { permiteSemEntrada: true },
    "Diamante": { permiteSemEntrada: true },
    "Premium": { permiteSemEntrada: true },
  },
  "2": {
    "Bronze com atraso": { entradaIgualParcela: true },
    "Bronze": { entradaIgualParcela: true },
    "Prata": { permiteSemEntrada: true },
    "Ouro": { permiteSemEntrada: true },
    "Diamante": { permiteSemEntrada: true },
    "Premium": { permiteSemEntrada: true },
  },
  "3": {
    "Bronze com atraso": { entradaMinimaPercentual: 10 },
    "Bronze": { entradaMinimaPercentual: 10 },
    "Prata": { entradaIgualParcela: true },
    "Ouro": { permiteSemEntrada: true },
    "Diamante": { permiteSemEntrada: true },
    "Premium": { permiteSemEntrada: true },
  },
};

export default function RenegociacaoCard() {
  const [totalSemJuros, setTotalSemJuros] = useState<string>("5375.46");
  const [grupo, setGrupo] = useState<Grupo>("1");
  const [classificacao, setClassificacao] = useState<Classificacao>("Prata");
  const [entrada, setEntrada] = useState<string>("");
  const [jurosTotal, setJurosTotal] = useState<string>("220.78");
  const [descontoJuros, setDescontoJuros] = useState<string>("100");
  const [maxParcelas, setMaxParcelas] = useState<string>("20");
  const [showRegras, setShowRegras] = useState(false);

  // === CÁLCULOS BASE ===
  const totalNumerico = useMemo(() => parseFloat(totalSemJuros || "0"), [totalSemJuros]);
  const regra = useMemo(() => REGRAS[grupo][classificacao], [grupo, classificacao]);

  // Entrada mínima com base na regra
  const entradaMinimaCalculada = useMemo(() => {
    if (regra.permiteSemEntrada) return 0;
    if (regra.entradaMinimaPercentual !== undefined) {
      return +(totalNumerico * (regra.entradaMinimaPercentual / 100));
    }
    return 0; // será substituído por entradaIgualParcela
  }, [totalNumerico, regra]);

  // Total a pagar (carteira própria)
  const carteiraPropria = useMemo(() => {
    const e = parseFloat(entrada || "0");
    return Math.max(0, totalNumerico - e);
  }, [totalNumerico, entrada]);

  // Juros após desconto
  const jurosAplicado = useMemo(() => {
    const j = parseFloat(jurosTotal || "0");
    const d = parseFloat(descontoJuros || "0");
    const desconto = Math.max(0, Math.min(100, d)) / 100;
    return +(j * (1 - desconto));
  }, [jurosTotal, descontoJuros]);

  const totalPagar = useMemo(() => +(carteiraPropria + jurosAplicado), [carteiraPropria, jurosAplicado]);

  // Lista de parcelas
  const parcelasList = useMemo(() => {
    const max = Math.max(1, parseInt(maxParcelas || "20", 10));
    const list: { qtd: number; valor: number }[] = [];
    for (let i = max; i >= 1; i--) {
      const valor = totalPagar / i;
      list.push({ qtd: i, valor: +valor.toFixed(2) });
    }
    return list;
  }, [totalPagar, maxParcelas]);

  // Mensagem formatada
  const mensagem = useMemo(() => {
    return (
      `Olá, temos uma proposta de renegociação para você.\n\n` +
      `Total sem Juros: ${formatBRL(totalSemJuros)}\n` +
      `Grupo: ${grupo} | Classificação: ${classificacao}\n` +
      `Entrada: ${formatBRL(entrada || "0")} ${regra.permiteSemEntrada ? "(sem entrada)" : ""}\n` +
      `Desconto sobre Juros: ${descontoJuros || "0"}%\n` +
      `Carteira própria: ${formatBRL(carteiraPropria)}\n` +
      `Total a Pagar: ${formatBRL(totalPagar)}\n` +
      `Parcelas: até ${maxParcelas}x de ${formatBRL(parcelasList[0]?.valor || 0)}\n\n` +
      `Opções:\n` +
      parcelasList.map(p => `${p.qtd}x de ${formatBRL(p.valor)}`).join("\n")
    );
  }, [
    totalSemJuros,
    grupo,
    classificacao,
    entrada,
    descontoJuros,
    carteiraPropria,
    totalPagar,
    maxParcelas,
    parcelasList,
    regra,
  ]);

  const copiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      alert("Mensagem copiada!");
    } catch {
      alert("Erro ao copiar.");
    }
  };

  // Verifica se entrada atende regra
  const entradaValida = useMemo(() => {
    const e = parseFloat(entrada || "0");
    if (regra.permiteSemEntrada) return true;
    if (regra.entradaMinimaPercentual !== undefined) {
      return e >= entradaMinimaCalculada;
    }
    if (regra.entradaIgualParcela) {
      const parcelaExemplo = totalPagar / parseInt(maxParcelas || "1", 10);
      return Math.abs(e - parcelaExemplo) < 0.01 || e === 0;
    }
    return true;
  }, [entrada, regra, entradaMinimaCalculada, totalPagar, maxParcelas]);

  return (
    <Card className="max-w-5xl mx-auto w-full bg-surface-50 dark:bg-surface-800">
      <div className="p-6 space-y-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Renegociação — Gerador de Mensagem</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Linha 1: Total + Grupo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Total sem Juros</Label>
              <Input value={totalSemJuros} onChange={e => setTotalSemJuros(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Grupo</Label>
              <Select value={grupo} onValueChange={(v) => setGrupo(v as Grupo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grupo 1</SelectItem>
                  <SelectItem value="2">Grupo 2</SelectItem>
                  <SelectItem value="3">Grupo 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 2: Classificação + Juros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Classificação</Label>
              <Select value={classificacao} onValueChange={(v) => setClassificacao(v as Classificacao)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bronze com atraso">Bronze com atraso</SelectItem>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Prata">Prata</SelectItem>
                  <SelectItem value="Ouro">Ouro</SelectItem>
                  <SelectItem value="Diamante">Diamante</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Juros Total (antes desconto)</Label>
              <Input value={jurosTotal} onChange={e => setJurosTotal(e.target.value)} type="number" />
            </div>
          </div>

          {/* Entrada com regra automática */}
          <div>
            <Label>
              Entrada {regra.permiteSemEntrada && "(opcional)"}
              {regra.entradaIgualParcela && " (deve ser ≈ 1 parcela)"}
              {regra.entradaMinimaPercentual && ` (mínimo ${regra.entradaMinimaPercentual}%)`}
            </Label>
            <Input
              value={entrada}
              onChange={e => setEntrada(e.target.value)}
              type="number"
              placeholder={
                regra.permiteSemEntrada
                  ? "0 (sem entrada)"
                  : regra.entradaIgualParcela
                  ? `≈ ${formatBRL(totalPagar / parseInt(maxParcelas || "1"))}`
                  : formatBRL(entradaMinimaCalculada)
              }
            />
            {!entradaValida && entrada && (
              <p className="text-sm text-red-500 mt-1">
                {regra.entradaIgualParcela
                  ? "Entrada deve ser igual a 1 parcela"
                  : "Entrada abaixo do mínimo exigido"}
              </p>
            )}
          </div>

          {/* Desconto e Máximo Parcelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Desconto sobre Juros (%)</Label>
              <Input value={descontoJuros} onChange={e => setDescontoJuros(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Máximo de Parcelas</Label>
              <Input value={maxParcelas} onChange={e => setMaxParcelas(e.target.value)} type="number" />
            </div>
          </div>

          <Separator />

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Carteira Própria</Label>
              <div className="text-2xl font-bold text-primary">{formatBRL(carteiraPropria)}</div>
            </div>
            <div>
              <Label>Total a Pagar</Label>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatBRL(totalPagar)}
              </div>
            </div>
          </div>

          {/* Parcelas */}
          <div>
            <Label>Opções de Parcelamento</Label>
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
              {parcelasList.slice(0, 12).map(p => (
                <div
                  key={p.qtd}
                  className="p-2 rounded border border-border/20 bg-card text-center hover:bg-accent transition"
                >
                  <div className="font-bold">{p.qtd}x</div>
                  <div>{formatBRL(p.valor)}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Mensagem */}
          <div>
            <Label>Mensagem Pronta</Label>
            <textarea
              readOnly
              value={mensagem}
              className="w-full mt-2 min-h-[140px] p-3 rounded-md bg-muted/5 dark:bg-muted/10 text-sm font-mono resize-none border border-border/20"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                setTotalSemJuros("");
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
              Copiar
            </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => setShowRegras(!showRegras)}
              className="flex items-center gap-1"
            >
              Regras <ChevronDown className={`h-4 w-4 transition-transform ${showRegras ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="ghost" onClick={() => alert("Enviar WhatsApp - implemente")}>
              WhatsApp
            </Button>
          </div>
        </CardFooter>

        {/* === PAINEL DE REGRAS === */}
        {showRegras && (
          <div className="border-t pt-4 mt-4 space-y-4 text-sm">
            <h3 className="font-semibold text-lg">Regras de Entrada por Grupo</h3>
            {(["1", "2", "3"] as Grupo[]).map(g => (
              <div key={g} className="bg-muted/5 dark:bg-muted/10 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Grupo {g}</h4>
                <ul className="space-y-1 text-xs">
                  {Object.entries(REGRAS[g]).map(([cls, r]) => (
                    <li key={cls}>
                      <strong>{cls}:</strong>{" "}
                      {r.permiteSemEntrada
                        ? "Sem entrada"
                        : r.entradaIgualParcela
                        ? "Entrada = 1 parcela"
                        : r.entradaMinimaPercentual
                        ? `Entrada mínima: ${r.entradaMinimaPercentual}%`
                        : "Sem regra"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
