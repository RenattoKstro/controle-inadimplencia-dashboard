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
    if (i === 1) return <Medal className={`${base} text-gray-400`} />;
    if (i === 2) return <Award className={`${base} text-amber-600`} />;
    return <span className="text-white font-black text-xl">{i + 1}</span>;
  };

  return (
    <div className="relative p-6">
      
      {/* CONTÊINER PRINCIPAL (AGORA COM FUNDO PRETO SÓLIDO) */}
      <div
        className="
          absolute inset-0
          rounded-3xl
          bg-black/90                  /* Fundo preto sólido */
          backdrop-blur-none          /* Desfoque não é mais necessário */
          border border-white/10
          shadow-2xl
        "
      />

      {/* CONTEÚDO */}
      <div className="relative z-10">

        {/* TOPO */}
        <div className="flex justify-between items-center mb-8">

          {/* Botão Apoiar (Estilo Escuro) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="
                  px-6 py-3
                  rounded-full
                  bg-gray-700                 /* Fundo cinza escuro */
                  hover:bg-gray-600
                  text-white font-bold
                  shadow-lg
                  transition duration-300
                "
              >
                <Heart className="w-5 h-5 fill-white mr-2" />
                Apoiar
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl p-0 bg-transparent border-0">
              <div className="max-h-[90vh] overflow-y-auto rounded-3xl">
                <AvisoApoio />
              </div>
            </DialogContent>
          </Dialog>

          {/* Botão Atualizar (Estilo Escuro) */}
          <Button
            size="icon"
            onClick={fetchRanking}
            className="
              bg-gray-700 
              hover:bg-gray-600 
              rounded-full
              shadow-lg
              transition duration-300
            "
          >
            <RefreshCw
              className={`w-5 h-5 text-white ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* TÍTULO */}
        <h2 className="text-3xl font-black text-white text-center drop-shadow-md mb-8">
          Ranking de Apoiadores
        </h2>

        {/* LISTA */}
        {loading ? (
          <p className="text-center text-white text-lg">Carregando...</p>
        ) : apoiadores.length === 0 ? (
          <p className="text-center text-white text-lg">
            Seja o primeiro a apoiar!
          </p>
        ) : (
          <div className="space-y-4">
            {apoiadores.map((a, i) => (
              <div
                key={a.id}
                className="
                  flex items-center justify-between
                  p-4
                  rounded-2xl
                  bg-gray-800/70             /* Fundo escuro para os itens da lista */
                  border border-white/5
                  shadow-md
                "
              >
                <div className="flex items-center gap-4">
                  {medal(i)}

                  <div>
                    {/* NOME: Visibilidade máxima garantida pelo fundo escuro */}
                    <p className="text-lg font-bold text-white">
                      {a.nome}
                    </p>
                    {/* FILIAL: Visibilidade máxima */}
                    <p className="text-sm font-semibold text-white/80">
                      Filial {a.filial}
                    </p>
                  </div>
                </div>

                {/* VALOR: Visibilidade máxima */}
                <p className="text-3xl font-black text-white">
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
