// src/components/RankingApoiadores.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";

interface Apoiador {
  id: string;
  nome: string;
  filial: string;
  valor: number;
}

export default function RankingApoiadores() {
  const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from("apoiadores")
        .select("nome, filial, valor")
        .order("valor", { ascending: false })
        .limit(10);

      if (!error) setApoiadores(data || []);
      setLoading(false);
    };

    fetchRanking();
  }, []);

  const getMedal = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="w-6 text-center font-bold">{index + 1}</span>;
  };

  if (loading) return <p className="text-center">Carregando heróis...</p>;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
        <h2 className="text-3xl font-black text-purple-800 text-center mb-6">
          Ranking dos Heróis
        </h2>

        {apoiadores.length === 0 ? (
          <p className="text-center text-gray-600">Seja o primeiro a apoiar!</p>
        ) : (
          <div className="space-y-4">
            {apoiadores.map((a, i) => (
              <div
                key={a.id}
                className={`flex items-center justify-between p-4 rounded-2xl shadow-lg transition-all hover:scale-105 ${
                  i === 0
                    ? "bg-yellow-100 border-4 border-yellow-500"
                    : i === 1
                    ? "bg-gray-100 border-4 border-gray-400"
                    : i === 2
                    ? "bg-orange-100 border-4 border-orange-500"
                    : "bg-white border-2 border-purple-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">{getMedal(i)}</div>
                  <div>
                    <p className="font-bold text-lg text-gray-800">{a.nome}</p>
                    <p className="text-sm text-gray-600">{a.filial}</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-green-600">
                  R$ {a.valor.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-purple-700 font-medium">
            Total apoiado: <strong>R$ {apoiadores.reduce((s, a) => s + a.valor, 0).toFixed(2)}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
