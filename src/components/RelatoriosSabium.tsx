import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const RelatoriosSabium = () => {
  return (
    <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto">
      <Accordion type="single" collapsible className="w-full">
        {/* Acompanhamento de Recebimento Contas Perdidas */}
        <AccordionItem value="item-1">
          <AccordionTrigger>Acompanhamento de Recebimento Contas Perdidas</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>A receber</li>
              <li>Relatórios</li>
              <li>Movimento diário</li>
              <li>Relatório por: 82.1</li>
              <li>Data desejada</li>
              <li>Filtro 3 carteira: 7,152</li>
              <li>Filtro 5 operação: 302010, 302011, 302012, 302013, 302014, 302015, 302016, 302020, 302021, 302050, 302062, 302065, 302070</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Vendas Liberada na Gerencial */}
        <AccordionItem value="item-2">
          <AccordionTrigger>Vendas Liberada na Gerencial</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>A Receber</li>
              <li>Pesquisa</li>
              <li>Acompanhamento Renegociação</li>
              <li>Relatório - 309.2</li>
              <li><em>Selecionar todas Classificação</em></li>
              <li><em>Alterar filial e data</em></li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Gerenciamento De Desconto (Usuário do Gerente) */}
        <AccordionItem value="item-3">
          <AccordionTrigger>Gerenciamento De Desconto (Usuário do Gerente)</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Venda – Pesquisa – Venda Gerencial (96358.2)</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Gerar Projeção Financeira */}
        <AccordionItem value="item-4">
          <AccordionTrigger>Gerar Projeção Financeira</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>A receber</li>
              <li>Relatórios</li>
              <li>Projeção Financeira</li>
              <li>Relatório por: 192.2</li>
              <li>Filtro 3 - Data da Posição</li>
              <li>Sempre colocar o ultimo dia do mês</li>
              <li>Clicar em Gerar</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default RelatoriosSabium;
