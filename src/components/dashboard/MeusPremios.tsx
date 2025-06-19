import React, { useEffect, useState } from "react";
import { DashboardProps } from "../DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Gift, Wallet, Trophy, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch"; // Adicionado para o botão toggle
import { Label } from "@/components/ui/label"; // Adicionado para o label do switch

interface PremioProps {
  nome: string;
  percentual: number;
  valor: number;
  atingido: boolean;
  icon: React.ReactNode;
  color: string;
}

interface CardPremioProps {
  titulo: string;
  premios: PremioProps[];
  total: number;
  icon: React.ReactNode;
  color: string;
}

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
  }).format(value / 100);
};

const isPastDay15 = () => {
  const today = new Date();
  return today.getDate() > 15;
};

const CardPremio = ({ titulo, premios, total, icon, color }: CardPremioProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`shadow-sm border-l-4 ${color}`}>
      <CardHeader className="pb-1 md:pb-2">
        <CardTitle className="text-base md:text-lg font-bold flex items-center gap-1 md:gap-2">
          {icon} {titulo}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Total possível: {formatCurrency(total)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 md:space-y-3">
          {premios.map((premio, index) => (
            <li key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-1 md:gap-2">
                <span className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${premio.atingido ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="text-xs md:text-sm">
                  {formatPercentage(premio.percentual)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xs md:text-sm font-semibold ${premio.atingido ? 'text-green-600' : 'text-gray-500'}`}>
                  {formatCurrency(premio.valor)}
                </span>
                {premio.atingido && <span>✅</span>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const MeusPremios = ({ 
  userData, 
  diasSemExpediente, 
  isLoading, 
  bonusPerdidoAtivado,
  setBonusPerdidoAtivado,
}: DashboardProps) => {
  const { toast } = useToast();
  const [premiosFiadoLider, setPremiosFiadoLider] = useState<PremioProps[]>([]);
  const [premiosDesafioLider, setPremiosDesafioLider] = useState<PremioProps[]>([]);
  const [premiosAlimentacaoLider, setPremiosAlimentacaoLider] = useState<PremioProps[]>([]);
  const [premiosFiadoCadastro, setPremiosFiadoCadastro] = useState<PremioProps[]>([]);
  const [premiosDesafioCadastro, setPremiosDesafioCadastro] = useState<PremioProps[]>([]);
  const [totalPremiosLider, setTotalPremiosLider] = useState(0);
  const [totalPremiosCadastro, setTotalPremiosCadastro] = useState(0);
  const [activeTab, setActiveTab] = useState("lider");

  useEffect(() => {
    if (!userData) {
      console.warn("userData não está disponível, pulando cálculos.");
      return;
    }

    const safeVencidoAtual = userData.vencido_atual || 0;
    const safeMetaMes = userData.meta_mes || 0;
    const safeMetaDesafio = userData.meta_desafio || 0;
    const safeMetaPerdido = userData.meta_perdido || 0;
    const safeRecPerdido = userData.rec_perdido || 0;

    let metaAtingidaPercentualLider = 0;
    if (safeVencidoAtual > 0) {
      metaAtingidaPercentualLider = (safeMetaMes / safeVencidoAtual) * 100;
      metaAtingidaPercentualLider = Number(metaAtingidaPercentualLider.toFixed(2));
    }
    metaAtingidaPercentualLider = Math.max(0, metaAtingidaPercentualLider);

    const premiosFiadoLiderData = [
      { nome: "94%", percentual: 94, valor: 52.50, atingido: metaAtingidaPercentualLider >= 94, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "96%", percentual: 96, valor: 63.00, atingido: metaAtingidaPercentualLider >= 96, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "98%", percentual: 98, valor: 84.00, atingido: metaAtingidaPercentualLider >= 98, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "99%", percentual: 99, valor: 94.50, atingido: metaAtingidaPercentualLider >= 99, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "100%", percentual: 100, valor: 241.50, atingido: metaAtingidaPercentualLider >= 100, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "101%", percentual: 101, valor: 84.00, atingido: metaAtingidaPercentualLider >= 101, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "103%", percentual: 103, valor: 84.00, atingido: metaAtingidaPercentualLider >= 103, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "105%", percentual: 105, valor: 84.00, atingido: metaAtingidaPercentualLider >= 105, icon: <Wallet size={16} />, color: "text-blue-500" },
    ];

    let metaDesafioPercentualLider = 0;
    if (safeVencidoAtual > 0 && safeMetaDesafio > 0) {
      metaDesafioPercentualLider = (safeMetaDesafio / safeVencidoAtual) * 100;
      metaDesafioPercentualLider = Number(metaDesafioPercentualLider.toFixed(2));
    }
    metaDesafioPercentualLider = Math.max(0, Math.min(100, metaDesafioPercentualLider));

    const premiosDesafioLiderData = [
      { nome: "96%", percentual: 96, valor: 200.00, atingido: metaDesafioPercentualLider >= 96, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "98%", percentual: 98, valor: 150.00, atingido: metaDesafioPercentualLider >= 98, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "100%", percentual: 100, valor: 150.00, atingido: metaDesafioPercentualLider >= 100, icon: <Trophy size={16} />, color: "text-yellow-500" },
    ];

    const premioAlimentacaoLiderData = [
      { nome: "Disponível após dia 15", percentual: 100, valor: 100.00, atingido: isPastDay15() && metaAtingidaPercentualLider >= 100, icon: <Gift size={16} />, color: "text-green-500" },
    ];

    let metaAtingidaPercentualCadastro = 0;
    if (safeVencidoAtual > 0) {
      metaAtingidaPercentualCadastro = (safeMetaMes / safeVencidoAtual) * 100;
      metaAtingidaPercentualCadastro = Number(metaAtingidaPercentualCadastro.toFixed(2));
    }
    metaAtingidaPercentualCadastro = Math.max(0, metaAtingidaPercentualCadastro);

    const premiosFiadoCadastroData = [
      { nome: "94%", percentual: 94, valor: 105.00, atingido: metaAtingidaPercentualCadastro >= 94, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "98%", percentual: 98, valor: 52.50, atingido: metaAtingidaPercentualCadastro >= 98, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "100%", percentual: 100, valor: 157.50, atingido: metaAtingidaPercentualCadastro >= 100, icon: <Wallet size={16} />, color: "text-blue-500" },
    ];

    let metaDesafioPercentualCadastro = 0;
    if (safeVencidoAtual > 0 && safeMetaDesafio > 0) {
      metaDesafioPercentualCadastro = (safeMetaDesafio / safeVencidoAtual) * 100;
      metaDesafioPercentualCadastro = Number(metaDesafioPercentualCadastro.toFixed(2));
    }
    metaDesafioPercentualCadastro = Math.max(0, Math.min(100, metaDesafioPercentualCadastro));

    const premiosDesafioCadastroData = [
      { nome: "94%", percentual: 94, valor: 100.00, atingido: metaDesafioPercentualCadastro >= 94, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "98%", percentual: 98, valor: 100.00, atingido: metaDesafioPercentualCadastro >= 98, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "100%", percentual: 100, valor: 150.00, atingido: metaDesafioPercentualCadastro >= 100, icon: <Trophy size={16} />, color: "text-yellow-500" },
    ];

    let metaPerdidoPercentual = 0;
    if (safeMetaPerdido > 0 && safeRecPerdido > 0) {
      metaPerdidoPercentual = (safeRecPerdido / safeMetaPerdido) * 100;
      metaPerdidoPercentual = Number(metaPerdidoPercentual.toFixed(2));
    }
    const bonusPerdido = [
      { percentual: 100, valor: 500.00, atingido: metaPerdidoPercentual >= 100 },
      { percentual: 105, valor: 200.00, atingido: metaPerdidoPercentual >= 105 },
    ];

    setPremiosFiadoLider(premiosFiadoLiderData);
    setPremiosDesafioLider(premiosDesafioLiderData);
    setPremiosAlimentacaoLider(premioAlimentacaoLiderData);
    setPremiosFiadoCadastro(premiosFiadoCadastroData);
    setPremiosDesafioCadastro(premiosDesafioCadastroData);

    const totalFiadoLider = premiosFiadoLiderData.reduce((acc, premio) => acc + premio.valor, 0);
    const totalDesafioLider = premiosDesafioLiderData.reduce((acc, premio) => acc + premio.valor, 0);
    const totalAlimentacaoLider = premioAlimentacaoLiderData.reduce((acc, premio) => acc + premio.valor, 0);
    const totalFiadoCadastro = premiosFiadoCadastroData.reduce((acc, premio) => acc + premio.valor, 0);
    const totalDesafioCadastro = premiosDesafioCadastroData.reduce((acc, premio) => acc + premio.valor, 0);
    setTotalPremiosLider(totalFiadoLider + totalDesafioLider + totalAlimentacaoLider);
    setTotalPremiosCadastro(totalFiadoCadastro + totalDesafioCadastro);
  }, [userData]);

  const premiosFiadoGanhosLider = premiosFiadoLider.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
  const premiosDesafioGanhosLider = premiosDesafioLider.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
  const premiosAlimentacaoGanhosLider = premiosAlimentacaoLider.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
  const bonusPerdidoGanhos = bonusPerdidoAtivado ? bonusPerdido.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0) : 0;
  const totalGanhosLider = premiosFiadoGanhosLider + premiosDesafioGanhosLider + premiosAlimentacaoGanhosLider + bonusPerdidoGanhos;

  const premiosFiadoGanhosCadastro = premiosFiadoCadastro.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
  const premiosDesafioGanhosCadastro = premiosDesafioCadastro.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
  const totalGanhosCadastro = premiosFiadoGanhosCadastro + premiosDesafioGanhosCadastro + (bonusPerdidoAtivado ? bonusPerdido.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0) : 0);

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-6 md:h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 md:h-6 w-36 mb-1" />
                <Skeleton className="h-3 md:h-4 w-24" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 md:space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <li key={j} className="flex justify-between">
                      <Skeleton className="h-3 md:h-4 w-16" />
                      <Skeleton className="h-3 md:h-4 w-24" />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-12 md:h-16 w-full" />
      </div>
    );
  }

  const renderTabContent = () => {
    if (activeTab === "lider") {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <CardPremio 
              titulo="Meta Fiado" 
              premios={premiosFiadoLider}
              total={totalPremiosLider}
              icon={<Wallet className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-500`} />}
              color="border-blue-500"
            />
            <CardPremio 
              titulo="Meta Desafio" 
              premios={premiosDesafioLider}
              total={totalPremiosLider}
              icon={<Trophy className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500`} />}
              color="border-yellow-500"
            />
            <CardPremio 
              titulo="Vale Alimentação" 
              premios={premiosAlimentacaoLider}
              total={totalPremiosLider}
              icon={<Gift className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-500`} />}
              color="border-green-500"
            />
            {bonusPerdidoAtivado && (
              <CardPremio 
                titulo="Meta Perdido" 
                premios={[{ percentual: 100, valor: 500.00, atingido: metaPerdidoPercentual >= 100 }, { percentual: 105, valor: 200.00, atingido: metaPerdidoPercentual >= 105 }].map(p => ({ ...p, icon: <AlertTriangle size={16} />, color: "text-red-500" }))}
                total={bonusPerdidoAtivado ? 700.00 : 0}
                icon={<AlertTriangle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-500`} />}
                color="border-red-500"
              />
            )}
          </div>
          <Card className="shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
                <div>
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-1 md:gap-2">
                    <Gift className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-500`} /> Total Geral de Ganhos (Líder)
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">Soma de todos os prêmios conquistados</p>
                </div>
                <div className="text-xl md:text-2xl font-bold text-purple-700 self-end md:self-auto">
                  {formatCurrency(totalGanhosLider)}
                  <span className="text-xs md:text-sm text-gray-500 block text-right">
                    de {formatCurrency(totalPremiosLider + (bonusPerdidoAtivado ? 700.00 : 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    } else {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
            <CardPremio 
              titulo="Meta Fiado" 
              premios={premiosFiadoCadastro}
              total={totalPremiosCadastro}
              icon={<Wallet className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-500`} />}
              color="border-blue-500"
            />
            <CardPremio 
              titulo="Meta Desafio" 
              premios={premiosDesafioCadastro}
              total={totalPremiosCadastro}
              icon={<Trophy className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500`} />}
              color="border-yellow-500"
            />
            {bonusPerdidoAtivado && (
              <CardPremio 
                titulo="Meta Perdido" 
                premios={[{ percentual: 100, valor: 500.00, atingido: metaPerdidoPercentual >= 100 }, { percentual: 105, valor: 200.00, atingido: metaPerdidoPercentual >= 105 }].map(p => ({ ...p, icon: <AlertTriangle size={16} />, color: "text-red-500" }))}
                total={bonusPerdidoAtivado ? 700.00 : 0}
                icon={<AlertTriangle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-500`} />}
                color="border-red-500"
              />
            )}
          </div>
          <Card className="shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
                <div>
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-1 md:gap-2">
                    <Gift className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-500`} /> Total Geral de Ganhos (Cadastro)
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">Soma de todos os prêmios conquistados</p>
                </div>
                <div className="text-xl md:text-2xl font-bold text-purple-700 self-end md:self-auto">
                  {formatCurrency(totalGanhosCadastro)}
                  <span className="text-xs md:text-sm text-gray-500 block text-right">
                    de {formatCurrency(totalPremiosCadastro + (bonusPerdidoAtivado ? 700.00 : 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <Gift className="text-pink-500" /> Meus Prêmios
      </h2>

      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded-md ${activeTab === "lider" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => setActiveTab("lider")}
        >
          Op. Cadastro Líder
        </button>
        <button
          className={`px-4 py-2 rounded-md ${activeTab === "cadastro" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => setActiveTab("cadastro")}
        >
          Op. Cadastro
        </button>
      </div>
      {renderTabContent()}
      <div className="flex items-center gap-2">
        <Switch
          checked={bonusPerdidoAtivado}
          onCheckedChange={(checked) => {
            try {
              setBonusPerdidoAtivado(checked);
              console.log("Switch + Perdido alterado para:", checked);
            } catch (error) {
              console.error("Erro ao alternar bonusPerdidoAtivado:", error);
              toast({
                title: "Erro",
                description: "Não foi possível ativar/desativar o bônus perdido. Tente novamente.",
                variant: "destructive",
              });
            }
          }}
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
        />
        <Label htmlFor="bonus-perdido-switch">Ativar Meta Perdido</Label>
      </div>
    </div>
  );
};

export default MeusPremios;
