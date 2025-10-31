import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";

export default function RenegociacaoNova() {
  const [totalSemJuros, setTotalSemJuros] = useState("");
  const [percentualIsencao, setPercentualIsencao] = useState("");
  const [entrada, setEntrada] = useState("");
  const [jurosTotal, setJurosTotal] = useState(""); // juros total antes do desconto
  const [descontoJuros, setDescontoJuros] = useState(""); // %
  const [qtdParcelas, setQtdParcelas] = useState("20");

  // ✅ Calcula entrada mínima baseada no percentual
  const entradaMinima =
    totalSemJuros && percentualIsencao
      ? (parseFloat(totalSemJuros) * (parseFloat(percentualIsencao) / 100)).toFixed(2)
      : "0.00";

  // ✅ Carteira própria: total - entrada
  const carteiraPropria =
    totalSemJuros && entrada
      ? (parseFloat(totalSemJuros) - parseFloat(entrada)).toFixed(2)
      : "0.00";

  // ✅ Aplica desconto nos juros
  const jurosAplicado =
    jurosTotal && descontoJuros
      ? (parseFloat(jurosTotal) * (1 - parseFloat(descontoJuros) / 100)).toFixed(2)
      : jurosTotal
      ? parseFloat(jurosTotal).toFixed(2)
      : "0.00";

  // ✅ Total a pagar
  const totalPagar = (parseFloat(carteiraPropria) + parseFloat(jurosAplicado)).toFixed(2);

  // ✅ Valor das parcelas
  const valorParcela =
    qtdParcelas && totalPagar
      ? (parseFloat(totalPagar) / parseInt(qtdParcelas)).toFixed(2)
      : "0.00";

  // ✅ Mensagem final
  const mensagem = `
Olá, temos uma proposta de renegociação para você.

Total sem Juros: R$ ${totalSemJuros}
Valor de Entrada: R$ ${entrada}
Desconto sobre Juros: ${descontoJuros}%  
Carteira Própria: R$ ${carteiraPropria}
Valor Total a Pagar: R$ ${totalPagar}

Qtd de Parcelas: ${qtdParcelas}
Valor da Parcela: R$ ${valorParcela}
  `.trim();

  const copiar = () => {
    Alert.alert("Mensagem copiada!");
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      {/* TOTAL SEM JUROS */}
      <Text>Total Sem Juros:</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={totalSemJuros}
        onChangeText={setTotalSemJuros}
      />

      {/* PERCENTUAL ISENÇÃO */}
      <Text>% Entrada mínima (isenção juros):</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={percentualIsencao}
        onChangeText={setPercentualIsencao}
      />

      {/* MOSTRAR ENTRADA MÍNIMA */}
      {totalSemJuros && percentualIsencao ? (
        <Text style={estilo.boxInfo}>
          Entrada mínima → R$ {entradaMinima}
        </Text>
      ) : null}

      {/* ENTRADA DIGITADA */}
      <Text>Entrada escolhida:</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={entrada}
        onChangeText={setEntrada}
      />

      {/* JUROS TOTAL */}
      <Text>Juros Total (antes do desconto):</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={jurosTotal}
        onChangeText={setJurosTotal}
      />

      {/* DESCONTO SOBRE JUROS (APARECE APÓS ENTRADA) */}
      {entrada ? (
        <>
          <Text>Desconto sobre Juros (%):</Text>
          <TextInput
            style={estilo.input}
            keyboardType="numeric"
            value={descontoJuros}
            onChangeText={setDescontoJuros}
          />
        </>
      ) : null}

      {/* PARCELAMENTO */}
      <Text>Quantidade de Parcelas:</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={qtdParcelas}
        onChangeText={setQtdParcelas}
      />

      {/* RESULTADOS */}
      <Text style={estilo.boxInfo}>
        Carteira Própria: R$ {carteiraPropria}
      </Text>

      <Text style={estilo.boxInfo}>
        Juros após desconto: R$ {jurosAplicado}
      </Text>

      <Text style={estilo.boxInfo}>
        Total a Pagar: R$ {totalPagar}
      </Text>

      <Text style={estilo.boxInfo}>
        Parcela: R$ {valorParcela}
      </Text>

      {/* MENSAGEM FINAL */}
      <Text style={{ fontWeight: "bold", marginTop: 20 }}>Mensagem:</Text>
      <Text style={estilo.msg}>{mensagem}</Text>

      <TouchableOpacity onPress={copiar} style={estilo.botao}>
        <Text style={{ color: "#FFF", textAlign: "center" }}>Copiar Mensagem</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilo = {
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  boxInfo: {
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
    fontSize: 16,
  },
  msg: {
    backgroundColor: "#e5e5e5",
    padding: 12,
    borderRadius: 6,
    marginVertical: 10,
    fontSize: 15,
  },
  botao: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
  },
};
