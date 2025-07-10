import { useEffect, useState } from "react";

interface PrevisaoProps {
  abertura_vencido_mes: number;
  meta_mes: number;
  vencido_atual: number;
  dias_trabalhados: number;
  dias_restantes: number;
  dailyReceipts: { date: string; value: number }[];
}

const Previsao = ({ abertura_vencido_mes, meta_mes, vencido_atual, dias_trabalhados, dias_restantes, dailyReceipts }: PrevisaoProps) => {
  const [mediaDiaria, setMediaDiaria] = useState(0);
  const [previsaoRecebimentoTotal, setPrevisaoRecebimentoTotal] = useState(0);
  const [previsaoFechamento, setPrevisaoFechamento] = useState(0);
  const [percentualMeta, setPercentualMeta] = useState(0);

  useEffect(() => {
    // Cálculo da Média Diária de Recebimento (usando dias_trabalhados)
    const totalRecebidoDiario = dailyReceipts.reduce((acc, receipt) => acc + receipt.value, 0);
    const mediaRecebimentoDiario = dias_trabalhados > 0 ? totalRecebidoDiario / dias_trabalhados : 0;
    setMediaDiaria(mediaRecebimentoDiario);

    // Previsão de Recebimento Total
    const previsaoRecebimentoRestante = mediaRecebimentoDiario * dias_restantes;
    const previsaoRecebimentoTotalCalc = totalRecebidoDiario + previsaoRecebimentoRestante;
    setPrevisaoRecebimentoTotal(previsaoRecebimentoTotalCalc);

    // Previsão de Fechamento
    const previsaoFechamentoCalc = abertura_vencido_mes - previsaoRecebimentoTotalCalc;
    setPrevisaoFechamento(previsaoFechamentoCalc);

    // Percentual da Meta
    const totalAReduzir = abertura_vencido_mes - meta_mes;
    const jaReduzido = abertura_vencido_mes - vencido_atual;
    const percentualMetaCalc = totalAReduzir > 0 ? (jaReduzido / totalAReduzir) * 100 : 0;
    setPercentualMeta(percentualMetaCalc);
  }, [abertura_vencido_mes, meta_mes, vencido_atual, dias_trabalhados, dias_restantes, dailyReceipts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getMetaStatus = () => {
    if (previsaoFechamento <= meta_mes) {
      return { text: 'Meta será atingida!', color: 'text-green-600' };
    } else {
      return { text: 'Meta em risco', color: 'text-orange-600' };
    }
  };

  const metaStatus = getMetaStatus();

  return {
    mediaDiaria,
    previsaoRecebimentoTotal,
    previsaoFechamento,
    percentualMeta,
    formatCurrency,
    metaStatus,
  };
};

export default Previsao;