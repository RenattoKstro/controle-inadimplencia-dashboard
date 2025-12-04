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
    const { data, error } = await supabase
      .from("user_dashboard")
      .select(`
        id,
        user_id,
        email,
        nome_usuario,
        filial,
        role,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Busca nome da filial pra mostrar bonito
      const filiaisIds = data
        .map(u => u.filial)
        .filter(Boolean);
      
      if (filiaisIds.length > 0) {
        const { data: filiais } = await supabase
          .from("filiais")
          .select("idfilial, filial")
          .in("idfilial", filiaisIds);

        const filiaisMap = Object.fromEntries(
          (filiais || []).map(f => [f.idfilial, f.filial])
        );

        const usuariosComFilial = data.map(u => ({
          ...u,
          nome_filial: u.filial ? filiaisMap[u.filial] || `Filial ${u.filial}` : "Sem filial"
        }));

        setUsuarios(usuariosComFilial);
      } else {
        setUsuarios(data.map(u => ({ ...u, nome_filial: "Sem filial" })));
      }
    }
    setLoading(false);
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

  if (loading) return <p className="text-center py-10 text-xl">Carregando usuários...</p>;

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <TableHead className="text-white">E-mail</TableHead>
            <TableHead className="text-white">Nome</TableHead>
            <TableHead className="text-white">Filial</TableHead>
            <TableHead className="text-white">User ID</TableHead>
            <TableHead className="text-white">Função</TableHead>
            <TableHead className="text-white">Cadastro</TableHead>
            <TableHead className="text-right text-white">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                Nenhum usuário cadastrado ainda.
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
                  {u.user_id?.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {editingId === u.id ? (
                    <select
                      value={editForm.role || u.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="bg-gray-100 px-3 py-1 rounded border"
                    >
                      <option value="líder">Líder</option>
                      <option value="auxiliar">Auxiliar</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.role === "líder" ? "bg-blue-100 text-blue-800" :
                      u.role === "auxiliar" ? "bg-gray-100 text-gray-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {u.role || "—"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
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
