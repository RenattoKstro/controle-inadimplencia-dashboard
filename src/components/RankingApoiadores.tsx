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
    if (i === 0) return <Trophy className="w-7 h-7 text-yellow-300 drop-shadow-[0_0_12px_rgba(255,255,150,0.7)]" />;
    if (i === 1) return <Medal className="w-7 h-7 text-gray-200 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]" />;
    if (i === 2) return <Award className="w-7 h-7 text-orange-300 drop-shadow-[0_0_12px_rgba(255,200,150,0.7)]" />;
    return <span className="w-7 text-center font-black text-white drop-shadow-xl">{i + 1}</span>;
  };

  return (
    <div className="
      relative 
      bg-white/10 
      backdrop-blur-3xl 
      rounded-3xl 
      shadow-[0_8px_40px_rgba(0,0,0,0.25)]
      border border-white/20
      p-6
      overflow-hidden
    ">

      {/* Glow iOS 26 */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-white/5 opacity-60 pointer-events-none" />
      <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_25px_rgba(255,255,255,0.3)] pointer-events-none" />

      <div className="relative z-10">
        {/* Header + botão */}
        <div className="flex justify-between items-center mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="
                bg-white/30 
                hover:bg-white/50
                text-white 
                font-black 
                px-6 py-3 
                rounded-2xl
                backdrop-blur-xl
                border border-white/40
                shadow-[0_0_20px_rgba(255,255,255,0.3)]
              ">
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
            className="
              bg-white/20 
              hover:bg-white/40 
              backdrop-blur-xl
              rounded-full 
              border border-white/30
              shadow-[0_0_20px_rgba(255,255,255,0.2)]
            "
          >
            <RefreshCw className={`w-5 h-5 text-white ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <h2 className="text-3xl font-black text-white drop-shadow-xl text-center mb-6 tracking-wide">
          Ranking de Apoiadores
        </h2>

        {loading ? (
          <p className="text-center py-6 text-white text-lg font-medium drop-shadow-lg">
            Carregando...
          </p>
        ) : apoiadores.length === 0 ? (
          <p className="text-center py-8 text-white text-lg font-medium drop-shadow-lg">
            Seja o primeiro a apoiar!
          </p>
        ) : (
          <div className="space-y-4">
            {apoiadores.map((a, i) => (
              <div
                key={a.id}
                className={`
                  flex items-center justify-between
                  p-4
                  rounded-3xl
                  bg-white/15 
                  backdrop-blur-2xl
                  border border-white/30 
                  shadow-[0_4px_25px_rgba(0,0,0,0.25)]
                  relative
                  overflow-hidden
                  ${i < 3 ? "ring-4 ring-white/40" : ""}
                `}
              >

                {/* brilho interno iOS */}
                <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_35px_rgba(255,255,255,0.22)] pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10">
                  {medal(i)}
                  <div>
                    <p className="font-black text-lg text-white drop-shadow-lg">{a.nome}</p>
                    <p className="text-sm font-bold text-white/80 drop-shadow">
                      Filial {a.filial}
                    </p>
                  </div>
                </div>

                <p className="font-black text-2xl text-white drop-shadow-2xl relative z-10">
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
