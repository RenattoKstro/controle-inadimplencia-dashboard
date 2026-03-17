// src/components/UploadFiliaisExcel.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

const UploadFiliaisExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResult("");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        let success = 0;
        const batchSize = 100;
        const batch: Array<{ idfilial: number; filial: string; regional: string; ativo: boolean }> = [];

        for (const row of json) {
          const r = row as Record<string, unknown>;

          let idfilial: number | null = null;
          for (const key in r) {
            if (key.toLowerCase().includes("idfilial") || key.toLowerCase().includes("id")) {
              const num = Number(r[key]);
              if (num >= 10000) {
                idfilial = num;
                break;
              }
            }
          }
          if (!idfilial) continue;

          let nomeFilial = "Filial Desconhecida";
          for (const key in r) {
            if (key.toLowerCase().includes("filial")) {
              nomeFilial = String(r[key]).trim();
              break;
            }
          }

          let regional = "";
          for (const key in r) {
            if (key.toLowerCase().includes("regional")) {
              regional = String(r[key]).trim();
              break;
            }
          }

          batch.push({
            idfilial,
            filial: nomeFilial,
            regional,
            ativo: true,
          });

          if (batch.length === batchSize) {
            const { error } = await supabase
              .from("filiais")
              .upsert(batch, { onConflict: "idfilial" });
            success += error ? 0 : batch.length;
            setProgress((success / json.length) * 100);
            batch.length = 0;
          }
        }

        if (batch.length > 0) {
          const { error } = await supabase
            .from("filiais")
            .upsert(batch, { onConflict: "idfilial" });
          success += error ? 0 : batch.length;
        }

        setResult(`SUCESSO! ${success} filiais importadas/atualizadas.`);
      } catch (err) {
        console.error(err);
        setResult("Erro ao processar o arquivo.");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Card className="max-w-md mx-auto border border-green-500/40 bg-zinc-950/60">
      <CardHeader className="bg-green-600/15 border-b border-green-500/20 text-green-100 text-center py-2 px-3">
        <CardTitle className="text-sm md:text-base font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle className="h-4 w-4" />
Upload Base Filiais
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2.5">
        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          disabled={uploading}
          className="bg-zinc-900 border-zinc-700 text-zinc-100"
        />

        {file && <p className="text-xs text-green-300 truncate">Arquivo: {file.name}</p>}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          size="sm"
          className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
        >
          {uploading ? `Importando... ${Math.round(progress)}%` : "Importar"}
        </Button>

        {uploading && <Progress value={progress} className="h-1.5" />}

        {result && (
          <div className="p-2 bg-green-500/10 border border-green-500/40 rounded-md text-xs text-green-200">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadFiliaisExcel;
