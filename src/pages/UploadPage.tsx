
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import UploadFile from "@/components/UploadFile";
import { ArrowLeft } from "lucide-react";

export default function UploadPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Gerenciador de Ícones
          </h1>
          
          <UploadFile />
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Ícones necessários:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><code>favicon.ico</code> - Ícone para a aba do navegador (tamanho recomendado: 32x32 ou 64x64)</li>
              <li><code>app_icon_192.png</code> - Ícone para dispositivos móveis (tamanho exato: 192x192)</li>
              <li><code>app_icon_512.png</code> - Ícone para tela inicial (tamanho exato: 512x512)</li>
            </ul>
            <p className="mt-2">
              Após o upload, os ícones serão automaticamente usados na aplicação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
