import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, CheckCircle2, AlertCircle, Zap, Percent } from "lucide-react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const ENTRADA_SEM_JUROS: Record<string, number> = {
  "Bronze com atraso": 25,
  "Bronze": 25,
  "Prata": 20,
  "Ouro": 15,
  "Diamante": 10,
  "Premium": 8,
};

type Grupo = "1" | "2" | "3";

const REGRAS: Record<Grupo, Record<string, any>> = {
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

const TAXA_PARCELAMENTO = 0.02; // 2% a.m.

export default function RenegociacaoCard() {
  const [grupo, setGrupo] = useState<Grupo>("1");
  const [classificacao, setClassificacao] = useState<string>("Prata");
  const [capital, setCapital] = useState<string>("3409.37");
  const [valorCorrigido, setValorCorrigido] = useState<string>("0");
  const [entrada, setEntrada] = useState<string>("");
  const [parcelas, setParcelas] = useState<string>("20");
  const [desconto, setDesconto] = useState<string>("100");

  const cap = useMemo(() => parseFloat(capital || "0"), [capital]);
  const valorCorrigidoNum = useMemo(() => parseFloat(valorCorrigido || "0"), [valorCorrigido]);
  const n = useMemo(() => Math.max(1, parseInt(parcelas || "1")), [parcelas]);
  const regra = REGRAS[grupo][classificacao] || {};

  // CÁLCULO: juros sobre o valor corrigido digitado
  const totalComJuros = valorCorrigidoNum * Math.pow(1 + TAXA_PARCELAMENTO, n);
  const jurosTotal = totalComJuros - cap;

  const entradaMinSemJuros = cap * (ENTRADA_SEM_JUROS[classificacao] / 100);
  const entradaMinGrupo = regra.entradaMinimaPercentual
    ? cap * (regra.entradaMinimaPercentual / 100)
    : regra.entradaIgualParcela
    ? totalComJuros / n
    : 0;

  const entradaNum = parseFloat(entrada || "0");
  const semJuros = entradaNum >= entradaMinSemJuros;
  const atendeGrupo = entradaNum >= entradaMinGrupo || entradaMinGrupo === 0;

  const carteira = Math.max(0, cap - entradaNum);
  const jurosAplicado = semJuros ? 0 : jurosTotal * (1 - parseFloat(desconto || "0") / 100);
  const totalPagar = carteira + jurosAplicado;
  const parcela = totalPagar / n;

  const preencherMinimo = () => setEntrada(entradaMinGrupo.toFixed(2));

  const mensagem = useMemo(() => {
    if (!cap) return "Preencha o capital.";
    return `Proposta de Renegociação

Grupo: ${grupo} | ${classificacao}
Capital: ${formatBRL(cap)}
Valor Corrigido: ${formatBRL(valorCorrigidoNum)}
Juros 2% a.m. × ${n}x: ${formatBRL(jurosTotal)}
Entrada: ${formatBRL(entradaNum)}
Juros Aplicados: ${semJuros ? "ISENTOS" : formatBRL(jurosAplicado)}
Carteira Própria: ${formatBRL(carteira)}
TOTAL: ${formatBRL(totalPagar)}
${n}x de ${formatBRL(parcela)}

Aprova?`;
  }, [cap, grupo, classificacao, valorCorrigidoNum, entradaNum, semJuros, jurosTotal, jurosAplicado, carteira, totalPagar, n, parcela]);

  const copiar = () => {
    navigator.clipboard.writeText(mensagem);
    alert("Mensagem copiada!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Renegociação Pro
          </h1>
          <p className="text-xl text-gray-700 mt-2">Correção manual + Parcelamento 2% a.m.</p>
        </div>

        {/* JUROS FIXOS */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-red-100 border-2 border-red-500 rounded-full px-5 py-2 shadow-md">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-red-700" />
              <span className="font-bold text-red-800">Parcelamento: 2% a.m.</span>
            </div>
          </div>
        </div>

        {/* CONFIGS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur shadow-xl border-2 border-indigo-300">
            <CardHeader><CardTitle className="text-lg">Grupo</CardTitle></CardHeader>
            <CardContent>
              <Select value={grupo} onValueChange={setGrupo}>
                <SelectTrigger className="h-12 text-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur shadow-xl border-2 border-purple-300">
            <CardHeader><CardTitle className="text-lg">Classificação</CardTitle></CardHeader>
            <CardContent>
              <Select value={classificacao} onValueChange={setClassificacao}>
                <SelectTrigger className="h-12 text-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(ENTRADA_SEM_JUROS).map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur shadow-xl border-2 border-orange-300">
            <CardHeader><CardTitle className="text-lg">Parcelas</CardTitle></CardHeader>
            <CardContent>
              <Input
                value={parcelas}
                onChange={e => setParcelas(e.target.value)}
                type="number"
                className="h-12 text-3xl font-bold text-center text-orange-700"
              />
            </CardContent>
          </Card>
        </div>

        {/* CAPITAL + VALOR CORRIGIDO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* VALOR CAPITAL */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-4 border-emerald-500 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-800">Valor Capital</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={capital}
                onChange={e => setCapital(e.target.value)}
                type="number"
                placeholder="0,00"
                className="text-6xl font-black text-center text-emerald-700 mb-4"
              />
              <div className="bg-white/90 rounded-2xl p-5 border-2 border-emerald-300">
                <p className="text-center text-lg font-medium text-gray-700">Valor original</p>
                <p className="text-center text-4xl font-black text-emerald-700">
                  {formatBRL(cap)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* VALOR CORRIGIDO (EDITÁVEL) */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-4 border-amber-500 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-800 flex items-center gap-3">
                Valor Corrigido
                <span className="text-xs font-normal bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
                  Digite manualmente
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={valorCorrigido}
                onChange={e => setValorCorrigido(e.target.value)}
                type="number"
                placeholder="0,00"
                className="text-6xl font-black text-center text-amber-700 mb-4"
              />
              <div className="bg-white/90 rounded-2xl p-5 border-2 border-amber-400">
                <p className="text-center text-lg font-medium text-gray-700">
                  Base para cálculo de juros
                </p>
                <p className="text-center text-4xl font-black text-amber-700">
                  {formatBRL(valorCorrigidoNum)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ENTRADA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-4 border-blue-500 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-800">Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-3">
                <Input
                  value={entrada}
                  onChange={e => setEntrada(e.target.value)}
                  type="number"
                  placeholder="0,00"
                  className="text-4xl font-bold flex-1"
                />
                <Button
                  onClick={preencherMinimo}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold"
                >
                  <Zap className="h-5 w-5 mr-2" /> Mínimo
                </Button>
              </div>

              <div className={`p-5 rounded-2xl border-4 ${semJuros ? 'border-green-600 bg-green-100' : 'border-amber-500 bg-amber-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold flex items-center gap-2">
                    {semJuros ? <CheckCircle2 className="h-8 w-8 text-green-700" /> : <AlertCircle className="h-8 w-8 text-amber-700" />}
                    SEM JUROS
                  </span>
                  <span className="text-3xl font-black text-green-700">
                    {formatBRL(entradaMinSemJuros)}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-100 border-4 border-blue-400">
                <p className="text-lg font-bold">Regra do Grupo {grupo}</p>
                <p className="text-2xl font-black mt-2 text-blue-700">
                  {formatBRL(entradaMinGrupo)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center bg-gradient-to-b from-purple-50 to-white border-4 border-purple-600 shadow-xl">
            <CardHeader><CardTitle>Carteira Própria</CardTitle></CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-purple-700">{formatBRL(carteira)}</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-b from-red-50 to-white border-4 border-red-600 shadow-xl">
            <CardHeader><CardTitle>Juros</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-5xl font-black ${semJuros ? 'text-green-600' : 'text-red-600'}`}>
                {semJuros ? "R$ 0,00" : formatBRL(jurosAplicado)}
              </div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-b from-emerald-50 to-white border-4 border-emerald-600 shadow-xl">
            <CardHeader><CardTitle>Total a Pagar</CardTitle></CardHeader>
            <CardContent>
              <div className="text-6xl font-black text-emerald-700">{formatBRL(totalPagar)}</div>
              <p className="text-2xl mt-3 text-emerald-600">{n}x de {formatBRL(parcela)}</p>
            </CardContent>
          </Card>
        </div>

        {/* DESCONTO */}
        {semJuros && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-100 border-4 border-green-600 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-3">
                <CheckCircle2 className="h-10 w-10" /> SEM JUROS ATIVADO!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-lg">Desconto sobre Juros (%)</Label>
              <Input
                value={desconto}
                onChange={e => setDesconto(e.target.value)}
                type="number"
                className="text-3xl text-center mt-2"
              />
            </CardContent>
          </Card>
        )}

        {/* MENSAGEM */}
        <Card className="bg-white/95 backdrop-blur border-4 border-gray-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Mensagem WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              readOnly
              value={mensagem}
              className="w-full min-h-72 p-6 text-base font-mono bg-gray-50 rounded-2xl border-2 border-gray-300 resize-none"
            />
          </CardContent>
        </Card>

        {/* BOTÕES */}
        <div className="flex flex-wrap gap-5 justify-center mt-10">
          <Button size="lg" variant="outline" onClick={() => {
            setCapital("");
            setValorCorrigido("0");
            setEntrada("");
            setParcelas("20");
          }}>
            Limpar
          </Button>
          <Button size="lg" onClick={copiar} className="text-xl font-bold px-12 bg-gradient-to-r from-green-600 to-emerald-600">
            Copiar Mensagem
          </Button>
        </div>
      </div>
    </div>
  );
}
