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

// === REGRAS DE ENTRADA SEM JUROS POR CLASSIFICAÇÃO ===
const ENTRADA_SEM_JUROS: Record<Classificacao, number> = {
  "Bronze com atraso": 25,
  "Bronze": 25,
  "Prata": 20,
  "Ouro": 15,
  "Diamante": 10,
  "Premium": 8,
};

// === REGRAS DE NEGÓCIO POR GRUPO ===
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
  const entradaMinimaSemJuros = useMemo(() => {
    return +(totalNumerico * (ENTRADA_SEM_JUROS[classificacao] / 100));
  }, [totalNumerico, classificacao]);

  const entradaMinimaRegra = useMemo(() => {
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
    const semJuros = parseFloat(entrada || "0") >= entradaMinimaSemJuros ? " (SEM JUROS)" : "";
    return (
      `Olá! Proposta de renegociação:\n\n` +
      `Grupo: ${grupo} | Classificação: ${classificacao}${semJuros}\n` +
      `Total sem Juros: ${formatBRL(totalSemJuros)}\n` +
      `Entrada: ${entradaTexto}\n` +
      `Desconto Juros: ${descontoJuros}%\n` +
      `Carteira Própria: ${formatBRL(carteiraPropria)}\n` +
      `Total a Pagar: ${formatBRL(totalPagar)}\n` +
      `Parcela (ex: ${maxParcelas}x): ${formatBRL(parcelasList[0]?.valor || 0)}\n\n` +
      `Opções:\n` +
      parcelasList.map(p => `${p.qtd}x de ${formatBRL(p.valor)}`).join("\n")
    );
  }, [
    grupo, classificacao, totalSemJuros, entrada, descontoJuros,
    carteiraPropria, totalPagar, maxParcelas, parcelasList, entradaMinimaSemJuros
  ]);

  const copiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      alert("Mensagem copiada com sucesso!");
    } catch {
      alert("Erro ao copiar.");
    }
  };

  // === VALIDAÇÃO PARA MOSTRAR DESCONTO ===
  const entradaSuficienteParaDesconto = useMemo(() => {
    const e = parseFloat(entrada || "0");
    return e >= entradaMinimaSemJuros;
  }, [entrada, entradaMinimaSemJuros]);

  const entradaValida = useMemo(() => {
    const e = parseFloat(entrada || "0");
    if (regra.permiteSemEntrada) return true;
    if (regra.entradaMinimaPercentual) return e >= entradaMinimaRegra;
    if (regra.entradaIgualParcela) {
      const parcela = totalPagar / parseInt(maxParcelas || "1");
      return Math.abs(e - parcela) < 1;
    }
    return true;
  }, [entrada, regra, entradaMinimaRegra, totalPagar, maxParcelas]);

  return (
    <Card className="max-w-5xl mx-auto w-full bg-surface-50 dark:bg-surface-800">
      <div className="p-6 space-y-6">

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Renegociação — Gerador de Mensagem</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* === GRUPO + CLASSIFICAÇÃO === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 dark:bg-primary/10 p-4 rounded-lg">
            <div>
              <Label className="font-semibold">Grupo</Label>
              <Select value={grupo} onValueChange={(v) => setGrupo(v as Grupo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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

          {/* === TOTAL + JUROS === */}
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

          {/* === ENTRADA + MÍNIMO SEM JUROS === */}
          <div className="space-y-2">
            <Label>
              Entrada{" "}
              <span className="text-xs text-muted-foreground">
                {regra.permiteSemEntrada && "(opcional)"}
                {regra.entradaIgualParcela && "(= 1 parcela)"}
                {regra.entradaMinimaPercentual && `(mín. ${regra.entradaMinimaPercentual}%)`}
              </span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={entrada}
                onChange={e => setEntrada(e.target.value)}
                type="number"
                placeholder={regra.permiteSemEntrada ? "0" : formatBRL(entradaMinimaRegra)}
              />
              <div className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <span className="text-sm font-medium">Entrada mínima sem juros</span>
                <span className="font-bold text-green-700 dark:text-green-400">
                  {formatBRL(entradaMinimaSemJuros)} ({ENTRADA_SEM_JUROS[classificacao]}%)
                </span>
              </div>
            </div>
            {!entradaValida && entrada && (
              <p className="text-sm text-red-500">Entrada abaixo do mínimo exigido pela regra.</p>
            )}
          </div>

          {/* === DESCONTO (OCULTO ATÉ ENTRADA SUFICIENTE) === */}
          {entradaSuficienteParaDesconto && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-4 border-green-500 pl-4 bg-green-50/50 dark:bg-green-900/10 rounded-r-lg">
              <div>
                <Label className="flex items-center gap-2">
                  Desconto sobre Juros (%)
                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">ATIVADO</span>
                </Label>
                <Input value={descontoJuros} onChange={e => setDescontoJuros(e.target.value)} type="number" />
              </div>
              <div>
                <Label>Máximo de Parcelas</Label>
                <Input value={maxParcelas} onChange={e => setMaxParcelas(e.target.value)} type="number" />
              </div>
            </div>
          )}

          <Separator />

          {/* === RESUMO === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Carteira Própria</Label>
              <div className="text-2xl font-bold text-primary">{formatBRL(carteiraPropria)}</div>
            </div>
            <div>
              <Label>Total a Pagar</Label>
              <div className={`text-2xl font-bold ${entradaSuficienteParaDesconto ? 'text-green-600 dark:text-green-400' : 'text-orange-600'}`}>
                {formatBRL(totalPagar)}
                {entradaSuficienteParaDesconto && " (SEM JUROS!)"}
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
              className="w-full mt-2 min-h-[160px] p-3 rounded-md bg-muted/5 dark:bg-muted/10 text-sm font-mono resize-none border"
            />
          </div>
        </CardContent>

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
              Copiar Mensagem
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
            <Button variant="ghost" onClick={() => alert("Enviar WhatsApp")}>
              WhatsApp
            </Button>
          </div>
        </CardFooter>

        {/* === REGRAS === */}
        {showRegras && (
          <div className="border-t pt-4 space-y-4 text-sm bg-muted/5 dark:bg-muted/10 rounded-b-lg -m-6 p-6">
            <h3 className="font-bold text-lg">Regras de Entrada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Sem Juros (Entrada Mínima)</h4>
                <ul className="text-xs space-y-1">
                  {Object.entries(ENTRADA_SEM_JUROS).map(([cls, pct]) => (
                    <li key={cls}><strong>{cls}:</strong> {pct}% → {formatBRL(totalNumerico * pct / 100)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Por Grupo</h4>
                {(["1", "2", "3"] as Grupo[]).map(g => (
                  <div key={g} className="mb-3">
                    <strong>Grupo {g}:</strong>
                    <ul className="text-xs ml-4">
                      {Object.entries(REGRAS[g]).map(([cls, r]) => (
                        <li key={cls}>
                          {cls}:{" "}
                          {r.permiteSemEntrada ? "Sem entrada" :
                           r.entradaIgualParcela ? "Entrada = parcela" :
                           r.entradaMinimaPercentual ? `${r.entradaMinimaPercentual}%` : "—"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
