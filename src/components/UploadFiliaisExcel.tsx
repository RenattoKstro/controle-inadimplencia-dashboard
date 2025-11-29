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
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        let success = 0;
        let error = 0;
        const batchSize = 100;
        const batch: any[] = [];

        for (let i = 0; i < json.length; i++) {
          const row = json[i] as any;

          // Converte todas as chaves para minúsculo e remove espaços/aspas
          const cleanRow: any = {};
          for (const key in row) {
            const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
            cleanRow[cleanKey] = String(row[key]).trim();
          }

          const idfilial = Number(cleanRow["idfilial"] || cleanRow["id"] || cleanRow["filial"]);

          if (!idfilial || isNaN(idfilial) || idfilial < 10000) {
            error++;
            continue;
          }

          batch.push({
            idfilial: idfilial,
            filial: cleanRow["filial"] || `Filial ${idfilial}`,
            uf: (cleanRow["uf"] || "").toUpperCase(),
            cidade: cleanRow["cidade"] || "",
            praca: cleanRow["praca"] || "",
            regional: cleanRow["regional"] || "",
            qtd_cidade: Number(cleanRow["qtdcidade"] || cleanRow["qtd_cidade"] || 1) || 1,
            ativo: true
          });

          if (batch.length === batchSize || i === json.length - 1) {
            const { error: err } = await supabase
              .from("filiais")
              .upsert(batch, { onConflict: "idfilial" });

            if (err) {
              console.error("Erro Supabase:", err);
              error += batch.length;
            } else {
              success += batch.length;
            }
            setProgress(((i + 1) / json.length) * 100);
            batch.length = 0;
          }
        }

        setResult(`SUCESSO! ${success} filiais importadas. ${error} ignoradas.`);

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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Upload className="h-8 w-8" />
          Importar Filiais (ACEITA QUALQUER ARQUIVO)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} disabled={uploading} />
        {file && <p className="text-green-600 font-bold">Arquivo carregado: {file.name}</p>}
        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full" size="lg">
          {uploading ? `Importando... ${Math.round(progress)}%` : "IMPORTAR AGORA"}
        </Button>
        {uploading && <Progress value={progress} />}
        {result && (
          <div className={`p-6 text-center text-xl font-bold rounded-lg ${result.includes("SUCESSO") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadFiliaisExcel;
