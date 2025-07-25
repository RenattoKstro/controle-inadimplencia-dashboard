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

        {/* Benefícios Que Permitem Empréstimo Para Aposentados E Pensionistas */}
        <AccordionItem value="item-5">
          <AccordionTrigger>Benefícios Que Permitem Empréstimo Para Aposentados E Pensionistas</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal pl-5 space-y-1">
              <li>001 Pensão Por Morte - Trabalhador Rural</li>
              <li>002 Pensão Por Morte Acidentaria</li>
              <li>003 Pensão Por Morte - Empregador Rural</li>
              <li>004 Aposentado Por Invalidez - Trabalhador Rural</li>
              <li>005 Aposentado Por Invalidez Acidentaria - Trabalhador Rural</li>
              <li>006 Aposentado Por Invalidez - Empregador Rural</li>
              <li>007 Aposentado Por Velhice - Trabalhador Rural</li>
              <li>008 Aposentado Por Idade - Trabalhador Rural</li>
              <li>019 Pensão De Estudante (Lei 7.004/82)</li>
              <li>020 Pensão Por Morte de Ex-Diplomata</li>
              <li>021 Pensão Por Morte Previdenciária</li>
              <li>022 Pensão Por Morte Estatutária</li>
              <li>023 Pensão Por Morte de Ex-Combatente</li>
              <li>024 Pensão Especial (Ato Institucional)</li>
              <li>026 Pensão Por Morte Especial</li>
              <li>027 Pensão Por Morte Servidor Publico Federal</li>
              <li>028 Pensão Por Morte Regime Geral</li>
              <li>029 Pensão Por Morte de Ex-Combatente Marítimo</li>
              <li>032 Aposentadoria Por Invalidez Previdenciária</li>
              <li>033 Aposentadoria Por Invalidez Aeronauta</li>
              <li>034 Aposentadoria Por Invalidez - Ex-Combatente Marítimo</li>
              <li>037 Aposentadoria Extranumerário Capin</li>
              <li>038 Aposentadoria Extranumerário Funcionário Publico</li>
              <li>041 Aposentadoria Por Idade</li>
              <li>042 Aposentadoria Por Tempo De Contribuição</li>
              <li>043 Aposentadoria Por Tempo De Serviço - Ex-Combatente</li>
              <li>044 Aposentadoria Especial De Aeronauta</li>
              <li>045 Aposentadoria Por Tempo De Serviço Jornalista</li>
              <li>046 Aposentadoria Especial</li>
              <li>049 Aposentadoria Ordinária</li>
              <li>051 Aposentadoria Por Invalidez Extinto Plano Básico</li>
              <li>052 Aposentadoria Por Idade Extinto Plano Básico</li>
              <li>054 Pensão Especial Vitalícia (Lei 9793/99)</li>
              <li>055 Pensão Por Morte Extinto Plano Básico</li>
              <li>056 Pensão Vitalícia Síndrome Talidomida</li>
              <li>057 Aposentadoria Por Tempo De Serviço Professor</li>
              <li>058 Aposentadoria De Anistiados</li>
              <li>059 Pensão Por Morte Anistiados</li>
              <li>060 Pensão Especial Portador De Sida</li>
              <li>072 Aposentadoria Tempo De Serviço Lei De Guerra</li>
              <li>078 Aposentadoria Idade Lei De Guerra</li>
              <li>081 Aposentadoria Compulsória Ex-Sasse</li>
              <li>082 Aposentadoria Tempo De Serviço Ex-Sasse</li>
              <li>083 Aposentadoria Por Invalidez Ex-Sasse</li>
              <li>084 Pensão Por Morte Ex-Sasse</li>
              <li>087 Benefício de Prestação Continuada a pessoa com deficiência</li>
              <li>088 Benefício de Prestação Continuada a pessoa idosa</li>
              <li>089 Pensão Especial Vitimas Hemodiálise Caruaru</li>
              <li>092 Aposentadoria Invalidez Acidente Trabalho</li>
              <li>093 Pensão Por Morte Acidente Do Trabalho</li>
              <li>096 Pensão Especial Para As Pessoas Atingidas Pela Hanseníase</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default RelatoriosSabium;
