// src/components/GerenciarUsuarios.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Save, X } from "lucide-react";

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      // 1. Pega todos os usuários da tabela user_dashboard
      const { data: users, error } = await supabase
        .from("user_dashboard")
        .select("id, user_id, email, nome_usuario, filial")
        .order("email");

      if (error) {
        console.error("Erro ao carregar usuários:", error);
        return;
      }

      if (!users || users.length === 0) {
        setUsuarios([]);
        setLoading(false);
        return;
      }

      // 2. Pega o nome das filiais
      const filiaisIds = users
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

      // 3. Junta tudo
      const usuariosFormatados = users.map(u => ({
        ...u,
        nome_filial: u.filial ? filiaisMap[u.filial] || `Filial ${u.filial}` : "Sem filial"
      }));

      setUsuarios(usuariosFormatados);
    } catch (err) {
      console.error("Erro fatal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que quer excluir este usuário?")) return;
    await supabase.from("user_dashboard").delete().eq("id", id);
    fetchUsuarios();
  };

  const handleSave = async (id: string) => {
    await supabase.from("user_dashboard").update(editForm).eq("id", id);
    setEditingId(null);
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
              <TableRow key={u.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium">{u.email || "—"}</TableCell>
                <TableCell className="font-bold text-purple-700">
                  {u.nome_usuario || "—"}
                </TableCell>
                <TableCell>{u.nome_filial}</TableCell>
                <TableCell className="text-xs font-mono text-gray-600">
                  {u.user_id ? u.user_id.slice(0, 8) + "..." : "—"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {editingId === u.id ? (
                    <>
                      <Button size="sm" onClick={() => handleSave(u.id)} className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => { setEditingId(u.id); setEditForm(u); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
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
