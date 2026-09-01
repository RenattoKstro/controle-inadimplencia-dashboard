import { useMemo, useState } from "react";
import { CheckCircle, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ABATEDORES_FILIAIS, ABATEDORES_REGIONAL } from "@/constants/abatedores";

const parseFiliais = (value: string) => (
  value
    .split(/[\s,;]+/)
    .map((item) => Number(item.replace(/\D/g, "")))
    .filter((item) => Number.isFinite(item) && item > 0)
);

const ManualAbatedoresFiliais = () => {
  const [filiaisInput, setFiliaisInput] = useState(ABATEDORES_FILIAIS.join(", "));
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState("");

  const filiaisPreview = useMemo(() => Array.from(new Set(parseFiliais(filiaisInput))), [filiaisInput]);

  const handleAddFiliais = async () => {
    if (!filiaisPreview.length) {
      setResult("Informe pelo menos uma filial válida.");
      return;
    }

    setSaving(true);
    setResult("");

    const payload = filiaisPreview.map((idfilial) => ({
      idfilial,
      filial: `Filial ${String(idfilial).padStart(3, "0")}`,
      regional: ABATEDORES_REGIONAL,
      ativo: true,
    }));

    const { error } = await supabase
      .from("filiais")
      .upsert(payload, { onConflict: "idfilial" });

    if (error) {
      setResult(`Erro ao adicionar filiais: ${error.message}`);
      setSaving(false);
      return;
    }

    setResult(`${payload.length} filiais adicionadas/atualizadas em ${ABATEDORES_REGIONAL}.`);
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-purple-100">
          Adicione manualmente as filiais do grupo {ABATEDORES_REGIONAL} quando elas ainda não aparecerem na base importada.
        </p>
        <p className="mt-1 text-xs text-purple-300">
          Padrão: {ABATEDORES_FILIAIS.join(", ")}
        </p>
      </div>

      <Input
        value={filiaisInput}
        onChange={(event) => {
          setFiliaisInput(event.target.value);
          setResult("");
        }}
        placeholder="Ex.: 165, 193, 358, 359, 382, 386"
        className="bg-zinc-900 border-zinc-700 text-zinc-100"
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-purple-200">
        {filiaisPreview.map((filial) => (
          <span key={filial} className="rounded-md bg-purple-500/20 px-2 py-1 font-semibold text-purple-100">
            {filial}
          </span>
        ))}
      </div>

      <Button onClick={handleAddFiliais} disabled={saving || !filiaisPreview.length} className="bg-purple-600 hover:bg-purple-700">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
        Adicionar filiais ABATEDORES
      </Button>

      {result && (
        <p className="flex items-center gap-2 rounded-md border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-sm text-purple-100">
          <CheckCircle className="h-4 w-4" /> {result}
        </p>
      )}
    </div>
  );
};

export default ManualAbatedoresFiliais;
