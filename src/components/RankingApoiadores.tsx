// src/components/RankingApoiadores.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Heart, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AvisoApoio from "./AvisoApoio";

interface Apoiador {
  id: string;
  nome: string;
  filial: string;
  valor: number;
  mostrar_valor?: boolean;
}

export default function RankingApoiadores() {
  const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
  const [loading, setLoading] = useState(true);
  const [recolhido, setRecolhido] = useState(false);

  const fetchRanking = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("apoiadores")
      .select("id, nome, filial, valor, mostrar_valor")
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
    if (i === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (i === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (i === 2) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="w-6 text-center font-bold text-purple-600 text-sm">{i + 1}</span>;
  };

  return (
    <div className={`transition-all duration-500 ease-in-out ${recolhido ? "w-0 overflow-hidden" : "w-full max-w-md"}`}>
      {/* CARD PRINCIPAL */}
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-purple-300">
        {/* BOTÃO RECOLHER/EXPANDIR */}
        <button
          onClick={() => setRecolhido(!recolhido)}
          className="absolute -right-12 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-r-full shadow-2xl z-20"
        >
          {recolhido ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </button>

        {/* CONTEÚDO (só aparece quando expandido) */}
        {!recolhido && (
          <>
            <div className="flex justify-between items-center mb-6">
              <Dialog>
                <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold shadow-xl">
                  <Heart className="w-5 h-5 fill-white mr-2" />
                  Apoiar o Projeto
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
              variant="outline"
              onClick={fetchRanking}
              className="rounded-full shadow-md hover:shadow-xl"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <h2 className="text-2xl font-black text-purple-800 text-center mb-4">
            Ranking de Apoiadores
          </h2>

          {loading ? (
            <p className="text-center py-4 text-gray-500">Carregando...</p>
          ) : apoiadores.length === 0 ? (
            <p className="text-center text-purple-600 font-medium py-8">
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
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">
                        {a.nome}
                      </p>
                      <p className="text-xs text-purple-600">FILIAL {a.filial}</p>
                    </div>
                  </div>
                  <p className="font-black text-green-600 text-sm">
                    R$ {a.mostrar_valor === false ? "***" : a.valor.toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
}
