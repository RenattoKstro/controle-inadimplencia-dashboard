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
  const [recolhido, setRecolhido] = useState(false); // ← NOVO ESTADO

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
    const base = "w-6 h-6";
    if (i === 0) return <Trophy className={`${base} text-yellow-400`} />;
    if (i === 1) return <Medal className={`${base} text-gray-400`} />;
    if (i === 2) return <Award className={`${base} text-amber-600`} />;
    return <span className="text-white font-black text-lg text-center w-6">{i + 1}</span>;
  };

  return (
    <div className={`fixed top-1/2 -translate-y-1/2 right-0 z-50 transition-all duration-500 ${recolhido ? "w-16" : "w-80"}`}>
      {/* CARD PRINCIPAL */}
      <div className="bg-black/90 border border-white/10 rounded-l-3xl shadow-2xl h-full flex flex-col">
        {/* BOTÃO RECOLHER/EXPANDIR */}
        <button
          onClick={() => setRecolhido(!recolhido)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-l-full shadow-2xl"
        >
          {recolhido ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </button>

        {/* CONTEÚDO (só aparece quando expandido) */}
        {!recolhido && (
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold shadow-lg">
                    <Heart className="w-4 h-4 fill-white mr-2" />
                    Apoiar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md sm:max-w-2xl p-0 bg-transparent border-0">
                  <div className="max-h-[90vh] overflow-y-auto rounded-3xl">
                    <AvisoApoio />
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="icon"
                onClick={fetchRanking}
                className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 text-white ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <h2 className="text-xl font-black text-white text-center mb-6">
              Ranking de Apoiadores
            </h2>

            {loading ? (
              <p className="text-center text-white text-lg">Carregando...</p>
            ) : apoiadores.length === 0 ? (
              <p className="text-center text-white text-lg">
                Seja o primeiro a apoiar!
              </p>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {apoiadores.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex flex-col p-3 rounded-xl bg-gray-800/70 border border-white/5 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">{medal(i)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {a.nome}
                        </p>
                        <p className="text-xs font-semibold text-white/80">
                          Filial {a.filial}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-black text-white text-right mt-2 pt-2 border-t border-white/10">
                      R$ {a.mostrar_valor === false ? "***" : a.valor.toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
