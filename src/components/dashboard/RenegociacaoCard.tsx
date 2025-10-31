// src/components/dashboard/RenegociacaoFullScreen.tsx
import React, { useMemo, useState } from "react";

/**
 * Componente auto-contido que funciona em full-screen.
 * Usa classes tailwind/HTML simples para garantir que funcione mesmo
 * se sua app estiver com estilos/shadcn diferentes.
 *
 * Se você usa o Modal do shadcn, veja instruções abaixo para forçar full-screen.
 */

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RenegociacaoFullScreen() {
  // armazenamos como string para permitir inputs vazios, mas convertamos sempre antes do cálculo
  const [valorOriginalStr, setValorOriginalStr] = useState<string>("5375.46");
  const [jurosMensalStr, setJurosMensalStr] = useState<string>("2");
  const [parcelasStr, setParcelasStr] = useState<string>("20");
  const maxSimulacoes = 20;

  // parse seguro -> número ou 0
  const valorOriginal = useMemo(() => {
    const n = parseFloat(valorOriginalStr.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }, [valorOriginalStr]);

  const jurosMensal = useMemo(() => {
    const n = parseFloat(jurosMensalStr.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }, [jurosMensalStr]);

  const parcelas = useMemo(() => {
    const n = parseInt(parcelasStr);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [parcelasStr]);

  // Cálculo: juros compostos por n meses
  const jurosTotal = useMemo(() => {
    // totalCorrigido = valorOriginal * (1 + i)^n
    const totalCorrigidoRaw = valorOriginal * Math.pow(1 + jurosMensal / 100, parcelas);
    const juros = totalCorrigidoRaw - valorOriginal;
    return Number.isFinite(juros) ? juros : 0;
  }, [valorOriginal, jurosMensal, parcelas]);

  const totalCorrigido = useMemo(() => valorOriginal + jurosTotal, [valorOriginal, jurosTotal]);

  const parcelaValor = useMemo(
    () => (parcelas > 0 ? totalCorrigido / parcelas : totalCorrigido),
    [totalCorrigido, parcelas]
  );

  // Gera lista de simulações de 1..maxSimulacoes (ou até parcelas)
  const simulacoes = useMemo(() => {
    const list: { qtd: number; total: number; valorParcela: number }[] = [];
    const limit = Math.max(1, Math.min(maxSimulacoes, Math.max(parcelas, maxSimulacoes)));
    // se quiser 1..20, iterar p = 1..limit
    for (let p = 1; p <= limit; p++) {
      const total = valorOriginal * Math.pow(1 + jurosMensal / 100, p);
      list.push({ qtd: p, total, valorParcela: total / p });
    }
    // ordena do maior para o menor (20x -> 1x) se preferir
    list.reverse();
    return list;
  }, [valorOriginal, jurosMensal, parcelas]);

  const mensagem = useMemo(() => {
    return [
      `Olá, temos uma proposta de renegociação para você.`,
      ``,
      `Total sem Juros: R$ ${fmt(valorOriginal)}`,
      `Total Corrigido: R$ ${fmt(totalCorrigido)}`,
      `Juros Parcelamento: R$ ${fmt(jurosTotal)}`,
      `Total Pagar: R$ ${fmt(totalCorrigido)}`,
      `Parcelas: ${parcelas}`,
      `Valor Parcela: R$ ${fmt(parcelaValor)}`,
    ].join("\n");
  }, [valorOriginal, totalCorrigido, jurosTotal, parcelas, parcelaValor]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      alert("Mensagem copiada!");
    } catch {
      alert("Não foi possível copiar. Permissões do navegador.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-stretch justify-center p-6">
      {/* card full-screen: ocupa largura total e altura, com padding interno */}
      <div className="w-full h-full max-w-[1400px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* header */}
        <div className="px-8 py-6 border-b">
          <h1 className="text-2xl font-bold text-center">Renegociação — Gerador de Mensagem</h1>
        </div>

        {/* body — scroll interno */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-[1100px] mx-auto space-y-8">

            {/* grid de inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor Original</label>
                <input
                  inputMode="decimal"
                  value={valorOriginalStr}
                  onChange={(e) => setValorOriginalStr(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Juros Mensal (%)</label>
                <input
                  inputMode="decimal"
                  value={jurosMensalStr}
                  onChange={(e) => setJurosMensalStr(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parcelas</label>
                <input
                  inputMode="numeric"
                  value={parcelasStr}
                  onChange={(e) => setParcelasStr(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={copiar}
                  className="w-full bg-blue-600 text-white rounded px-4 py-2"
                >
                  Copiar Mensagem
                </button>
              </div>
            </div>

            {/* resultados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-lg p-6 space-y-2">
                <div><strong>Total sem Juros:</strong> R$ {fmt(valorOriginal)}</div>
                <div><strong>Total Corrigido:</strong> R$ {fmt(totalCorrigido)}</div>
                <div><strong>Juros Total:</strong> R$ {fmt(jurosTotal)}</div>
                <div><strong>Total a Pagar:</strong> R$ {fmt(totalCorrigido)}</div>
                <div><strong>Parcela (ex: {parcelas}x):</strong> R$ {fmt(parcelaValor)}</div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Simulações ({simulacoes.length})</h3>
                <div className="space-y-2 max-h-[320px] overflow-auto pr-2">
                  {simulacoes.map((s) => (
                    <div key={s.qtd} className="flex justify-between px-3 py-2 border rounded">
                      <div>{s.qtd}x</div>
                      <div>de R$ {fmt(s.valorParcela)}</div>
                      <div className="text-xs text-gray-500">total R$ {fmt(s.total)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* area da mensagem */}
            <div>
              <label className="block text-sm font-medium mb-1">Mensagem Gerada</label>
              <textarea
                readOnly
                value={mensagem}
                className="w-full h-40 border rounded p-3 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="px-8 py-4 border-t text-right">
          <small className="text-gray-500">Renegociação — Calc</small>
        </div>
      </div>
    </div>
  );
}
