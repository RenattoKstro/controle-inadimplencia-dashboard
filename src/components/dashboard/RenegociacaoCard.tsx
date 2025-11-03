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

  // JUROS: 0,1% por parcela
  const taxaPorParcela = 0.001;
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
  const valorParcela = totalPagar > 0 ? +(totalPagar / numParcelas).toFixed(2) : 0;

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
      `Juros (0,1% × ${numParcelas}x): ${formatBRL(jurosTotal)}\n` +
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
    alert("Mensagem copiada!");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">

      {/* TÍTULO */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">
          Renegociação Inteligente
        </h1>
        <p className="text-muted-foreground mt-2">Juros por parcela • 20x padrão</p>
      </div>

      {/* GRUPO + CLASSIFICAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-700">Grupo</CardTitle>
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

        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-purple-700">Classificação</CardTitle>
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

      {/* 2 CARDS LADO A LADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD: VALOR CAPITAL */}
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-green-700">
              Valor Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={valorCapital}
              onChange={(e) => setValorCapital(e.target.value)}
              type="number"
              placeholder="0,00"
              className="text-4xl font-bold text-green-700 placeholder:text-green-300"
            />
            {capital > 0 && (
              <div className="mt-4 p-3 bg-white/80 rounded-lg border border-green-200">
                <div className="flex justify-between text-sm">
                  <span>Juros totais:</span>
                  <span className="font-bold text-red-600">{formatBRL(jurosTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD: PARCELAMENTO */}
        <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-orange-700">
              Parcelamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={parcelas} onValueChange={setParcelas}>
              <SelectTrigger className="text-3xl font-bold text-orange-700">
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
            <p className="text-xs text-orange-600 mt-3 text-center">
              0,1% de juros por parcela • Padrão: 20x
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ENTRADA */}
      {capital > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Entrada</CardTitle>
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
              <div className={`p-6 rounded-2xl border-4 ${semJuros ? 'border-green-500 bg-green-50' : 'border-amber-400 bg-amber-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold flex items-center gap-3">
                    {semJuros ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : <AlertCircle className="h-8 w-8 text-amber-600" />}
                    SEM JUROS
                  </span>
                  <span className="text-4xl font-bold text-green-700">
                    {formatBRL(entradaMinimaSemJuros)}
                  </span>
                </div>
                <p className="text-sm mt-2 opacity-80">
                  {classificacao}: {ENTRADA_SEM_JUROS[classificacao]}% do capital
                </p>
              </div>

              <div className={`p-6 rounded-2xl ${atendeRegraGrupo ? 'bg-blue-50' : 'bg-red-50'}`}>
                <strong className="text-xl block mb-3">Regra do Grupo {grupo}</strong>
                <p className="text-sm leading-relaxed">
                  {regra.permiteSemEntrada && "Entrada opcional"}
                  {regra.entradaIgualParcela && `Entrada deve ser ≈ 1 parcela (${formatBRL(valorParcela)})`}
                  {regra.entradaMinimaPercentual && `Mínimo: ${regra.entradaMinimaPercentual}% (${formatBRL(entradaMinimaGrupo)})`}
                </p>
              </div>
            </div>

            {!atendeRegraGrupo && entrada && (
              <p className="text-red-600 font-medium flex items-center gap-2">
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
            <CardTitle className="text-3xl flex items-center gap-3 text-green-700">
              <CheckCircle2 className="h-10 w-10" />
              SEM JUROS ATIVADO!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-lg">Desconto sobre Juros (%)</Label>
            <Input value={descontoJuros} onChange={(e) => setDescontoJuros(e.target.value)} type="number" className="text-2xl" />
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* RESUMO FINANCEIRO */}
      {capital > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center bg-gradient-to-b from-blue-50 to-white">
            <CardHeader><CardTitle className="text-xl">Carteira Própria</CardTitle></CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-blue-600">{formatBRL(carteiraPropria)}</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-b from-red-50 to-white">
            <CardHeader><CardTitle className="text-xl">Juros</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-5xl font-bold ${semJuros ? 'text-green-600' : 'text-red-600'}`}>
                {semJuros ? "R$ 0,00" : formatBRL(jurosAplicado)}
              </div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-b from-emerald-50 to-white">
            <CardHeader><CardTitle className="text-xl">Total a Pagar</CardTitle></CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-emerald-600">
                {formatBRL(totalPagar)}
              </div>
              <p className="text-lg mt-2 text-emerald-700">
                {numParcelas}x de {formatBRL(valorParcela)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MENSAGEM PRONTA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mensagem para WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            readOnly
            value={mensagem}
            className="w-full min-h-64 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-mono resize-none border-2 border-gray-200"
          />
        </CardContent>
      </Card>

      {/* BOTÕES */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button size="lg" variant="outline" onClick={() => {
          setValorCapital("");
          setEntrada("");
          setParcelas("20");
          setDescontoJuros("100");
        }}>
          Limpar Tudo
        </Button>
        <Button size="lg" onClick={copiarMensagem} className="text-lg font-bold">
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
        <Card className="border-2 border-indigo-300 bg-indigo-50/30">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-indigo-700">
              Regras Oficiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-green-600 text-xl mb-4">SEM JUROS</h3>
                {Object.entries(ENTRADA_SEM_JUROS).map(([cls, pct]) => (
                  <div key={cls} className="flex justify-between py-2 border-b border-green-200">
                    <span className="font-medium">{cls}</span>
                    <span className="font-bold text-green-600">{pct}%</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-bold text-blue-600 text-xl mb-4">COM JUROS</h3>
                {(["1", "2", "3"] as Grupo[]).map(g => (
                  <div key={g} className="mb-6 bg-white p-4 rounded-lg shadow">
                    <strong className="block text-lg mb-2">Grupo {g}</strong>
                    <ul className="text-sm space-y-1">
                      {Object.entries(REGRAS[g]).map(([cls, r]) => (
                        <li key={cls}>
                          <strong>{cls}:</strong>{" "}
                          {r.permiteSemEntrada ? "Sem entrada" :
                           r.entradaIgualParcela ? "Entrada = 1 parcela" :
                           `${r.entradaMinimaPercentual}% do capital`}
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
