
import { useState } from "react";
import { DashboardProps } from "../DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const MetaDesafio = ({ userData, updateUserData, isLoading }: DashboardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [metaDesafio, setMetaDesafio] = useState(userData.meta_desafio);

  // Cálculos
  const progresso = userData.meta_desafio > 0 
    ? userData.meta_desafio / userData.vencido_atual 
    : 0;
  
  const diferenca = userData.vencido_atual - userData.meta_desafio;
  const meta96 = diferenca * 0.96;
  const meta98 = diferenca * 0.98;
  const meta100 = diferenca;

  const handleSave = () => {
    updateUserData({ meta_desafio: metaDesafio });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMetaDesafio(userData.meta_desafio);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-60" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-500" /> Meta Desafio
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso para atingir a meta desafio
            </CardDescription>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="default" onClick={handleSave}>Salvar</Button>
              <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Editar Meta
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-medium">Meta Desafio</div>
          {isEditing ? (
            <Input
              value={metaDesafio}
              onChange={(e) => setMetaDesafio(parseFloat(e.target.value) || 0)}
              className="font-bold text-lg"
            />
          ) : (
            <div className="text-2xl font-bold">{formatCurrency(userData.meta_desafio)}</div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm font-medium">{formatPercentage(progresso)}</span>
          </div>
          <Progress value={progresso * 100} className="h-2" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Meta 96%</span>
              <span className="text-sm font-medium">{formatCurrency(meta96)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-yellow-400 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${Math.min(96, progresso * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Meta 98%</span>
              <span className="text-sm font-medium">{formatCurrency(meta98)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-orange-400 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${Math.min(98, progresso * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Meta 100%</span>
              <span className="text-sm font-medium">{formatCurrency(meta100)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${Math.min(100, progresso * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaDesafio;
