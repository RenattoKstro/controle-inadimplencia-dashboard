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
import { ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

function formatBRL(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value || "0") : value || 0;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

// REGRAS SEM JUROS (POR CLASSIFICAÇÃO)
const ENTRADA_SEM_JUROS: Record<Classificacao, number> = {
  "Bronze com atraso": 25,
  "Bronze": 25,
  "Prata": 20,
  "Ouro": 15,
  "Diamante": 10,
  "Premium": 8,
};

// REGRAS COM JUROS (POR GRUPO)
type Classificacao =
  | "Bronze com atraso"
  | "Bronze"
  | "Prata"
  | "Ouro"
  | "Diamante"
  | "Premium";

type Grupo = "1" | "2" | "3";

interface RegraJuros {
  entradaMinimaPercentual?: number;
  entradaIgualParcela?: boolean;
  permiteSemEntrada?: boolean;
}

const REGRAS_JUROS: Record<Grupo, Record<Classificacao, RegraJuros>> = {
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

  const total = useMemo(() => parseFloat(totalSemJuros || "0"), [totalSemJuros]);
  const regraJuros = useMemo(() => REGRAS_JUROS[grupo][classificacao], [grupo, classificacao]);

  // MÍNIMO PARA SEM JUROS
  const entradaMinimaSemJuros = useMemo(() => {
    return +(total * (ENTRADA_SEM_JUROS[classificacao] / 100));
  }, [total, classificacao]);

  // MÍNIMO PARA REGRA COM JUROS
  const entradaMinimaJuros = useMemo(() => {
    if (regraJuros.permiteSemEntrada) return 0;
    if (regraJuros.entradaMinimaPercentual) return +(total * (regraJuros.entradaMinimaPercentual / 100));
    return 0;
  }, [total, regraJuros]);

  const entradaAtual = useMemo(() => parseFloat(entrada || "0"), [entrada]);

  // VALIDAÇÕES
  const atendeSemJuros = entradaAtual >= entradaMinimaSemJuros;
  const atendeRegraJuros = useMemo(() => {
    if (regraJuros.permiteSemEntrada) return true;
    if (regraJuros.entradaMinimaPercentual) return entradaAtual >= entradaMinimaJuros;
    if (regraJuros.entradaIgualParcela) {
      const parcela = (total - entradaAtual + parseFloat(jurosTotal || "0")) / parseInt(maxParcelas || "1");
      return Math.abs(entradaAtual - parcela) < 1;
    }
    return true;
  }, [entradaAtual, regraJuros, entradaMinimaJuros, total, jurosTotal, maxParcelas]);

  // CÁLCULOS
  const carteiraPropria = Math.max(0, total - entradaAtual);
  const jurosAplicado = atendeSemJuros
    ? 0
    : +(parseFloat(jurosTotal || "0") * (1 - Math.max(0, Math.min(100, parseFloat(descontoJuros || "0"))) / 100));
  const totalPagar = +(carteiraPropria + jurosAplicado);

  const parcelasList = useMemo(() => {
    const max = Math.max(1, parseInt(maxParcelas || "20", 10));
    return Array.from({ length: Math.min(max, 12) }, (_, i) => {
      const qtd = max - i;
      return { qtd, valor: +(totalPagar / qtd).toFixed(2) };
    });
  }, [totalPagar, maxParcelas]);

  const mensagem = useMemo(() => {
    const status = atendeSemJuros ? "SEM JUROS!" : "com juros";
    return (
      `Olá! Proposta de renegociação:\n\n` +
      `Grupo: ${grupo} | Classificação: ${classificacao}\n` +
      `Status: ${status}\n` +
      `Total sem Juros: ${formatBRL(totalSemJuros)}\n` +
      `Entrada: ${formatBRL(entrada || "0")}\n` +
      `Juros: ${atendeSemJuros ? "ISENTOS" : formatBRL(jurosAplicado)}\n` +
      `Carteira Própria: ${formatBRL(carteiraPropria)}\n` +
      `Total a Pagar: ${formatBRL(totalPagar)}\n` +
      `Parcela (ex: ${maxParcelas}x): ${formatBRL(parcelasList[0]?.valor || 0)}\n\n` +
      `Opções:\n` +
      parcelasList.map(p => `${p.qtd}x de ${formatBRL(p.valor)}`).join("\n")
    );
  }, [grupo, classificacao, totalSemJuros, entrada, atendeSemJuros, jurosAplicado, carteiraPropria, totalPagar, maxParcelas, parcelasList]);

  const copiarMensagem = async () => {
    await navigator.clipboard.writeText(mensagem);
    alert("Mensagem copiada!");
  };

  return (
    <Card className="max-w-5xl mx-auto w-full bg-surface-50 dark:bg-surface-800">
      <div className="p-6 space-y-6">

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Renegociação — 2 Regras Simultâneas</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* GRUPO + CLASSIFICAÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
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

          {/* TOTAL + JUROS */}
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

          {/* ENTRADA + 2 REGRAS VISUAIS */}
          <div className="space-y-3 p-4 bg-muted/5 dark:bg-muted/10 rounded-lg">
            <Label>Entrada</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={entrada}
                onChange={e => setEntrada(e.target.value)}
                type="number"
                placeholder="Digite o valor da entrada"
                className="text-lg font-medium"
              />

              <div className="space-y-2">
                <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${atendeSemJuros ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'}`}>
                  <span className="text-sm font-semibold flex items-center gap-2">
                    {atendeSemJuros ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-orange-600" />}
                    Entrada mínima sem juros
                  </span>
                  <span className="font-bold text-lg">
                    {formatBRL(entradaMinimaSemJuros)}
                  </span>
                </div>

                <div className={`text-xs p-2 rounded ${atendeRegraJuros ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>
                  {regraJuros.permiteSemEntrada && "Entrada opcional"}
                  {regraJuros.entradaIgualParcela && `Entrada deve ser ≈ 1 parcela`}
                  {regraJuros.entradaMinimaPercentual && `Mínimo: ${regraJuros.entradaMinimaPercentual}% (${formatBRL(entradaMinimaJuros)})`}
                </div>
              </div>
            </div>

            {!atendeRegraJuros && entrada && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Entrada abaixo do mínimo exigido pela regra do grupo.
              </p>
            )}
          </div>

          {/* DESCONTO (SÓ SE ATINGIR SEM JUROS) */}
          {atendeSemJuros && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <span className="font-bold text-green-700 dark:text-green-400">SEM JUROS ATIVADO!</span>
              </div>
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
            </div>
          )}

          <Separator />

          {/* RESUMO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-card rounded-lg">
              <Label>Carteira Própria</Label>
              <div className="text-2xl font-bold text-primary mt-1">{formatBRL(carteiraPropria)}</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg">
              <Label>Juros Aplicados</Label>
              <div className={`text-2xl font-bold mt-1 ${atendeSemJuros ? 'text-green-600' : 'text-orange-600'}`}>
                {atendeSemJuros ? "R$ 0,00" : formatBRL(jurosAplicado)}
              </div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg">
              <Label>Total a Pagar</Label>
              <div className={`text-3xl font-bold mt-1 ${atendeSemJuros ? 'text-green-600' : 'text-blue-600'}`}>
                {formatBRL(totalPagar)}
              </div>
            </div>
          </div>

          {/* PARCELAS */}
          <div>
            <Label>Opções de Parcelamento</Label>
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {parcelasList.map(p => (
                <div key={p.qtd} className="p-3 rounded-lg border bg-card text-center hover:bg-accent transition">
                  <div className="font-bold text-sm">{p.qtd}x</div>
                  <div className="text-xs">{formatBRL(p.valor)}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* MENSAGEM */}
          <div>
            <Label>Mensagem Pronta</Label>
            <textarea
              readOnly
              value={mensagem}
              className="w-full mt-2 min-h-[180px] p-4 rounded-md bg-muted/5 dark:bg-muted/10 text-sm font-mono resize-none border"
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
            }}>
              Limpar
            </Button>
            <Button onClick={copiarMensagem}>
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
            <Button variant="ghost">
              WhatsApp
            </Button>
          </div>
        </CardFooter>

        {/* PAINEL DE REGRAS */}
        {showRegras && (
          <div className="border-t pt-6 space-y-6 text-sm bg-muted/5 dark:bg-muted/10 rounded-b-lg -m-6 p-6">
            <h3 className="font-bold text-xl">2 Regras Simultâneas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-green-600 mb-3">SEM JUROS (Classificação)</h4>
                <ul className="space-y-2">
                  {Object.entries(ENTRADA_SEM_JUROS).map(([cls, pct]) => (
                    <li key={cls} className="flex justify-between">
                      <span>{cls}</span>
                      <span className="font-bold">{pct}% → {formatBRL(total * pct / 100)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-blue-600 mb-3">COM JUROS (Grupo)</h4>
                {(["1", "2", "3"] as Grupo[]).map(g => (
                  <div key={g} className="mb-4">
                    <strong>Grupo {g}:</strong>
                    <ul className="text-xs ml-4 mt-1 space-y-1">
                      {Object.entries(REGRAS_JUROS[g]).map(([cls, r]) => (
                        <li key={cls}>
                          {cls}:{" "}
                          {r.permiteSemEntrada ? "Sem entrada" :
                           r.entradaIgualParcela ? "Entrada = 1 parcela" :
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
