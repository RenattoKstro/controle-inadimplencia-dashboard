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

  // NOVA FUNÇÃO: CLICAR EM "EDITAR METAS" FORÇA PERFIL SE FALTAR NOME OU FILIAL
  const handleEditarMetas = () => {
    if (!userData?.nome_usuario || !userData?.filial) {
      setIsEditingPerfil(true);
      alert("Antes de editar as metas, você precisa preencher seu nome e selecionar a filial!");
    } else {
      setIsEditingMetas(true);
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Usuário não autenticado!");
      return;
    }

    // VALIDAÇÃO OBRIGATÓRIA NO PERFIL
    if (isEditingPerfil) {
      if (!nomeUsuario.trim()) {
        alert("O nome é obrigatório!");
        return;
      }
      if (whatsapp.replace(/\D/g, "").length < 11) {
        alert("WhatsApp válido é obrigatório (11 dígitos)!");
        return;
      }
      if (!selectedFilial && !userData?.filial) {
        alert("Você deve selecionar uma filial!");
        return;
      }
    }

    const dadosParaSalvar: any = {};
    if (isEditingMetas) {
      Object.assign(dadosParaSalvar, formState);
    }
    if (isEditingPerfil) {
      if (nomeUsuario.trim()) dadosParaSalvar.nome_usuario = nomeUsuario.trim().toUpperCase();
      if (whatsapp.replace(/\D/g, "").length >= 11) dadosParaSalvar.whatsapp = whatsapp.replace(/\D/g, "");
      if (instagram.trim()) dadosParaSalvar.instagram = instagram.trim().replace("@", "");
      if (selectedFilial) dadosParaSalvar.filial = selectedFilial.numero;
    }

    // FORÇA ATUALIZAÇÃO DO updated_at SEMPRE QUE SALVAR (ESSA É A LINHA QUE RESOLVE O CONTADOR TRAVADO)
    dadosParaSalvar.updated_at = new Date().toISOString();

    if (Object.keys(dadosParaSalvar).length > 0) {
      const { error } = await supabase
        .from("user_dashboard")
        .upsert({
          user_id: user.id,
          ...dadosParaSalvar,
        }, {
          onConflict: "user_id",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar ajustes: " + error.message);
      } else {
        updateUserData(dadosParaSalvar);
      }
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
          {/* BOTÃO EDITAR METAS — AGORA COM FUNÇÃO ESPECIAL */}
          {!isEditingMetas && !isEditingPerfil && (
            <Button variant="outline" onClick={handleEditarMetas} className="border-blue-300 text-blue-600">
              Editar Metas
            </Button>
          )}
          {/* BOTÃO "Editar Informações" — SÓ APARECE QUANDO ESTÁ EDITANDO METAS */}
          {isEditingMetas && !isEditingPerfil && (
            <Button
              variant="outline"
              className="gap-2 text-muted-foreground hover:text-foreground border-muted-foreground hover:border-foreground"
              onClick={() => setIsEditingPerfil(true)}
            >
              <Info className="h-4 w-4" />
              Editar Informações
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
          {/* BOTÕES DE ROLE E SWITCHES */}
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

      {/* EDIÇÃO DE PERFIL — FORÇADA NA PRIMEIRA VEZ */}
      {isEditingPerfil && (
        <Card className="border-2 border-dashed border-purple-400 bg-purple-50">
          <CardContent className="pt-6 space-y-6">
            {/* Nome */}
            <div className="flex items-center gap-4">
              <User className="h-10 w-10 text-purple-600" />
              <div className="flex-1">
                <Label className="text-xl font-bold text-purple-900">Nome completo</Label>
                <Input
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value.toUpperCase())}
                  placeholder="SEU NOME COMPLETO"
                  className="text-2xl font-bold text-center"
                />
              </div>
            </div>
            {/* WhatsApp */}
            <div className="flex items-center gap-4">
              <Phone className="h-10 w-10 text-green-600" />
              <div className="flex-1">
                <Label className="text-xl font-bold text-green-900">WhatsApp (obrigatório)</Label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
                  placeholder="(99) 99999-9999"
                  maxLength={15}
                  className="text-2xl font-bold text-center"
                />
              </div>
            </div>
            {/* Instagram (opcional) */}
            <div className="flex items-center gap-4">
              <Instagram className="h-10 w-10 text-pink-600" />
              <div className="flex-1">
                <Label className="text-xl font-bold text-pink-900">Instagram (opcional)</Label>
                <Input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@seu_perfil"
                  className="text-2xl font-bold text-center"
                />
                <p className="text-sm text-gray-600 mt-1">Se deixar em branco, não aparecerá no ranking</p>
              </div>
            </div>
            {/* Filial */}
            <div className="flex items-center gap-4">
              <Store className="h-10 w-10 text-blue-600" />
              <div className="flex-1">
                <Label className="text-xl font-bold text-blue-900">Filial</Label>
                <Popover open={openPopover} onOpenChange={setOpenPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-14 text-lg">
                      {selectedFilial ? selectedFilial.label : "Selecionar filial..."}
                      <ChevronsUpDown className="ml-2 h-6 w-6"/>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar filial..." />
                      <CommandList>
                        <CommandEmpty>Nenhuma filial encontrada.</CommandEmpty>
                        <CommandGroup>
                          {filiaisList.map(f => (
                            <CommandItem
                              key={f.numero}
                              value={`${f.numero} ${f.label}`}
                              onSelect={() => {
                                setSelectedFilial(f);
                                setOpenPopover(false);
                              }}
                            >
                              <Check className={`mr-2 h-5 w-5 ${selectedFilial?.numero === f.numero ? "opacity-100" : "opacity-0"}`} />
                              {f.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GRID DE METAS — SÓ MOSTRA QUANDO NÃO ESTÁ FORÇADO NO PERFIL */}
      {!isEditingPerfil && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <CardItem title="Abertura de Vencido do Mês" value={formState.abertura_vencido_mes} icon={<Wallet size={16} />} isEditable={isEditingMetas} onChange={(v) => handleChange("abertura_vencido_mes", v)} color="bg-purple-500" isEditMode={isEditingMetas} />
          <CardItem title="Abertura do Dia" value={formState.abertura_dia} icon={<Building size={16} />} isEditable={isEditingMetas} onChange={(v) => handleChange("abertura_dia", v)} color="bg-indigo-500" isEditMode={isEditingMetas} />
          <CardItem title="Meta do Mês" value={formState.meta_mes} icon={<Target size={16} />} isEditable={isEditingMetas} onChange={(v) => handleChange("meta_mes", v)} color="bg-blue-500" isEditMode={isEditingMetas} />
          <CardItem title="Vencido Atual" value={formState.vencido_atual} icon={<AlertTriangle size={16} />} isEditable={isEditingMetas} onChange={(v) => handleChange("vencido_atual", v)} color="bg-yellow-500" isEditMode={isEditingMetas} />
          <CardItem title="Meta Desafio" value={formState.meta_desafio} icon={<Target size={16} />} isEditable={isEditingMetas} onChange={(v) => handleChange("meta_desafio", v)} color="bg-green-500" isEditMode={isEditingMetas} />
          {bonusPerdidoAtivado && (
            <>
              <CardItem title="Meta Perdido" value={formState.meta_perdido} icon={<AlertTriangle size={16} />} isEditable={isEditingMetas} onChange={(v) => handleChange("meta_perdido", v)} color="bg-red-500" isEditMode={isEditingMetas} />
              <CardItem title="Rec. Perdido" value={formState.rec_perdido} icon={<Wallet size={16} />} isEditable={isEditingMetas} onChange={(v) => handleChange("rec_perdido", v)} color="bg-red-500" isEditMode={isEditingMetas} />
            </>
          )}
          <CardItem title="Carteira Total" value={formState.carteira_total} icon={<Wallet size={16} />} isEditable={isEditingMetas} onChange={(v) => handleChange("carteira_total", v)} color="bg-teal-500" isEditMode={isEditingMetas} />
          <Card className="shadow-sm bg-gray-500 bg-opacity-50">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Dias</h3>
                <span className="p-2 rounded-full bg-gray-500 text-white"><Target size={16} /></span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trabalhados</p>
                {isEditingMetas ? (
                  <Input type="number" value={formState.dias_trabalhados} onChange={(e) => handleChange("dias_trabalhados", parseInt(e.target.value) || 0)} className="text-lg font-bold" />
                ) : (
                  <div className="text-xl font-bold">{formState.dias_trabalhados}</div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Restantes</p>
                {isEditingMetas ? (
                  <Input type="number" value={formState.dias_restantes} onChange={(e) => handleChange("dias_restantes", parseInt(e.target.value) || 0)} className="text-lg font-bold" />
                ) : (
                  <div className="text-xl font-bold">{formState.dias_restantes}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AjustesMetas;
