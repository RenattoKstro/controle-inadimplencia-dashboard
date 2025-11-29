// src/components/UploadFiliaisExcel.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Upload } from "lucide-react";
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
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        let success = 0;
        let error = 0;
        const batchSize = 100;
        const batch: any[] = [];

        for (const row of json) {
          const r = row as any;
          const idfilial = Number(r.idfilial);

          if (!idfilial || isNaN(idfilial)) {
            error++;
            continue;
          }

          batch.push({
            idfilial: idfilial,
            filial: String(r.filial || "").trim(),
            uf: String(r.uf || "").trim().toUpperCase(),
            cidade: String(r.cidade || "").trim(),
            praca: String(r.praca || "").trim(),
            regional: String(r.regional || "").trim(),
            qtd_cidade: Number(r.qtd_cidade) || 1,
            ativo: true,
          });

          if (batch.length === batchSize) {
            const { error: err } = await supabase
              .from("filiais")
              .upsert(batch, { onConflict: "idfilial" });

            if (err) error += batch.length;
            else success += batch.length;

            setProgress((success + error) / json.length * 100);
            batch.length = 0;
          }
        }

        // último lote
        if (batch.length > 0) {
          const { error: err } = await supabase
            .from("filiais")
            .upsert(batch, { onConflict: "idfilial" });
          if (err) error += batch.length;
          else success += batch.length;
        }

        setResult(`SUCESSO! ${success} filiais importadas. ${error} ignoradas.`);
      } catch (err) {
        setResult("Erro ao processar o arquivo.");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Upload className="h-8 w-8" />
          Importar Filiais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={uploading} />
        {file && <p className="text-sm font-medium">Arquivo: {file.name}</p>}
        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full" size="lg">
          {uploading ? `Importando... ${Math.round(progress)}%` : "IMPORTAR AGORA"}
        </Button>
        {uploading && <Progress value={progress} />}
        {result && (
          <div className={`p-4 rounded-lg text-center font-bold text-lg ${result.includes("SUCESSO") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadFiliaisExcel;
