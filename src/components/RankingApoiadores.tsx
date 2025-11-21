// src/components/RankingApoiadores.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Heart, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
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

  // ➕ NOVO: controla expandir/recolher
  const [expandir, setExpandir] = useState(true);

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
    <div className="relative p-4 sm:p-6">
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-black/90 border border-white/10 shadow-2xl" />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm sm:text-base font-bold shadow-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white mr-2" />
                Apoiar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md sm:max-w-2xl p-0 bg-transparent border-0">
              <div className="max-h-[90vh] overflow-y-auto rounded-3xl">
                <AvisoApoio />
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-3">

            {/* ➕ BOTÃO NOVO: expandir/recolher */}
            <Button
              size="icon"
              onClick={() => setExpandir(!expandir)}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg"
            >
              {expandir ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </Button>

            <Button
              size="icon"
              onClick={fetchRanking}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-6">
          Ranking de Apoiadores
        </h2>

        {loading ? (
          <p className="text-center text-white text-lg">Carregando...</p>
        ) : apoiadores.length === 0 ? (
          <p className="text-center text-white text-lg">
            Seja o primeiro a apoiar!
          </p>
        ) : (
          <div className="space-y-3">

            {/* LISTA (não alterei nada da estrutura original) */}
            {apoiadores.map((a, i) => (
              <div
                key={a.id}
                className="flex flex-col p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-800/70 border border-white/5 shadow-md"
              >
                {/* LINHA SUPERIOR */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0">{medal(i)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-bold text-white truncate">
                      {a.nome}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-white/80">
                      Filial {a.filial}
                    </p>
                  </div>
                </div>

                {/* LINHA DO VALOR — agora com expandir/recolher */}
                {expandir && (
                  <p className="text-lg sm:text-xl font-black text-white text-right mt-2 pt-2 border-t border-white/10">
                    R$ {a.mostrar_valor === false ? "***" : a.valor.toFixed(0)}
                  </p>
                )}
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
