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
    const base = "w-7 h-7 drop-shadow-md";
    if (i === 0) return <Trophy className={`${base} text-yellow-400`} />;
    if (i === 1) return <Medal className={`${base} text-gray-300`} />;
    if (i === 2) return <Award className={`${base} text-orange-300`} />;
    return <span className="text-white font-black text-xl">{i + 1}</span>;
  };

  return (
    <div className="relative p-6">

      {/* ✨ Liquid Glass - versão com contraste alto */}
      <div className="
        absolute inset-0 rounded-[40px]
        bg-gradient-to-br from-white/10 via-white/5 to-white/0
        backdrop-blur-3xl
        shadow-[0_0_60px_10px_rgba(0,0,0,0.25)]
        border border-white/15
      " />

      {/* Iluminação suave (não deixa branco demais) */}
      <div className="
        absolute top-0 left-0 right-0 h-10
        bg-white/10 blur-2xl opacity-40
        pointer-events-none
      " />

      {/* Conteúdo acima do glass */}
      <div className="relative z-10">

        {/* Topo */}
        <div className="flex justify-between items-center mb-8">

          {/* Botão Apoiar */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="
                  px-6 py-3 rounded-full
                  bg-white/15 hover:bg-white/25
                  backdrop-blur-2xl
                  border border-white/20
                  text-white font-bold
                  shadow-lg
                "
              >
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

          {/* Atualizar */}
          <Button
            size="icon"
            onClick={fetchRanking}
            className="
              bg-white/15 hover:bg-white/25
              backdrop-blur-2xl
              border border-white/20
              rounded-full shadow-lg
            "
          >
            <RefreshCw
              className={`w-5 h-5 text-white ${
                loading ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-black text-white text-center drop-shadow-2xl mb-8">
          Ranking de Apoiadores
        </h2>

        {/* Lista */}
        {loading ? (
          <p className="text-center text-white/90 text-lg">Carregando...</p>
        ) : apoiadores.length === 0 ? (
          <p className="text-center text-white/90 text-lg">
            Seja o primeiro a apoiar!
          </p>
        ) : (
          <div className="space-y-5">
            {apoiadores.map((a, i) => (
              <div
                key={a.id}
                className="
                  flex items-center justify-between
                  p-5 rounded-3xl
                  bg-white/10
                  backdrop-blur-3xl
                  border border-white/15
                  shadow-[0_8px_25px_rgba(0,0,0,0.35)]
                "
              >
                <div className="flex items-center gap-4">
                  {medal(i)}

                  <div>
                    <p className="text-lg font-bold text-white drop-shadow-md">
                      {a.nome}
                    </p>
                    <p className="text-sm font-semibold text-white/70 drop-shadow-sm">
                      Filial {a.filial}
                    </p>
                  </div>
                </div>

                <p className="text-3xl font-black text-white drop-shadow-xl">
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
