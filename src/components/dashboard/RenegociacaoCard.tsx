// src/components/dashboard/RenegociacaoPage.tsx

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RenegociacaoPage() {
  const [valorOriginal, setValorOriginal] = useState(0)
  const [jurosMensal, setJurosMensal] = useState(0)
  const [parcelas, setParcelas] = useState(1)

  // Fórmulas
  const totalSemJuros = valorOriginal
  const totalCorrigido = valorOriginal * Math.pow(1 + jurosMensal / 100, parcelas)
  const jurosTotal = totalCorrigido - totalSemJuros
  const totalPagar = totalCorrigido

  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
      <Card className="w-full max-w-4xl shadow-xl rounded-2xl bg-white">
        
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center">
            Renegociação — Gerador de Mensagem
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">

          {/* ----------------------------- */}
          {/* 🔹 CAMPOS DE ENTRADA */}
          {/* ----------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="space-y-2">
              <Label>Valor Original</Label>
              <Input
                type="number"
                value={valorOriginal}
                onChange={(e) => setValorOriginal(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Juros Mensal (%)</Label>
              <Input
                type="number"
                value={jurosMensal}
                onChange={(e) => setJurosMensal(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Parcelas</Label>
              <Input
                type="number"
                min={1}
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
              />
            </div>
          </div>

          {/* ----------------------------- */}
          {/* 🔹 RESULTADOS DO CÁLCULO */}
          {/* ----------------------------- */}
          <div className="rounded-xl border p-6 bg-gray-50 space-y-3">
            <p><strong>Total sem Juros:</strong> R$ {totalSemJuros.toFixed(2)}</p>
            <p><strong>Total Corrigido:</strong> R$ {totalCorrigido.toFixed(2)}</p>
            <p><strong>Juros Total:</strong> R$ {jurosTotal.toFixed(2)}</p>
            <p><strong>Total a Pagar:</strong> R$ {totalPagar.toFixed(2)}</p>
          </div>

          {/* ----------------------------- */}
          {/* 🔹 SIMULAÇÃO DE PARCELAS (1x a 20x) */}
          {/* ----------------------------- */}
          <div className="rounded-xl border p-6 bg-gray-50">
            <h3 className="font-semibold text-lg mb-3">Simulação Automática</h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {[...Array(20)].map((_, idx) => {
                const p = idx + 1
                const total = valorOriginal * Math.pow(1 + jurosMensal / 100, p)
                const valorParcela = total / p
                return (
                  <div key={p} className="text-sm border-b pb-1">
                    <strong>{p}x</strong> de R$ {valorParcela.toFixed(2)}
                  </div>
                )
              })}
            </div>

          </div>

        </CardContent>
      </Card>
    </div>
  )
}
