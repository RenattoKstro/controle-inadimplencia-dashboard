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
  const [valorCapital, setValorCapital] = useState<string>("3409.37");
  const [entrada, setEntrada] = useState<string>("");
  const [numParcelas, setNumParcelas] = useState<string>("20");
  const [descontoJuros, setDescontoJuros] = useState<string>("100");
  const [showRegras, setShowRegras] = useState(false);

  const capital = useMemo(() => parseFloat(valorCapital || "0"), [valorCapital]);
  const parcelas = useMemo(() => Math.max(1, parseInt(numParcelas || "1", 10)), [numParcelas]);
  const regra = useMemo(() => REGRAS[grupo][classificacao], [grupo, classificacao]);

  // JUROS COMPOSTOS: 2% a.m. por X meses
  const taxaMensal = 0.02;
  const totalComJuros = useMemo(() => {
    if (capital <= 0) return 0;
    return capital * Math.pow(1 + taxaMensal, parcelas);
  }, [capital, parcelas]);

  const jurosTotal = totalComJuros - capital;

  // MÍNIMO SEM JUROS
  const entradaMinimaSemJuros = capital * (ENTRADA_SEM_JUROS[classificacao] / 100);

  // MÍNIMO DO GRUPO
  const entradaMinimaGrupo = useMemo(() => {
    if (regra.permiteSemEntrada) return 0;
    if (regra.entradaMinimaPercentual) return capital * (regra.entradaMinimaPercentual / 100);
    if (regra.entradaIgualParcela) return totalComJuros / parcelas;
    return 0;
  }, [capital, regra, totalComJuros, parcelas]);

  const entradaAtual = parseFloat(entrada || "0");
  const atendeRegraGrupo = entradaAtual >= entradaMinimaGrupo || entradaMinimaGrupo === 0;
  const semJuros = entradaAtual >= entradaMinimaSemJuros;

  // CÁLCULOS FINAIS
  const carteiraPropria = Math.max(0, capital - entradaAtual);
  const totalAPagarSemDesconto = carteiraPropria + (semJuros ? 0 : jurosTotal);
  const jurosAplicado = semJuros ? 0 : jurosTotal * (1 - parseFloat(descontoJuros || "0") / 100);
  const totalPagar = carteiraPropria + jurosAplicado;
  const valorParcela = totalPagar / parcelas;

  // AUTO-PREENCHER
  const preencherEntradaMinima = () => {
    setEntrada(entradaMinimaGrupo.toFixed(2));
  };

  const mensagem = useMemo(() => {
    if (capital === 0) return "Digite o Valor Capital.";
    const status = semJuros ? "SEM JUROS!" : "com juros";
    return (
      `Proposta de Renegociação\n\n` +
      `Grupo: ${grupo} | ${classificacao}\n` +
      `Status: ${status}\n` +
      `Capital: ${formatBRL(capital)}\n` +
      `Juros (2% a.m. × ${parcelas} meses): ${formatBRL(jurosTotal)}\n` +
      `Entrada: ${formatBRL(entradaAtual)}\n` +
      `Juros Aplicados: ${semJuros ? "ISENTOS" : formatBRL(jurosAplicado)}\n` +
      `Carteira Própria: ${formatBRL(carteiraPropria)}\n` +
      `TOTAL: ${formatBRL(totalPagar)}\n` +
      `Parcela: ${parcelas}x de ${formatBRL(valorParcela)}\n\n` +
      `Aprova?`
    );
  }, [capital, grupo, classificacao, entradaAtual, semJuros, jurosTotal, jurosAplicado, carteiraPropria, totalPagar, parcelas, valorParcela]);

  const copiarMensagem = async () => {
    await navigator.clipboard.writeText(mensagem);
    alert("Mensagem copiada!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gradient-to-b from-gray-50 to-white">

      <div className="text-center">
        <h1 className="text-5xl font-black text-indigo-700">Renegociação 2% a.m.</h1>
        <p className="text-xl text-gray-600 mt-2">Juros compostos • Exato como o banco</p>
      </div>

      {/* GRUPO + CLASSIFICAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-4 border-indigo-500 bg-indigo-50">
          <CardHeader><CardTitle className="text-2xl">Grupo</CardTitle></CardHeader>
          <CardContent>
            <Select value={grupo} onValueChange={(v) => setGrupo(v as Grupo)}>
              <SelectTrigger className="text-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Grupo 1</SelectItem>
                <SelectItem value="2">Grupo 2</SelectItem>
                <SelectItem value="3">Grupo 3</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-4 border-purple-500 bg-purple-50">
          <CardHeader><CardTitle className="text-2xl">Classificação</CardTitle></CardHeader>
          <CardContent>
            <Select value={classificacao} onValueChange={(v) => setClassificacao(v as Classificacao)}>
              <SelectTrigger className="text-2xl"><SelectValue /></SelectTrigger>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <Card className="border-4 border-green-600 bg-gradient-to-br from-green-100 to-emerald-100 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-green-800 flex items-center gap-3">
              Valor Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={valorCapital}
              onChange={(e) => setValorCapital(e.target.value)}
              type="number"
              placeholder="0,00"
              className="text-6xl font-black text-green-700 text-center"
            />
            <div className="mt-6 p-6 bg-white/90 rounded-2xl border-4 border-green-400">
              <div className="flex justify-between text-2xl font-bold">
                <span>Juros Totais:</span>
                <span className="text-red-600">{formatBRL(jurosTotal)}</span>
              </div>
              <p className="text-center text-sm mt-3 text-gray-600">
                2% a.m. × {parcelas} meses (com capitalização)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-orange-600 bg-gradient-to-br from-orange-100 to-amber-100 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-orange-800 flex items-center gap-3">
              Parcelamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <Input
                value={numParcelas}
                onChange={(e) => setNumParcelas(e.target.value)}
                type="number"
                min="1"
                max="60"
                className="text-7xl font-black text-orange-700 text-center w-40"
              />
              <span className="text-6xl font-black text-orange-700">x</span>
            </div>
            <p className="text-center text-lg mt-4 text-orange-600 font-semibold">
              Digite qualquer quantidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ENTRADA */}
      {capital > 0 && (
        <Card className="border-4 border-blue-600 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-3xl text-blue-800">Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label className="text-xl">Valor da Entrada</Label>
                <Input
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                  type="number"
                  placeholder="0,00"
                  className="text-5xl font-bold mt-2"
                />
              </div>
              <Button
                onClick={preencherEntradaMinima}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-8 py-6"
              >
                <Zap className="h-8 w-8 mr-2" />
                Usar Mínimo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-8 rounded-3xl border-6 ${semJuros ? 'border-green-600 bg-green-100' : 'border-amber-500 bg-amber-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black flex items-center gap-4">
                    {semJuros ? <CheckCircle2 className="h-12 w-12 text-green-700" /> : <AlertCircle className="h-12 w-12 text-amber-700" />}
                    SEM JUROS
                  </span>
                  <span className="text-5xl font-black text-green-700">
                    {formatBRL(entradaMinimaSemJuros)}
                  </span>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-blue-100 border-6 border-blue-400">
                <p className="text-xl font-bold mb-3">Regra do Grupo {grupo}</p>
                <p className="text-2xl">
                  {regra.permiteSemEntrada && "Entrada opcional"}
                  {regra.entradaIgualParcela && `Entrada = 1 parcela`}
                  {regra.entradaMinimaPercentual && `Mínimo ${regra.entradaMinimaPercentual}%`}
                </p>
                <p className="text-3xl font-black mt-4 text-blue-700">
                  {formatBRL(entradaMinimaGrupo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RESUMO */}
      {capital > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center bg-gradient-to-b from-purple-100 to-white border-4 border-purple-600">
            <CardHeader><CardTitle className="text-2xl">Carteira Própria</CardTitle></CardHeader>
            <CardContent>
              <div className="text-6xl font-black text-purple-700">{formatBRL(carteiraPropria)}</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-gradient-to-b from-red-100 to-white border-4 border-red-600">
            <CardHeader><CardTitle className="text-2xl">Juros</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-6xl font-black ${semJuros ? 'text-green-600' : 'text-red-600'}`}>
                {semJuros ? "R$ 0,00" : formatBRL(jurosAplicado)}
              </div>
            </CardContent>
          </Card>

          <Card className="text-center bg-gradient-to-b from-emerald-100 to-white border-4 border-emerald-600">
            <CardHeader><CardTitle className="text-2xl">Total a Pagar</CardTitle></CardHeader>
            <CardContent>
              <div className="text-7xl font-black text-emerald-700">
                {formatBRL(totalPagar)}
              </div>
              <p className="text-3xl mt-4 text-emerald-600">
                {parcelas}x de {formatBRL(valorParcela)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MENSAGEM */}
      <Card className="border-4 border-gray-800">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Mensagem Pronta</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            readOnly
            value={mensagem}
            className="w-full min-h-80 p-8 rounded-3xl bg-gray-100 text-lg font-mono resize-none border-4 border-gray-300"
          />
        </CardContent>
      </Card>

      {/* BOTÕES */}
      <div className="flex flex-wrap gap-6 justify-center">
        <Button size="lg" variant="outline" onClick={() => {
          setValorCapital("");
          setEntrada("");
          setNumParcelas("20");
        }} className="text-xl px-10">
          Limpar
        </Button>
        <Button size="lg" onClick={copiarMensagem} className="text-2xl font-bold px-12 bg-green-600 hover:bg-green-700">
          Copiar Mensagem
        </Button>
        <Button size="lg" variant="secondary" onClick={() => setShowRegras(!showRegras)}>
          Regras <ChevronDown className="h-6 w-6 ml-2" />
        </Button>
      </div>
    </div>
  );
}
