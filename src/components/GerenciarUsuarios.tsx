// src/components/GerenciarUsuarios.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Save, X } from "lucide-react";

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      // 1. Pega TODOS os usuários da tabela auth.users
      const { data: authUsers, error: err1 } = await supabase.auth.admin.listUsers();

      if (err1 || !authUsers?.users) {
        console.error("Erro ao carregar usuários do auth:", err1);
        setLoading(false);
        return;
      }

      // 2. Pega dados do user_dashboard (nome_usuario, filial, etc)
      const { data: dashboardUsers, error: err2 } = await supabase
        .from("user_dashboard")
        .select("user_id, nome_usuario, filial");

      if (err2) {
        console.error("Erro no user_dashboard:", err2);
        setLoading(false);
        return;
      }

      // 3. Pega nome das filiais
      const filiaisIds = dashboardUsers
        ?.map(u => u.filial)
        .filter(Boolean) || [];

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

      // 4. Junta tudo: auth.users + user_dashboard + filiais
      const usuariosCompletos = authUsers.users.map(authUser => {
        const dash = dashboardUsers?.find(d => d.user_id === authUser.id);
        const nomeFilial = dash?.filial 
          ? filiaisMap[dash.filial] || `Filial ${dash.filial}`
          : "Sem filial";

        return {
          user_id: authUser.id,
          email: authUser.email || "Sem e-mail",
          nome_usuario: dash?.nome_usuario || "Sem nome",
          nome_filial: nomeFilial,
        };
      });

      setUsuarios(usuariosCompletos);
    } catch (err) {
      console.error("Erro fatal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user_id: string) => {
    if (!confirm("Tem certeza que quer excluir este usuário?")) return;

    // Exclui do user_dashboard
    await supabase.from("user_dashboard").delete().eq("user_id", user_id);
    
    // Exclui do auth (só admin pode)
    await supabase.auth.admin.deleteUser(user_id);

    fetchUsuarios();
  };

  if (loading) {
    return <p className="text-center py-20 text-xl">Carregando usuários...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <TableHead className="text-white">E-mail</TableHead>
            <TableHead className="text-white">Nome</TableHead>
            <TableHead className="text-white">Filial</TableHead>
            <TableHead className="text-white">User ID</TableHead>
            <TableHead className="text-right text-white">Ações</TableHead>
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
