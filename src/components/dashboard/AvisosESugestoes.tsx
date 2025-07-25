import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AvisosESugestoesProps {
  userData: any;
  recebidoHoje: number;
}

const AvisosESugestoes = ({ userData, recebidoHoje }: AvisosESugestoesProps) => {
  const [suggestion, setSuggestion] = useState("Analisando dados...");

  useEffect(() => {
    if (userData && userData.meta_mes && userData.vencido_atual) {
      const progressoMensal = userData.vencido_atual > 0 ? (userData.meta_mes / userData.vencido_atual) * 100 : 0;
      const metaDiaria = userData.meta_mes / 27; // Receber por Dia (assumindo 27 dias úteis)
      const progressoDiario = metaDiaria > 0 ? (recebidoHoje / metaDiaria) * 100 : 0;

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
    } else {
      setSuggestion("Aguarde os dados serem carregados...");
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
