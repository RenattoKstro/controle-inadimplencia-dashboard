import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 25;

/* =====================
   PALAVRAS – VAREJO
===================== */
const WORDS = [
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
  "Gazin".toUpperCase(),
];

type Cell = {
  letter: string;
  found: boolean;
};

/* =====================
   COMPONENT
===================== */
const CacaPalavras = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selected, setSelected] = useState<{ r: number; c: number }[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);

  /* =====================
     INIT GAME
  ====================== */
  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const chosen = shuffle([...WORDS]).slice(0, 20);
    setWords(chosen);
    setFoundWords([]);
    setSelected([]);
    setGrid(generateGrid(chosen));
  };

  /* =====================
     GRID GENERATOR
  ====================== */
  const generateGrid = (words: string[]) => {
    const grid: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        letter: "",
        found: false,
      }))
    );

    words.forEach(word => placeWord(grid, word));

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!grid[r][c].letter) {
          grid[r][c].letter = randomLetter();
        }
      }
    }

    return grid;
  };

  const placeWord = (grid: Cell[][], word: string) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
    ];

    for (let tries = 0; tries < 100; tries++) {
      const [dr, dc] =
        directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      if (canPlace(grid, word, row, col, dr, dc)) {
        for (let i = 0; i < word.length; i++) {
          grid[row + dr * i][col + dc * i].letter = word[i];
        }
        return;
      }
    }
  };

  const canPlace = (
    grid: Cell[][],
    word: string,
    row: number,
    col: number,
    dr: number,
    dc: number
  ) => {
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (
        r < 0 ||
        c < 0 ||
        r >= GRID_SIZE ||
        c >= GRID_SIZE ||
        (grid[r][c].letter && grid[r][c].letter !== word[i])
      ) {
        return false;
      }
    }
    return true;
  };

  /* =====================
     CLICK CELL
  ====================== */
  const toggleSelect = (r: number, c: number) => {
    const exists = selected.find(p => p.r === r && p.c === c);
    const newSel = exists
      ? selected.filter(p => !(p.r === r && p.c === c))
      : [...selected, { r, c }];

    setSelected(newSel);
    checkWord(newSel);
  };

  const checkWord = (sel: { r: number; c: number }[]) => {
    const word = sel.map(p => grid[p.r][p.c].letter).join("");
    if (words.includes(word) && !foundWords.includes(word)) {
      setFoundWords([...foundWords, word]);
      markFound(sel);
      setSelected([]);
    }
  };

  const markFound = (sel: { r: number; c: number }[]) => {
    setGrid(prev =>
      prev.map((row, r) =>
        row.map((cell, c) => {
          if (sel.find(p => p.r === r && p.c === c)) {
            return { ...cell, found: true };
          }
          return cell;
        })
      )
    );
  };

  /* =====================
     UTILS
  ====================== */
  const randomLetter = () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26));

  const shuffle = (arr: string[]) => arr.sort(() => Math.random() - 0.5);

  /* =====================
     RENDER
  ====================== */
  return (
    <div className="flex gap-8">
      {/* GRID */}
      <div
        className="grid gap-1 select-none"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isSel = selected.find(p => p.r === r && p.c === c);
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => toggleSelect(r, c)}
                className={`
                  w-7 h-7 md:w-8 md:h-8
                  flex items-center justify-center
                  font-bold text-sm
                  cursor-pointer rounded
                  ${
                    cell.found
                      ? "bg-green-500 text-white"
                      : isSel
                      ? "bg-blue-400 text-white"
                      : "bg-gray-200"
                  }
                `}
              >
                {cell.letter}
              </div>
            );
          })
        )}
      </div>

      {/* WORD LIST */}
      <div className="w-60 space-y-3">
        <h4 className="text-xl font-bold">🔎 Palavras</h4>
        <ul className="space-y-1">
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

        <Button className="mt-4 w-full" onClick={startGame}>
          Nova Rodada
        </Button>
      </div>
    </div>
  );
};

export default CacaPalavras;
