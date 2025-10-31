import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Clipboard } from "react-native";

export default function RenegociacaoMensagem() {
  const [totalCorrigido, setTotalCorrigido] = useState("");
  const [jurosParcelamento, setJurosParcelamento] = useState("");
  const [maxParcelas, setMaxParcelas] = useState("20");

  const totalPagar =
    totalCorrigido && jurosParcelamento
      ? (parseFloat(totalCorrigido) + parseFloat(jurosParcelamento))
      : 0;

  // Geração da tabela de parcelamento
  const gerarParcelas = () => {
    const parcelas = [];
    const max = parseInt(maxParcelas);

    for (let i = max; i >= 1; i--) {
      const valor = (totalPagar / i).toFixed(2);
      parcelas.push({ qtd: i, valor });
    }

    return parcelas;
  };

  const listaParcelas = gerarParcelas();

  const mensagem = `
Olá! Temos várias opções de renegociação para você:

Total Corrigido: R$ ${totalCorrigido}
Juros Parc.: R$ ${jurosParcelamento}
Total a Pagar: R$ ${totalPagar.toFixed(2)}

Opções de Parcelamento:
${listaParcelas.map(p => `${p.qtd}x de R$ ${p.valor}`).join("\n")}
  `.trim();

  const copiar = () => {
    Clipboard.setString(mensagem);
    alert("Mensagem copiada!");
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text>Total Corrigido:</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={totalCorrigido}
        onChangeText={setTotalCorrigido}
      />

      <Text>Juros Parcelamento:</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={jurosParcelamento}
        onChangeText={setJurosParcelamento}
      />

      <Text>Máximo de Parcelas (ex: 20):</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={maxParcelas}
        onChangeText={setMaxParcelas}
      />

      {totalPagar > 0 ? (
        <>
          <Text style={{ marginTop: 20, fontWeight: "bold" }}>Opções:</Text>

          {listaParcelas.map((p, index) => (
            <Text key={index} style={estilo.itemParcela}>
              {p.qtd}x de R$ {p.valor}
            </Text>
          ))}

          <Text style={{ fontWeight: "bold", marginTop: 20 }}>Mensagem Gerada:</Text>
          <Text style={estilo.msg}>{mensagem}</Text>

          <TouchableOpacity onPress={copiar} style={estilo.botao}>
            <Text style={{ color: "#FFF", textAlign: "center" }}>Copiar Mensagem</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </ScrollView>
  );
}

const estilo = {
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  itemParcela: {
    backgroundColor: "#f8f8f8",
    padding: 8,
    borderRadius: 5,
    marginVertical: 4,
  },
  msg: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 5,
    marginVertical: 10,
  },
  botao: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
};
