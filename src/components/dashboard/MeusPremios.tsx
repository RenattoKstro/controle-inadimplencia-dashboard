
import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Gift, Wallet, Trophy, Utensils } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  }).format(value/100);
};

// Função para verificar se a data atual é depois do dia 15 do mês corrente
const isPastDay15 = () => {
  const today = new Date();
  return today.getDate() > 15;
};

const CardPremio = ({ titulo, premios, total, icon, color }: CardPremioProps) => {
  return (
    <Card className={`shadow-sm border-l-4 ${color}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          {icon} {titulo}
        </CardTitle>
        <CardDescription>
          Total possível: {formatCurrency(total)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {premios.map((premio, index) => (
            <li key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${premio.atingido ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="text-sm">
                  {formatPercentage(premio.percentual)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-semibold ${premio.atingido ? 'text-green-600' : 'text-gray-500'}`}>
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

const MeusPremios = ({ userData, diasSemExpediente, isLoading }: DashboardProps) => {
  const [premiosFiado, setPremiosFiado] = useState<PremioProps[]>([]);
  const [premiosDesafio, setPremiosDesafio] = useState<PremioProps[]>([]);
  const [premioAlimentacao, setPremioAlimentacao] = useState<PremioProps[]>([]);
  const [totalPremios, setTotalPremios] = useState(0);
  
  useEffect(() => {
    // Cálculos para Meta Fiado
    const recebidoMes = userData.abertura_vencido_mes - userData.vencido_atual;
    
    // Para Meta Fiado, calculamos a porcentagem de redução do valor inicial para a meta
    const totalFiado = userData.abertura_vencido_mes - userData.meta_mes;
    const metaAtingidaPercentual = totalFiado > 0 
      ? (recebidoMes / totalFiado) * 100
      : 0;
    
    const premiosFiadoData = [
      { nome: "94%", percentual: 94, valor: 52.50, atingido: metaAtingidaPercentual >= 94, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "96%", percentual: 96, valor: 63.00, atingido: metaAtingidaPercentual >= 96, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "98%", percentual: 98, valor: 84.00, atingido: metaAtingidaPercentual >= 98, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "99%", percentual: 99, valor: 94.50, atingido: metaAtingidaPercentual >= 99, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "100%", percentual: 100, valor: 241.50, atingido: metaAtingidaPercentual >= 100, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "101%", percentual: 101, valor: 84.00, atingido: metaAtingidaPercentual >= 101, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "103%", percentual: 103, valor: 84.00, atingido: metaAtingidaPercentual >= 103, icon: <Wallet size={16} />, color: "text-blue-500" },
      { nome: "105%", percentual: 105, valor: 84.00, atingido: metaAtingidaPercentual >= 105, icon: <Wallet size={16} />, color: "text-blue-500" },
    ];
    
    // Cálculos para Meta Desafio
    // Meta desafio é o valor atual reduzido para a meta de desafio
    const metaDesafioPercentual = (userData.vencido_atual > 0 && userData.meta_desafio > 0)
      ? ((userData.vencido_atual - userData.meta_desafio) / userData.vencido_atual) * 100
      : 0;
    
    const premiosDesafioData = [
      { nome: "96%", percentual: 96, valor: 200.00, atingido: metaDesafioPercentual >= 96, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "98%", percentual: 98, valor: 150.00, atingido: metaDesafioPercentual >= 98, icon: <Trophy size={16} />, color: "text-yellow-500" },
      { nome: "100%", percentual: 100, valor: 150.00, atingido: metaDesafioPercentual >= 100, icon: <Trophy size={16} />, color: "text-yellow-500" },
    ];
    
    // Cálculos para Meta Vale Alimentação - baseado em A Receber
    const aReceber = userData.abertura_vencido_mes - userData.meta_mes;
    const metaAlimentacao = aReceber * 0.8;
    const recebido = userData.abertura_vencido_mes - userData.vencido_atual;
    const metaAlimentacaoBatida = recebido >= metaAlimentacao && !isPastDay15();
    
    const premioAlimentacaoData = [
      { nome: "80% até o dia 15", percentual: 80, valor: 100.00, atingido: metaAlimentacaoBatida, icon: <Utensils size={16} />, color: "text-green-500" },
    ];
    
    setPremiosFiado(premiosFiadoData);
    setPremiosDesafio(premiosDesafioData);
    setPremioAlimentacao(premioAlimentacaoData);
    
    // Calcular total de prêmios possíveis
    const totalFiadoPremios = premiosFiadoData.reduce((acc, premio) => acc + premio.valor, 0);
    const totalDesafio = premiosDesafioData.reduce((acc, premio) => acc + premio.valor, 0);
    const totalAlimentacao = premioAlimentacaoData.reduce((acc, premio) => acc + premio.valor, 0);
    setTotalPremios(totalFiadoPremios + totalDesafio + totalAlimentacao);
    
  }, [userData]);
  
  // Calcular prêmios ganhos
  const premiosFiadoGanhos = premiosFiado.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
  const premiosDesafioGanhos = premiosDesafio.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
  const premiosAlimentacaoGanhos = premioAlimentacao.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
  const totalGanhos = premiosFiadoGanhos + premiosDesafioGanhos + premiosAlimentacaoGanhos;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-1" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <li key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Gift className="text-pink-500" /> Meus Prêmios
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardPremio 
          titulo="Meta Fiado" 
          premios={premiosFiado}
          total={787.50}
          icon={<Wallet className="text-blue-500" />}
          color="border-blue-500"
        />
        
        <CardPremio 
          titulo="Meta Desafio" 
          premios={premiosDesafio}
          total={500.00}
          icon={<Trophy className="text-yellow-500" />}
          color="border-yellow-500"
        />
        
        <CardPremio 
          titulo="Vale Alimentação" 
          premios={premioAlimentacao}
          total={100.00}
          icon={<Utensils className="text-green-500" />}
          color="border-green-500"
        />
      </div>
      
      <Card className="shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Gift className="text-purple-500" /> Total Geral de Ganhos
              </h3>
              <p className="text-sm text-gray-500">Soma de todos os prêmios conquistados</p>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(totalGanhos)}
              <span className="text-sm text-gray-500 block text-right">
                de {formatCurrency(totalPremios)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeusPremios;
