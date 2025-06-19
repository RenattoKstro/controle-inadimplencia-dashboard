import React from "react";
import { DashboardProps } from "../DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const MetaPerdido = ({ userData, updateUserData, isLoading }: DashboardProps) => {
  const [metaPerdido, setMetaPerdido] = React.useState(userData.meta_perdido || 0);
  const [recPerdido, setRecPerdido] = React.useState(userData.rec_perdido || 0);

  React.useEffect(() => {
    setMetaPerdido(userData.meta_perdido || 0);
    setRecPerdido(userData.rec_perdido || 0);
  }, [userData]);

  const percentual = userData.vencido_atual > 0 
    ? Math.min(105, (recPerdido / metaPerdido) * 100) 
    : 0;
  const faltam100 = metaPerdido - recPerdido > 0 ? metaPerdido - recPerdido : 0;
  const faltam105 = metaPerdido * 1.05 - recPerdido > 0 ? metaPerdido * 1.05 - recPerdido : 0;

  const handleSave = () => {
    updateUserData({ meta_perdido: metaPerdido, rec_perdido: recPerdido });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Meta Perdido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Meta: {metaPerdido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p>Recebido: {recPerdido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <Progress value={percentual} className="w-full" />
            <p>Progresso: {percentual.toFixed(2)}%</p>
            <p>Falta para 100%: {faltam100.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p>Falta para 105%: {faltam105.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaPerdido;
