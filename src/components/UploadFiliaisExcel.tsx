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
        const json = XLSX.utils.sheet_to_json(sheet);

        const filiaisFormatadas = json.map((row: any, index) => {
          const idfilial = Number(row.IDfilial || row.idfilial || row["IDfilial"] || row["idfilial"]);
          
          if (!idfilial || isNaN(idfilial)) {
            console.warn(`Linha ${index + 2} ignorada: IDfilial inválido`, row);
            return null;
          }

          return {
            IDfilial: idfilial,
            Filial: String(row.Filial || row.filial || "Filial " + idfilial).trim(),
            UF: String(row.UF || row.uf || "").trim().toUpperCase(),
            Cidade: String(row.Cidade || row.cidade || "").trim(),
            "Praça": String(row.Praça || row.praça || row["Praça"] || "").trim(),
            Regional: String(row.Regional || row.regional || "").trim(),
            qtd_cidade: Number(row.qtd_cidade || row["qtd_cidade"] || 1) || 1,
            ativo: true
          };
        }).filter(Boolean);

        // Envia em lotes
        const batchSize = 100;
        let success = 0;
        let error = 0;

        for (let i = 0; i < filiaisFormatadas.length; i += batchSize) {
          const batch = filiaisFormatadas.slice(i, i + batchSize);
          
          const { error: upsertError } = await supabase
            .from("filiais")
            .upsert(batch, { 
              onConflict: "IDfilial", 
              ignoreDuplicates: false 
            });

          if (upsertError) {
            console.error("Erro no lote:", upsertError);
            error += batch.length;
          } else {
            success += batch.length;
          }

          setProgress(((i + batch.length) / filiaisFormatadas.length) * 100);
        }

        setResult({
          success,
          error,
          message: `Importação concluída! ${success} filiais processadas. ${error > 0 ? `${error} com erro.` : ""}`
        });

      } catch (err) {
        console.error("Erro:", err);
        setResult({ message: "Erro ao processar o arquivo. Verifique se está no formato correto." });
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
          <Label>Arquivo Excel</Label>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p className="text-sm text-muted-foreground">
            Colunas obrigatórias: <strong>IDfilial, Filial, UF, Cidade, Praça, Regional, qtd_cidade</strong>
          </p>
        </div>

        {file && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            Arquivo selecionado: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          size="lg"
          className="w-full"
        >
          {uploading ? (
            <>Processando... {Math.round(progress)}%</>
          ) : (
            <>Importar Filiais do Excel</>
          )}
        </Button>

        {uploading && <Progress value={progress} className="h-3" />}

        {result.message && (
          <div className={`p-4 rounded-lg border flex items-start gap-3 ${
            result.success && result.error === 0 
              ? "bg-green-50 border-green-300 text-green-800" 
              : "bg-amber-50 border-amber-300 text-amber-800"
          }`}>
            {result.success && result.error === 0 ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-amber-600" />
            )}
            <div>
              <p className="font-semibold">{result.message}</p>
              {result.success ? <p className="text-sm mt-1">{result.success} filiais importadas/atualizadas</p> : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadFiliaisExcel;
