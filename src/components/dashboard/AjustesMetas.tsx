import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Building, AlertTriangle, Target, Pencil } from "lucide-react";
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
  const [formState, setFormState] = useState({
    abertura_vencido_mes: userData.abertura_vencido_mes || 0,
    abertura_dia: userData.abertura_dia || 0,
    meta_mes: userData.meta_mes || 0,
    vencido_atual: userData.vencido_atual || 0,
    dias_restantes: userData.dias_restantes || diasRestantesCalculados || 0,
    meta_desafio: userData.meta_desafio || 0,
    meta_perdido: userData.meta_perdido || 0,
    rec_perdido: userData.rec_perdido || 0,
    carteira_total: userData.carteira_total || 0, // Novo campo para Carteira
    role: userData.role || "líder",
  });

  useEffect(() => {
    setFormState({
      abertura_vencido_mes: userData.abertura_vencido_mes || 0,
      abertura_dia: userData.abertura_dia || 0,
      meta_mes: userData.meta_mes || 0,
      vencido_atual: userData.vencido_atual || 0,
      dias_restantes: userData.dias_restantes || diasRestantesCalculados || 0,
      meta_desafio: userData.meta_desafio || 0,
      meta_perdido: userData.meta_perdido || 0,
      rec_perdido: userData.rec_perdido || 0,
      carteira_total: userData.carteira_total || 0, // Inicializa com valor de userData ou 0
      role: userData.role || "líder",
    });
  }, [userData, diasRestantesCalculados]);

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
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
        }).format(value);
      }
      return value.toString();
    };

    const handleChange = (value: number) => {
      onChange && onChange(value);
    };

    return (
      <Card className={`shadow-sm hover:shadow transition-shadow duration-200 ${color} bg-opacity-50`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <div className="flex items-center gap-2">
              {isEditable && !isEditMode && onEdit && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={onEdit} 
                  className="h-7 w-7 rounded-full hover:bg-blue-50"
                >
                  <Pencil className="h-3.5 w-3.5 text-blue-500" />
                </Button>
              )}
              <span className={`p-2 rounded-full ${color} text-white`}>
                {icon}
              </span>
            </div>
          </div>
          
          {isEditable && isEditMode ? (
            formatAsCurrency ? (
              <CurrencyInput
                value={value}
                onValueChange={onChange}
                className="text-lg font-bold mt-1"
              />
            ) : (
              <Input
                type="number"
                value={value}
                onChange={(e) => onChange && onChange(parseInt(e.target.value) || 0)}
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

  const handleSave = () => {
    updateUserData(formState);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormState({
      abertura_vencido_mes: userData.abertura_vencido_mes || 0,
      abertura_dia: userData.abertura_dia || 0,
      meta_mes: userData.meta_mes || 0,
      vencido_atual: userData.vencido_atual || 0,
      dias_restantes: userData.dias_restantes || diasRestantesCalculados || 0,
      meta_desafio: userData.meta_desafio || 0,
      meta_perdido: userData.meta_perdido || 0,
      rec_perdido: userData.rec_perdido || 0,
      carteira_total: userData.carteira_total || 0,
      role: userData.role || "líder",
    });
    setIsEditing(false);
  };

  const handleChange = (field: string, value: number | string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemEdit = () => {
    setIsEditing(true);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Ajustes de Metas
        </h2>
        {isEditing ? (
          <div className="flex gap-2">
            <Button 
              variant="default" 
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Salvar
            </Button>
            <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Editar
            </Button>
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
            <div className="flex items-center space-x-4">
              <Button
                variant={formState.role === "líder" ? "default" : "outline"}
                onClick={() => {
                  handleChange("role", "líder");
                  updateUserData({ ...userData, role: "líder" });
                }}
                className="px-4 py-2 rounded-md flex items-center gap-2"
              >
                {formState.role === "líder" ? "✅" : "🚫"} Op. Líder
              </Button>
              <Button
                variant={formState.role === "auxiliar" ? "default" : "outline"}
                onClick={() => {
                  handleChange("role", "auxiliar");
                  updateUserData({ ...userData, role: "auxiliar" });
                }}
                className="px-4 py-2 rounded-md flex items-center gap-2"
              >
                {formState.role === "auxiliar" ? "✅" : "🚫"} Op. Auxiliar
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <CardItem 
          title="Abertura de Vencido do Mês" 
          value={formState.abertura_vencido_mes} 
          icon={<Wallet size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('abertura_vencido_mes', value)}
          color="bg-purple-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        <CardItem 
          title="Abertura do Dia" 
          value={formState.abertura_dia} 
          icon={<Building size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('abertura_dia', value)}
          color="bg-indigo-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        <CardItem 
          title="Meta do Mês" 
          value={formState.meta_mes} 
          icon={<Target size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('meta_mes', value)}
          color="bg-blue-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        <CardItem 
          title="Vencido Atual" 
          value={formState.vencido_atual} 
          icon={<AlertTriangle size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('vencido_atual', value)}
          color="bg-yellow-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        <CardItem 
          title="Meta Desafio" 
          value={formState.meta_desafio} 
          icon={<Target size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('meta_desafio', value)}
          color="bg-green-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        {bonusPerdidoAtivado && (
          <>
            <CardItem 
              title="Meta Perdido" 
              value={formState.meta_perdido} 
              icon={<AlertTriangle size={16} />} 
              isEditable={true}
              onChange={(value) => handleChange('meta_perdido', value)}
              color="bg-red-500"
              isEditMode={isEditing}
              onEdit={handleItemEdit}
            />
            <CardItem 
              title="Rec. Perdido" 
              value={formState.rec_perdido} 
              icon={<Wallet size={16} />} 
              isEditable={true}
              onChange={(value) => handleChange('rec_perdido', value)}
              color="bg-red-500"
              isEditMode={isEditing}
              onEdit={handleItemEdit}
            />
          </>
        )}
        <CardItem 
          title="Dias Restantes (mês)" 
          value={formState.dias_restantes} 
          icon={<Target size={16} />}
          color="bg-gray-500"
          formatAsCurrency={false}
          isEditable={true}
          onChange={(value) => handleChange('dias_restantes', value)}
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
        <CardItem 
          title="Carteira Total" 
          value={formState.carteira_total} 
          icon={<Wallet size={16} />} 
          isEditable={true}
          onChange={(value) => handleChange('carteira_total', value)}
          color="bg-teal-500"
          isEditMode={isEditing}
          onEdit={handleItemEdit}
        />
      </div>
    </div>
  );
};

export default AjustesMetas;
