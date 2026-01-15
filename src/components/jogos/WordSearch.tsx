import React, { useEffect, useRef, useState } from "react";
import "./CacaPalavras.css";

const ROWS = 25;
const COLS = 20;

const ALL_WORDS = [
  "VENDAS",
"LUCRO",
"META",
"CREDIARIO",
"JUROS",
"RECEBIMENTO",
"CAIXA",
"ESTOQUE",
"CLIENTE",
"PROMOCAO",
"DESCONTO",
"PARCELAMENTO",
"BOLETO",
"PIX",
"CARTAO",
"GARANTIA",
"SEGURO",
"CONSORCIO",
"LOJA",
"VAREJO",
"MARGEM",
"COMISSAO",
"FATURAMENTO",
"PRECO",
"VENDEDOR",
"GATILHO",
"ATENDIMENTO",
"EMPRESTIMO",
"CCG",
"SIGA",
"SABIUM",
"ASSISTENCIA",
"GAZIN",
"INADIMPLENCIA",
"NEGOCIACAO",
"PROSPECCAO",
"FIDELIZACAO",
"ESTORNO",
"LIQUIDACAO",
"ORCAMENTO",
"FORNECEDOR",
"LOGISTICA",
"INVENTARIO",
"COBRANCA",
"ANTECIPACAO",
"POSVENDA",
"DNA",
"ENTREGAS",
"TV GAZIN",
"MONTAGENS",
"FILIAL",
"AUDITORIA",
"RENEGOCIAÇÃO",
"ROBOZIN",
"ABATEDORES",
];

const DIRECTIONS = [
  { x: 1, y: 0 },   // →
  { x: -1, y: 0 },  // ←
  { x: 0, y: 1 },   // ↓
  { x: 0, y: -1 },  // ↑
  { x: 1, y: 1 },   // ↘
  { x: -1, y: -1 }, // ↖
  { x: 1, y: -1 },  // ↗
  { x: -1, y: 1 }   // ↙
];

function CacaPalavras() {
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [found, setFound] = useState([]);
  const [selected, setSelected] = useState([]);
  const [time, setTime] = useState(0);
  const [name, setName] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    newGame();
    loadRanking();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  function newGame() {
    clearInterval(timerRef.current);
    setTime(0);
    setFound([]);

    const selectedWords = shuffle([...ALL_WORDS]).slice(0, 20);
    const emptyGrid = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => "")
    );

    selectedWords.forEach(word => placeWord(emptyGrid, word));
    fillEmpty(emptyGrid);

    setGrid(emptyGrid);
    setWords(selectedWords);
  }

  function placeWord(grid, word) {
    let placed = false;

    while (!placed) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const x = Math.floor(Math.random() * COLS);
      const y = Math.floor(Math.random() * ROWS);

      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const nx = x + dir.x * i;
        const ny = y + dir.y * i;
        if (
          nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS ||
          (grid[ny][nx] && grid[ny][nx] !== word[i])
        ) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          grid[y + dir.y * i][x + dir.x * i] = word[i];
        }
        placed = true;
      }
    }
  }

  function fillEmpty(grid) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!grid[y][x]) {
          grid[y][x] =
            letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }

  function startSelect(x, y) {
    setSelected([{ x, y }]);
  }

  function moveSelect(x, y) {
    setSelected(prev =>
      prev.some(p => p.x === x && p.y === y)
        ? prev
        : [...prev, { x, y }]
    );
  }

  function endSelect() {
    const word = selected.map(p => grid[p.y][p.x]).join("");
    const reverse = [...selected]
      .reverse()
      .map(p => grid[p.y][p.x])
      .join("");

    if (words.includes(word) || words.includes(reverse)) {
      setFound(prev => [...prev, word]);
    }
    setSelected([]);
  }

  function saveScore() {
    if (!name) return;
    const ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
    ranking.push({ name, time });
    ranking.sort((a, b) => a.time - b.time);
    localStorage.setItem("ranking", JSON.stringify(ranking.slice(0, 10)));
    loadRanking();
  }

  function loadRanking() {
    setTimeout(() => {
      setRanking(
        JSON.parse(localStorage.getItem("ranking") || "[]")
      );
    }, 0);
  }

  const [ranking, setRanking] = useState([]);

  return (
    <div className="container">
      <div>
        <h2>⏱ Tempo: {time}s</h2>

        <div
          className="grid"
          onMouseUp={endSelect}
        >
          {grid.map((row, y) =>
            row.map((char, x) => {
              const isSelected = selected.some(
                p => p.x === x && p.y === y
              );
              return (
                <div
                  key={`${x}-${y}`}
                  className={`cell ${isSelected ? "selected" : ""}`}
                  onMouseDown={() => startSelect(x, y)}
                  onMouseEnter={() => moveSelect(x, y)}
                >
                  {char}
                </div>
              );
            })
          )}
        </div>

        <button onClick={newGame}>🔄 Nova Rodada</button>
      </div>

      <div className="sidebar">
        <h3>📋 Palavras</h3>
        {words.map(w => (
          <div key={w} className="word">{w}</div>
        ))}

        <h3>🏆 Ranking</h3>
        <input
          placeholder="Seu nome"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button onClick={saveScore}>Salvar Recorde</button>

        {ranking.map((r, i) => (
          <div key={i}>{r.name} - {r.time}s</div>
        ))}
      </div>
    </div>
  );
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

export default CacaPalavras;
