import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AvisosESugestoesProps {
  userData: any;
  recebidoHoje: number;
}

const AvisosESugestoes = ({ userData, recebidoHoje }: AvisosESugestoesProps) => {
  const [suggestion, setSuggestion] = useState("Analisando dados...");

  useEffect(() => {
    // Validações iniciais
    if (!userData || !userData.meta_mes || !userData.vencido_atual) {
      setSuggestion("Aguarde os dados serem carregados...");
      return;
    }

    const metaMes = userData.meta_mes || 0;
    const vencidoAtual = userData.vencido_atual || 0;
    const receivedToday = recebidoHoje || 0;

    const progressoMensal = vencidoAtual > 0 ? (metaMes / vencidoAtual) * 100 : 0;
    const metaDiaria = metaMes / 27; // Assumindo 27 dias úteis
    const progressoDiario = metaDiaria > 0 ? (receivedToday / metaDiaria) * 100 : 0;

    const suggestions = {
      metaAtingida: [
        "Meta já alcançada! Excelente desempenho.",
        "Parabéns! Tudo que vier agora é bônus.",
        "Você superou a meta. Continue assim!",
        "Meta batida antes do fim do mês. Ótimo trabalho!"
      ],
      ritmoAdequado: [
        "Você está no ritmo certo. Mantenha a média!",
        "Bom andamento. Siga com foco diário.",
        "Está dentro da média necessária. Continue com consistência.",
        "Ótimo progresso até aqui. Mantenha esse ritmo para atingir a meta."
      ],
      pequenoAjuste: [
        "A meta ainda é possível com um leve aumento no ritmo.",
        "Atenção: é preciso um pequeno ajuste para alcançar a meta.",
        "Faltam poucos dias e a média diária precisa subir um pouco.",
        "Com um esforço extra, você pode alcançar a meta a tempo."
      ],
      esforçoMaior: [
        "Atenção: será necessário intensificar os resultados.",
        "Para alcançar a meta, o esforço precisa ser dobrado.",
        "O tempo está curto. Priorize os melhores recebimentos.",
        "Ritmo abaixo do ideal. Ajuste o foco para os próximos dias."
      ]
    };

    // Verifica se os arrays de sugestões estão definidos antes de acessar .length
    if (!suggestions.metaAtingida || !suggestions.ritmoAdequado || !suggestions.pequenoAjuste || !suggestions.esforcoMaior) {
      setSuggestion("Erro ao carregar sugestões...");
      return;
    }

    if (progressoMensal >= 100) {
      setSuggestion(suggestions.metaAtingida[Math.floor(Math.random() * suggestions.metaAtingida.length)]);
    } else if (progressoDiario >= 100) {
      setSuggestion("Excelente! Você bateu a meta diária de hoje! Mantenha o ritmo!");
    } else if (progressoMensal >= 75) {
      setSuggestion(suggestions.ritmoAdequado[Math.floor(Math.random() * suggestions.ritmoAdequado.length)]);
    } else if (progressoMensal >= 50) {
      setSuggestion(suggestions.pequenoAjuste[Math.floor(Math.random() * suggestions.pequenoAjuste.length)]);
    } else {
      setSuggestion(suggestions.esforcoMaior[Math.floor(Math.random() * suggestions.esforcoMaior.length)]);
    }
  }, [userData, recebidoHoje]);

  return (
    <Card className="bg-card p-4 rounded-lg shadow-sm mb-6">
      <CardContent className="p-0">
        <p className="text-foreground">{suggestion}</p>
      </CardContent>
    </Card>
  );
};

export default AvisosESugestoes;
