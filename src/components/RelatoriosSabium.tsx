// RelatoriosSabium.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RelatoriosSabium = () => {
  return (
    <div className="space-y-6 mt-4">
       {/* Projeção Financeira */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Projeção Fiananceira</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>A Receber</li>
            <li>Relatórios</li>
            <li>Projeção Financeira</li>
            <li>Relatório - 192.2</li>
            <li><em>Filtro 3 - Data da Posição</em></li>
            <li><em>Seleciona o último dia do mês</em></li>
            <li><em>Clica em Gerar</em></li>
          </ul>
        </CardContent>
      </Card>
      
      {/* Acompanhamento de Recebimento Contas Perdidas */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Acompanhamento de Recebimento Contas Perdidas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>A receber</li>
            <li>Relatórios</li>
            <li>Movimento diário</li>
            <li>Relatório por: 82.1</li>
            <li>Data desejada</li>
            <li>Filtro 3 carteira: 7,152</li>
            <li>Filtro 5 operação: 302010, 302011, 302012, 302013, 302014, 302015, 302016, 302020, 302021, 302050, 302062, 302065, 302070</li>
          </ul>
        </CardContent>
      </Card>

      {/* Vendas Liberada na Gerencial */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Vendas Liberada na Gerencial</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>A Receber</li>
            <li>Pesquisa</li>
            <li>Acompanhamento Renegociação</li>
            <li>Relatório - 309.2</li>
            <li><em>Não selecionar nenhuma Classificação</em></li>
            <li><em>alterar somente Filial e Data</em></li>
          </ul>
        </CardContent>
      </Card>

      {/* Gerenciamento de Desconto (Usuário do Gerente) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Gerenciamento de Desconto (Usuário do Gerente)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Venda – Pesquisa – Venda Gerencial (96358.2)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosSabium;
