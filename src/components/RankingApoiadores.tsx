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
    const base = "w-6 h-6"; // Tamanho ligeiramente menor para economizar espaço
    if (i === 0) return <Trophy className={`${base} text-yellow-400`} />;
    if (i === 1) return <Medal className={`${base} text-gray-400`} />;
    if (i === 2) return <Award className={`${base} text-amber-600`} />;
    // Ajuste de tamanho e alinhamento para o número
    return <span className="text-white font-black text-lg text-center w-6">{i + 1}</span>;
  };

  return (
    // Padding responsivo para garantir que caiba em telas menores
    <div className="relative p-4 sm:p-6"> 
      
      {/* CONTÊINER PRINCIPAL (Fundo Preto) */}
      <div
        className="
          absolute inset-0
          rounded-2xl sm:rounded-3xl /* Bordas ajustadas para responsividade */
          bg-black/90
          border border-white/10
          shadow-2xl
        "
      />

      {/* CONTEÚDO */}
      <div className="relative z-10">

        {/* TOPO: Usa flexbox para manter alinhamento entre os botões */}
        <div className="flex justify-between items-center mb-6"> 

          {/* Botão Apoiar */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="
                  px-4 py-2 sm:px-6 sm:py-3 /* Padding ajustado */
                  rounded-full
                  bg-gray-700
                  hover:bg-gray-600
                  text-white text-sm sm:text-base font-bold /* Tamanho de fonte responsivo */
                  shadow-lg
                "
              >
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

          {/* Botão Atualizar */}
          <Button
            size="icon"
            onClick={fetchRanking}
            className="
              w-10 h-10 sm:w-11 sm:h-11 /* Tamanho fixo para ícone */
              bg-gray-700 
              hover:bg-gray-600 
              rounded-full
              shadow-lg
            "
          >
            <RefreshCw
              className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* TÍTULO */}
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-6">
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
          <div className="space-y-3"> {/* Espaçamento compacto */}
            {apoiadores.map((a, i) => (
              <div
                key={a.id}
                className="
                  flex items-center justify-between /* Garante alinhamento horizontal */
                  p-3 sm:p-4
                  rounded-xl sm:rounded-2xl
                  bg-gray-800/70
                  border border-white/5
                  shadow-md
                "
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0">{medal(i)}</div> {/* Garante que a medalha não encolha */}
                  <div>
                    {/* NOME */}
                    <p className="text-base sm:text-lg font-bold text-white truncate max-w-[150px] sm:max-w-none"> {/* Adiciona truncate para nomes longos */}
                      {a.nome}
                    </p>
                    {/* FILIAL */}
                    <p className="text-xs sm:text-sm font-semibold text-white/80">
                      Filial {a.filial}
                    </p>
                  </div>
                </div>

                {/* VALOR: Tamanho ajustado para caber melhor */}
                <p className="text-xl sm:text-2xl font-black text-white flex-shrink-0 ml-2"> 
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
