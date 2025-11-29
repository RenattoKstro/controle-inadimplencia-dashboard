// src/components/UploadFiliaisExcel.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

const UploadFiliaisExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success?: number; error?: number; message?: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult({});
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResult({});

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: null });

        let success = 0;
        let error = 0;
        const batchSize = 100;
        const batch: any[] = [];

        const findColumn = (row: any, names: string[]) => {
          for (const name of names) {
            const found = Object.keys(row).find(k => k.trim().toLowerCase() === name.toLowerCase());
            if (found) return row[found];
          }
          return null;
        };

        for (let i = 0; i < json.length; i++) {
          const row = json[i] as any;

          const idRaw = findColumn(row, ["IDfilial", "idfilial", "IDFilial", "filial", "loja", "numero"]);
          const idfilial = Number(idRaw);

          if (!idfilial || isNaN(idfilial) || idfilial <= 0) {
            error++;
            continue;
          }

          const registro = {
            IDfilial: idfilial,
            Filial: String(findColumn(row, ["Filial", "filial", "nome", "nome_filial"]) || "Sem nome").trim(),
            UF: String(findColumn(row, ["UF", "uf", "estado"]) || "").trim().toUpperCase(),
            Cidade: String(findColumn(row, ["Cidade", "cidade"]) || "").trim(),
            praca: String(findColumn(row, ["Praça", "praca", "Praça ", "praca ", "praca"]) || "").trim(), // ← agora é "praca"
            Regional: String(findColumn(row, ["Regional", "regional"]) || "").trim(),
            qtd_cidade: Number(findColumn(row, ["qtd_cidade", "qtdcidade", "quantidade_cidade"]) || 1) || 1,
            ativo: true
          };

          batch.push(registro);

          if (batch.length === batchSize || i === json.length - 1) {
            const { error: upsertError } = await supabase
              .from("filiais")
              .upsert(batch, { onConflict: "IDfilial" });

            if (upsertError) {
              console.error("Erro no lote:", upsertError);
              error += batch.length;
            } else {
              success += batch.length;
            }

            setProgress(((i + 1) / json.length) * 100);
            batch.length = 0;
          }
        }

        setResult({
          success,
          error,
          message: `Importação concluída com sucesso! ${success} filiais importadas/atualizadas. ${error > 0 ? `${error} linhas ignoradas (IDfilial inválido).` : ""}`
        });

      } catch (err) {
        console.error("Erro fatal:", err);
        setResult({ message: "Erro ao processar o arquivo. Verifique o formato." });
      } finally {
        setUploading(false);
        setProgress(0);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Upload className="h-8 w-8" />
          Importar Base de Filiais (Excel)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Arquivo Excel (.xlsx)</Label>
          <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={uploading} />
          <p className="text-sm text-green-600 font-medium">
            Funciona com qualquer nome de coluna (com ou sem acento, maiúscula/minúscula)
          </p>
        </div>

        {file && <p className="text-sm">Arquivo carregado: <strong>{file.name}</strong></p>}

        <Button onClick={handleUpload} disabled={!file || uploading} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          {uploading ? `Importando... ${Math.round(progress)}%` : "Importar Todas as Filiais"}
        </Button>

        {uploading && <Progress value={progress} className="h-4" />}

        {result.message && (
          <div className={`p-6 rounded-lg border-2 text-center ${result.success! > 0 ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"}`}>
            {result.success! > 0 ? (
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
            )}
            <p className="text-lg font-bold">{result.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadFiliaisExcel;
