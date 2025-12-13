// src/components/GerenciarUsuarios.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      // 1. Pega TODOS os registros da tabela user_dashboard
      const { data: dashboard, error } = await supabase
        .from("user_dashboard")
        .select("id, user_id, email, nome_usuario, filial")
        .not("user_id", "is", null);

      if (error || !dashboard || dashboard.length === 0) {
        console.log("Nenhum usuário encontrado ou erro:", error);
        setUsuarios([]);
        setLoading(false);
        return;
      }

      // 2. Pega os nomes das filiais
      const filiaisIds = dashboard
        .map(u => u.filial)
        .filter(Boolean);

      let filiaisMap: any = {};
      if (filiaisIds.length > 0) {
        const { data: filiais } = await supabase
          .from("filiais")
          .select("idfilial, filial")
          .in("idfilial", filiaisIds);

        filiaisMap = Object.fromEntries(
          (filiais || []).map(f => [f.idfilial, f.filial])
        );
      }

      // 3. Monta a lista completa
      const lista = dashboard.map(u => ({
        user_id: u.user_id,
        email: u.email || "Sem e-mail",
        nome_usuario: u.nome_usuario || "Sem nome",
        nome_filial: u.filial ? filiaisMap[u.filial] || `Filial ${u.filial}` : "Sem filial"
      }));

      setUsuarios(lista);
    } catch (err) {
      console.error("Erro fatal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user_id: string) => {
    if (!confirm("Tem certeza que quer excluir este usuário?")) return;

    // Remove do user_dashboard
    await supabase.from("user_dashboard").delete().eq("user_id", user_id);
    
    fetchUsuarios();
  };

  if (loading) {
    return <p className="text-center py-20 text-xl">Carregando usuários...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
        <h3 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h3>
        <p className="text-blue-100 mt-1">{usuarios.length} usuários encontrados</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>E-mail</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Filial</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-16 text-gray-500">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map((u) => (
              <TableRow key={u.user_id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell className="font-bold text-purple-700">
                  {u.nome_usuario}
                </TableCell>
                <TableCell>{u.nome_filial}</TableCell>
                <TableCell className="text-xs font-mono text-gray-600">
                  {u.user_id.slice(0, 8)}...
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(u.user_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default GerenciarUsuarios;
