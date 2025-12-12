// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Target, Zap, Store, Phone, Instagram } from "lucide-react";
import { supabase } from "@/components/integrations/supabase/client";
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/ui/hover-card";

interface RankingFilial {
  idfilial: number;
  filial: string;
  regional: string;
  total_vencido: number;
  total_meta_fiado: number;
  total_meta_desafio: number;
  pct_fiado: number;
  pct_desafio: number;
  total_usuarios: number;
}

const Filiais = () => {
  const [ranking, setRanking] = useState<RankingFilial[]>([]);
  const [regionais, setRegionais] = useState<string[]>([]);
  const [filtroRegional, setFiltroRegional] = useState<string>("todas");
  const [ocultarZeradas, setOcultarZeradas] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data } = await supabase
        .from("vw_ranking_filiais")
        .select("*");
      if (data) {
        const lista = data as RankingFilial[];
        const regs = [...new Set(lista.map(f => f.regional || "Sem regional")].sort();
        setRegionais(regs);
        setRanking(lista);
      }
      setLoading(false);
    };
    fetchRanking();
    const interval = setInterval(fetchRanking, 30_000);
    return () => clearInterval(interval);
  }, []);

  let dadosFiltrados = ranking;

  if (filtroRegional !== "todas") {
    dadosFiltrados = dadosFiltrados.filter(f => (f.regional || "Sem regional") === filtroRegional);
  }
  if (ocultarZeradas) {
    dadosFiltrados = dadosFiltrados.filter(f =>
      f.total_meta_fiado > 0 || f.total_meta_desafio > 0
    );
  }

  if (loading) return <p className="text-center py-20 text-xl">Carregando...</p>;

  return (
    <div className="space-y-6">
      {/* FILTROS (igual antes) */}
      {/* ... seu código de filtro aqui ... */}

      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-3">Filial</th>
              <th className="px-4 py-3 text-center">Meta Fiado</th>
              <th className="px-4 py-3 text-center">Meta Desafio</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((f, i) => (
              <tr key={f.idfilial} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {i < 3 && (
                      <Trophy className={`h-5 w-5 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-orange-600"}`} />
                    )}
                    <span className="font-bold">{i + 1}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <HoverCard openDelay={200}>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500">
                          <img
                            src={`https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/public/perfis/${f.usuarios[0]?.user_id}.jpeg` || "https://via.placeholder.com/40"}

                          />
                        </div>
                      </div>
                    </HoverCardTrigger>
                  </HoverCard>
                  <HoverCardContent className="w-80">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
                        <img
                          src={`https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/public/perfis/${f.usuarios[0]?.user_id}.jpeg`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="font-bold text-lg">{f.usuarios[0]?.nome_usuario || "Usuário"}</p>
                      <p className="text-sm text-muted-foreground">Filial {f.filial}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {f.usuarios[0]?.whatsapp && (
                        <a
                          href={`https://wa.me/55${f.usuarios[0].whatsapp}`}
                          target="_blank"
                          className="flex items-center gap-2 text-green-600 hover:underline">
                          <Phone className="h-4 w-4" /> WhatsApp
                        </a>
                      )}
                      {f.usuarios[0]?.instagram && (
                        <a
                          href={`https://instagram.com/${f.usuarios[0].instagram.replace("@", "")}`}
                          target="_blank"
                          className="flex items-center gap-2 text-pink-600 hover:underline">
                          <Instagram className="h-4 w-4" /> Instagram
                        </a>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCardTrigger>
              )}
              <p className="font-medium">{f.filial}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="space-y-1">
                    <p className="font-bold text-lg">{f.pct_fiado.toFixed(2)}%</p>
                    <Progress value={f.pct_fiado} className="h-3"
                      indicatorClassName={f.pct_fiado >= 100 ? "bg-green-500" : f.pct_fiado >= 95 ? "bg-yellow-500" : "bg-red-500"} />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="space-y-1">
                    <p className="font-bold text-lg flex items-center justify-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {f.pct_desafio.toFixed(2)}%
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Filiais;
