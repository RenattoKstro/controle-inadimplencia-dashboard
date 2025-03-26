
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo para upload");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Determine a suitable filename (using original name)
      const fileName = file.name;

      // Upload the file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("app_icons")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Generate the public URL
      const { data: urlData } = supabase.storage
        .from("app_icons")
        .getPublicUrl(fileName);

      setSuccess(`Arquivo enviado com sucesso: ${fileName}`);
      
      toast({
        title: "Upload realizado!",
        description: `O arquivo ${fileName} foi enviado com sucesso.`,
      });

      console.log("URL pública do arquivo:", urlData.publicUrl);
    } catch (error: any) {
      console.error("Erro no upload:", error);
      setError(error.message || "Erro ao fazer upload do arquivo");
      
      toast({
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao fazer upload do arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload de Ícones</CardTitle>
        <CardDescription>
          Faça upload dos ícones para sua aplicação (favicon.ico, app_icon_192.png, app_icon_512.png)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input 
            id="file-upload" 
            type="file" 
            accept="image/x-icon,image/png"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {file && (
            <p className="text-sm text-gray-500">
              Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>Enviando...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Fazer Upload
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
