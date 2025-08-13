import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Utensils,
  Check,
  AlertTriangle,
  Calendar,
  Target,
  Trophy,
  Calculator,
  Building,
  ArrowDown,
  Wallet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formatCurrency = (value: number | null): string => {
  if (value === null || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) return "0,00%";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

const isPastDay15 = (): boolean => {
  const today = new Date();
  return today.getDate() > 15;
};

const calcularDiasUteisAte15 = (diasRestantes: number): number => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  if (today.getDate() > 15 || today.getDate() > lastDayOfMonth) return 0;

  let diasUteis = 0;

  if (today.getDate() <= 15) {
    const diasAte15 = 15 - today.getDate();
    for (let i = 0; i <= diasAte15; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0) diasUteis++;
    }
  }

  return Math.min(diasRestantes || Infinity, diasUteis);
};

const calcularValorPorDia = (valorRestante: number, diasRestantes: number): number => {
  if (typeof diasRestantes !== "number" || diasRestantes <= 0) return 0;
  if (typeof valorRestante !== "number" || isNaN(valorRestante)) return 0;
  return Math.max(0, valorRestante / diasRestantes);
};

const calcularProgressoDiario = (recebidoHoje: number, valorPorDia: number): number => {
  if (typeof valorPorDia !== "number" || valorPorDia <= 0) return 0;
  if (typeof recebidoHoje !== "number" || isNaN(recebidoHoje)) return 0;
  return (recebidoHoje / valorPorDia) * 100;
};

const calculateTotalWorkDays = (diasSemExpediente: Date[]) => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  let totalDays = 0;
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && !diasSemExpediente?.some(date => date.toDateString() === d.toDateString())) {
      totalDays++;
    }
  }
  return totalDays;
};

const calculateWorkedDays = (diasSemExpediente: Date[]) => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  let workedDays = 0;
  for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && !diasSemExpediente?.some(date => date.toDateString() === d.toDateString())) {
      workedDays++;
    }
  }
  if (today.getDay() === 0) workedDays--;
  return workedDays;
};

const CardItem = ({
  title,
  value,
  icon,
  color = "bg-blue-500",
  showProgress = false,
  progressValue = 0,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  showProgress?: boolean;
  progressValue?: number;
}) => {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${color} bg-opacity-50`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <span className={`p-2 rounded-full ${color} text-white`}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl md:text-2xl font-bold text-foreground">{formatCurrency(value)}</div>
          {showProgress && (
            <div className="text-lg font-bold text-red-600">
              {progressValue.toFixed(2)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProgressCard = ({ title, current, target, icon, userData }: {
  title: string;
  current: number;
  target: number;
  icon: React.ReactNode;
  userData: any;
}) => {
  const isMobile = useIsMobile();

  let percentageComplete = 0;
  if (userData.vencido_atual > 0) {
    percentageComplete = (userData.meta_mes / userData.vencido_atual) * 100;
  } else {
    console.log(`[MetaFiado] Meta Fiado - Vencido Atual é zero ou negativo: ${userData.vencido_atual}`);
  }
  percentageComplete = Math.max(0, percentageComplete);

  const percentuaisAlvo = [94, 96, 98, 99, 100, 101, 103, 105];
  const valoresRestantes = percentuaisAlvo.map((percentual) => {
    const vencidoNecessario = userData.meta_mes / (percentual / 100);
    let diferenca = userData.vencido_atual - vencidoNecessario;
    const atingido = percentageComplete >= percentual;
    diferenca = atingido ? Math.abs(diferenca) : -Math.abs(diferenca);
    return { percentual, diferenca, atingido };
  });

  const getProgressStyle = (value: number) => {
    if (value < 94) return { background: "#ff0000" };
    if (value < 100) return { background: "#facc15" };
    return { background: "#22c55e" };
  };

  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-shadow duration-200 bg-blue-500 bg-opacity-10 ${
        isMobile ? "col-span-1" : "col-span-1 md:col-span-3"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col items-center gap-2">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="text-xl md:text-2xl font-bold text-foreground">
            {percentageComplete.toFixed(2)}% concluído
          </div>
        </div>
        <CardDescription className="text-sm mt-1 text-center text-foreground">
          <div className="flex flex-col md:flex-row md:gap-4 justify-center">
            <span>Meta: {formatCurrency(target)}</span>
            <span>Atual: {formatCurrency(current)}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div
            className="w-full h-10 md:h-12 rounded-full bg-white overflow-hidden relative"
            style={{ boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <div
              className="h-full rounded-l-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(percentageComplete, 105)}%`,
                ...getProgressStyle(percentageComplete),
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            />
          </div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            {valoresRestantes.map(({ percentual, diferenca, atingido }, index) => (
              <div key={percentual} className="flex items-center gap-2">
                <div
                  className={cn(
                    "text-sm md:text-base font-medium",
                    atingido ? "text-green-600" : "text-red-600"
                  )}
                >
                  {percentual}%: {formatCurrency(diferenca)}
                </div>
                {index < valoresRestantes.length - 1 && <span className="text-gray-400">|</span>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Metas = ({
  userData,
  updateUserData,
  diasRestantesCalculados,
  isLoading,
  recebidoHoje = 0,
  diasSemExpediente,
  setRecebidoHoje,
}: DashboardProps & { recebidoHoje?: number }) => {
  const isMobile = useIsMobile();
  const [diasUteisAte15, setDiasUteisAte15] = useState(0);
  const [progressoCongelado, setProgressoCongelado] = useState<number | null>(null);
  const [mesCongelado, setMesCongelado] = useState<number | null>(null);
  const [metaTicketConfirmada, setMetaTicketConfirmada] = useState(userData?.metaTicketConfirmada || false);
  const [isEditingDesafio, setIsEditingDesafio] = useState(false);
  const [metaDesafio, setMetaDesafio] = useState(userData?.meta_desafio || 0);
  const [diasRestantes, setDiasRestantes] = useState(userData?.dias_restantes || diasRestantesCalculados || 1);

  useEffect(() => {
    const dias = calcularDiasUteisAte15(diasRestantesCalculados || 0);
    setDiasUteisAte15(dias);
  }, [diasRestantesCalculados]);

  useEffect(() => {
    if (userData?.dias_restantes !== undefined) {
      setDiasRestantes(userData.dias_restantes);
    }
  }, [userData?.dias_restantes]);

  const passouDia15 = isPastDay15();
  const todayDate = new Date();
  const mesAtual = todayDate.getMonth();

  const aReceber = userData?.abertura_vencido_mes - userData?.meta_mes || 0;
  const recebidoMes = userData?.abertura_vencido_mes - userData?.vencido_atual || 0;
  const metaTicket = aReceber * 0.8;
  const progressoTicketAtual = metaTicket > 0 ? (recebidoMes / metaTicket) * 100 : 0;

  useEffect(() => {
    if (mesCongelado !== null && mesCongelado !== mesAtual) {
      setProgressoCongelado(null);
      setMesCongelado(null);
    }
    if (passouDia15 && progressoCongelado === null) {
      const progressoNoDia15 = Math.min(100, progressoTicketAtual);
      setProgressoCongelado(progressoNoDia15);
      setMesCongelado(mesAtual);
    }
  }, [passouDia15, progressoTicketAtual, mesAtual, mesCongelado]);

  const progressoExibido = progressoCongelado !== null ? progressoCongelado : Math.min(100, progressoTicketAtual);
  const metaTicketBatida = recebidoMes >= metaTicket;

  const getProgressColor = (isComplete: boolean, isPastDeadline: boolean) => {
    if (isComplete) return "bg-green-500";
    return isPastDeadline ? "bg-red-500" : "bg-yellow-500";
  };

  const valorRestanteTicket = Math.max(0, metaTicket - recebidoMes);
  const valorPorDiaTicket = diasUteisAte15 > 0 ? valorRestanteTicket / diasUteisAte15 : 0;

  const vencidoAtual = Number(userData?.vencido_atual) || 0;
  const metaDesafioValor = Number(metaDesafio) || 0;
  let progressoDesafio = 0;
  if (metaDesafioValor > 0 && vencidoAtual > 0) {
    progressoDesafio = (metaDesafioValor / vencidoAtual) * 100;
  }
  progressoDesafio = Number(progressoDesafio.toFixed(2));
  const progressoDesafioPercentual = Math.max(0, Math.min(100, progressoDesafio));
  const valorRestanteDesafio = Math.max(0, vencidoAtual - metaDesafioValor);
  const valorPorDiaDesafio = calcularValorPorDia(valorRestanteDesafio, diasRestantes);
  const progressoDiarioDesafio = calcularProgressoDiario(recebidoHoje, valorPorDiaDesafio);

  const percentuaisAlvoDesafio = [96, 98, 100];
  const valoresRestantesDesafio = percentuaisAlvoDesafio.map((percentual) => {
    const vencidoNecessario = metaDesafioValor / (percentual / 100);
    let diferenca = vencidoAtual - vencidoNecessario;
    const atingido = progressoDesafio >= percentual;
    diferenca = atingido ? Math.abs(diferenca) : -Math.abs(diferenca);
    return { percentual, diferenca, atingido };
  });

  const handleSaveDesafio = () => {
    updateUserData({ ...userData, meta_desafio: metaDesafio });
    setIsEditingDesafio(false);
  };

  const handleCancelDesafio = () => {
    setMetaDesafio(userData?.meta_desafio || 0);
    setIsEditingDesafio(false);
  };

  const faltaReceberMes = Math.max(0, (userData.vencido_atual || 0) - (userData.meta_mes || 0));
  const recebidosMesFiado = (userData.abertura_vencido_mes || 0) - (userData.vencido_atual || 0);
  const recebidoHojeFiado = Math.max(0, Number(((userData.abertura_dia || 0) - (userData.vencido_atual || 0)).toFixed(2)));
  const totalWorkDaysInMonth = calculateTotalWorkDays(diasSemExpediente);
  const diasUteisTrabalhados = userData.dias_trabalhados || calculateWorkedDays(diasSemExpediente);
  const valorPorDiaFiado = aReceber > 0 && totalWorkDaysInMonth > 0 ? aReceber / totalWorkDaysInMonth : 0;
  const valorEsperadoAcumulado = diasUteisTrabalhados > 0 ? valorPorDiaFiado * diasUteisTrabalhados : 0;
  const gap = recebidosMesFiado - valorEsperadoAcumulado;
  const receberPorDiaFiado = diasRestantesCalculados > 0 ? faltaReceberMes / diasRestantesCalculados : 0;
  const progressoDiarioFiado = receberPorDiaFiado > 0 ? (recebidoHojeFiado / receberPorDiaFiado) * 100 : 0;
  const faltaParaMetaDiariaFiado = Math.max(0, receberPorDiaFiado - recebidoHojeFiado);

  useEffect(() => {
    if (setRecebidoHoje) {
      setRecebidoHoje(recebidoHojeFiado);
    }
  }, [recebidoHojeFiado, setRecebidoHoje]);

  const handleConfirmacaoChange = (confirmed: boolean) => {
    setMetaTicketConfirmada(confirmed);
    updateUserData({ ...userData, metaTicketConfirmada: confirmed });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
        <Skeleton className="h-8 w-1/4" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-1/4" />
          </div>
          <div
            className={`grid grid-cols-1 ${
              isMobile ? "" : "md:grid-cols-2 lg:grid-cols-3"
            } gap-4`}
          >
            {[...Array(isMobile ? 4 : 8)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Meta de Ticket */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
          <Utensils className="h-5 w-5 text-green-500" />
          Meta de Ticket
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <Target className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                Meta de Ticket
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-foreground">
                80% de "A Receber" até o dia 15 do mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-medium text-foreground">Valor da Meta (80%)</p>
                    <p className="text-base md:text-2xl font-bold text-foreground">
                      {formatCurrency(metaTicket)}
                    </p>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-medium text-foreground">Recebido até agora</p>
                    <p className="text-base md:text-2xl font-bold text-foreground">
                      {formatCurrency(recebidoMes)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs md:text-sm font-medium text-foreground">Progresso da Meta</p>
                    <p className="text-xs md:text-sm font-medium text-foreground">
                      {progressoExibido.toFixed(2)}%
                    </p>
                  </div>
                  <Progress
                    value={progressoExibido}
                    className={cn(
                      "h-2 md:h-3 rounded-full bg-gray-100",
                      getProgressColor(metaTicketBatida, passouDia15)
                    )}
                  />
                </div>
                <div className="space-y-2 md:space-y-3">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-xs md:text-sm font-medium text-foreground">Valor Restante</p>
                      <p className="text-sm md:text-lg font-semibold text-foreground">
                        {formatCurrency(valorRestanteTicket)}
                      </p>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-xs md:text-sm font-medium text-foreground">Receber por dia até o dia 15</p>
                      <p className="text-sm md:text-lg font-semibold text-foreground">
                        {formatCurrency(valorPorDiaTicket)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 md:pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 md:gap-2">
                      {metaTicketBatida ? (
                        <div className="bg-green-100 p-1 rounded-full">
                          <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="bg-amber-100 p-1 rounded-full">
                          <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-amber-600" />
                        </div>
                      )}
                      <span className="text-xs md:text-sm font-medium text-foreground">
                        {metaTicketBatida
                          ? "Meta atingida! Vale alimentação garantido"
                          : "Meta ainda não atingida"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                Detalhes do Período
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-foreground">
                Informações sobre o período de avaliação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-medium text-foreground">Dias úteis restantes até o dia 15</p>
                    <div className="bg-blue-50 rounded-lg p-2 md:p-4 flex justify-center items-center">
                      <p className="text-xl md:text-3xl font-bold text-blue-700">
                        {diasUteisAte15}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-medium text-foreground">Status do Período</p>
                    <div
                      className={cn(
                        "rounded-lg p-2 md:p-4 flex justify-center items-center",
                        passouDia15 ? "bg-blue-50" : "bg-amber-50"
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm md:text-lg font-semibold",
                          passouDia15 ? "text-blue-700" : "text-amber-700"
                        )}
                      >
                        {passouDia15 ? "Período encerrado" : "Em andamento"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 md:pt-4 space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs md:text-sm font-medium text-foreground">Dia Atual</p>
                    <p className="text-xs md:text-sm font-medium text-foreground">
                      {todayDate.getDate()}
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 md:h-2">
                    <div
                      className="bg-blue-500 h-1.5 md:h-2 rounded-full"
                      style={{ width: `${Math.min(100, (todayDate.getDate() / 15) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-foreground text-right">Dias até 15 do mês</p>
                </div>
                <div className="pt-2 md:pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-xs md:text-sm font-medium text-blue-600">
                        Meta: 80% de "A Receber" ({formatCurrency(aReceber)}) = {formatCurrency(metaTicket)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {passouDia15 && (
          <div className="pt-4 border-t">
            <p className="text-sm md:text-base font-medium text-foreground">Meta de ticket foi batida?</p>
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant={metaTicketConfirmada ? "default" : "outline"}
                onClick={() => handleConfirmacaoChange(true)}
                className="px-4 py-2 rounded-md"
              >
                Sim
              </Button>
              <Button
                variant={!metaTicketConfirmada ? "default" : "outline"}
                onClick={() => handleConfirmacaoChange(false)}
                className="px-4 py-2 rounded-md"
              >
                Não
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Meta Desafio */}
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-yellow-500 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Meta Desafio
        </h2>
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="text-yellow-500" />
                  Meta Desafio
                </CardTitle>
                <CardDescription className="text-foreground">
                  Acompanha seu progresso
                </CardDescription>
              </div>
              {isEditingDesafio ? (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size={isMobile ? "sm" : "default"}
                    onClick={handleSaveDesafio}
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={handleCancelDesafio}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => setIsEditingDesafio(true)}
                >
                  Editar Meta
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Meta Desafio</div>
              {isEditingDesafio ? (
                <Input
                  value={metaDesafio}
                  onChange={(e) => setMetaDesafio(parseFloat(e.target.value) || 0)}
                  className="font-bold text-lg"
                />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {formatCurrency(metaDesafio)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-foreground">Progresso</span>
                <span className="text-sm font-medium text-foreground">
                  {formatPercentage(progressoDesafio)}
                </span>
              </div>
              <div
                className="w-full bg-white rounded-full h-4 md:h-6 shadow-inner"
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${progressoDesafioPercentual}%`,
                    background:
                      "linear-gradient(to right, #ff4d4d 0%, #ff6666 25%, #ffeb3b 50%, #ffcc00 75%, #4caf50 100%)",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-4 mt-2 justify-center">
                {valoresRestantesDesafio.map(({ percentual, diferenca, atingido }, index) => (
                  <div
                    key={percentual}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        "text-sm md:text-base font-medium",
                        atingido ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {percentual}%: {formatCurrency(diferenca)}
                    </div>
                    {index < valoresRestantesDesafio.length - 1 && (
                      <span className="text-gray-400">|</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-3 gap-4"}`}
            >
              <Card className="shadow-sm hover:shadow transition-shadow duration-200 bg-purple-500 bg-opacity-50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-sm font-medium text-foreground">
                      Valor Restante
                    </h3>
                    <span className="p-1.5 md:p-2 rounded-full bg-purple-500 text-white">
                      <Target size={isMobile ? 14 : 16} />
                    </span>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-foreground">
                    {formatCurrency(valorRestanteDesafio)}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm hover:shadow transition-shadow duration-200 bg-orange-500 bg-opacity-50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-sm font-medium text-foreground">
                      Receber por Dia
                    </h3>
                    <span className="p-1.5 md:p-2 rounded-full bg-orange-500 text-white">
                      <Calculator size={isMobile ? 14 : 16} />
                    </span>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-foreground">
                    {formatCurrency(valorPorDiaDesafio)}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm hover:shadow transition-shadow duration-200 bg-gray-500 bg-opacity-50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-sm font-medium text-foreground">
                      Dias Restantes
                    </h3>
                    <span className="p-1.5 md:p-2 rounded-full bg-gray-500 text-white">
                      <Target size={isMobile ? 14 : 16} />
                    </span>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-foreground">{diasRestantes}</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meta Fiado */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Meta Fiado</h2>
        </div>
        <div
          className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-3 gap-4"}`}
        >
          <ProgressCard
            title="Progresso da Meta Mensal"
            current={userData.vencido_atual || 0}
            target={userData.meta_mes || 0}
            icon={<Target className="h-5 w-5 text-blue-500" />}
            userData={userData}
          />
          <CardItem
            title="A Receber"
            value={aReceber}
            icon={<ArrowDown size={16} />}
            color="bg-cyan-500"
          />
          <CardItem
            title="Falta Receber/Mês"
            value={faltaReceberMes}
            icon={<ArrowDown size={16} />}
            color="bg-red-500"
          />
          <CardItem
            title="Recebido Mês"
            value={recebidosMesFiado}
            icon={<Check size={16} />}
            color="bg-green-500"
          />
          <CardItem
            title="Recebido Hoje"
            value={recebidoHojeFiado}
            icon={<Building size={16} />}
            color="bg-green-500"
            showProgress={true}
            progressValue={progressoDiarioFiado}
          />
          <CardItem
            title="Receber por Dia"
            value={receberPorDiaFiado}
            icon={<Calculator size={16} />}
            color="bg-orange-500"
          />
          <CardItem
            title="Falta para Meta Diária"
            value={faltaParaMetaDiariaFiado}
            icon={<Target size={16} />}
            color="bg-yellow-500"
          />
          <Card
            className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${gap >= 0 ? "bg-green-500" : "bg-red-500"} bg-opacity-50`}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">{gap >= 0 ? "GAP (Positivo)" : "GAP (Negativo)"}</h3>
                <span
                  className={`p-2 rounded-full ${gap >= 0 ? "bg-green-500" : "bg-red-500"} text-white`}
                >
                  <Wallet size={16} />
                </span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground">{formatCurrency(gap)}</div>
              <div className="mt-2 text-sm text-foreground">
                {gap >= 0 ? "Acima da meta" : "Abaixo da meta"}
              </div>
              <div className="mt-1 text-xs text-foreground">
                Dias úteis trabalhados: {diasUteisTrabalhados}
              </div>
              <div className="mt-1 text-xs text-foreground">
                Dias úteis restantes: {diasRestantesCalculados}
              </div>
              <div className="mt-1 text-xs text-foreground">
                Valor esperado acumulado: {formatCurrency(valorEsperadoAcumulado)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Metas;
