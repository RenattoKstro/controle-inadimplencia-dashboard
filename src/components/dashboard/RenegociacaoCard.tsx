import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Clipboard } from "react-native";

export default function RenegociacaoMensagem() {
  const [totalSemJuros, setTotalSemJuros] = useState("");
  const [totalCorrigido, setTotalCorrigido] = useState("");
  const [jurosParcelamento, setJurosParcelamento] = useState("");
  const [parcelas, setParcelas] = useState("");
  
  const totalPagar = 
    totalCorrigido && jurosParcelamento
      ? (parseFloat(totalCorrigido) + parseFloat(jurosParcelamento)).toFixed(2)
      : "";

  const valorParcela = 
    totalPagar && parcelas
      ? (parseFloat(totalPagar) / parseInt(parcelas)).toFixed(2)
      : "";

  const mensagem = `
Olá, temos uma proposta de renegociação para você:

Total sem Juros: R$ ${totalSemJuros}
Total Corrigido: R$ ${totalCorrigido}
Juros Parcelamento: R$ ${jurosParcelamento}
Total Pagar: R$ ${totalPagar}
Parcelas: ${parcelas}
Valor por Parcela: R$ ${valorParcela}
`.trim();

  const copiar = () => {
    Clipboard.setString(mensagem);
    alert("Mensagem copiada!");
  };

  return (
    <View style={{ padding: 20 }}>
      
      <Text>Total sem Juros:</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={totalSemJuros}
        onChangeText={setTotalSemJuros}
      />

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

      <Text>Quantidade de Parcelas:</Text>
      <TextInput
        style={estilo.input}
        keyboardType="numeric"
        value={parcelas}
        onChangeText={setParcelas}
      />

      {totalPagar && valorParcela ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "bold" }}>Mensagem Gerada:</Text>
          <Text style={estilo.msg}>{mensagem}</Text>

          <TouchableOpacity onPress={copiar} style={estilo.botao}>
            <Text style={{ color: "#FFF", textAlign: "center" }}>Copiar Mensagem</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
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
  msg: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  botao: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  }
};
