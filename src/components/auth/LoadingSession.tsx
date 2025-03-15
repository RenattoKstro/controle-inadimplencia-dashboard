
import { Card } from "@/components/ui/card";

export const LoadingSession = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg p-8 text-center">
        <div className="animate-pulse">Verificando sessão...</div>
      </Card>
    </div>
  );
};
