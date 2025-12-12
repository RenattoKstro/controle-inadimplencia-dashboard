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
  Store,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
  User,
  Phone,
  Instagram,
  Info,
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
  const [isEditingMetas, setIsEditingMetas] = useState(false);
  const [isEditingPerfil, setIsEditingPerfil] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);

  const [filiaisList, setFiliaisList] = useState<{ numero: number; label: string }[]>([]);
  const [selectedFilial, setSelectedFilial] = useState<{ numero: number; label: string } | null>(null);

  const [nomeUsuario, setNomeUsuario] = useState(userData?.nome_usuario?.toUpperCase() || "");
  const [whatsapp, setWhatsapp] = useState(userData?.whatsapp || "");
  const [instagram, setInstagram] = useState(userData?.instagram || "");

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

  const formatWhatsapp = (value: string) => {
    const num = value.replace(/\D/g, "");
    if (num.length <= 2) return num;
    if (num.length <= 7) return `(${num.slice(0, 2)}) ${num.slice(2)}`;
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7, 11)}`;
  };

  useEffect(() => {
    const fetchFiliais = async () => {
      const { data } = await supabase
        .from("filiais")
        .select("idfilial, filial, regional")
        .eq("ativo", true)
        .order("idfilial");

      if (data) {
        const formatted = data.map((f: any) => ({
          numero: f.idfilial,
          label: `${f.idfilial} - ${f.filial} (${f.regional || "Sem regional"})`,
        }));
        setFiliaisList(formatted);
      }
    };
    fetchFiliais();
  }, []);

  useEffect(() => {
    if (userData?.filial && filiaisList.length > 0) {
      const found = filiaisList.find((f) => f.numero === userData.filial);
      if (found) setSelectedFilial(found);
    }
  }, [userData?.filial, filiaisList]);

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      ...userData,
      dias_restantes: userData?.dias_restantes || diasRestantesCalculados || 0,
    }));
    setNomeUsuario(userData?.nome_usuario?.toUpperCase() || "");
    setWhatsapp(userData?.whatsapp || "");
    setInstagram(userData?.instagram || "");
  }, [userData, diasRestantesCalculados]);

  const handleSave = () => {
    const dadosParaSalvar: any = {};

    if (isEditingMetas) {
      Object.assign(dadosParaSalvar, formState);
    }

    if (isEditingPerfil) {
      if (nomeUsuario.trim()) dadosParaSalvar.nome_usuario = nomeUsuario.trim().toUpperCase();
      if (whatsapp.replace(/\D/g, "").length >= 11) dadosParaSalvar.whatsapp = whatsapp.replace(/\D/g, "");
      if (instagram.trim()) dadosParaSalvar.instagram = instagram.trim().replace("@", "");
      if (selectedFilial && !userData?.filial) dadosParaSalvar.filial = selectedFilial.numero;
    }

    if (Object.keys(dadosParaSalvar).length > 0) {
      updateUserData(dadosParaSalvar);
    }

    setIsEditingMetas(false);
    setIsEditingPerfil(false);
    setOpenPopover(false);
  };

  const handleCancel = () => {
    setFormState((prev) => ({
      ...prev,
      ...userData,
      dias_restantes: userData?.dias_restantes || diasRestantesCalculados || 0,
    }));
    setNomeUsuario(userData?.nome_usuario?.toUpperCase() || "");
    setWhatsapp(userData?.whatsapp || "");
    setInstagram(userData?.instagram || "");
    setIsEditingMetas(false);
    setIsEditingPerfil(false);
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
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Ajustes de Metas
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* BOTÃO EDITAR METAS */}
          {!isEditingMetas && !isEditingPerfil && (
            <Button variant="outline" onClick={() => setIsEditingMetas(true)} className="border-blue-300 text-blue-600">
              Editar Metas
            </Button>
          )}

          {/* BOTÃO "i" — SÓ APARECE QUANDO ESTÁ EDITANDO METAS */}
          {isEditingMetas && !isEditingPerfil && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditingPerfil(true)}
              title="Editar nome, WhatsApp, Instagram e filial"
            >
              <Info className="h-5 w-5" />
            </Button>
          )}

          {/* BOTÕES SALVAR/CANCELAR */}
          {(isEditingMetas || isEditingPerfil) && (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Salvar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          )}

          {/* BOTÕES DE ROLE E SWITCHES — SÓ QUANDO NÃO ESTÁ EDITANDO NADA */}
          {!(isEditingMetas || isEditingPerfil) && (
            <>
              <div className="flex gap-2">
                <Button
                  variant={formState.role === "líder" ? "default" : "outline"}
                  onClick={() => updateUserData({ role: "líder" })}
                >
                  {formState.role === "líder" ? "Líder" : "Op. Líder"}
                </Button>
                <Button
                  variant={formState.role === "auxiliar" ? "default" : "outline"}
                  onClick={() => updateUserData({ role: "auxiliar" })}
                >
                  {formState.role === "auxiliar" ? "Auxiliar" : "Op. Auxiliar"}
                </Button>
              </div>
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
            </>
          )}
        </div>
      </div>

      {/* EDIÇÃO DE PERFIL — SÓ APARECE QUANDO CLICA NO "i" */}
      {isEditingPerfil && (
        <Card className="border-2 border-dashed border-purple-400 bg-purple-50">
          <CardContent className="pt-6 space-y-6">
            {/* ... seus campos de nome, whats, insta, filial ... */}
            {/* (exatamente como no código anterior) */}
          </CardContent>
        </Card>
      )}

      {/* GRID DE METAS — SÓ APARECE QUANDO NÃO ESTÁ EDITANDO PERFIL */}
      {!isEditingPerfil && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* ... todos os seus CardItem ... */}
        </div>
      )}
    </div>
  );
};

export default AjustesMetas;
