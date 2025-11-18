// src/components/RankingApoiadores.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Heart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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

  const fetchRanking = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("apoiadores")
      .select("id, nome, filial, valor")
      .order("valor", { ascending: false })
      .limit(10);
    setApoiadores(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRanking();
    const interval = setInterval(fetchRanking, 30000);
    return () => clearInterval(interval);
  }, []);

  const medal = (i: number) => {
    if (i === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (i === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (i === 2) return <Award className="w-5 h-5 text-orange-600" />;
    return <span className="w-5 text-center text-xs font-bold text-purple-600">{i + 1}</span>;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-5 border-4 border-purple-300">
      {/* BOTÃO APOIAR + ATUALIZAR */}
      <div className="flex justify-between items-center mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold shadow-lg text-sm px-4 py-2">
              <Heart className="w-4 h-4 fill-white mr-1" />
              Apoiar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl p-0 bg-transparent border-0">
            <div className="max-h-[90vh] overflow-y-auto rounded-3xl bg-white">
              <AvisoApoio />
            </div>
          </DialogContent>
        </Dialog>

        <Button
          size="icon"
          variant="ghost"
          onClick={fetchRanking}
          className="rounded-full hover:bg-purple-100 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <h2 className="text-xl font-black text-purple-800 text-center mb-3">
        Ranking de Apoiadores
      </h2>

      {loading ? (
        <p className="text-center py-6 text-sm text-gray-500">Carregando...</p>
      ) : apoiadores.length === 0 ? (
        <p className="text-center py-8 text-purple-600 font-medium text-sm">
          Seja o primeiro a apoiar!
        </p>
      ) : (
        <div className="space-y-3">
          {apoiadores.map((a, i) => (
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
                <div className="text-left">
                  <p className="font-bold text-sm text-gray-800 leading-tight">{a.nome}</p>
                  <p className="text-xs font-black text-purple-600 leading-tight">
                    FILIAL {a.filial}
                  </p>
                </div>
              </div>
              <p className="font-black text-green-600 text-sm">
                R$ {a.valor.toFixed(0)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
