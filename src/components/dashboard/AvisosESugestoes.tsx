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

      if (progressoMensal >= 100) {
        setSuggestion("Parabéns! Você atingiu 100% da meta! Continue assim!");
      } else if (progressoDiario >= 100) {
        setSuggestion("Excelente! Você bateu a meta diária de hoje! Mantenha o ritmo!");
      } else {
        setSuggestion(`Continue se esforçando! Você está a ${(100 - progressoMensal).toFixed(2)}% de atingir a meta e a ${(100 - progressoDiario).toFixed(2)}% da meta diária.`);
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
