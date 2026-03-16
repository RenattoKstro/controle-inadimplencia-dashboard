import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Pencil, Save, X, Plus } from "lucide-react";

interface UsuarioDashboard {
  id: number | string | null;
  user_id: string | null;
  email?: string | null;
  nome_usuario?: string | null;
  filial?: number | null;
  role?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  membro?: boolean | null;
}

interface FilialInfo {
  idfilial: number;
  filial: string;
  regional: string | null;
}

interface UsuarioComFilial {
  id: number | string | null;
  user_id: string;
  email: string;
  nome_usuario: string;
  filial_id: number | null;
  nome_filial: string;
  regional: string;
  role: string;
  whatsapp: string;
  instagram: string;
  membro: boolean;
  origem?: "user_dashboard" | "vw_ranking_filiais";
}

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioComFilial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRowDbId, setEditingRowDbId] = useState<string | null>(null);
  const [editingOrigem, setEditingOrigem] = useState<"user_dashboard" | "vw_ranking_filiais" | null>(null);
  const [schemaTemMembro, setSchemaTemMembro] = useState(true);
  const [form, setForm] = useState({ nome_usuario: "", filial_id: "", regional: "", membro: false });
  const [novaRegional, setNovaRegional] = useState("");

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const { data: dashboard, error } = await supabase
        .from("user_dashboard")
        .select("*")
        .order("nome_usuario", { ascending: true });

      if (error || !dashboard) {
        setUsuarios([]);
        return;
      }

      const usuariosDb = (dashboard as unknown as UsuarioDashboard[])
        .map((u, index) => ({
          ...u,
          user_id: u.user_id || `row-${u.id ?? index}`,
        }));

      if (!usuariosDb.length) {
        setUsuarios([]);
        return;
      }

      const filiaisIds = Array.from(
        new Set(
          usuariosDb
            .map((u) => u.filial)
            .filter((f): f is number => typeof f === "number")
        )
      );

      let filiaisMap: Record<number, FilialInfo> = {};
      if (filiaisIds.length > 0) {
        const { data: filiais } = await supabase
          .from("filiais")
          .select("idfilial, filial, regional")
          .in("idfilial", filiaisIds);

        filiaisMap = Object.fromEntries((filiais as FilialInfo[] || []).map((f) => [f.idfilial, f]));
      }

      const lista: UsuarioComFilial[] = usuariosDb.map((u) => {
        const filialId = typeof u.filial === "number" ? u.filial : null;
        const filialData = filialId ? filiaisMap[filialId] : undefined;

        return {
          id: u.id,
          user_id: u.user_id || String(u.id),
          email: u.email || "Sem e-mail",
          nome_usuario: u.nome_usuario || "Sem nome",
          filial_id: filialId,
          nome_filial: filialData?.filial || (filialId ? `Filial ${filialId}` : "Sem filial"),
          regional: filialData?.regional || "Sem regional",
          role: u.role || "Sem perfil",
          whatsapp: u.whatsapp || "-",
          instagram: u.instagram || "-",
          membro: Boolean(u.membro) || (u.role || "").toLowerCase() === "membro",
          origem: "user_dashboard",
        };
      });

      const { data: rankingData } = await supabase
        .from("vw_ranking_filiais")
        .select("idfilial, filial, regional, usuario_principal")
        .not("usuario_principal", "is", null);

      if (rankingData) {
        const existentes = new Set(lista.map((u) => u.user_id));
        const extras: UsuarioComFilial[] = (rankingData as Array<{
          idfilial: number;
          filial: string;
          regional: string | null;
          usuario_principal: {
            user_id: string;
            nome_usuario: string;
            whatsapp: string;
            instagram: string;
          } | null;
        }>)
          .filter((r) => r.usuario_principal?.user_id)
          .map((r, index) => {
            const principal = r.usuario_principal as {
              user_id: string;
              nome_usuario?: string | null;
              whatsapp?: string | null;
              instagram?: string | null;
              role?: string | null;
              membro?: boolean | null;
            } | null;

            return {
              id: `view-${r.idfilial}-${index}`,
              user_id: principal?.user_id || `view-user-${index}`,
              email: "Sem e-mail",
              nome_usuario: principal?.nome_usuario || "Sem nome",
              filial_id: r.idfilial,
              nome_filial: r.filial || `Filial ${r.idfilial}`,
              regional: r.regional || "Sem regional",
              role: principal?.role || "Sem perfil",
              whatsapp: principal?.whatsapp || "-",
              instagram: principal?.instagram || "-",
              membro: Boolean(principal?.membro) || (principal?.role || "").toLowerCase() === "membro",
              origem: "vw_ranking_filiais",
            };
          })
          .filter((u) => !existentes.has(u.user_id));

        setUsuarios([...lista, ...extras]);
        return;
      }

      setUsuarios(lista);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (u: UsuarioComFilial) => {
    setEditingUserId(u.user_id);
    const rowId = u.id !== null ? String(u.id) : null;
    setEditingRowDbId(rowId && !rowId.startsWith("view-") ? rowId : null);
    setEditingOrigem(u.origem || "user_dashboard");
    setForm({
      nome_usuario: u.nome_usuario,
      filial_id: u.filial_id ? String(u.filial_id) : "",
      regional: u.regional === "Sem regional" ? "" : u.regional,
      membro: u.membro,
    });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditingRowDbId(null);
    setEditingOrigem(null);
    setForm({ nome_usuario: "", filial_id: "", regional: "", membro: false });
  };

  const saveEdit = async (userId: string) => {
    const filialNumber = form.filial_id ? Number(form.filial_id) : null;

    if (userId.startsWith("row-")) {
      alert("Este usuário não possui user_id válido para atualização. Complete o cadastro na base primeiro.");
      return;
    }

    const updateWithMembro = async () => {
      if (!schemaTemMembro) {
        return { data: null, error: { message: "membro column unavailable" } };
      }

      const base = supabase
        .from("user_dashboard")
        .update({ nome_usuario: form.nome_usuario, filial: filialNumber, membro: form.membro })
        .select("user_id");
      if (editingRowDbId && editingOrigem === "user_dashboard") return base.eq("id", editingRowDbId);
      return base.eq("user_id", userId);
    };

    const updateWithoutMembro = async () => {
      const base = supabase
        .from("user_dashboard")
        .update({ nome_usuario: form.nome_usuario, filial: filialNumber })
        .select("user_id");
      if (editingRowDbId && editingOrigem === "user_dashboard") return base.eq("id", editingRowDbId);
      return base.eq("user_id", userId);
    };

    let saveError: { message?: string } | null = null;
    let updatedSuccessfully = false;

    const { data: firstUpdateRows, error: userError } = await updateWithMembro();
    const firstUpdateAffected = Array.isArray(firstUpdateRows) && firstUpdateRows.length > 0;
    const erroColunaMembro = (userError?.message || "").toLowerCase().includes("could not find the 'membro' column");

    if (erroColunaMembro) {
      setSchemaTemMembro(false);
    }

    if (!userError && firstUpdateAffected) {
      updatedSuccessfully = true;
    } else {
      const { data: fallbackRows, error: fallbackUpdateError } = await updateWithoutMembro();
      const fallbackAffected = Array.isArray(fallbackRows) && fallbackRows.length > 0;

      if (!fallbackUpdateError && fallbackAffected) {
        updatedSuccessfully = true;
      } else {
        saveError = fallbackUpdateError || userError || { message: "usuário não encontrado em user_dashboard (ou sem permissão de leitura por RLS)" };
      }
    }

    if (updatedSuccessfully) {
      const roleValue = form.membro ? "membro" : null;
      const { error: roleError } = await supabase
        .from("user_dashboard")
        .update({ role: roleValue })
        .eq("user_id", userId);

      if (roleError) {
        // não bloqueia o fluxo: alguns ambientes podem não ter permissão para role.
      }
    }

    if (saveError) {
      if ((saveError.message || "").toLowerCase().includes("row-level security")) {
        alert("Erro de permissão (RLS): este usuário ainda não pode ser alterado pelo painel. Peça para ele abrir o dashboard e salvar os dados em Ajustes de Metas ao menos uma vez.");
      } else {
        alert(`Erro ao atualizar usuário: ${saveError.message || "verifique permissões da base."}`);
      }
      return;
    }

    alert("Usuário atualizado com sucesso.");

    if (filialNumber && form.regional.trim()) {
      await supabase
        .from("filiais")
        .upsert(
          [{ idfilial: filialNumber, regional: form.regional.trim(), ativo: true }],
          { onConflict: "idfilial" }
        );
    }

    cancelEdit();
    fetchUsuarios();
  };

  const handleDelete = async (userId: string, dbId: number | string | null) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    const query = supabase
      .from("user_dashboard")
      .delete();

    const deleteQuery = dbId !== null ? query.eq("id", String(dbId)) : query.eq("user_id", userId);

    const { error } = await deleteQuery;

    if (error) {
      alert("Erro ao excluir usuário.");
      return;
    }

    fetchUsuarios();
  };

  const aplicarRegionalEmMassa = async () => {
    if (!novaRegional.trim()) return;

    const filiaisIds = Array.from(
      new Set(
        usuarios
          .map((u) => u.filial_id)
          .filter((id): id is number => Boolean(id))
      )
    );

    if (filiaisIds.length === 0) {
      alert("Nenhuma filial para aplicar regional.");
      return;
    }

    const payload = filiaisIds.map((id) => ({ idfilial: id, regional: novaRegional.trim(), ativo: true }));

    const { error } = await supabase
      .from("filiais")
      .upsert(payload, { onConflict: "idfilial" });

    if (error) {
      alert("Erro ao aplicar regional.");
      return;
    }

    setNovaRegional("");
    fetchUsuarios();
  };

  if (loading) return <p className="text-center py-10">Carregando usuários...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <p className="text-sm text-zinc-300">Total de usuários: {usuarios.length}</p>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            value={novaRegional}
            onChange={(e) => setNovaRegional(e.target.value)}
            placeholder="Adicionar/forçar regional em todas filiais da lista"
            className="md:w-96 bg-zinc-900 border-zinc-700 text-zinc-100"
          />
          <Button size="sm" onClick={aplicarRegionalEmMassa} className="bg-indigo-600 hover:bg-indigo-500">
            <Plus className="h-4 w-4 mr-1" /> Aplicar
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-700 overflow-auto max-h-[70vh]">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="bg-zinc-900/80 hover:bg-zinc-900/80 sticky top-0 z-20">
              <TableHead>E-mail</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead>Regional</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Instagram</TableHead>
              <TableHead>Membros</TableHead>
              <TableHead className="hidden lg:table-cell">ID</TableHead>
              <TableHead className="text-right sticky right-0 bg-zinc-900/95">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10">Nenhum usuário encontrado.</TableCell>
              </TableRow>
            ) : (
              usuarios.map((u) => {
                const isEditing = editingUserId === u.user_id;
                return (
                  <TableRow key={u.user_id} className="hover:bg-zinc-800/50">
                    <TableCell className="max-w-48 truncate">{u.email}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.nome_usuario}
                          onChange={(e) => setForm((prev) => ({ ...prev, nome_usuario: e.target.value }))}
                          className="h-8 bg-zinc-900 border-zinc-700 text-zinc-100"
                        />
                      ) : u.nome_usuario}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.filial_id}
                          onChange={(e) => setForm((prev) => ({ ...prev, filial_id: e.target.value }))}
                          className="h-8 w-28 bg-zinc-900 border-zinc-700 text-zinc-100"
                        />
                      ) : `${u.nome_filial} (${u.filial_id ?? "-"})`}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.regional}
                          onChange={(e) => setForm((prev) => ({ ...prev, regional: e.target.value }))}
                          className="h-8 w-36 bg-zinc-900 border-zinc-700 text-zinc-100"
                        />
                      ) : u.regional}
                    </TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.whatsapp}</TableCell>
                    <TableCell>{u.instagram}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.membro}
                            onChange={(e) => setForm((prev) => ({ ...prev, membro: e.target.checked }))}
                          />
                          Membro
                        </label>
                      ) : (u.membro ? "Sim" : "Não")}
                    </TableCell>
                    <TableCell className="text-xs font-mono hidden lg:table-cell">{u.user_id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-right space-x-1 sticky right-0 bg-zinc-950/95">
                      {isEditing ? (
                        <>
                          <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-500" onClick={() => saveEdit(u.user_id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="h-8" onClick={() => startEdit(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8" onClick={() => handleDelete(u.user_id, u.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GerenciarUsuarios;
