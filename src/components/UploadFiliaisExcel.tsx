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

        for (let i = 0; i < json.length; i++) {
          const row = json[i] as any;

          // Seu arquivo tem exatamente esses nomes (minúsculo)
          const idfilial = Number(row.idfilial);
          const filial = String(row.filial || "").trim();
          const uf = String(row.uf || "").trim().toUpperCase();
          const cidade = String(row.cidade || "").trim();
          const praca = String(row.praca || "").trim();
          const regional = String(row.regional || "").trim();
          const qtd_cidade = Number(row.qtd_cidade || 1);

          // Validação simples
          if (!idfilial || isNaN(idfilial) || idfilial < 10000) {
            error++;
            continue;
          }

          batch.push({
            IDfilial: idfilial,
            Filial: filial || `Filial ${idfilial}`,
            UF: uf,
            Cidade: cidade,
            praca: praca,
            Regional: regional,
            qtd_cidade: qtd_cidade > 0 ? qtd_cidade : 1,
            ativo: true
          });

          if (batch.length === batchSize || i === json.length - 1) {
            const { error: upsertError } = await supabase
              .from("filiais")
              .upsert(batch, { onConflict: "IDfilial" });

            if (upsertError) {
              console.error("Erro no Supabase:", upsertError);
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
          message: success > 0
            ? `SUCESSO TOTAL! ${success} filiais importadas com sucesso!`
            : `Nenhuma filial importada. Verifique o arquivo.`
        });

      } catch (err) {
        console.error("Erro:", err);
        setResult({ message: "Erro ao processar o arquivo." });
      } finally {
        setUploading(false);
        setProgress(0);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-4 text-3xl">
          <Upload className="h-12 w-12" />
          Importar Base de Filiais
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10 space-y-8">
        <div className="space-y-3">
          <Label className="text-lg">Selecione seu arquivo Excel</Label>
          <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={uploading} className="text-lg" />
          <p className="text-sm text-green-600 font-bold">
            Seu arquivo está no formato correto! (idfilial, filial, uf, cidade, praca, etc)
          </p>
        </div>

        {file && (
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
            <p className="text-lg font-bold text-blue-800">
              Arquivo carregado: <span className="text-purple-700">{file.name}</span>
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          size="lg"
          className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
        >
          {uploading ? `Importando... ${Math.round(progress)}%` : "IMPORTAR TODAS AS FILIAIS"}
        </Button>

        {uploading && <Progress value={progress} className="h-8" />}

        {result.message && (
          <div className={`p-10 rounded-2xl text-center text-3xl font-bold border-4 ${result.success! > 0 ? "bg-green-100 border-green-600 text-green-800" : "bg-red-100 border-red-600 text-red-800"}`}>
            {result.success! > 0 ? (
              <CheckCircle className="h-20 w-20 mx-auto mb-6 text-green-600" />
            ) : (
              <AlertCircle className="h-20 w-20 mx-auto mb-6 text-red-600" />
            )}
            <p>{result.message}</p>
            {result.success! > 0 && <p className="text-5xl mt-4">PARABÉNS!</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadFiliaisExcel;
