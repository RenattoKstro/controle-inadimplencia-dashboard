import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// REGRAS SEM JUROS
const ENTRADA_SEM_JUROS: Record<Classificacao, number> = {
  "Bronze com atraso": 25,
  "Bronze": 25,
  "Prata": 20,
  "Ouro": 15,
  "Diamante": 10,
  "Premium": 8,
};

type Classificacao =
  | "Bronze com atraso"
  | "Bronze"
  | "Prata"
  | "Ouro"
  | "Diamante"
  | "Premium";

type Grupo = "1" | "2" | "3";

interface Regra {
  permiteSemEntrada?: boolean;
  entradaIgualParcela?: boolean;
  entradaMinimaPercentual?: number;
}

const REGRAS: Record<Grupo, Record<Classificacao, Regra>> = {
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
  const [valorCapital, setValorCapital] = useState<string>("");
  const [entrada, setEntrada] = useState<string>("");
  const [parcelas, setParcelas] = useState<string>("20"); // 20x padrão
  const [descontoJuros, setDescontoJuros] = useState<string>("100");
  const [showRegras, setShowRegras] = useState(false);

  const capital = useMemo(() => parseFloat(valorCapital || "0"), [valorCapital]);
  const entradaAtual = useMemo(() => parseFloat(entrada || "0"), [entrada]);
  const numParcelas = useMemo(() => parseInt(parcelas || "20", 10), [parcelas]);
  const regra = useMemo(() => REGRAS[grupo][classificacao], [grupo, classificacao]);

  // JUROS POR PARCELA (ex: 0.1% por parcela)
  const taxaPorParcela = 0.001; // 0.1% por parcela
  const jurosTotal = useMemo(() => {
    return capital > 0 ? +(capital * taxaPorParcela * numParcelas) : 0;
  }, [capital, numParcelas]);

  // MÍNIMO SEM JUROS
  const entradaMinimaSemJuros = useMemo(() => {
    return capital > 0 ? +(capital * (ENTRADA_SEM_JUROS[classificacao] / 100)) : 0;
  }, [capital, classificacao]);

  // MÍNIMO DO GRUPO
  const entradaMinimaGrupo = useMemo(() => {
    if (regra.permiteSemEntrada) return 0;
    if (regra.entradaMinimaPercentual) return +(capital * (regra.entradaMinimaPercentual / 100));
    return 0;
  }, [capital, regra]);

  // VALIDAÇÃO
  const atendeRegraGrupo = useMemo(() => {
    if (regra.permiteSemEntrada) return true;
    if (regra.entradaMinimaPercentual) return entradaAtual >= entradaMinimaGrupo;
    if (regra.entradaIgualParcela) {
      const totalComJuros = capital + jurosTotal;
      const parcela = totalComJuros / numParcelas;
      return Math.abs(entradaAtual - parcela) < 1;
    }
    return true;
  }, [entradaAtual, regra, entradaMinimaGrupo, capital, jurosTotal, numParcelas]);

  const semJuros = entradaAtual >= entradaMinimaSemJuros;

  // CÁLCULOS
  const carteiraPropria = Math.max(0, capital - entradaAtual);
  const jurosAplicado = semJuros ? 0 : +(jurosTotal * (1 - parseFloat(descontoJuros || "0") / 100));
  const totalPagar = +(carteiraPropria + jurosAplicado);
  const valorParcela = totalPagar / numParcelas;

  // LISTA DE PARCELAS
  const parcelasList = useMemo(() => {
    if (totalPagar <= 0) return [];
    return Array.from({ length: Math.min(numParcelas, 12) }, (_, i) => {
      const qtd = numParcelas - i;
      return { qtd, valor: +(totalPagar / qtd).toFixed(2) };
    });
  }, [totalPagar, numParcelas]);

  const mensagem = useMemo(() => {
    if (capital === 0) return "Preencha o Valor Capital para gerar a proposta.";
    const status = semJuros ? "SEM JUROS!" : "com juros";
    return (
      `Olá! Proposta de renegociação:\n\n` +
      `Grupo: ${grupo} | Classificação: ${classificacao}\n` +
      `Status: ${status}\n` +
      `Valor Capital: ${formatBRL(capital)}\n` +
      `Juros (${(taxaPorParcela * 100).toFixed(1)}% por parcela × ${numParcelas}x): ${formatBRL(jurosTotal)}\n` +
      `Entrada: ${formatBRL(entrada || "0")}\n` +
      `Juros Aplicados: ${semJuros ? "ISENTOS" : formatBRL(jurosAplicado)}\n` +
      `Carteira Própria: ${formatBRL(carteiraPropria)}\n` +
      `Total a Pagar: ${formatBRL(totalPagar)}\n` +
      `Parcelamento: ${numParcelas}x de ${formatBRL(valorParcela)}\n\n` +
      `Outras opções:\n` +
      parcelasList.map(p => `${p.qtd}x de ${formatBRL(p.valor)}`).join("\n")
    );
  }, [
    grupo, classificacao, capital, jurosTotal, entrada, semJuros,
    jurosAplicado, carteiraPropria, totalPagar, numParcelas, valorParcela, parcelasList
  ]);

  const copiarMensagem = async () => {
    await navigator.clipboard.writeText(mensagem);
    alert("Mensagem copiada com sucesso!");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* TÍTULO */}
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">
          Renegociação — Juros por Parcela
        </CardTitle>
      </CardHeader>

      {/* GRUPO + CLASSIFICAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30">
          <CardHeader>
            <CardTitle className="text-lg">Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={grupo} onValueChange={(v) => setGrupo(v as Grupo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Grupo 1</SelectItem>
                <SelectItem value="2">Grupo 2</SelectItem>
                <SelectItem value="3">Grupo 3</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30">
          <CardHeader>
            <CardTitle className="text-lg">Classificação</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* VALOR CAPITAL */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Valor Capital
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={valorCapital}
            onChange={(e) => setValorCapital(e.target.value)}
            type="number"
            placeholder="0,00"
            className="text-4xl font-bold text-green-700"
          />
          {capital > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-300">
              <div className="flex justify-between text-lg">
                <span>Juros ({numParcelas}x × 0,1%):</span>
                <span className="font-bold text-red-600">{formatBRL(jurosTotal)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PARCELAMENTO */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Parcelamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={parcelas} onValueChange={setParcelas}>
            <SelectTrigger className="text-2xl font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[6, 8, 10, 12, 15, 18, 20, 24].map(n => (
                <SelectItem key={n} value={n.toString()}>
                  {n}x parcelas
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            Padrão: 20x | Juros: 0,1% por parcela
          </p>
        </CardContent>
      </Card>

      {/* ENTRADA + REGRAS */}
      {capital > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              type="number"
              placeholder="Digite a entrada"
              className="text-2xl font-bold"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-5 rounded-xl border-4 ${semJuros ? 'border-green-500 bg-green-50' : 'border-amber-400 bg-amber-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    {semJuros ? <CheckCircle2 className="h-7 w-7 text-green-600" /> : <AlertCircle className="h-7 w-7 text-amber-600" />}
                    SEM JUROS
                  </span>
                  <span className="text-3xl font-bold text-green-700">
                    {formatBRL(entradaMinimaSemJuros)}
                  </span>
                </div>
                <p className="text-sm mt-2">{classificacao}: {ENTRADA_SEM_JUROS[classificacao]}%</p>
              </div>

              <div className={`p-5 rounded-xl ${atendeRegraGrupo ? 'bg-blue-50' : 'bg-red-50'}`}>
                <strong className="text-lg block mb-2">Regra do Grupo {grupo}</strong>
                <p className="text-sm">
                  {regra.permiteSemEntrada && "Entrada opcional"}
                  {regra.entradaIgualParcela && `Entrada = 1 parcela (${formatBRL(valorParcela)})`}
                  {regra.entradaMinimaPercentual && `Mínimo: ${regra.entradaMinimaPercentual}% (${formatBRL(entradaMinimaGrupo)})`}
                </p>
              </div>
            </div>

            {!atendeRegraGrupo && entrada && (
              <p className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Entrada não atende à regra do grupo.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* DESCONTO */}
      {capital > 0 && semJuros && (
        <Card className="bg-green-50 border-4 border-green-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              SEM JUROS ATIVADO!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Desconto sobre Juros (%)</Label>
            <Input value={descontoJuros} onChange={(e) => setDescontoJuros(e.target.value)} type="number" />
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* RESUMO */}
      {capital > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader><CardTitle>Carteira Própria</CardTitle></CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{formatBRL(carteiraPropria)}</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader><CardTitle>Juros</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${semJuros ? 'text-green-600' : 'text-red-600'}`}>
                {semJuros ? "R$ 0,00" : formatBRL(jurosAplicado)}
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader><CardTitle>Total a Pagar</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-5xl font-bold ${semJuros ? 'text-green-600' : 'text-blue-600'}`}>
                {formatBRL(totalPagar)}
              </div>
              <p className="text-sm mt-2">{numParcelas}x de {formatBRL(valorParcela)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MENSAGEM */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mensagem Pronta</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            readOnly
            value={mensagem}
            className="w-full min-h-[280px] p-5 rounded-xl bg-muted/5 dark:bg-muted/10 text-sm font-mono resize-none border-2"
          />
        </CardContent>
      </Card>

      {/* BOTÕES */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" variant="outline" onClick={() => {
          setValorCapital("");
          setEntrada("");
          setParcelas("20");
          setDescontoJuros("100");
        }}>
          Limpar Tudo
        </Button>
        <Button size="lg" onClick={copiarMensagem} className="font-bold text-lg">
          Copiar Mensagem
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setShowRegras(!showRegras)}
          className="flex items-center gap-2"
        >
          Regras <ChevronDown className={`h-5 w-5 transition ${showRegras ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* REGRAS */}
      {showRegras && (
        <Card className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Regras Oficiais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-green-600 mb-4">SEM JUROS</h3>
                {Object.entries(ENTRADA_SEM_JUROS).map(([cls, pct]) => (
                  <div key={cls} className="flex justify-between py-2 border-b">
                    <span>{cls}</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-bold text-blue-600 mb-4">COM JUROS</h3>
                {(["1", "2", "3"] as Grupo[]).map(g => (
                  <div key={g} className="mb-6">
                    <strong className="block mb-2">Grupo {g}</strong>
                    <ul className="text-sm space-y-1">
                      {Object.entries(REGRAS[g]).map(([cls, r]) => (
                        <li key={cls}>
                          <strong>{cls}:</strong> {r.permiteSemEntrada ? "Sem entrada" : r.entradaIgualParcela ? "Entrada = parcela" : `${r.entradaMinimaPercentual}%`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
