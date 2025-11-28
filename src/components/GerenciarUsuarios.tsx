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
      .select("id, email, role, filial, created_at")
      .order("created_at", { ascending: false });

    if (!error) setUsuarios(data || []);
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

  if (loading) return <p>Carregando usuários...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>E-mail</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Filial</TableHead>
          <TableHead>Data Cadastro</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((u) => (
          <TableRow key={u.id}>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              {editingId === u.id ? (
                <select
                  value={editForm.role || u.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="bg-gray-800 text-white px-2 py-1 rounded"
                >
                  <option value="líder">Líder</option>
                  <option value="auxiliar">Auxiliar</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                u.role
              )}
            </TableCell>
            <TableCell>{u.filial || "—"}</TableCell>
            <TableCell>{new Date(u.created_at).toLocaleDateString("pt-BR")}</TableCell>
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
        ))}
      </TableBody>
    </Table>
  );
};

export default GerenciarUsuarios;
