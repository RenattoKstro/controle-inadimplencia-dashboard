// utils/parcelas.ts
export type ResultadoParcelamento = {
  jurosTotal: number;        // juros total (precisão)
  totalPagar: number;       // total a pagar
  parcela: number;          // valor por parcela (precisão)
  parcelas: { qtd:number; valor:number }[]; // lista N..1
};

// arredonda para 2 casas
function round2(v:number){ return Math.round((v + Number.EPSILON)*100)/100; }

/**
 * Calcula parcelamento com juros fixos por parcela (taxa mensal * totalCorrigido).
 * @param totalCorrigido valor base
 * @param taxaMensalPercent ex: 2  (para 2%)
 * @param n parcelas (ex: 20)
 * @param mode 'precise' | 'perParcelRounded'
 *    - 'precise': calcula juros total em alta precisão e só depois arredonda
 *    - 'perParcelRounded': arredonda juros mensal para 2 casas e soma (pode gerar centavos extras)
 */
export function calcParcelamento(
  totalCorrigido:number,
  taxaMensalPercent:number,
  n:number,
  mode:'precise'|'perParcelRounded' = 'precise'
): ResultadoParcelamento {
  const r = taxaMensalPercent / 100;
  if (mode === 'perParcelRounded') {
    const jMensal = round2(totalCorrigido * r);          // arredonda cada parcela de juros
    const jurosTotal = round2(jMensal * n);
    const totalPagar = round2(totalCorrigido + jurosTotal);
    const parcela = round2(totalPagar / n);
    const parcelas = Array.from({length:n}, (_,i) => ({qtd: n - i, valor: round2(totalPagar / (n - i))}));
    return { jurosTotal, totalPagar, parcela, parcelas };
  } else {
    // modo precise
    const jurosTotalRaw = totalCorrigido * r * n;        // alta precisão
    const jurosTotal = round2(jurosTotalRaw);
    const totalPagarRaw = totalCorrigido + jurosTotalRaw;
    const totalPagar = round2(totalPagarRaw);
    const parcela = round2(totalPagarRaw / n);
    const parcelas = Array.from({length:n}, (_,i) => {
      const qtd = n - i;
      const valor = round2(totalPagarRaw / qtd);
      return {qtd, valor};
    });
    return { jurosTotal, totalPagar, parcela, parcelas };
  }
}
