// src/components/dashboard/AjustesMetas.tsx
import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Wallet,
  Building,
  AlertTriangle,
  Target,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";

interface CardItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isEditable?: boolean;
  onChange?: (value: number) => void;
  color?: string;
  isEditMode?: boolean;
  formatAsCurrency?: boolean;
}

const AjustesMetas = ({
  userData,
  updateUserData,
  diasRestantesCalculados,
  isLoading,
  bonusPerdidoAtivado,
  setBonusPerdidoAtivado,
  mostrarHistorico,
  setMostrarHistorico,
}: DashboardProps & {
  setBonusPerdidoAtivado: (value: boolean) => void;
  mostrarHistorico: boolean;
  setMostrarHistorico: (value: boolean) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const [formState, setFormState] = useState({
    abertura_vencido_mes: userData?.abertura_vencido_mes || 0,
    abertura_dia: userData?.abertura_dia || 0,
    meta_mes: userData?.meta_mes || 0,
    vencido_atual: userData?.vencido_atual || 0,
    dias_restantes: userData?.dias_restantes || diasRestantesCalculados || 0,
    dias_trabalhados: userData?.dias_trabalhados || 0,
    meta_desafio: userData?.meta_desafio || 0,
    meta_perdido: userData?.meta_perdido || 0,
    rec_perdido: userData?.rec_perdido || 0,
    carteira_total: userData?.carteira_total || 0,
    role: userData?.role || "líder",
  });

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      ...userData,
      dias_restantes: userData?.dias_restantes || diasRestantesCalculados || 0,
    }));
  }, [userData, diasRestantesCalculados]);

  const handleSave = () => {
    updateUserData(formState);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormState((prev) => ({
      ...prev,
      ...userData,
      dias_restantes: userData?.dias_restantes || diasRestantesCalculados || 0,
    }));
    setIsEditing(false);
  };

  const handleChange = (field: string, value: number | string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const CardItem = ({
    title,
    value,
    icon,
    isEditable = false,
    onChange,
    color = "bg-blue-500",
    isEditMode = false,
    formatAsCurrency = true,
  }: CardItemProps) => {
    const formatValue = (v: number) =>
      formatAsCurrency
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
        : v.toString();

    return (
      <Card className={`shadow-sm hover:shadow transition-shadow ${color} bg-opacity-50`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <span className={`p-2 rounded-full ${color} text-white`}>{icon}</span>
          </div>
          {isEditable && isEditMode ? (
            formatAsCurrency ? (
              <CurrencyInput value={value} onValueChange={(v) => onChange?.(v || 0)} className="text-lg font-bold" />
            ) : (
              <Input type="number" value={value} onChange={(e) => onChange?.(parseInt(e.target.value) || 0)} className="text-lg font-bold" />
            )
          ) : (
            <div className="text-xl font-bold">{formatValue(value)}</div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Ajustes de Metas
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Salvar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="border-blue-300 text-blue-600">
              Editar
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Switch checked={mostrarHistorico} onCheckedChange={setMostrarHistorico} />
            <Label className="flex items-center gap-1 cursor-pointer" onClick={() => setMostrarHistorico(!mostrarHistorico)}>
              {mostrarHistorico ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Histórico
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={bonusPerdidoAtivado} onCheckedChange={setBonusPerdidoAtivado} />
            <Label>Ativar Meta Perdido</Label>
          </div>
          <div className="flex gap-2">
            <Button
              variant={formState.role === "líder" ? "default" : "outline"}
              onClick={() => updateUserData({ ...userData, role: "líder" })}
            >
              {formState.role === "líder" ? "Líder" : "Op. Líder"}
            </Button>
            <Button
              variant={formState.role === "auxiliar" ? "default" : "outline"}
              onClick={() => updateUserData({ ...userData, role: "auxiliar" })}
            >
              {formState.role === "auxiliar" ? "Auxiliar" : "Op. Auxiliar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de metas — SEM NOME E SEM FILIAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <CardItem title="Abertura de Vencido do Mês" value={formState.abertura_vencido_mes} icon={<Wallet size={16} />} isEditable={isEditing} onChange={(v) => handleChange("abertura_vencido_mes", v)} color="bg-purple-500" isEditMode={isEditing} />
        <CardItem title="Abertura do Dia" value={formState.abertura_dia} icon={<Building size={16} />} isEditable={isEditing} onChange={(v) => handleChange("abertura_dia", v)} color="bg-indigo-500" isEditMode={isEditing} />
        <CardItem title="Meta do Mês" value={formState.meta_mes} icon={<Target size={16} />} isEditable={isEditing} onChange={(v) => handleChange("meta_mes", v)} color="bg-blue-500" isEditMode={isEditing} />
        <CardItem title="Vencido Atual" value={formState.vencido_atual} icon={<AlertTriangle size={16} />} isEditable={isEditing} onChange={(v) => handleChange("vencido_atual", v)} color="bg-yellow-500" isEditMode={isEditing} />
        <CardItem title="Meta Desafio" value={formState.meta_desafio} icon={<Target size={16} />} isEditable={isEditing} onChange={(v) => handleChange("meta_desafio", v)} color="bg-green-500" isEditMode={isEditing} />
        {bonusPerdidoAtivado && (
          <>
            <CardItem title="Meta Perdido" value={formState.meta_perdido} icon={<AlertTriangle size={16} />} isEditable={isEditing} onChange={(v) => handleChange("meta_perdido", v)} color="bg-red-500" isEditMode={isEditing} />
            <CardItem title="Rec. Perdido" value={formState.rec_perdido} icon={<Wallet size={16} />} isEditable={isEditing} onChange={(v) => handleChange("rec_perdido", v)} color="bg-red-500" isEditMode={isEditing} />
          </>
        )}
        <CardItem title="Carteira Total" value={formState.carteira_total} icon={<Wallet size={16} />} isEditable={isEditing} onChange={(v) => handleChange("carteira_total", v)} color="bg-teal-500" isEditMode={isEditing} />
        <Card className="shadow-sm bg-gray-500 bg-opacity-50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Dias</h3>
              <span className="p-2 rounded-full bg-gray-500 text-white"><Target size={16} /></span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trabalhados</p>
              {isEditing ? (
                <Input type="number" value={formState.dias_trabalhados} onChange={(e) => handleChange("dias_trabalhados", parseInt(e.target.value) || 0)} className="text-lg font-bold" />
              ) : (
                <div className="text-xl font-bold">{formState.dias_trabalhados}</div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Restantes</p>
              {isEditing ? (
                <Input type="number" value={formState.dias_restantes} onChange={(e) => handleChange("dias_restantes", parseInt(e.target.value) || 0)} className="text-lg font-bold" />
              ) : (
                <div className="text-xl font-bold">{formState.dias_restantes}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AjustesMetas;
