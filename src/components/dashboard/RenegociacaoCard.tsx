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

// === REGRAS DE NEGÓCIO ===
type Classificacao =
  | "Bronze com atraso"
  | "Bronze"
  | "Prata"
  | "Ouro"
  | "Diamante"
  | "Premium";

type Grupo = "1" | "2" | "3";

interface RegraEntrada {
  entradaMinimaPercentual?: number;
  entradaIgualParcela?: boolean;
  permiteSemEntrada?: boolean;
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
  // === ESTADOS ===
  const [grupo, setGrupo] = useState<Grupo>("1");
  const [classificacao, setClassificacao] = useState<Classificacao>("Prata");
  const [totalSemJuros, setTotalSemJuros] = useState<string>("5375.46");
  const [entrada, setEntrada] = useState<string>("");
  const [jurosTotal, setJurosTotal] = useState<string>("220.78");
  const [descontoJuros, setDescontoJuros] = useState<string>("100");
  const [maxParcelas, setMaxParcelas] = useState<string>("20");
  const [showRegras, setShowRegras] = useState(false);

  // === CÁLCULOS ===
  const totalNumerico = useMemo(() => parseFloat(totalSemJuros || "0"), [totalSemJuros]);
  const regra = useMemo(() => REGRAS[grupo][classificacao], [grupo, classificacao]);

  const entradaMinimaCalculada = useMemo(() => {
    if (regra.permiteSemEntrada) return 0;
    if (regra.entradaMinimaPercentual) return +(totalNumerico * (regra.entradaMinimaPercentual / 100));
    return 0;
  }, [totalNumerico, regra]);

  const carteiraPropria = useMemo(() => {
    const e = parseFloat(entrada || "0");
    return Math.max(0, totalNumerico - e);
  }, [totalNumerico, entrada]);

  const jurosAplicado = useMemo(() => {
    const j = parseFloat(jurosTotal || "0");
    const d = Math.max(0, Math.min(100, parseFloat(descontoJuros || "0"))) / 100;
    return +(j * (1 - d));
  }, [jurosTotal, descontoJuros]);

  const totalPagar = useMemo(() => +(carteiraPropria + jurosAplicado), [carteiraPropria, jurosAplicado]);

  const parcelasList = useMemo(() => {
    const max = Math.max(1, parseInt(maxParcelas || "20", 10));
    return Array.from({ length: max }, (_, i) => {
      const qtd = max - i;
      return { qtd, valor: +(totalPagar / qtd).toFixed(2) };
    });
  }, [totalPagar, maxParcelas]);

  const mensagem = useMemo(() => {
    const entradaTexto = entrada ? formatBRL(entrada) : "sem entrada";
    return (
      `Olá! Proposta de renegociação:\n\n` +
      `Grupo: ${grupo} | Classificação: ${classificacao}\n` +
      `Total sem Juros: ${formatBRL(totalSemJuros)}\n` +
      `Entrada: ${entradaTexto}\n` +
      `Desconto Juros: ${descontoJuros}%\n` +
      `Carteira Própria: ${formatBRL(carteiraPropria)}\n` +
      `Total a Pagar: ${formatBRL(totalPagar)}\n` +
      `Parcela (ex: ${maxParcelas}x): ${formatBRL(parcelasList[0]?.valor || 0)}\n\n` +
      `Opções:\n` +
      parcelasList.map(p => `${p.qtd}x de ${formatBRL(p.valor)}`).join("\n")
    );
  }, [grupo, classificacao, totalSemJuros, entrada, descontoJuros, carteiraPropria, totalPagar, maxParcelas, parcelasList]);

  const copiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      alert("Mensagem copiada!");
    } catch {
      alert("Erro ao copiar.");
    }
  };

  const entradaValida = useMemo(() => {
    const e = parseFloat(entrada || "0");
    if (regra.permiteSemEntrada) return true;
    if (regra.entradaMinimaPercentual) return e >= entradaMinimaCalculada;
    if (regra.entradaIgualParcela) {
      const parcela = totalPagar / parseInt(maxParcelas || "1");
      return Math.abs(e - parcela) < 1;
    }
    return true;
  }, [entrada, regra, entradaMinimaCalculada, totalPagar, maxParcelas]);

  return (
    <Card className="max-w-5xl mx-auto w-full bg-surface-50 dark:bg-surface-800">
      <div className="p-6 space-y-6">

        {/* === TÍTULO === */}
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Renegociação — Gerador de Mensagem</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* === GRUPO + CLASSIFICAÇÃO (PRIMEIRO) === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 dark:bg-primary/10 p-4 rounded-lg">
            <div>
              <Label className="font-semibold">Grupo</Label>
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
            <div>
              <Label className="font-semibold">Classificação</Label>
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
          </div>

          {/* === DADOS PRINCIPAIS === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Total sem Juros</Label>
              <Input value={totalSemJuros} onChange={e => setTotalSemJuros(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Juros Total (antes desconto)</Label>
              <Input value={jurosTotal} onChange={e => setJurosTotal(e.target.value)} type="number" />
            </div>
          </div>

          {/* === ENTRADA COM REGRAS === */}
          <div>
            <Label>
              Entrada{" "}
              <span className="text-xs text-muted-foreground">
                {regra.permiteSemEntrada && "(sem entrada permitida)"}
                {regra.entradaIgualParcela && "(deve ser ≈ 1 parcela)"}
                {regra.entradaMinimaPercentual && `(mínimo ${regra.entradaMinimaPercentual}%)`}
              </span>
            </Label>
            <Input
              value={entrada}
              onChange={e => setEntrada(e.target.value)}
              type="number"
              placeholder={
                regra.permiteSemEntrada ? "0" :
                regra.entradaIgualParcela ? `≈ ${formatBRL(totalPagar / parseInt(maxParcelas || "1"))}` :
                formatBRL(entradaMinimaCalculada)
              }
            />
            {!entradaValida && entrada && (
              <p className="text-sm text-red-500 mt-1">Entrada não atende à regra do grupo.</p>
            )}
          </div>

          {/* === DESCONTO + PARCELAS === */}
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

          {/* === RESUMO FINANCEIRO === */}
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

          {/* === PARCELAS === */}
          <div>
            <Label>Opções de Parcelamento</Label>
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
              {parcelasList.slice(0, 12).map(p => (
                <div key={p.qtd} className="p-2 rounded border bg-card text-center hover:bg-accent transition">
                  <div className="font-bold">{p.qtd}x</div>
                  <div>{formatBRL(p.valor)}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* === MENSAGEM === */}
          <div>
            <Label>Mensagem Pronta</Label>
            <textarea
              readOnly
              value={mensagem}
              className="w-full mt-2 min-h-[140px] p-3 rounded-md bg-muted/5 dark:bg-muted/10 text-sm font-mono resize-none border"
            />
          </div>
        </CardContent>

        {/* === BOTÕES === */}
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => {
              setTotalSemJuros("");
              setEntrada("");
              setJurosTotal("");
              setDescontoJuros("100");
              setMaxParcelas("20");
            }} className="flex-1 sm:flex-initial">
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
            <Button variant="ghost" onClick={() => alert("WhatsApp - implemente")}>
              WhatsApp
            </Button>
          </div>
        </CardFooter>

        {/* === PAINEL DE REGRAS === */}
        {showRegras && (
          <div className="border-t pt-4 space-y-4 text-sm bg-muted/5 dark:bg-muted/10 rounded-b-lg -m-6 p-6">
            <h3 className="font-bold text-lg">Regras de Entrada</h3>
            {(["1", "2", "3"] as Grupo[]).map(g => (
              <div key={g} className="bg-card p-4 rounded">
                <h4 className="font-semibold mb-2">Grupo {g}</h4>
                <ul className="space-y-1 text-xs">
                  {Object.entries(REGRAS[g]).map(([cls, r]) => (
                    <li key={cls}>
                      <strong>{cls}:</strong>{" "}
                      {r.permiteSemEntrada ? "Sem entrada" :
                       r.entradaIgualParcela ? "Entrada = 1 parcela" :
                       r.entradaMinimaPercentual ? `Mínimo ${r.entradaMinimaPercentual}%` :
                       "Sem regra"}
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
