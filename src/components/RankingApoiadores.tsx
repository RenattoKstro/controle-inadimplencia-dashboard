// src/components/RankingApoiadores.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, { Medal, Award, Heart, RefreshCw } from "lucide-react";
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
    <div className="relative">
      {/* FUNDO COM EFEITO GLASS iOS 18 */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* BOTÃO APOIAR + ATUALIZAR */}
          <div className="flex justify-between items-center mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500/90 to-red-500/90 hover:from-pink-600 hover:to-red-600 text-white font-bold shadow-xl backdrop-blur-md border border-white/30">
                  <Heart className="w-5 h-5 fill-white mr-2" />
                  Apoiar o Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0 bg-transparent border-0">
                <div className="max-h-[90vh] overflow-y-auto rounded-3xl">
                  <AvisoApoio />
                </div>
              </DialogContent>
            </Dialog>

            <Button
              size="icon"
              variant="ghost"
              onClick={fetchRanking}
              className="bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full shadow-md"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <h2 className="text-2xl font-black text-white drop-shadow-lg text-center mb-5">
            Ranking de Apoiadores
          </h2>

          {loading ? (
            <p className="text-center py-6 text-white/80">Carregando...</p>
          ) : apoiadores.length === 0 ? (
            <p className="text-center py-8 text-white/90 font-medium">
              Seja o primeiro a apoiar!
            </p>
          ) : (
            <div className="space-y-4">
              {apoiadores.map((a, i) => (
                <div
                  key={a.id}
                  className={`flex items-center justify-between p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg ${
                    i < 3 ? "ring-2 ring-white/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {medal(i)}
                    <div>
                      <p className="font-black text-lg text-white drop-shadow-md">{a.nome}</p>
                      <p className="text-sm font-bold text-white/90 drop-shadow">FILIAL {a.filial}</p>
                    </div>
                  </div>
                  <p className="font-black text-xl text-white drop-shadow-lg">
                    R$ {a.mostrar_valor === false ? "***" : a.valor.toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
