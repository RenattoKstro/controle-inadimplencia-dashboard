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
    const base = "w-7 h-7 drop-shadow-lg"; // Sombra maior para profundidade
    if (i === 0) return <Trophy className={`${base} text-yellow-300`} />;
    if (i === 1) return <Medal className={`${base} text-gray-300`} />; // Cor mais clara
    if (i === 2) return <Award className={`${base} text-amber-500`} />; // Laranja mais vibrante
    return <span className="text-white font-black text-xl">{i + 1}</span>;
  };

  return (
    <div className="relative p-6">
      
      {/* 🧊 CONTÊINER PRINCIPAL (ESTILO LIQUID GLASS) */}
      <div
        className="
          absolute inset-0
          rounded-3xl
          backdrop-blur-3xl           /* Blur mais intenso */
          bg-white/10                 /* Fundo mais transparente */
          border border-white/20      /* Borda sutil */
          shadow-2xl shadow-white/10  /* Sombra externa para profundidade */
          shadow-inner                /* Sombra interna para o brilho sutil */
          /* Brilho Especular (como luz refletida no vidro) */
          before:absolute before:inset-0
          before:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),rgba(255,255,255,0)_60%)]
          before:opacity-100
          before:rounded-3xl
          overflow-hidden
        "
      />

      {/* 🔳 RUÍDO SUAVE (iOS) - Adicione uma imagem de ruído sutil no seu projeto */}
      {/* Certifique-se de ter um arquivo de ruído, se quiser usar esta parte */}
      {/* <div
        className="
          absolute inset-0 rounded-3xl pointer-events-none opacity-[0.08]
          mix-blend-overlay
          bg-[url('/textures/noise.png')]
          bg-cover bg-repeat
        "
      /> */}

      {/* CONTEÚDO */}
      <div className="relative z-10">

        {/* TOPO */}
        <div className="flex justify-between items-center mb-8">

          {/* Botão Apoiar (Estilo Glassy) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="
                  px-6 py-3
                  rounded-full             /* Completamente arredondado */
                  bg-white/20
                  hover:bg-white/30
                  backdrop-blur-lg
                  border border-white/30
                  text-white font-bold
                  shadow-xl shadow-blue-500/30 /* Sombra colorida sutil */
                  transition duration-300 transform hover:scale-105
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

          {/* Botão Atualizar (Estilo Glassy) */}
          <Button
            size="icon"
            onClick={fetchRanking}
            className="
              bg-white/20 
              hover:bg-white/30 
              backdrop-blur-lg
              border border-white/30
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
        <h2 className="text-3xl font-black text-white text-center drop-shadow-xl mb-8">
          Ranking de Apoiadores
        </h2>

        {/* LISTA */}
        {loading ? (
          <p className="text-center text-white/90 text-lg">Carregando...</p>
        ) : apoiadores.length === 0 ? (
          <p className="text-center text-white/90 text-lg">
            Seja o primeiro a apoiar!
          </p>
        ) : (
          <div className="space-y-4"> {/* Espaçamento um pouco menor */}
            {apoiadores.map((a, i) => (
              <div
                key={a.id}
                className="
                  flex items-center justify-between
                  p-4                        /* Padding menor */
                  rounded-2xl                /* Bordas mais suaves */
                  bg-white/5                 /* Mais transparente ainda */
                  backdrop-blur-xl
                  border border-white/10
                  shadow-xl                  /* Sombra para flutuar */
                "
              >
                <div className="flex items-center gap-4">
                  {medal(i)}

                  <div>
                    <p className="text-lg font-bold text-white drop-shadow-lg">
                      {a.nome}
                    </p>
                    <p className="text-sm font-semibold text-white/70 drop-shadow">
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
