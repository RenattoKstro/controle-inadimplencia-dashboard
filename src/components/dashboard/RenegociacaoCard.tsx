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
  const [valorCapital, setValorCapital] = useState<string>(""); // ← ZERADO
  const [entrada, setEntrada] = useState<string>("");
  const [descontoJuros, setDescontoJuros] = useState<string>("100");
  const [showRegras, setShowRegras] = useState(false);

  // === JUROS FIXO 2% ===
  const jurosTotal = useMemo(() => {
    const capital = parseFloat(valorCapital || "0");
    return capital > 0 ? +(capital * 0.02) : 0;
  }, [valorCapital]);

  const capital = useMemo(() => parseFloat(valorCapital || "0"), [valorCapital]);
  const entradaAtual = useMemo(() => parseFloat(entrada || "0"), [entrada]);
  const regra = useMemo(() => REGRAS[grupo][classificacao], [grupo, classificacao]);

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

  // VALIDAÇÃO GRUPO
  const atendeRegraGrupo = useMemo(() => {
    if (regra.permiteSemEntrada) return true;
    if (regra.entradaMinimaPercentual) return entradaAtual >= entradaMinimaGrupo;
    if (regra.entradaIgualParcela) {
      const totalComJuros = capital + jurosTotal;
      const parcela = totalComJuros / 20;
      return Math.abs(entradaAtual - parcela) < 1;
    }
    return true;
  }, [entradaAtual, regra, entradaMinimaGrupo, capital, jurosTotal]);

  const semJuros = entradaAtual >= entradaMinimaSemJuros;

  // CÁLCULOS
  const carteiraPropria = Math.max(0, capital - entradaAtual);
  const jurosAplicado = semJuros ? 0 : +(jurosTotal * (1 - parseFloat(descontoJuros || "0") / 100));
  const totalPagar = +(carteiraPropria + jurosAplicado);

  // 20 PARCELAS FIXAS
  const parcelasList = useMemo(() => {
    if (totalPagar <= 0) return [];
    return Array.from({ length: 20 }, (_, i) => {
      const qtd = 20 - i;
      return { qtd, valor: +(totalPagar / qtd).toFixed(2) };
    });
  }, [totalPagar]);

  const mensagem = useMemo(() => {
    if (capital === 0) return "Preencha o Valor Capital para gerar a proposta.";
    const status = semJuros ? "SEM JUROS!" : "com juros";
    return (
      `Olá! Proposta de renegociação:\n\n` +
      `Grupo: ${grupo} | Classificação: ${classificacao}\n` +
      `Status: ${status}\n` +
      `Valor Capital: ${formatBRL(capital)}\n` +
      `Juros (2%): ${formatBRL(jurosTotal)}\n` +
      `Entrada: ${formatBRL(entrada || "0")}\n` +
      `Juros Aplicados: ${semJuros ? "ISENTOS" : formatBRL(jurosAplicado)}\n` +
      `Carteira Própria: ${formatBRL(carteiraPropria)}\n` +
      `Total a Pagar: ${formatBRL(totalPagar)}\n` +
      `Parcelamento: 20x de ${formatBRL(totalPagar / 20)}\n\n` +
      `Opções:\n` +
      parcelasList.map(p => `${p.qtd}x de ${formatBRL(p.valor)}`).join("\n")
    );
  }, [grupo, classificacao, capital, jurosTotal, entrada, semJuros, jurosAplicado, carteiraPropria, totalPagar, parcelasList]);

  const copiarMensagem = async () => {
    await navigator.clipboard.writeText(mensagem);
    alert("Mensagem copiada com sucesso!");
  };

  return (
    <Card className="max-w-5xl mx-auto w-full bg-surface-50 dark:bg-surface-800">
      <div className="p-6 space-y-6">

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Renegociação — 2% Juros Automático</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* GRUPO + CLASSIFICAÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-xl">
            <div>
              <Label className="font-bold text-indigo-700">Grupo</Label>
              <Select value={grupo} onValueChange={(v) => setGrupo(v as Grupo)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grupo 1</SelectItem>
                  <SelectItem value="2">Grupo 2</SelectItem>
                  <SelectItem value="3">Grupo 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-bold text-purple-700">Classificação</Label>
              <Select value={classificacao} onValueChange={(v) => setClassificacao(v as Classificacao)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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

          {/* VALOR CAPITAL (OBRIGATÓRIO) */}
          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-300">
            <Label className="text-xl font-bold text-blue-700">Valor Capital</Label>
            <Input
              value={valorCapital}
              onChange={(e) => setValorCapital(e.target.value)}
              type="number"
              placeholder="0,00"
              className="text-3xl font-bold mt-2"
            />
            {capital > 0 && (
              <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex justify-between text-lg">
                  <span>Juros (2% do capital):</span>
                  <span className="font-bold text-red-600">{formatBRL(jurosTotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ENTRADA + REGRAS */}
          {capital > 0 && (
            <div className="p-5 bg-gray-50 dark:bg-gray-900/30 rounded-xl border">
              <Label className="text-lg font-semibold">Entrada</Label>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                  type="number"
                  placeholder="Digite a entrada"
                  className="text-xl font-bold"
                />

                <div className="space-y-4">
                  {/* SEM JUROS */}
                  <div className={`p-4 rounded-lg border-2 ${semJuros ? 'border-green-500 bg-green-50' : 'border-amber-400 bg-amber-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-2">
                        {semJuros ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <AlertCircle className="h-6 w-6 text-amber-600" />}
                        Mínimo para SEM JUROS
                      </span>
                      <span className="text-2xl font-bold text-green-700">
                        {formatBRL(entradaMinimaSemJuros)}
                      </span>
                    </div>
                    <p className="text-xs mt-1">{classificacao}: {ENTRADA_SEM_JUROS[classificacao]}%</p>
                  </div>

                  {/* REGRA DO GRUPO */}
                  <div className={`text-sm p-3 rounded ${atendeRegraGrupo ? 'bg-blue-50' : 'bg-red-50'}`}>
                    <strong>Regra do Grupo {grupo}:</strong>
                    <span className="block mt-1">
                      {regra.permiteSemEntrada && "Sem entrada"}
                      {regra.entradaIgualParcela && "Entrada = 1 parcela"}
                      {regra.entradaMinimaPercentual && `Mínimo: ${regra.entradaMinimaPercentual}% (${formatBRL(entradaMinimaGrupo)})`}
                    </span>
                  </div>
                </div>
              </div>

              {!atendeRegraGrupo && entrada && (
                <p className="text-sm text-red-600 mt-3 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Entrada não atende à regra do grupo.
                </p>
              )}
            </div>
          )}

          {/* DESCONTO (SÓ COM SEM JUROS) */}
          {capital > 0 && semJuros && (
            <div className="p-5 bg-green-50 dark:bg-green-900/30 border-4 border-green-500 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-bold text-green-700">
                  SEM JUROS ATIVADO!
                </h3>
              </div>
              <Label>Desconto sobre Juros (%)</Label>
              <Input value={descontoJuros} onChange={(e) => setDescontoJuros(e.target.value)} type="number" />
            </div>
          )}

          <Separator />

          {/* RESUMO */}
          {capital > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-5 bg-card rounded-xl shadow-lg">
                <Label className="text-lg">Carteira Própria</Label>
                <div className="text-3xl font-bold text-primary mt-2">{formatBRL(carteiraPropria)}</div>
              </div>
              <div className="text-center p-5 bg-card rounded-xl shadow-lg">
                <Label className="text-lg">Juros Aplicados</Label>
                <div className={`text-3xl font-bold mt-2 ${semJuros ? 'text-green-600' : 'text-red-600'}`}>
                  {semJuros ? "R$ 0,00" : formatBRL(jurosAplicado)}
                </div>
              </div>
              <div className="text-center p-5 bg-card rounded-xl shadow-lg">
                <Label className="text-lg">Total a Pagar</Label>
                <div className={`text-4xl font-bold mt-2 ${semJuros ? 'text-green-600' : 'text-blue-600'}`}>
                  {formatBRL(totalPagar)}
                </div>
              </div>
            </div>
          )}

          {/* PARCELAS (20x FIXO) */}
          {capital > 0 && parcelasList.length > 0 && (
            <div>
              <Label className="text-xl font-bold">Parcelamento (20x)</Label>
              <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3">
                {parcelasList.map(p => (
                  <div key={p.qtd} className="p-3 rounded-lg border bg-card text-center hover:scale-105 transition">
                    <div className="font-bold">{p.qtd}x</div>
                    <div className="text-xs">{formatBRL(p.valor)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* MENSAGEM */}
          <div>
            <Label className="text-xl font-bold">Mensagem para o Cliente</Label>
            <textarea
              readOnly
              value={mensagem}
              className="w-full mt-3 min-h-[220px] p-5 rounded-xl bg-muted/5 dark:bg-muted/10 text-sm font-mono resize-none border-2"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" size="lg" onClick={() => {
              setValorCapital("");
              setEntrada("");
              setDescontoJuros("100");
            }}>
              Limpar
            </Button>
            <Button size="lg" onClick={copiarMensagem} className="font-bold">
              Copiar Mensagem
            </Button>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowRegras(!showRegras)}
              className="flex items-center gap-2"
            >
              Regras <ChevronDown className={`h-5 w-5 transition ${showRegras ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="ghost" size="lg">
              WhatsApp
            </Button>
          </div>
        </CardFooter>

        {/* REGRAS */}
        {showRegras && (
          <div className="border-t-4 border-indigo-500 pt-6 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 -m-6 p-8 rounded-b-3xl">
            <h3 className="text-2xl font-bold text-center mb-6">Regras Oficiais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold text-green-600 mb-4">SEM JUROS</h4>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
                  {Object.entries(ENTRADA_SEM_JUROS).map(([cls, pct]) => (
                    <div key={cls} className="flex justify-between py-2 border-b last:border-0">
                      <span>{cls}</span>
                      <span className="font-bold text-green-600">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-blue-600 mb-4">COM JUROS</h4>
                <div className="space-y-4">
                  {(["1", "2", "3"] as Grupo[]).map(g => (
                    <div key={g} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
                      <h5 className="font-bold">Grupo {g}</h5>
                      <ul className="text-sm mt-2 space-y-1">
                        {Object.entries(REGRAS[g]).map(([cls, r]) => (
                          <li key={cls}>
                            <strong>{cls}:</strong>{" "}
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
          </div>
        )}
      </div>
    </Card>
  );
}
