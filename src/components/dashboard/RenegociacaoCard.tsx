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
import { CheckCircle2, AlertCircle, Zap, Percent } from "lucide-react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const ENTRADA_SEM_JUROS: Record<string, number> = {
  "Bronze com atraso": 25, "Bronze": 25, "Prata": 20,
  "Ouro": 15, "Diamante": 10, "Premium": 8,
};

type Grupo = "1" | "2" | "3";

const REGRAS: Record<Grupo, Record<string, any>> = {
  "1": { "Bronze com atraso": { entradaIgualParcela: true }, "Bronze": { entradaIgualParcela: true }, "Prata": { permiteSemEntrada: true }, "Ouro": { permiteSemEntrada: true }, "Diamante": { permiteSemEntrada: true }, "Premium": { permiteSemEntrada: true } },
  "2": { "Bronze com atraso": { entradaIgualParcela: true }, "Bronze": { entradaIgualParcela: true }, "Prata": { permiteSemEntrada: true }, "Ouro": { permiteSemEntrada: true }, "Diamante": { permiteSemEntrada: true }, "Premium": { permiteSemEntrada: true } },
  "3": { "Bronze com atraso": { entradaMinimaPercentual: 10 }, "Bronze": { entradaMinimaPercentual: 10 }, "Prata": { entradaIgualParcela: true }, "Ouro": { permiteSemEntrada: true }, "Diamante": { permiteSemEntrada: true }, "Premium": { permiteSemEntrada: true } },
};

const TAXA_JUROS_SIMPLES = 0.02; // 2% ao mês

export default function RenegociacaoCard() {
  const [grupo, setGrupo] = useState<Grupo>("1");
  const [classificacao, setClassificacao] = useState<string>("Prata");
  const [capital, setCapital] = useState<string>("3409.37");
  const [valorCorrigido, setValorCorrigido] = useState<string>("3845.41");
  const [entrada, setEntrada] = useState<string>("340.94");
  const [parcelas, setParcelas] = useState<string>("20");
  const [desconto, setDesconto] = useState<string>("100");

  const cap = useMemo(() => parseFloat(capital || "0"), [capital]);
  const valorCorrigidoNum = useMemo(() => parseFloat(valorCorrigido || "0"), [valorCorrigido]);
  const entradaNum = useMemo(() => parseFloat(entrada || "0"), [entrada]);
  const n = useMemo(() => Math.max(1, parseInt(parcelas || "1")), [parcelas]);
  const regra = REGRAS[grupo][classificacao] || {};

  // JUROS SIMPLES: 2% ao mês × número de parcelas
  const jurosTotal = valorCorrigidoNum * TAXA_JUROS_SIMPLES * n;

  // Total a pagar = Valor Corrigido + Juros
  const totalAPagar = valorCorrigidoNum + jurosTotal;

  // Valor parcelado = Total - Entrada
  const totalParcelado = totalAPagar - entradaNum;

  // Valor da parcela
  const valorParcela = totalParcelado / n;

  // Entrada mínima para SEM JUROS
  const entradaMinSemJuros = cap * (ENTRADA_SEM_JUROS[classificacao] / 100);

  // Regra do grupo
  const entradaMinGrupo = regra.entradaMinimaPercentual
    ? cap * (regra.entradaMinimaPercentual / 100)
    : regra.entradaIgualParcela
    ? totalParcelado / n
    : 0;

  const semJuros = entradaNum >= entradaMinSemJuros;
  const atendeGrupo = entradaNum >= entradaMinGrupo || entradaMinGrupo === 0;

  // Juros aplicados (com desconto)
  const jurosAplicado = semJuros ? 0 : jurosTotal * (1 - parseFloat(desconto || "0") / 100);
  const totalFinal = valorCorrigidoNum + jurosAplicado;
  const totalParceladoFinal = totalFinal - entradaNum;
  const parcelaFinal = totalParceladoFinal / n;

  const preencherMinimo = () => setEntrada(entradaMinGrupo.toFixed(2));

  const mensagem = useMemo(() => {
    if (!cap) return "Preencha o capital.";
    return `Proposta de Renegociação

Grupo: ${grupo} | ${classificacao}
Capital: ${formatBRL(cap)}
Valor Corrigido: ${formatBRL(valorCorrigidoNum)}
Juros Simples (2% a.m. × ${n} meses): ${formatBRL(jurosTotal)}
Entrada: ${formatBRL(entradaNum)}
Juros Aplicados: ${semJuros ? "ISENTOS" : formatBRL(jurosAplicado)}
Total a Pagar: ${formatBRL(totalFinal)}
Total Parcelado: ${formatBRL(totalParceladoFinal)}
${n}x de ${formatBRL(parcelaFinal)}

Aprova?`;
  }, [cap, grupo, classificacao, valorCorrigidoNum, entradaNum, n, jurosTotal, semJuros, jurosAplicado, totalFinal, totalParceladoFinal, parcelaFinal]);

  const copiar = () => {
    navigator.clipboard.writeText(mensagem);
    alert("Mensagem copiada!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Renegociação Pro
          </h1>
          <p className="text-xl text-gray-700 mt-2">Juros Simples 2% a.m.</p>
        </div>

        {/* JUROS FIXOS */}
        <div className="flex justify-center mb-8">
          <div className="bg-red-100 border-2 border-red-500 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <Percent className="h-6 w-6 text-red-700" />
              <span className="font-bold text-red-800 text-lg">Juros Simples: 2% ao mês</span>
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
              <div className="bg-white/90 rounded-2xl p-5 border-2 border-emerald-300 text-center">
                <p className="text-4xl font-black text-emerald-700">{formatBRL(cap)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-4 border-amber-500 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-800">Valor Corrigido</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={valorCorrigido}
                onChange={e => setValorCorrigido(e.target.value)}
                type="number"
                placeholder="0,00"
                className="text-6xl font-black text-center text-amber-700 mb-4"
              />
              <div className="bg-white/90 rounded-2xl p-5 border-2 border-amber-400 text-center">
                <p className="text-4xl font-black text-amber-700">{formatBRL(valorCorrigidoNum)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ENTRADA */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-4 border-blue-500 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
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
                <Zap className="h-6 w-6 mr-2" /> Mínimo
              </Button>
            </div>

            <div className={`p-6 rounded-3xl border-4 ${semJuros ? 'border-green-600 bg-green-100' : 'border-amber-500 bg-amber-100'}`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold flex items-center gap-3">
                  {semJuros ? <CheckCircle2 className="h-10 w-10 text-green-700" /> : <AlertCircle className="h-10 w-10 text-amber-700" />}
                  SEM JUROS
                </span>
                <span className="text-4xl font-black text-green-700">
                  {formatBRL(entradaMinSemJuros)}
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-blue-100 border-4 border-blue-400">
              <p className="text-xl font-bold">Regra do Grupo {grupo}</p>
              <p className="text-3xl font-black mt-3 text-blue-700">
                {formatBRL(entradaMinGrupo)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center bg-gradient-to-b from-purple-50 to-white border-4 border-purple-600 shadow-xl">
            <CardHeader><CardTitle>Carteira Própria</CardTitle></CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-purple-700">
                {formatBRL(cap - entradaNum)}
              </div>
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
              <div className="text-6xl font-black text-emerald-700">
                {formatBRL(totalFinal)}
              </div>
              <p className="text-2xl mt-3 text-emerald-600">
                {n}x de {formatBRL(parcelaFinal)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* MENSAGEM */}
        <Card className="bg-white/95 backdrop-blur border-4 border-gray-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Mensagem WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              readOnly
              value={mensagem}
              className="w-full min-h-80 p-8 text-base font-mono bg-gray-50 rounded-3xl border-2 border-gray-300 resize-none"
            />
          </CardContent>
        </Card>

        {/* BOTÕES */}
        <div className="flex flex-wrap gap-6 justify-center mt-10">
          <Button size="lg" variant="outline" onClick={() => {
            setCapital("3409.37");
            setValorCorrigido("3845.41");
            setEntrada("340.94");
            setParcelas("20");
          }}>
            Exemplo
          </Button>
          <Button size="lg" onClick={copiar} className="text-2xl font-bold px-16 bg-gradient-to-r from-green-600 to-emerald-600">
            Copiar Mensagem
          </Button>
        </div>
      </div>
    </div>
  );
}
