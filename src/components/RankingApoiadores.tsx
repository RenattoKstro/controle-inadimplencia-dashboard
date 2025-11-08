// src/components/RankingApoiadores.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AvisoApoio from "./AvisoApoio";

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
    const fetch = async () => {
      const { data } = await supabase
        .from("apoiadores")
        .select("id, nome, filial, valor")
        .order("valor", { ascending: false })
        .limit(8);
      setApoiadores(data || []);
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const medal = (i: number) => {
    if (i === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (i === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (i === 2) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="w-6 text-center font-bold text-purple-600 text-sm">{i + 1}</span>;
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-purple-300">
      {/* BOTÃO APOIAR ACIMA DO RANKING */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full mb-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold shadow-lg">
            <Heart className="w-5 h-5 fill-white mr-2" />
            Apoiar o Projeto
          </Button>
        </DialogTrigger>
        <div className="max-h-[90vh] overflow-y-auto rounded-3xl">
          <AvisoApoio />
        </div>
      </Dialog>

      {/* TÍTULO */}
      <h2 className="text-2xl font-black text-purple-800 text-center mb-4">
        Ranking de Apoiadores
      </h2>

      {loading ? (
        <p className="text-center py-4 text-gray-500">Carregando...</p>
      ) : (
        <>
          <div className="space-y-3">
            {apoiadores.length === 0 ? (
              <p className="text-center text-purple-600 font-medium py-8">
                Seja o primeiro a apoiar!
              </p>
            ) : (
              apoiadores.map((a, i) => (
                <div
                  key={a.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    i < 3
                      ? "bg-gradient-to-r from-yellow-50 to-pink-50 border-purple-400"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {medal(i)}
                    <div>
                      <p className="font-bold text-sm text-gray-800">{a.nome}</p>
                      <p className="text-xs text-purple-600">{a.filial}</p>
                    </div>
                  </div>
                  <p className="font-black text-green-600">R$ {a.valor.toFixed(0)}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
