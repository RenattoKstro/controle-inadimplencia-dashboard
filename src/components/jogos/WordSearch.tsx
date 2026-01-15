import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/* CONFIG */
const ROWS = 25;
const COLS = 20;

const WORDS = [
  "VENDAS","LUCRO","JUROS","CREDIARIO","GAZIN",
  "CLIENTE","CAIXA","META","DESCONTO","PARCELA",
  "ESTOQUE","RECEBIMENTO","COMISSAO","CARTAO",
  "BOLETO","PROMOCAO","PRECO","MARGEM","FINANCEIRO","LOJA"
];

/* TYPES */
type Cell = { row: number; col: number };

/* COMPONENT */
export default function WordSearch() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());

  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<Cell[]>([]);

  /* INIT */
  useEffect(() => {
    generateGrid();
  }, []);

  /* GRID GENERATION */
  function generateGrid() {
    const empty = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => "")
    );

    const placed: { word: string; cells: Cell[] }[] = [];

    WORDS.forEach(word => {
      let placedOk = false;
      let attempts = 0;

      while (!placedOk && attempts < 200) {
        attempts++;
        const dir = randomDirection();
        const startRow = Math.floor(Math.random() * ROWS);
        const startCol = Math.floor(Math.random() * COLS);

        const cells: Cell[] = [];

        for (let i = 0; i < word.length; i++) {
          const r = startRow + dir.r * i;
          const c = startCol + dir.c * i;
          if (r < 0 || c < 0 || r >= ROWS || c >= COLS) break;
          if (empty[r][c] && empty[r][c] !== word[i]) break;
          cells.push({ row: r, col: c });
        }

        if (cells.length === word.length) {
          cells.forEach((cell, i) => {
            empty[cell.row][cell.col] = word[i];
          });
          placed.push({ word, cells });
          placedOk = true;
        }
      }
    });

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!empty[r][c]) {
          empty[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(empty);
    setFoundWords([]);
    setFoundCells(new Set());
    setSelection([]);
  }

  /* MOUSE EVENTS */
  function startSelection(cell: Cell) {
    setIsSelecting(true);
    setSelection([cell]);
  }

  function updateSelection(cell: Cell) {
    if (!isSelecting) return;

    const first = selection[0];
    const path = buildLine(first, cell);
    setSelection(path);
  }

  function endSelection() {
    if (!isSelecting) return;
    setIsSelecting(false);
    checkSelection();
    setSelection([]);
  }

  /* LINE BUILDER */
  function buildLine(a: Cell, b: Cell): Cell[] {
    const dr = Math.sign(b.row - a.row);
    const dc = Math.sign(b.col - a.col);

    if (
      dr !== 0 && dc !== 0 &&
      Math.abs(b.row - a.row) !== Math.abs(b.col - a.col)
    ) return [a];

    const len = Math.max(
      Math.abs(b.row - a.row),
      Math.abs(b.col - a.col)
    ) + 1;

    return Array.from({ length: len }, (_, i) => ({
      row: a.row + dr * i,
      col: a.col + dc * i
    }));
  }

  /* VALIDATE WORD */
  function checkSelection() {
    const word = selection.map(c => grid[c.row][c.col]).join("");
    const reversed = word.split("").reverse().join("");

    const match = WORDS.find(
      w => (w === word || w === reversed) && !foundWords.includes(w)
    );

    if (!match) return;

    setFoundWords(prev => [...prev, match]);

    setFoundCells(prev => {
      const next = new Set(prev);
      selection.forEach(c => next.add(`${c.row}-${c.col}`));
      return next;
    });
  }

  /* RENDER */
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-bold">🔍 Caça-Palavras</h2>

      <div className="flex justify-center gap-10">
        {/* GRID */}
        <div
          className="grid gap-1 select-none"
          style={{ gridTemplateColumns: `repeat(${COLS}, 32px)` }}
          onMouseLeave={endSelection}
        >
          {grid.map((row, r) =>
            row.map((char, c) => {
              const key = `${r}-${c}`;
              const selected = selection.some(s => s.row === r && s.col === c);
              const found = foundCells.has(key);

              return (
                <div
                  key={key}
                  onMouseDown={() => startSelection({ row: r, col: c })}
                  onMouseEnter={() => updateSelection({ row: r, col: c })}
                  onMouseUp={endSelection}
                  className={`
                    w-8 h-8 flex items-center justify-center font-bold cursor-pointer
                    border rounded
                    ${found ? "bg-green-500 text-white" : ""}
                    ${selected && !found ? "bg-blue-400 text-white" : ""}
                  `}
                >
                  {char}
                </div>
              );
            })
          )}
        </div>

        {/* WORD LIST */}
        <div className="text-left space-y-1">
          <h4 className="font-bold mb-2">Palavras</h4>
          {WORDS.map(w => (
            <div
              key={w}
              className={foundWords.includes(w) ? "line-through text-green-600" : ""}
            >
              {w}
            </div>
          ))}
        </div>
      </div>

      <Button onClick={generateGrid}>🔄 Nova Rodada</Button>
    </div>
  );
}

/* UTIL */
function randomDirection() {
  const dirs = [
    { r: 0, c: 1 }, { r: 0, c: -1 },
    { r: 1, c: 0 }, { r: -1, c: 0 },
    { r: 1, c: 1 }, { r: -1, c: -1 },
    { r: 1, c: -1 }, { r: -1, c: 1 }
  ];
  return dirs[Math.floor(Math.random() * dirs.length)];
}
