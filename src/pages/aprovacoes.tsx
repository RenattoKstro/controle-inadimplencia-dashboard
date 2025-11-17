// src/pages/aprovacoes.tsx
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Check, X, RefreshCw, Trophy, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const supabase = createClientComponentClient();

interface Pendente {
  id: string;
  nome: string;
  filial: string;
  valor: number;
  created_at: string;
}

export default function PainelAprovacoes() {
  const [user, setUser] = useState<any>(null);
  const [pendentes, setPendentes] = useState<Pendente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { toast } = useToast();

  // VERIFICA SE É O RENATO (só você entra)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email === "rks7ro@gmail.com") {
        setUser(data.user);
      }
    });
  }, []);

  const buscarPendentes = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("apoiadores_pendentes")
      .select("*")
      .order("created_at", { ascending: false });
    setPendentes(data || []);
    setCarregando(false);
  };

  useEffect(() => {
    if (user) {
      buscarPendentes();
      const interval = setInterval(buscarPendentes, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const aprovar = async (item: Pendente) => {
    const { error } = await supabase.from("apoiadores").insert({
      nome: item.nome,
      filial: item.filial,
      valor: item.valor,
    });

    if (!error) {
      await supabase.from("apoiadores_pendentes").delete().eq("id", item.id);
      toast({ title: `${item.nome} entrou no ranking!` });
      buscarPendentes();
    }
  };

  const rejeitar = async (id: string) => {
    await supabase.from("apoiadores_pendentes").delete().eq("id", id);
    toast({ title: "Rejeitado", variant: "destructive" });
    buscarPendentes();
  };

  // SE NÃO FOR O RENATO → REDIRECIONA (evita 404)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Shield className="w-24 h-24 mx-auto mb-6" />
          <h1 className="text-4xl font-black mb-4">Acesso Restrito</h1>
          <p className="text-xl">Faça login com rks7ro@gmail.com</p>
          <Button className="mt-8" onClick={() => window.location.href = "/"}>
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  // PAINEL DO RENATO (só você vê)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black text-purple-800 flex items-center justify-center gap-4">
            <Heart className="fill-red-500 text-red-500" /> Painel do Renato
          </h1>
          <p className="text-2xl text-purple-700 mt-4">Você decide quem entra no ranking</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800">
              Pendentes: {pendentes.length}
            </h2>
            <Button onClick={buscarPendentes} size="lg" className="gap-3 text-xl">
              <RefreshCw className={`w-7 h-7 ${carregando ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {carregando ? (
            <p className="text-center py-20 text-3xl text-gray-500">Carregando...</p>
          ) : pendentes.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6" />
              <p className="text-4xl font-black text-gray-700">Tudo aprovado!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {pendentes.map((p) => (
                <div key={p.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-10 border-4 border-purple-400 shadow-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                      <p className="text-5xl font-black text-purple-800">{p.nome}</p>
                      <p className="text-3xl text-purple-600 font-bold">{p.filial}</p>
                      <p className="text-6xl font-black text-green-600 mt-4">
                        R$ {p.valor.toFixed(0)}
                      </p>
                      <p className="text-lg text-gray-600 mt-3">
                        {new Date(p.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-black text-3xl px-16 py-10 shadow-2xl"
                        onClick={() => aprovar(p)}
                      >
                        <Check className="w-14 h-14 mr-4" />
                        APROVAR
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        className="font-black text-3xl px-16 py-10 shadow-2xl"
                        onClick={() => rejeitar(p.id)}
                      >
                        <X className="w-14 h-14 mr-4" />
                        REJEITAR
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
