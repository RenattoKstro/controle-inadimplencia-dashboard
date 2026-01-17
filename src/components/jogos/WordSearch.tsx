import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const ROWS = 25;
const COLS = 20;

const WORDS = [
  "VENDAS","LUCRO","META","CREDIARIO","JUROS",
  "RECEBIMENTO","CAIXA","ESTOQUE","CLIENTE",
  "PROMOCAO","DESCONTO","PARCELAMENTO","BOLETO",
  "NEGOCIACAO","MARGEM","COMISSAO","FINANCEIRO",
  "LOJA","PRECO","GAZIN"
];

type Cell = { row: number; col: number };

function CacaPalavras() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<Cell[]>([]);
  const [selecting, setSelecting] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    startGame();
    return stopTimer;
  }, []);

  function startTimer() {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startGame() {
    generateGrid();
    setFoundWords([]);
    setFoundCells(new Set());
    setSelection([]);
    setSeconds(0);
    startTimer();
  }

  function generateGrid() {
    const g = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => "")
    );

    WORDS.forEach(word => {
      let placed = false;

      while (!placed) {
        const dir = randomDir();
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);

        const cells: Cell[] = [];
        for (let i = 0; i < word.length; i++) {
          const nr = r + dir.r * i;
          const nc = c + dir.c * i;
          if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) break;
          if (g[nr][nc] && g[nr][nc] !== word[i]) break;
          cells.push({ row: nr, col: nc });
        }

        if (cells.length === word.length) {
          cells.forEach((cell, i) => {
            g[cell.row][cell.col] = word[i];
          });
          placed = true;
        }
      }
    });

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!g[r][c]) {
          g[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(g);
  }

  function startSelect(cell: Cell) {
    setSelecting(true);
    setSelection([cell]);
  }

  function updateSelect(cell: Cell) {
    if (!selecting) return;
    setSelection(buildLine(selection[0], cell));
  }

  function endSelect() {
    if (!selecting) return;
    setSelecting(false);
    checkWord();
    setSelection([]);
  }

  function checkWord() {
    const word = selection.map(c => grid[c.row][c.col]).join("");
    const reversed = word.split("").reverse().join("");

    const match = WORDS.find(
      w => (w === word || w === reversed) && !foundWords.includes(w)
    );

    if (!match) return;

    setFoundWords(f => [...f, match]);
    setFoundCells(prev => {
      const n = new Set(prev);
      selection.forEach(c => n.add(`${c.row}-${c.col}`));
      return n;
    });

    if (foundWords.length + 1 === WORDS.length) {
      stopTimer();
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-3">
        <h2 className="text-2xl font-bold">🔍 Caça-Palavras</h2>
        <p>⏱️ Tempo: <b>{seconds}s</b></p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 overflow-auto border rounded-lg p-2">
          <div
            className="grid gap-1 select-none"
            style={{ gridTemplateColumns: `repeat(${COLS}, 32px)` }}
          >
            {grid.map((row, r) =>
              row.map((char, c) => {
                const key = `${r}-${c}`;
                const selected = selection.some(s => s.row === r && s.col === c);
                const found = foundCells.has(key);

                return (
                  <div
                    key={key}
                    onMouseDown={() => startSelect({ row: r, col: c })}
                    onMouseEnter={() => updateSelect({ row: r, col: c })}
                    onMouseUp={endSelect}
                    className={`
                      w-8 h-8 flex items-center justify-center
                      border rounded cursor-pointer font-bold
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
        </div>

        <div className="w-48 overflow-auto">
          <h4 className="font-bold mb-2">Palavras</h4>
          {WORDS.map(w => (
            <div
              key={w}
              className={foundWords.includes(w)
                ? "line-through text-green-600"
                : ""}
            >
              {w}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <Button onClick={startGame}>🔄 Nova Rodada</Button>
      </div>
    </div>
  );
}

/* HELPERS */
function buildLine(a: Cell, b: Cell): Cell[] {
  const dr = Math.sign(b.row - a.row);
  const dc = Math.sign(b.col - a.col);
  const len =
    Math.max(Math.abs(b.row - a.row), Math.abs(b.col - a.col)) + 1;

  return Array.from({ length: len }, (_, i) => ({
    row: a.row + dr * i,
    col: a.col + dc * i
  }));
}

function randomDir() {
  const dirs = [
    { r: 0, c: 1 }, { r: 0, c: -1 },
    { r: 1, c: 0 }, { r: -1, c: 0 },
    { r: 1, c: 1 }, { r: -1, c: -1 },
    { r: 1, c: -1 }, { r: -1, c: 1 }
  ];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

export default CacaPalavras;
