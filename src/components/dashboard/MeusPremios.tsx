import React, { useEffect, useState, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

const isPastDeadline = (): boolean => {
  const now = new Date();
  now.setHours(now.getHours() - 4); // Ajuste para UTC-04
  const deadline = new Date(now.getFullYear(), now.getMonth(), 16, 0, 0, 0, 0); // 00:00 do dia 16 no fuso -04
  const isPast = now >= deadline;
  console.log("Debug - isPastDeadline:", { now: now.toISOString(), deadline: deadline.toISOString(), isPast });
  return isPast;
};

const isPastDay15 = (): boolean => {
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
                <span
                  className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${
                    premio.atingido ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></span>
                <span className="text-xs md:text-sm">
                  {formatPercentage(premio.percentual)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs md:text-sm font-semibold ${
                    premio.atingido ? "text-green-600" : "text-gray-500"
                  }`}
                >
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
  const isMobile = useIsMobile();
  const [maxMetaAtingida, setMaxMetaAtingida] = useState(0);
  const [isPastDeadlineState, setIsPastDeadlineState] = useState(false);
  const [premios, setPremios] = useState<{
    fiadoLider: PremioProps[];
    desafioLider: PremioProps[];
    alimentacaoLider: PremioProps[];
    fiadoCadastro: PremioProps[];
    desafioCadastro: PremioProps[];
  }>({
    fiadoLider: [],
    desafioLider: [],
    alimentacaoLider: [],
    fiadoCadastro: [],
    desafioCadastro: [],
  });
  const [totalPremiosLider, setTotalPremiosLider] = useState(0);
  const [totalPremiosCadastro, setTotalPremiosCadastro] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const maxMetaRef = useRef(0);
  const todayDate = new Date();
  const mesAtual = todayDate.getMonth();
  const [progressoCongelado, setProgressoCongelado] = useState<number | null>(null);
  const [mesCongelado, setMesCongelado] = useState<number | null>(null);

  useEffect(() => {
    const newIsPastDeadline = isPastDeadline();
    setIsPastDeadlineState(newIsPastDeadline);
    console.log("Debug - Inicializando isPastDeadlineState:", { newIsPastDeadline });

    if (userData && userData.abertura_vencido_mes && userData.meta_mes && userData.vencido_atual) {
      const aReceber = userData.abertura_vencido_mes - userData.meta_mes || 0;
      const recebidoMes = userData.abertura_vencido_mes - userData.vencido_atual || 0;
      const metaTicket = aReceber * 0.8;
      const progressoTicketAtual = metaTicket > 0 ? (recebidoMes / metaTicket) * 100 : 0;
      const progressoExibido = Math.min(100, progressoTicketAtual);
      maxMetaRef.current = Math.max(maxMetaRef.current, progressoExibido);
      setMaxMetaAtingida(maxMetaRef.current);
      console.log("Debug - Inicializando maxMetaAtingida:", { aReceber, recebidoMes, metaTicket, progressoTicketAtual, progressoExibido, maxMetaRef: maxMetaRef.current });
    }
  }, []);

  useEffect(() => {
    if (!userData || !userData.abertura_vencido_mes || !userData.meta_mes || !userData.vencido_atual) {
      console.warn("Debug - userData incompleto:", userData);
      return;
    }

    const aReceber = userData.abertura_vencido_mes - userData.meta_mes || 0;
    const recebidoMes = userData.abertura_vencido_mes - userData.vencido_atual || 0;
    const metaTicket = aReceber * 0.8;
    const progressoTicketAtual = metaTicket > 0 ? (recebidoMes / metaTicket) * 100 : 0;
    const passouDia15 = isPastDay15();

    if (passouDia15 && progressoCongelado === null) {
      const progressoNoDia15 = Math.min(100, progressoTicketAtual);
      setProgressoCongelado(progressoNoDia15);
      setMesCongelado(mesAtual);
    } else if (mesCongelado !== null && mesCongelado !== mesAtual) {
      setProgressoCongelado(null);
      setMesCongelado(null);
    }

    const progressoExibido = progressoCongelado !== null ? progressoCongelado : Math.min(100, progressoTicketAtual);
    maxMetaRef.current = Math.max(maxMetaRef.current, progressoExibido);
    setMaxMetaAtingida(maxMetaRef.current);
    console.log("Debug - Atualizando maxMetaAtingida:", { aReceber, recebidoMes, metaTicket, progressoTicketAtual, progressoExibido, maxMetaRef: maxMetaRef.current });
  }, [userData, progressoCongelado, mesCongelado]);

  useEffect(() => {
    if (!userData || isPastDeadlineState === undefined || maxMetaAtingida === undefined) {
      console.warn("Debug - Estados incompletos para cálculo de prêmios.");
      return;
    }

    const safeVencidoAtual = userData.vencido_atual || 0;
    const safeMetaMes = userData.meta_mes || 0;
    const safeMetaDesafio = userData.meta_desafio || 0;
    const safeMetaPerdido = userData.meta_perdido || 0;
    const safeRecPerdido = userData.rec_perdido || 0;

    let metaAtingidaPercentualFiadoLider = safeVencidoAtual > 0 ? Number(((safeMetaMes / safeVencidoAtual) * 100).toFixed(2)) : 0;
    metaAtingidaPercentualFiadoLider = Math.max(0, metaAtingidaPercentualFiadoLider);

    const premiosFiadoLider = [
      { nome: "94%", percentual: 94, valor: 52.50, atingido: metaAtingidaPercentualFiadoLider >= 94, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "96%", percentual: 96, valor: 63.00, atingido: metaAtingidaPercentualFiadoLider >= 96, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "98%", percentual: 98, valor: 84.00, atingido: metaAtingidaPercentualFiadoLider >= 98, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "99%", percentual: 99, valor: 94.50, atingido: metaAtingidaPercentualFiadoLider >= 99, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "100%", percentual: 100, valor: 241.50, atingido: metaAtingidaPercentualFiadoLider >= 100, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "101%", percentual: 101, valor: 84.00, atingido: metaAtingidaPercentualFiadoLider >= 101, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "103%", percentual: 103, valor: 84.00, atingido: metaAtingidaPercentualFiadoLider >= 103, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "105%", percentual: 105, valor: 84.00, atingido: metaAtingidaPercentualFiadoLider >= 105, icon: <Wallet size={16} />, color: "text-blue-500" },
    ];

    let metaDesafioPercentualLider = safeVencidoAtual > 0 && safeMetaDesafio > 0 ? Number(((safeMetaDesafio / safeVencidoAtual) * 100).toFixed(2)) : 0;
    metaDesafioPercentualLider = Math.max(0, Math.min(100, metaDesafioPercentualLider));

    const premiosDesafioLider = [
      { nome: "96%", percentual: 96, valor: 200.00, atingido: metaDesafioPercentualLider >= 96, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "98%", percentual: 98, valor: 150.00, atingido: metaDesafioPercentualLider >= 98, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "100%", percentual: 100, valor: 150.00, atingido: metaDesafioPercentualLider >= 100, icon: <Trophy size={16} />, color: "text-yellow-500" },
    ];

    const premiosAlimentacaoLider = [
      { nome: "Confirmado manualmente", percentual: 100, valor: 100.00, atingido: isPastDeadlineState && userData?.metaTicketConfirmada === true, icon: <Gift size={16} />, color: "text-green-500" },
    ];
    console.log("Debug - Calculando Vale Alimentação:", { isPastDeadlineState, metaTicketConfirmada: userData?.metaTicketConfirmada, atingidoManual: isPastDeadlineState && userData?.metaTicketConfirmada === true });

    let metaAtingidaPercentualCadastro = safeVencidoAtual > 0 ? Number(((safeMetaMes / safeVencidoAtual) * 100).toFixed(2)) : 0;
    metaAtingidaPercentualCadastro = Math.max(0, metaAtingidaPercentualCadastro);

    const premiosFiadoCadastro = [
      { nome: "94%", percentual: 94, valor: 105.00, atingido: metaAtingidaPercentualCadastro >= 94, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "98%", percentual: 98, valor: 52.50, atingido: metaAtingidaPercentualCadastro >= 98, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "100%", percentual: 100, valor: 157.50, atingido: metaAtingidaPercentualCadastro >= 100, icon: <Wallet size={16} />, color: "text-blue-500" },
    ];

    let metaDesafioPercentualCadastro = safeVencidoAtual > 0 && safeMetaDesafio > 0 ? Number(((safeMetaDesafio / safeVencidoAtual) * 100).toFixed(2)) : 0;
    metaDesafioPercentualCadastro = Math.max(0, Math.min(100, metaDesafioPercentualCadastro));

    const premiosDesafioCadastro = [
      { nome: "94%", percentual: 94, valor: 100.00, atingido: metaDesafioPercentualCadastro >= 94, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "98%", percentual: 98, valor: 100.00, atingido: metaDesafioPercentualCadastro >= 98, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "100%", percentual: 100, valor: 150.00, atingido: metaDesafioPercentualCadastro >= 100, icon: <Trophy size={16} />, color: "text-yellow-500" },
    ];

    setPremios({
      fiadoLider: premiosFiadoLider,
      desafioLider: premiosDesafioLider,
      alimentacaoLider: premiosAlimentacaoLider,
      fiadoCadastro: premiosFiadoCadastro,
      desafioCadastro: premiosDesafioCadastro,
    });
    setTotalPremiosLider(
      premiosFiadoLider.reduce((acc, p) => acc + p.valor, 0) +
      premiosDesafioLider.reduce((acc, p) => acc + p.valor, 0) +
      premiosAlimentacaoLider.reduce((acc, p) => acc + p.valor, 0)
    );
    setTotalPremiosCadastro(
      premiosFiadoCadastro.reduce((acc, p) => acc + p.valor, 0) +
      premiosDesafioCadastro.reduce((acc, p) => acc + p.valor, 0)
    );
    setIsReady(true);
  }, [userData, isPastDeadlineState, maxMetaAtingida, progressoCongelado, mesCongelado]);

  const calculoGanhos = (tipo: "lider" | "cadastro") => {
    if (!isReady || !premios || !premios[tipo === "lider" ? "fiadoLider" : "fiadoCadastro"]) {
      return 0;
    }
    const fiadoGanhos = premios[tipo === "lider" ? "fiadoLider" : "fiadoCadastro"]
      .filter((p) => p.atingido)
      .reduce((acc, p) => acc + p.valor, 0);
    const desafioGanhos = premios[tipo === "lider" ? "desafioLider" : "desafioCadastro"]
      .filter((p) => p.atingido)
      .reduce((acc, p) => acc + p.valor, 0);
    const alimentacaoGanhos = tipo === "lider" ? premios.alimentacaoLider.filter((p) => p.atingido).reduce((acc, p) => acc + p.valor, 0) : 0;
    const bonusPerdidoGanhos = bonusPerdidoAtivado
      ? [
          { percentual: 100, valor: 500.00, atingido: (userData.rec_perdido || 0) / (userData.meta_perdido || 1) >= 1 },
          { percentual: 105, valor: 200.00, atingido: (userData.rec_perdido || 0) / (userData.meta_perdido || 1) >= 1.05 },
        ].filter((p) => p.atingido).reduce((acc, p) => acc + p.valor, 0)
      : 0;

    return fiadoGanhos + desafioGanhos + alimentacaoGanhos + bonusPerdidoGanhos;
  };

  const totalGanhosLider = calculoGanhos("lider");
  const totalGanhosCadastro = calculoGanhos("cadastro");

  if (isLoading || !isReady) {
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

  if (!userData) {
    return <div>Erro: Dados do usuário não disponíveis.</div>;
  }

  const renderTabContent = () => {
    const isLider = userData.role === "líder";
    const totalPremios = isLider ? totalPremiosLider : totalPremiosCadastro;
    const totalGanhos = isLider ? totalGanhosLider : totalGanhosCadastro;
    const premiosFiado = isLider ? premios.fiadoLider : premios.fiadoCadastro;
    const premiosDesafio = isLider ? premios.desafioLider : premios.desafioCadastro;
    const premiosAlimentacao = isLider ? premios.alimentacaoLider : [];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <CardPremio
            titulo="Meta Fiado"
            premios={premiosFiado}
            total={totalPremios}
            icon={<Wallet className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-blue-500`} />}
            color="border-blue-500"
          />
          <CardPremio
            titulo="Meta Desafio"
            premios={premiosDesafio}
            total={totalPremios}
            icon={<Trophy className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-yellow-500`} />}
            color="border-yellow-500"
          />
          {isLider && (
            <CardPremio
              titulo="Vale Alimentação"
              premios={premiosAlimentacao}
              total={totalPremios}
              icon={<Gift className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-green-500`} />}
              color="border-green-500"
            />
          )}
          {bonusPerdidoAtivado && (
            <CardPremio
              titulo="Meta Perdido"
              premios={[
                { percentual: 100, valor: 500.00, atingido: (userData.rec_perdido || 0) / (userData.meta_perdido || 1) >= 1, icon: <AlertTriangle size={16} />, color: "text-red-500" },
                { percentual: 105, valor: 200.00, atingido: (userData.rec_perdido || 0) / (userData.meta_perdido || 1) >= 1.05, icon: <AlertTriangle size={16} />, color: "text-red-500" },
              ]}
              total={700.00}
              icon={<AlertTriangle className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-red-500`} />}
              color="border-red-500"
            />
          )}
        </div>
        <Card className="shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
              <div>
                <h3 className="text-base md:text-lg font-bold flex items-center gap-1 md:gap-2">
                  <Gift className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-purple-500`} /> Total Geral de Ganhos ({isLider ? "Líder" : "Cadastro"})
                </h3>
                <p className="text-xs md:text-sm text-gray-500">Soma de todos os prêmios conquistados</p>
              </div>
              <div className="text-xl md:text-2xl font-bold text-purple-700 self-end md:self-auto">
                {formatCurrency(totalGanhos)}
                <span className="text-xs md:text-sm text-gray-500 block text-right">
                  de {formatCurrency(totalPremios + (bonusPerdidoAtivado ? 700.00 : 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <Gift className="text-pink-500" /> Meus Prêmios
      </h2>
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