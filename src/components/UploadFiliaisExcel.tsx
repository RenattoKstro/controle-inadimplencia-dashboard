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
        
        // Força o cabeçalho correto (seu arquivo tem exatamente esses nomes)
        const json = XLSX.utils.sheet_to_json(sheet, {
          header: ["idfilial", "filial", "uf", "cidade", "praca", "regional", "qtd_cidade"],
          range: 1 // pula a primeira linha (cabeçalho do Excel)
        });

        console.log("Primeiras 3 linhas lidas:", json.slice(0, 3));

        let success = 0;
        let error = 0;
        const batchSize = 100;
        const batch: any[] = [];

        for (let i = 0; i < json.length; i++) {
          const row = json[i] as any;

          const idfilial = Number(row.idfilial);

          if (!idfilial || isNaN(idfilial) || idfilial < 10000) {
            error++;
            continue;
          }

          batch.push({
            IDfilial: idfilial,
            Filial: String(row.filial || "").trim(),
            UF: String(row.uf || "").trim().toUpperCase(),
            Cidade: String(row.cidade || "").trim(),
            praca: String(row.praca || "").trim(),
            Regional: String(row.regional || "").trim(),
            qtd_cidade: Number(row.qtd_cidade) || 1,
            ativo: true
          });

          if (batch.length === batchSize || i === json.length - 1) {
            const { error: upsertError } = await supabase
              .from("filiais")
              .upsert(batch, { onConflict: "IDfilial" });

            if (upsertError) {
              console.error("Erro Supabase:", upsertError);
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
            ? `PARABÉNS! ${success} filiais importadas com sucesso!`
            : `Nenhuma filial importada. Erros: ${error}`
        });

      } catch (err) {
        console.error("Erro fatal:", err);
        setResult({ message: "Erro ao processar o arquivo." });
      } finally {
        setUploading(false);
        setProgress(0);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-4 border-purple-600">
      <CardHeader className="bg-gradient-to-r from-purple-700 to-blue-700 text-white text-center">
        <CardTitle className="text-4xl font-bold flex items-center justify-center gap-4">
          <Upload className="h-16 w-16" />
          IMPORTAR FILIAIS
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12 space-y-10">
        <div className="text-center">
          <Label className="text-2xl">Selecione seu arquivo Excel</Label>
          <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={uploading} className="mt-4 text-lg" />
        </div>

        {file && (
          <div className="p-6 bg-green-50 border-4 border-green-400 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-800">
              PRONTO! Arquivo carregado: <span className="text-purple-700">{file.name}</span>
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          size="lg"
          className="w-full h-20 text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl"
        >
          {uploading ? `IMPORTANDO... ${Math.round(progress)}%` : "IMPORTAR TODAS AS 378 FILIAIS AGORA"}
        </Button>

        {uploading && <Progress value={progress} className="h-10" />}

        {result.message && (
          <div className={`p-12 rounded-3xl text-center text-4xl font-bold border-8 ${result.success! > 0 ? "bg-green-100 border-green-600 text-green-800" : "bg-red-100 border-red-600 text-red-800"}`}>
            {result.success! > 0 ? (
              <>
                <CheckCircle className="h-32 w-32 mx-auto mb-6 text-green-600" />
                <p>{result.message}</p>
                <p className="text-6xl mt-6 animate-bounce">SUCESSO TOTAL!</p>
              </>
            ) : (
              <>
                <AlertCircle className="h-32 w-32 mx-auto mb-6 text-red-600" />
                <p>{result.message}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadFiliaisExcel;
