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
        const batch: any[] = [];

        for (const row of json) {
          const r = row as any;

          // Busca idfilial
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

          // Busca nome da filial
          let nomeFilial = "Filial Desconhecida";
          for (const key in r) {
            if (key.toLowerCase().includes("filial")) {
              nomeFilial = String(r[key]).trim();
              break;
            }
          }

          // Busca regional
          let regional = "";
          for (const key in r) {
            if (key.toLowerCase().includes("regional")) {
              regional = String(r[key]).trim();
              break;
            }
          }

          batch.push({
            idfilial: idfilial,
            filial: nomeFilial,
            regional: regional,
            ativo: true
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

        setResult(`SUCESSO TOTAL! ${success} filiais importadas com regional!`);

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
    <Card className="max-w-2xl mx-auto border-4 border-green-600">
      <CardHeader className="bg-green-600 text-white text-center">
        <CardTitle className="text-4xl font-bold flex items-center justify-center gap-4">
          <CheckCircle className="h-16 w-16" />
          IMPORTAR FILIAIS (com Regional)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12 space-y-8">
        <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} disabled={uploading} className="text-xl" />
        {file && <p className="text-2xl font-bold text-green-700 text-center">Arquivo carregado: {file.name}</p>}
        
        <Button onClick={handleUpload} disabled={!file || uploading} size="lg" className="w-full h-20 text-3xl bg-green-600 hover:bg-green-700">
          {uploading ? `IMPORTANDO... ${Math.round(progress)}%` : "IMPORTAR AGORA"}
        </Button>

        {uploading && <Progress value={progress} className="h-10" />}

        {result && (
          <div className="p-12 bg-green-100 border-8 border-green-600 rounded-3xl text-center">
            <CheckCircle className="h-32 w-32 mx-auto mb-6 text-green-600" />
            <p className="text-5xl font-bold text-green-800">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadFiliaisExcel;
