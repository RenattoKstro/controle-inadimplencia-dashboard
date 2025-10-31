export default function RenegociacaoPage() {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center p-6">

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 overflow-y-auto">

        <h1 className="text-2xl font-bold text-center mb-1">
          Renegociação — Gerador de Mensagem
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Preencha os dados abaixo
        </p>

        {/* Inputs principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="flex flex-col">
            <label className="font-medium mb-1">Valor Original</label>
            <input
              type="number"
              className="border rounded-lg p-3"
              placeholder="0,00"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Juros Mensal (%)</label>
            <input
              type="number"
              className="border rounded-lg p-3"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Parcelas</label>
            <input
              type="number"
              className="border rounded-lg p-3"
              placeholder="1"
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-gray-50 border rounded-xl p-6 mb-10">
          <p className="text-lg mb-2">✅ <strong>Total sem Juros:</strong> R$ 0,00</p>
          <p className="text-lg mb-2">✅ <strong>Total Corrigido:</strong> R$ 0,00</p>
          <p className="text-lg mb-2">✅ <strong>Juros Total:</strong> R$ 0,00</p>
          <p className="text-lg"><strong>Total a Pagar:</strong> R$ 0,00</p>
        </div>

        {/* Mensagem gerada */}
        <div className="border rounded-xl p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Simulação de Mensagem</h2>
          <textarea
            rows={5}
            className="w-full border rounded-lg p-3 resize-none"
            placeholder="A mensagem gerada aparecerá aqui..."
          ></textarea>
        </div>
      </div>

    </div>
  );
}
