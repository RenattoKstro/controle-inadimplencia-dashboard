import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Scripts = ({ onClose }) => {
  const cobrancas = [
    {
      id: 1,
      text: `🟡 Olá [Nome do Cliente], tudo bem?\n\nEstamos passando pra lembrar que sua parcela de R$ [valor] está vencida há [número de dias] dias.\n\n⚠️ A partir do 4º dia de atraso, já começam a ser aplicados juros e encargos ao valor.\n\nPedimos que regularize o quanto antes pra evitar mais acréscimos.\nSe já tiver feito o pagamento, é só desconsiderar essa mensagem.\n\nQualquer dúvida, estamos à disposição!\n\n🤝 [Seu nome ou nome da empresa]`
    },
    {
      id: 2,
      text: `Olá [Nome do Cliente], tudo bem?\n\nEstamos entrando em contato para lembrar que a sua parcela no valor de R$ [valor] está em atraso há [número de dias] dias.\n\nAtenção: a partir do 4º dia de atraso, juros e encargos já começaram a ser aplicados ao valor devido.\n\nRecomendamos que regularize o pagamento o quanto antes para evitar a continuidade dos acréscimos.\n\nCaso já tenha realizado o pagamento, por favor, desconsidere esta mensagem.\n\nFicamos à disposição para qualquer dúvida.\n\nAtenciosamente,\n[Seu nome ou nome da empresa]`
    },
    {
      id: 3,
      text: `📣 Oi [Nome do Cliente]! Tudo certo?\nSó lembrando que sua parcela de R$ [valor] está com [número de dias] dias de atraso.\nA partir do 4º dia, já começam os juros e encargos.\nSe precisar de ajuda ou tiver dúvidas, me chama aqui!\n🙏 Obrigado!`
    },
    {
      id: 4,
      text: `📌 Prezado(a) [Nome do Cliente],\nIdentificamos um atraso de [número de dias] dias no pagamento da sua parcela no valor de R$ [valor].\nInformamos que, a partir do 4º dia, juros e encargos são aplicados automaticamente.\nSolicitamos a regularização o quanto antes.\nAtenciosamente,\n[Seu nome ou empresa]`
    },
    {
      id: 5,
      text: `👋 Olá [Nome do Cliente]! Tudo bem por aí?\nSó passando pra avisar que sua parcela de R$ [valor] está vencida há [número de dias] dias.\nPra evitar juros (que já começaram a contar a partir do 4º dia), é legal regularizar o quanto antes.\nSe precisar de alguma informação ou ajuda, só me chamar aqui!`
    },
    {
      id: 6,
      text: `🔔 [Nome do Cliente], sua parcela de R$ [valor] está com [número de dias] de atraso.\n⚠️ Como já passou de 4 dias, o valor está acumulando juros e encargos.\nEvite mais acréscimos e regularize assim que possível.\nEstamos à disposição se precisar!`
    },
    {
      id: 7,
      text: `📩 Oi [Nome do Cliente]!\nSua parcela de R$ [valor] está vencida há [número de dias] dias, e já estão sendo aplicados juros a partir do 4º dia.\nSe tiver algum imprevisto, chama a gente pra ver uma forma de resolver!\nQueremos te ajudar. 🤝`
    }
  ];

  const renegociacoes = [
    {
      id: 1,
      text: `Assunto: Regularize sua situação com condições especiais de pagamento\n\nOlá [Nome do Cliente],\n\nIdentificamos que existem pendências em aberto vinculadas ao seu CPF/CNPJ conosco. Sabemos que imprevistos acontecem e, por isso, estamos oferecendo uma condição especial por tempo limitado para que você regularize sua situação com mais tranquilidade.\n\nAgora você pode renegociar sua dívida em até 20x!\nÉ a oportunidade ideal para colocar tudo em dia, evitar restrições em seu nome e ainda manter seu acesso aos nossos serviços/produtos.\n\n👉 Para aproveitar essa condição facilitada, entre em contato com nossa equipe o quanto antes:\n📞 [Telefone]\n📧 [E-mail]\n💬 [WhatsApp / Link para renegociação]\n\nCaso o débito já tenha sido regularizado, por favor, desconsidere esta mensagem.\n\nEstamos à disposição para encontrar a melhor solução para você!\n\nAtenciosamente,\n[Seu Nome ou Nome da Empresa]\n[Assinatura com dados de contato]`
    },
    {
      id: 2,
      text: `Assunto: Última chance de renegociar sua dívida em até 20x!\n\nOlá [Nome do Cliente],\n\nNotamos que sua pendência financeira conosco continua em aberto. Mas temos uma excelente oportunidade para você regularizar sua situação sem comprometer o seu orçamento.\n\nEstamos oferecendo a possibilidade de renegociar sua dívida em até 20 parcelas fixas.\nÉ simples, rápido e pode ser feito direto com nossa equipe!\n\nEntre em contato agora mesmo para saber os valores e simular sua renegociação:\n📱 [WhatsApp] | 📞 [Telefone] | 📧 [E-mail]\n\nEvite restrições e mantenha seu nome limpo. Aproveite enquanto ainda está disponível!\n\nAtenciosamente,\n[Nome da empresa ou responsável]`
    },
    {
      id: 3,
      text: `Assunto: A gente entende e quer te ajudar – parcele sua dívida em até 20x\n\nOi [Nome do Cliente], tudo bem?\n\nSabemos que às vezes as coisas saem do controle, e queremos te ajudar a retomar o equilíbrio financeiro. Por isso, estamos oferecendo a chance de renegociar seu débito em até 20x com parcelas que cabem no seu bolso.\n\nVocê não está sozinho. Nossa equipe está pronta para encontrar a melhor condição para o seu momento.\nChame a gente no WhatsApp ou ligue para conversar sem compromisso:\n📞 [Telefone] | 💬 [WhatsApp] | 📧 [E-mail]\n\nConte conosco para resolver da melhor forma!\n\nCom consideração,\n[Nome ou nome da empresa]`
    },
    {
      id: 4,
      text: `Assunto: URGENTE – Oferta especial para renegociação em até 20x\n\nPrezado(a) [Nome do Cliente],\n\nSua pendência ainda está ativa e pode gerar consequências como negativação do seu CPF/CNPJ.\nMas antes disso acontecer, estamos te oferecendo uma última chance para renegociar sua dívida em até 20x, com condições exclusivas.\n\n✅ Parcelas acessíveis\n✅ Sem burocracia\n✅ Atendimento rápido\n\nNão deixe para depois! Fale conosco agora e garanta essa condição:\n📱 [WhatsApp] | 📧 [E-mail]\n\nEvite transtornos. Vamos resolver isso juntos!\n\nAtenciosamente,\n[Nome ou nome da empresa]`
    }
  ];

  const emprestimos = [
    {
      id: 1,
      text: `Temos uma ótima notícia empolgante para você! 🎉 A nossa Taxa de Juros foi reduzida para 1.72% ! Sim, você leu certo! Com o intuito de oferecer o melhor atendimento, estamos reduzindo nossas taxas. Não perca essa oportunidade, venha para a Gazin! 💼\n\nOferecemos Empréstimo Consignado especialmente para aposentados e pensionistas do INSS, com excelentes vantagens:\n- Contrato novo ou refinanciamento ✍\n- Parcelamento em até 84 vezes (sem consulta ao SPC e SERASA) 🔄\n- Limite de crédito sujeito à disponibilidade da margem, de até 35% do valor do benefício 💰\n- Parcelas descontadas diretamente do benefício 💱\n- E o melhor de tudo, uma taxa de juros super baixa! 📉\n\nFale comigo e consulte sua margem hoje mesmo sem compromisso.🤝🏆`
    },
    {
      id: 2,
      text: `💰 Precisa de grana extra? Orçamento apertou? \n💙 A Gazin Bank tem uma SURPRESA incrível para você! 💙\n💵 EMPRÉSTIMO PESSOAL PRÉ-APROVADO ☑\n🥳 É PRA JÁ! RÁPIDO E SEM BUROCRACIA!\n VALORES DE ATÉ 10MIL APROVADO NA HORA, e pago no carnê da loja. \n➡ Em até 24X\n➡ Pagamento no carnê📲\n➡ Saque na loja/crédito em conta💰\n\n➡ E aí, bora simular essa super facilidade?`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Scripts</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          < className="h-4 w-4" />
        </Button>
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="cobrancas">
          <AccordionTrigger>Scripts de Cobranças</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
              {cobrancas.map((script) => (
                <li key={script.id} className="bg-muted p-3 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-foreground">{script.text}</pre>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="renegociacoes">
          <AccordionTrigger>Scripts de Renegociações</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
              {renegociacoes.map((script) => (
                <li key={script.id} className="bg-muted p-3 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-foreground">{script.text}</pre>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="emprestimos">
          <AccordionTrigger>Scripts de Empréstimos</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
              {emprestimos.map((script) => (
                <li key={script.id} className="bg-muted p-3 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-foreground">{script.text}</pre>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Scripts;
