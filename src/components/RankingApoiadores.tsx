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
  mostrar_valor?: boolean;
}

export default function RankingApoiadores() {
  const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("apoiadores")
        .select("id, nome, filial, valor, mostrar_valor")
        .order("valor", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Erro ao buscar apoiadores:", error);
      } else {
        setApoiadores(data || []);
      }
    } catch (err) {
      console.error("Exceção ao buscar apoiadores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
    const interval = setInterval(fetchRanking, 30000); // atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const medal = (i: number) => {
    const base = "w-5 h-5";
    if (i === 0) return <Trophy className={`${base} text-yellow-400`} />;
    if (i === 1) return <Medal className={`${base} text-gray-400`} />;
    if (i === 2) return <Award className={`${base} text-amber-600`} />;
    return <span className="text-white font-black text-base text-center w-5">{i + 1}</span>;
  };

  return (
    <div className="relative p-3 sm:p-4">
      {/* Fundo escuro com efeito de sombra */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-black/90 border border-white/10 shadow-2xl" />
      
      <div className="relative z-10">
        {/* Botões Apoiar + Refresh */}
        <div className="flex justify-between items-center mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-xs sm:text-sm font-bold shadow-lg">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white mr-1.5" />
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
            className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Título */}
        <h2 className="text-lg sm:text-xl font-black text-white text-center mb-4">
          Ranking de Apoiadores
        </h2>

        {/* Conteúdo */}
        {loading ? (
          <p className="text-center text-white text-sm">Carregando...</p>
        ) : apoiadores.length === 0 ? (
          <p className="text-center text-white text-sm">
            Seja o primeiro a apoiar!
          </p>
        ) : (
          <div className="space-y-2">
            {apoiadores.map((a, i) => (
              <div
                key={a.id}
                className="flex flex-col p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-800/70 border border-white/5 shadow-md"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex-shrink-0">{medal(i)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      {a.nome}
                    </p>
                    <p className="text-xs font-semibold text-white/80">
                      Filial {a.filial}
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-base font-black text-white text-right mt-1.5 pt-1.5 border-t border-white/10">
                  R$ {a.mostrar_valor === false ? "***" : a.valor.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
