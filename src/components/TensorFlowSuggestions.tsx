import React, { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { Card, CardContent } from "@/components/ui/card";

interface TensorFlowSuggestionsProps {
  userData: any;
  recebidoHoje: number;
  onSuggestionChange: (suggestion: string) => void;
}

const TensorFlowSuggestions: React.FC<TensorFlowSuggestionsProps> = ({ userData, recebidoHoje, onSuggestionChange }) => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  useEffect(() => {
    // Inicializa e compila o modelo TensorFlow.js
    const initModel = async () => {
      const newModel = tf.sequential();
      newModel.add(tf.layers.dense({ units: 16, activation: "relu", inputShape: [3] })); // 3 entradas: value, average, target
      newModel.add(tf.layers.dense({ units: 1, activation: "sigmoid" })); // Saída para classificação (probabilidade)

      newModel.compile({
        optimizer: "adam",
        loss: "binaryCrossentropy",
        metrics: ["accuracy"],
      });

      setModel(newModel);
    };
    initModel();
  }, []);

  useEffect(() => {
    if (!model || !userData || !userData.historico_diario || !recebidoHoje) return;

    // Prepara os dados de treinamento
    const dailyReceipts = userData.historico_diario || [];
    const data = dailyReceipts.map((item: any) => ({
      value: item.recebido || 0,
      average: userData.meta_mes / 27,
      target: userData.meta_mes,
    }));

    if (data.length === 0) {
      onSuggestionChange("Nenhum dado histórico disponível para análise.");
      return;
    }

    const xs = tf.tensor2d(
      data.map((item: any) => [item.value, item.average, item.target]),
      [data.length, 3]
    );
    const ys = tf.tensor2d(
      data.map((item: any) => [categorizePerformance(item.value, item.average, item.target) === "above" ? 1 : 0]),
      [data.length, 1]
    );

    // Treina o modelo
    const trainModel = async () => {
      await model.fit(xs, ys, {
        epochs: 50,
        callbacks: {
          onEpochEnd: async (epoch, log) => {
            console.log(`Época ${epoch}: perda = ${log.loss}, acurácia = ${log.acc}`);
          },
        },
      });
      console.log("Treinamento concluído!");

      // Faz a previsão
      const input = tf.tensor2d([[recebidoHoje, userData.meta_mes / 27, userData.meta_mes]], [1, 3]);
      const prediction = model.predict(input) as tf.Tensor;
      const probability = (prediction as tf.Tensor1D).dataSync()[0];
      const category = probability > 0.5 ? "above" : "below";

      // Gera sugestão baseada na categoria
      const daysLeft = userData.dias_restantes || 0;
      const remaining = Math.max(0, userData.meta_mes - userData.vencido_atual);
      const suggestions = {
        above: [
          "Excelente! Seu desempenho ultrapassou a média. Continue com esse ritmo!",
          "Dias acima da meta detectados. Parabéns pela consistência!",
        ],
        below: [
          "Você está abaixo da média nos últimos dias. Reforce as abordagens com os clientes recorrentes.",
          "Muitos dias consecutivos com baixo desempenho. Reavalie suas estratégias de cobrança.",
        ],
      };

      const selectedSuggestion =
        suggestions[category]?.[Math.floor(Math.random() * suggestions[category].length)] ||
        "Sem sugestões no momento.";
      onSuggestionChange(selectedSuggestion);
    };

    trainModel().catch((err) => {
      console.error("Erro no treinamento ou previsão:", err);
      onSuggestionChange("Erro ao gerar sugestão.");
    });

    // Libera memória
    xs.dispose();
    ys.dispose();
    input.dispose();
    prediction?.dispose();
  }, [model, userData, recebidoHoje]);

  return (
    <Card className="bg-card p-4 rounded-lg shadow-sm mb-6">
      <CardContent className="p-0">
        <p className="text-foreground">Analisando dados...</p>
      </CardContent>
    </Card>
  );
};

function categorizePerformance(value: number, average: number, target: number): string {
  if (value > average * 1.2) return "above";
  if (value < average * 0.8) return "below";
  return "neutral";
}

export default TensorFlowSuggestions;
