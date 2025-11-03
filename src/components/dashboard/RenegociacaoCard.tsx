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
import { ChevronDown, CheckCircle2, AlertCircle, Zap } from "lucide-react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
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
  const [numParcelas, setNumParcelas] = useState<string>("20");
  const [descontoJuros, setDescontoJuros] = useState<string>("100");
  const [showRegras, setShowRegras] = useState(false);

  const capital = useMemo(() => parseFloat(valorCapital || "0"), [valorCapital]);
  const parcelas = useMemo(() => Math.max(1, parseInt(numParcelas || "1", 10)), [numParcelas]);
  const regra = useMemo(() => REGRAS[grupo][classificacao], [grupo, classificacao]);

  // JUROS FIXO: 2% do capital
  const jurosTotal = useMemo(() => capital * 0.02, [capital]);

  // MÍNIMO SEM JUROS
  const entradaMinimaSemJuros = useMemo(() => {
    return capital * (ENTRADA_SEM_JUROS[classificacao] / 100);
  }, [capital, classificacao]);

  // MÍNIMO DO GRUPO
  const entradaMinimaGrupo = useMemo(() => {
    if (regra.permiteSemEntrada) return 0;
    if (regra.entradaMinimaPercentual) return capital * (regra.entradaMinimaPercentual / 100);
    if (regra.entradaIgualParcela) {
      const totalComJuros = capital + jurosTotal;
      return totalComJuros / parcelas;
    }
    return 0;
  }, [capital, regra, jurosTotal, parcelas]);

  // VALIDAÇÕES
  const entradaAtual = parseFloat(entrada || "0");
  const atendeRegraGrupo = entradaAtual >= entradaMinimaGrupo || entradaMinimaGrupo === 0;
  const semJuros = entradaAtual >= entradaMinimaSemJuros;

  // CÁLCULOS
  const carteiraPropria = Math.max(0, capital - entradaAtual);
  const jurosAplicado = semJuros ? 0 : jurosTotal * (1 - parseFloat(descontoJuros || "0") / 100);
  const totalPagar = carteiraPropria + jurosAplicado;
  const valorParcela = totalPagar / parcelas;

  // AUTO-PREENCHER ENTRADA
  const preencherEntradaMinima = () => {
    setEntrada(entradaMinimaGrupo.toFixed(2));
  };

  const mensagem = useMemo(() => {
    if (capital === 0) return "Digite o Valor Capital para começar.";
    const status = semJuros ? "SEM JUROS!" : "com juros";
    return (
      `Olá! Proposta de renegociação:\n\n` +
      `Grupo: ${grupo} | Classificação: ${classificacao}\n` +
      `Status: ${status}\n` +
      `Valor Capital: ${formatBRL(capital)}\n` +
      `Juros (2%): ${formatBRL(jurosTotal)}\n` +
      `Entrada: ${formatBRL(entradaAtual)}\n` +
      `Juros Aplicados: ${semJuros ? "ISENTOS" : formatBRL(jurosAplicado)}\n` +
      `Carteira Própria: ${formatBRL(carteiraPropria)}\n` +
      `Total a Pagar: ${formatBRL(totalPagar)}\n` +
      `Parcelamento: ${parcelas}x de ${formatBRL(valorParcela)}\n\n` +
      `Precisa de outra opção? Só falar!`
    );
  }, [capital, grupo, classificacao, entradaAtual, semJuros, jurosAplicado, carteiraPropria, totalPagar, parcelas, valorParcela]);

  const copiarMensagem = async () => {
    await navigator.clipboard.writeText(mensagem);
    alert("Mensagem copiada com sucesso!");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">

      {/* TÍTULO */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">Renegociação 2% Juros</h1>
        <p className="text-lg text-muted-foreground mt-2">Entrada mínima automática • Parcelas editáveis</p>
      </div>

      {/* GRUPO + CLASSIFICAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-300 bg-blue-50/70">
          <CardHeader><CardTitle className="text-lg text-blue-700">Grupo</CardTitle></CardHeader>
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

        <Card className="border-2 border-purple-300 bg-purple-50/70">
          <CardHeader><CardTitle className="text-lg text-purple-700">Classificação</CardTitle></CardHeader>
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
        <Card className="border-3 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700 flex items-center gap-2">
              Valor Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={valorCapital}
              onChange={(e) => setValorCapital(e.target.value)}
              type="number"
              placeholder="0,00"
              className="text-5xl font-bold text-green-700 placeholder:text-green-300"
            />
            {capital > 0 && (
              <div className="mt-4 p-4 bg-white/90 rounded-xl border-2 border-green-300">
                <div className="flex justify-between text-lg font-medium">
                  <span>Juros (2%):</span>
                  <span className="text-red-600 font-bold">{formatBRL(jurosTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD: PARCELAMENTO EDITÁVEL */}
        <Card className="border-3 border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-700 flex items-center gap-2">
              Parcelamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input
                value={numParcelas}
                onChange={(e) => setNumParcelas(e.target.value)}
                type="number"
                min="1"
                max="60"
                className="text-5xl font-bold text-orange-700 text-center w-32"
              />
              <span className="text-3xl font-bold text-orange-700">x</span>
            </div>
            <p className="text-sm text-orange-600 mt-3 text-center">
              Digite qualquer número (1 a 60)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ENTRADA COM AUTO-PREENCHER */}
      {capital > 0 && (
        <Card className="border-3 border-indigo-400 bg-indigo-50/30">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700">Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Input
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                type="number"
                placeholder="0,00"
                className="text-4xl font-bold flex-1"
              />
              <Button
                onClick={preencherEntradaMinima}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2"
              >
                <Zap className="h-5 w-5" />
                Usar Mínimo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SEM JUROS */}
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

              {/* REGRA DO GRUPO */}
              <div className={`p-6 rounded-2xl ${atendeRegraGrupo ? 'bg-blue-50' : 'bg-red-50'} border-2`}>
                <strong className="text-xl block mb-3">Regra do Grupo {grupo}</strong>
                <p className="text-sm leading-relaxed">
                  {regra.permiteSemEntrada && "Entrada opcional"}
                  {regra.entradaIgualParcela && `Entrada = 1 parcela (${formatBRL(entradaMinimaGrupo)})`}
                  {regra.entradaMinimaPercentual && `Mínimo: ${regra.entradaMinimaPercentual}% (${formatBRL(entradaMinimaGrupo)})`}
                </p>
                <p className="text-xs mt-3 text-muted-foreground">
                  Clique em “Usar Mínimo” para preencher automaticamente
                </p>
              </div>
            </div>

            {!atendeRegraGrupo && entrada && (
              <p className="text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Entrada abaixo do mínimo exigido.
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

      {/* RESUMO */}
      {capital > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center bg-gradient-to-b from-blue-50 to-white shadow-xl">
            <CardHeader><CardTitle className="text-xl">Carteira Própria</CardTitle></CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-blue-600">{formatBRL(carteiraPropria)}</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-b from-red-50 to-white shadow-xl">
            <CardHeader><CardTitle className="text-xl">Juros</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-5xl font-bold ${semJuros ? 'text-green-600' : 'text-red-600'}`}>
                {semJuros ? "R$ 0,00" : formatBRL(jurosAplicado)}
              </div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-b from-emerald-50 to-white shadow-xl">
            <CardHeader><CardTitle className="text-xl">Total a Pagar</CardTitle></CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-emerald-600">
                {formatBRL(totalPagar)}
              </div>
              <p className="text-xl mt-3 text-emerald-700">
                {parcelas}x de {formatBRL(valorParcela)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MENSAGEM */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mensagem Pronta (WhatsApp)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            readOnly
            value={mensagem}
            className="w-full min-h-72 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-mono resize-none border-2 border-gray-300"
          />
        </CardContent>
      </Card>

      {/* BOTÕES */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button size="lg" variant="outline" onClick={() => {
          setValorCapital("");
          setEntrada("");
          setNumParcelas("20");
          setDescontoJuros("100");
        }}>
          Limpar Tudo
        </Button>
        <Button size="lg" onClick={copiarMensagem} className="text-lg font-bold bg-green-600 hover:bg-green-700">
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
        <Card className="border-3 border-indigo-400 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-indigo-700">Regras Oficiais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-green-600 text-xl mb-4">SEM JUROS</h3>
                {Object.entries(ENTRADA_SEM_JUROS).map(([cls, pct]) => (
                  <div key={cls} className="flex justify-between py-2 border-b">
                    <span>{cls}</span>
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
