import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 25;
const WORDS_PER_GAME = 20;

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
  "GAZIN".toUpperCase(),
];

type Cell = {
  letter: string;
  selected: boolean;
  found: boolean;
};

const randomLetter = () =>
  String.fromCharCode(65 + Math.floor(Math.random() * 26));

const WordSearch = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<[number, number][]>([]);
  const [score, setScore] = useState(0);

  /* =====================
     INIT GAME
  ====================== */
  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const selectedWords = shuffle([...ALL_WORDS]).slice(0, WORDS_PER_GAME);
    const emptyGrid = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        letter: "",
        selected: false,
        found: false,
      }))
    );

    selectedWords.forEach(word => placeWord(emptyGrid, word));
    fillEmpty(emptyGrid);

    setGrid(emptyGrid);
    setWords(selectedWords);
    setFoundWords([]);
    setScore(0);
    setCurrentSelection([]);
  };

  /* =====================
     GRID HELPERS
  ====================== */
  const placeWord = (g: Cell[][], word: string) => {
    const directions = [
      [0, 1],   // →
      [1, 0],   // ↓
      [1, 1],   // ↘
      [-1, 1],  // ↗
    ];

    for (let attempt = 0; attempt < 100; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        if (
          r < 0 ||
          c < 0 ||
          r >= GRID_SIZE ||
          c >= GRID_SIZE ||
          (g[r][c].letter && g[r][c].letter !== word[i])
        ) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const r = row + dir[0] * i;
          const c = col + dir[1] * i;
          g[r][c].letter = word[i];
        }
        return;
      }
    }
  };

  const fillEmpty = (g: Cell[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!g[r][c].letter) {
          g[r][c].letter = randomLetter();
        }
      }
    }
  };

  /* =====================
     SELECTION
  ====================== */
  const toggleCell = (r: number, c: number) => {
    if (grid[r][c].found) return;

    const key: [number, number] = [r, c];
    let newSel = [...currentSelection];

    if (newSel.find(p => p[0] === r && p[1] === c)) {
      newSel = newSel.filter(p => !(p[0] === r && p[1] === c));
    } else {
      newSel.push(key);
    }

    setCurrentSelection(newSel);
    updateSelection(newSel);
  };

  const updateSelection = (sel: [number, number][]) => {
    const text = sel.map(([r, c]) => grid[r][c].letter).join("");

    if (words.includes(text) && !foundWords.includes(text)) {
      const newGrid = grid.map(row =>
        row.map(cell => ({ ...cell }))
      );

      sel.forEach(([r, c]) => {
        newGrid[r][c].found = true;
        newGrid[r][c].selected = false;
      });

      setGrid(newGrid);
      setFoundWords([...foundWords, text]);
      setScore(s => s + text.length * 10);
      setCurrentSelection([]);
    } else {
      const newGrid = grid.map((row, ri) =>
        row.map((cell, ci) => ({
          ...cell,
          selected: sel.some(p => p[0] === ri && p[1] === ci),
        }))
      );
      setGrid(newGrid);
    }
  };

  /* =====================
     UTILS
  ====================== */
  const shuffle = (arr: string[]) =>
    arr.sort(() => Math.random() - 0.5);

  /* =====================
     RENDER
  ====================== */
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold">🔤 Caça-Palavras</h3>
        <div className="text-xl font-bold text-green-600">
          Pontos: {score}
        </div>
      </div>

      <div className="grid grid-cols-25 gap-1 text-sm select-none">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => toggleCell(r, c)}
              className={`w-7 h-7 flex items-center justify-center rounded cursor-pointer font-bold
                ${
                  cell.found
                    ? "bg-green-500 text-white"
                    : cell.selected
                    ? "bg-blue-400 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              {cell.letter}
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold mb-2">📋 Palavras</h4>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {words.map(w => (
              <li
                key={w}
                className={
                  foundWords.includes(w)
                    ? "line-through text-green-600 font-bold"
                    : ""
                }
              >
                {w}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-end">
          <Button className="w-full" onClick={startGame}>
            🔄 Nova Rodada
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WordSearch;
