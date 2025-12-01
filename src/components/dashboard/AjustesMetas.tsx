// src/components/dashboard/AjustesMetas.tsx
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Wallet,
  Building,
  AlertTriangle,
  Target,
  Store,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [openPopover, setOpenPopover] = useState(false);

  // Filial
  const [filiaisList, setFiliaisList] = useState<{ numero: number; label: string }[]>([]);
  const [selectedFilial, setSelectedFilial] = useState<{ numero: number; label: string } | null>(null);

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

  // Carrega filiais
  useEffect(() => {
    const fetchFiliais = async () => {
      const { data, error } = await supabase
        .from("filiais")
        .select("idfilial, filial, regional")
        .eq("ativo", true)
        .order("idfilial");

      if (error) {
        console.error("Erro ao carregar filiais:", error);
        return;
      }

      if (data && data.length > 0) {
        const formatted = data.map((f: any) => ({
          numero: f.idfilial,
          label: `${f.idfilial} - ${f.filial} (${f.regional || "Sem regional"})`,
        }));
        setFiliaisList(formatted);
      }
    };
    fetchFiliais();
  }, []);

  // Sincroniza filial selecionada com userData
  useEffect(() => {
    if (userData?.filial && filiaisList.length > 0) {
      const found = filiaisList.find((f) => f.numero === userData.filial);
      if (found) setSelectedFilial(found);
    }
  }, [userData?.filial, filiaisList]);

  // Atualiza formState com userData
  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      ...userData,
      dias_restantes: userData?.dias_restantes || diasRestantesCalculados || 0,
    }));
  }, [userData, diasRestantesCalculados]);

  // SALVAR — AGORA SÓ SALVA SE TIVER FILIAL NA PRIMEIRA VEZ!
  const handleSave = () => {
    // PRIMEIRA VEZ: FILIAL É OBRIGATÓRIA
    if (!userData?.filial && !selectedFilial) {
      alert("Você precisa selecionar uma filial antes de salvar pela primeira vez!");
      return;
    }

    const dadosParaSalvar: any = { ...formState };

    // Salva a filial (só na primeira vez)
    if (selectedFilial && !userData?.filial) {
      dadosParaSalvar.filial = selectedFilial.numero;
    }

    updateUserData(dadosParaSalvar);
    setIsEditing(false);
    setOpenPopover(false);
  };

  const handleCancel = () => {
    setFormState((prev) => ({
      ...prev,
      ...userData,
      dias_restantes: userData?.dias_restantes || diasRestantesCalculados || 0,
    }));
    setIsEditing(false);
    setOpenPopover(false);
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
        </div>
      </div>

      {/* PRIMEIRA VEZ: FILIAL OBRIGATÓRIA */}
      {!userData?.filial && !isEditing && (
        <Card className="border-2 border-dashed border-red-400 bg-red-50">
          <CardContent className="pt-6 text-center">
            <Store className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <p className="text-lg font-bold text-red-800">
              Você ainda não selecionou sua filial!
            </p>
            <p className="text-sm text-red-700 mt-2">
              Clique em <strong>Editar</strong> e escolha sua loja (obrigatório).
            </p>
          </CardContent>
        </Card>
      )}

      {/* MODO EDIÇÃO: PRIMEIRA VEZ → FILIAL OBRIGATÓRIA */}
      {isEditing && !userData?.filial && (
        <Card className="border-2 border-dashed border-blue-400 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Store className="h-10 w-10 text-blue-600" />
              <div className="flex-1 space-y-4">
                <Label className="text-xl font-bold text-blue-900">
                  Selecione sua Filial (obrigatório)
                </Label>
                <Popover open={openPopover} onOpenChange={setOpenPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between h-14 text-left font-medium text-lg">
                      {selectedFilial ? selectedFilial.label : "Buscar filial..."}
                      <ChevronsUpDown className="ml-2 h-6 w-6 shrink-0 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Digite número, nome ou regional..." className="h-12" />
                      <CommandList>
                        <CommandEmpty>Nenhuma filial encontrada.</CommandEmpty>
                        <CommandGroup>
                          {filiaisList.map((f) => (
                            <CommandItem
                              key={f.numero}
                              value={`${f.numero} ${f.label}`}
                              onSelect={() => {
                                setSelectedFilial(f);
                                setOpenPopover(false);
                              }}
                            >
                              <Check className={`mr-3 h-6 w-6 ${selectedFilial?.numero === f.numero ? "opacity-100" : "opacity-0"}`} />
                              {f.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {!selectedFilial && (
                  <p className="text-sm font-bold text-red-600 mt-2">
                    Você deve selecionar uma filial antes de salvar!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FILIAL JÁ SALVA → SÓ MOSTRA (NÃO EDITA MAIS) */}
      {userData?.filial && selectedFilial && !isEditing && (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
          <CardContent className="p-6 flex items-center gap-6">
            <Store className="h-16 w-16" />
            <div>
              <p className="text-sm opacity-90">Sua Filial Vinculada</p>
              <p className="text-3xl font-bold">{selectedFilial.label}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de metas */}
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
