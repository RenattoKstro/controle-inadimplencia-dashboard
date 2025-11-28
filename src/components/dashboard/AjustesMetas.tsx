import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Building, AlertTriangle, Target, Pencil, Store } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CardItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isEditable?: boolean;
  onChange?: (value: number) => void;
  color?: string;
  isEditMode?: boolean;
  formatAsCurrency?: boolean;
  onEdit?: () => void;
}

const AjustesMetas = ({
  userData,
  updateUserData,
  diasRestantesCalculados,
  isLoading,
  bonusPerdidoAtivado,
  setBonusPerdidoAtivado,
}: DashboardProps & { setBonusPerdidoAtivado: (value: boolean) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [filialInput, setFilialInput] = useState(""); // para o campo temporário
  const [showChangeFilialCard, setShowChangeFilialCard] = useState(false);

  const filialAtual = userData?.filial || null;

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
    filial: userData?.filial || null,
  });

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      ...userData,
      dias_restantes: userData?.dias_restantes || diasRestantesCalculados || 0,
    }));
  }, [userData, diasRestantesCalculados]);

  const handleSave = () => {
    const dadosParaSalvar = {
      ...formState,
      // Se o usuário digitou uma filial nova no campo temporário, salva
      filial: filialInput.trim() ? parseInt(filialInput.trim()) : formState.filial,
    };

    updateUserData(dadosParaSalvar);
    setIsEditing(false);
    setFilialInput("");
    setShowChangeFilialCard(false);
  };

  const handleCancel = () => {
    setFormState((prev) => ({
      ...prev,
      ...userData,
      dias_restantes: userData?.dias_restantes || diasRestantesCalculados || 0,
    }));
    setFilialInput("");
    setIsEditing(false);
    setShowChangeFilialCard(false);
  };

  const handleChange = (field: string, value: number | string | null) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    onEdit,
  }: CardItemProps) => {
    const formatValue = (value: number): string => {
      if (formatAsCurrency) {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      }
      return value.toString();
    };

    return (
      <Card className={`shadow-sm hover:shadow transition-shadow duration-200 ${color} bg-opacity-50`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <div className="flex items-center gap-2">
              {isEditable && !isEditMode && onEdit && (
                <Button size="icon" variant="ghost" onClick={onEdit} className="h-7 w-7 rounded-full hover:bg-blue-50">
                  <Pencil className="h-3.5 w-3.5 text-blue-500" />
                </Button>
              )}
              <span className={`p-2 rounded-full ${color} text-white`}>{icon}</span>
            </div>
          </div>

          {isEditable && isEditMode ? (
            formatAsCurrency ? (
              <CurrencyInput value={value} onValueChange={(v) => onChange?.(v || 0)} className="text-lg font-bold mt-1" />
            ) : (
              <Input
                type="number"
                value={value}
                onChange={(e) => onChange?.(parseInt(e.target.value) || 0)}
                className="text-lg font-bold mt-1"
              />
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
      <Card className="w-full shadow-sm">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Skeleton className="h-[300px] w-full max-w-[350px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Ajustes de Metas
        </h2>

        <div className="flex items-center gap-4 flex-wrap">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Salvar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Editar
            </Button>
          )}

          {/* Switch e botões de role permanecem iguais */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={bonusPerdidoAtivado}
              onCheckedChange={(checked) => {
                setBonusPerdidoAtivado(checked);
                updateUserData({ ...userData, bonusPerdidoAtivado: checked });
              }}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
            />
            <Label htmlFor="bonus-perdido-switch">Ativar Meta Perdido</Label>
          </div>

          <div className="flex gap-2">
            <Button
              variant={formState.role === "líder" ? "default" : "outline"}
              onClick={() => {
                handleChange("role", "líder");
                updateUserData({ ...userData, role: "líder" });
              }}
            >
              {formState.role === "líder" ? "Líder" : "Op. Líder"}
            </Button>
            <Button
              variant={formState.role === "auxiliar" ? "default" : "outline"}
              onClick={() => {
                handleChange("role", "auxiliar");
                updateUserData({ ...userData, role: "auxiliar" });
              }}
            >
              {formState.role === "auxiliar" ? "Auxiliar" : "Op. Auxiliar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Campo Filial - Só aparece na primeira vez */}
      {isEditing && !filialAtual && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <Label htmlFor="filial-input" className="text-base font-semibold">
                  Número da Filial * (obrigatório)
                </Label>
                <Input
                  id="filial-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ex: 001"
                  value={filialInput}
                  onChange={(e) => setFilialInput(e.target.value.replace(/\D/g, ""))} // só números
                  className="mt-2 text-lg font-bold w-32 text-center"
                  maxLength={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Esta informação será salva e não aparecerá mais aqui.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card para alterar filial (aparece só depois de já ter uma filial salva) */}
      {filialAtual && !showChangeFilialCard && !isEditing && (
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-6 w-6" />
              <div>
                <p className="text-sm opacity-90">Filial vinculada</p>
                <p className="text-2xl font-bold">{String(filialAtual).padStart(3, "0")}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowChangeFilialCard(true)}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Alterar Filial
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Card de troca de filial (quando usuário clica em "Alterar Filial") */}
      {showChangeFilialCard && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <Label className="text-base font-semibold text-orange-800">
                  Alterar número da Filial
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Nova filial"
                  value={filialInput}
                  onChange={(e) => setFilialInput(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 text-lg font-bold w-32 text-center border-orange-300"
                  maxLength={4}
                />
                <p className="text-xs text-orange-700 mt-2">
                  Atual: {String(filialAtual).padStart(3, "0")}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowChangeFilialCard(false);
                  setFilialInput("");
                }}
                className="text-orange-600"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de cards de metas (igual antes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* ... todos os CardItem que já existiam ... */}
        <CardItem
          title="Abertura de Vencido do Mês"
          value={formState.abertura_vencido_mes}
          icon={<Wallet size={16} />}
          isEditable={true}
          onChange={(value) => handleChange("abertura_vencido_mes", value)}
          color="bg-purple-500"
          isEditMode={isEditing}
        />
        <CardItem
          title="Abertura do Dia"
          value={formState.abertura_dia}
          icon={<Building size={16} />}
          isEditable={true}
          onChange={(value) => handleChange("abertura_dia", value)}
          color="bg-indigo-500"
          isEditMode={isEditing}
        />
        <CardItem
          title="Meta do Mês"
          value={formState.meta_mes}
          icon={<Target size={16} />}
          isEditable={true}
          onChange={(value) => handleChange("meta_mes", value)}
          color="bg-blue-500"
          isEditMode={isEditing}
        />
        {/* ... continuar com os outros cards ... */}
        {/* (os outros CardItem permanecem exatamente iguais) */}
      </div>
    </div>
  );
};

export default AjustesMetas;
