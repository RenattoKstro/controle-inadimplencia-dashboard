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
import { ChevronDown, CheckCircle2, AlertCircle, Zap, Percent } from "lucide-react";

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

export default function RenegociacaoCard() {
  const [grupo, setGrupo] = useState<Grupo>("1");
  const [classificacao, setClassificacao] = useState<string>("Prata");
  const [capital, setCapital] = useState<string>("3409.37");
  const [entrada, setEntrada] = useState<string>("");
  const [parcelas, setParcelas] = useState<string>("20");
  const [jurosCorrecao, setJurosCorrecao] = useState<string>("1");
  const [jurosParcelamento, setJurosParcelamento] = useState<string>("2");
  const [desconto, setDesconto] = useState<string>("100");
  const [showRegras, setShowRegras] = useState(false);

  const cap = useMemo(() => parseFloat(capital || "0"), [capital]);
  const n = useMemo(() => Math.max(1, parseInt(parcelas || "1")), [parcelas]);
  const taxaCorrecao = useMemo(() => parseFloat(jurosCorrecao || "0") / 100, [jurosCorrecao]);
  const taxaParcelamento = useMemo(() => parseFloat(jurosParcelamento || "0") / 100, [jurosParcelamento]);
  const regra = REGRAS[grupo][classificacao] || {};

  // PASSO 1: Correção
  const capitalCorrigido = cap * (1 + taxaCorrecao);
  // PASSO 2: Juros compostos do parcelamento
  const totalComJuros = capitalCorrigido * Math.pow(1 + taxaParcelamento, n);
  const jurosTotal = totalComJuros - cap;

  const entradaMinSemJuros = cap * (ENTRADA_SEM_JUROS[classificacao] / 100);
  const entradaMinGrupo = regra.entradaMinimaPercentual ? cap * (regra.entradaMinimaPercentual / 100) :
                         regra.entradaIgualParcela ? totalComJuros / n : 0;

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
Correção (1%): +${formatBRL(cap * taxaCorrecao)}
Juros Parcelamento (2% a.m. × ${n}x): ${formatBRL(jurosTotal)}
Entrada: ${formatBRL(entradaNum)}
Juros Aplicados: ${semJuros ? "ISENTOS" : formatBRL(jurosAplicado)}
Carteira Própria: ${formatBRL(carteira)}
TOTAL: ${formatBRL(totalPagar)}
${n}x de ${formatBRL(parcela)}

Aprova?`;
  }, [cap, grupo, classificacao, entradaNum, semJuros, jurosTotal, jurosAplicado, carteira, totalPagar, n, parcela]);

  const copiar = () => { navigator.clipboard.writeText(mensagem); alert("Copiado!"); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-indigo-700 mb-3">
            Renegociação Pro
          </h1>
          <p className="text-xl text-indigo-600">Correção 1% + Parcelamento 2% a.m.</p>
        </div>

        {/* CONFIGURAÇÕES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur shadow-xl border-2 border-indigo-200">
            <CardHeader><CardTitle className="text-xl text-indigo-700">Grupo</CardTitle></CardHeader>
            <CardContent>
              <Select value={grupo} onValueChange={setGrupo}>
                <SelectTrigger className="h-14 text-2xl"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem></SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur shadow-xl border-2 border-purple-200">
            <CardHeader><CardTitle className="text-xl text-purple-700">Classificação</CardTitle></CardHeader>
            <CardContent>
              <Select value={classificacao} onValueChange={setClassificacao}>
                <SelectTrigger className="h-14 text-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(ENTRADA_SEM_JUROS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur shadow-xl border-2 border-orange-200">
            <CardHeader><CardTitle className="text-xl text-orange-700">Parcelas</CardTitle></CardHeader>
            <CardContent>
              <Input value={parcelas} onChange={e => setParcelas(e.target.value)} type="number" className="h-14 text-4xl font-bold text-center text-orange-700" />
            </CardContent>
          </Card>
        </div>

        {/* JUROS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-4 border-amber-400 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3 text-amber-800">
                <Percent className="h-8 w-8" /> Juros Correção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input value={jurosCorrecao} onChange={e => setJurosCorrecao(e.target.value)} type="number" step="0.1" className="text-5xl font-black text-center text-amber-700" suffix="%" />
              <p className="text-center text-amber-600 mt-2">Aplicado uma vez no capital</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-4 border-red-400 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3 text-red-800">
                <Percent className="h-8 w-8" /> Juros Parcelamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input value={jurosParcelamento} onChange={e => setJurosParcelamento(e.target.value)} type="number" step="0.1" className="text-5xl font-black text-center text-red-700" suffix="%" />
              <p className="text-center text-red-600 mt-2">Composto por {n} meses</p>
            </CardContent>
          </Card>
        </div>

        {/* CAPITAL + ENTRADA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gradient-to-br from-emerald-100 to-teal-100 border-4 border-emerald-500 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl text-emerald-800">Valor Capital</CardTitle>
            </CardHeader>
            <CardContent>
              <Input value={capital} onChange={e => setCapital(e.target.value)} type="number" className="text-7xl font-black text-center text-emerald-700" />
              <div className="mt-6 p-6 bg-white/80 rounded-3xl border-4 border-emerald-400">
                <div className="grid grid-cols-2 gap-4 text-xl">
                  <div><strong>Correção:</strong></div>
                  <div className="text-right text-amber-700">{formatBRL(cap * taxaCorrecao)}</div>
                  <div><strong>Juros Total:</strong></div>
                  <div className="text-right text-red-700 font-black">{formatBRL(jurosTotal)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-blue-500 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl text-blue-800">Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Input value={entrada} onChange={e => setEntrada(e.target.value)} type="number" placeholder="0,00" className="text-5xl font-bold flex-1" />
                <Button onClick={preencherMinimo} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xl px-8">
                  <Zap className="h-6 w-6 mr-2" /> Mínimo
                </Button>
              </div>

              <div className={`p-6 rounded-3xl border-4 ${semJuros ? 'border-green-600 bg-green-100' : 'border-amber-500 bg-amber-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black flex items-center gap-3">
                    {semJuros ? <CheckCircle2 className="h-10 w-10 text-green-700" /> : <AlertCircle className="h-10 w-10 text-amber-700" />}
                    SEM JUROS
                  </span>
                  <span className="text-4xl font-black text-green-700">{formatBRL(entradaMinSemJuros)}</span>
                </div>
              </div>

              <div className={`p-6 rounded-3xl ${atendeGrupo ? 'bg-blue-100' : 'bg-red-100'} border-4 border-blue-400`}>
                <p className="text-xl font-bold">Regra Grupo {grupo}</p>
                <p className="text-3xl font-black mt-3 text-blue-700">{formatBRL(entradaMinGrupo)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Carteira Própria", value: carteira, color: "from-purple-100 to-purple-50", border: "border-purple-600" },
            { label: "Juros Aplicados", value: jurosAplicado, color: "from-red-100 to-red-50", border: "border-red-600", zero: "R$ 0,00" },
            { label: "Total a Pagar", value: totalPagar, color: "from-emerald-100 to-emerald-50", border: "border-emerald-600", parcela: true }
          ].map((item, i) => (
            <Card key={i} className={`bg-gradient-to-b ${item.color} border-4 ${item.border} shadow-2xl`}>
              <CardHeader><CardTitle className="text-2xl text-center">{item.label}</CardTitle></CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-black">
                  {item.zero && semJuros ? item.zero : formatBRL(item.value)}
                </div>
                {item.parcela && <p className="text-3xl mt-4 text-emerald-700">{n}x de {formatBRL(parcela)}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DESCONTO */}
        {semJuros && (
          <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-600 mb-8">
            <CardHeader>
              <CardTitle className="text-3xl text-green-800 flex items-center gap-4">
                <CheckCircle2 className="h-12 w-12" /> SEM JUROS ATIVADO!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-xl">Desconto sobre Juros (%)</Label>
              <Input value={desconto} onChange={e => setDesconto(e.target.value)} type="number" className="text-4xl text-center mt-3" />
            </CardContent>
          </Card>
        )}

        {/* MENSAGEM */}
        <Card className="bg-white/95 backdrop-blur border-4 border-gray-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-gray-800">Mensagem para WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea readOnly value={mensagem} className="w-full min-h-80 p-8 text-lg font-mono bg-gray-50 rounded-3xl border-4 border-gray-300 resize-none" />
          </CardContent>
        </Card>

        {/* BOTÕES */}
        <div className="flex flex-wrap gap-6 justify-center mt-10">
          <Button size="lg" variant="outline" onClick={() => { setCapital(""); setEntrada(""); setParcelas("20"); }} className="text-xl px-10">
            Limpar
          </Button>
          <Button size="lg" onClick={copiar} className="text-2xl font-bold px-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            Copiar Mensagem
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setShowRegras(!showRegras)} className="text-xl">
            Regras <ChevronDown className="h-6 w-6 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
