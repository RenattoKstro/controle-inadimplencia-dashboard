// src/components/jogos/CacaPalavras.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const ROWS = 12;
const COLS = 18;

const WORDS = [
  "VENDAS","LUCRO","META","CREDIARIO","JUROS",
  "CAIXA","CLIENTE","PROMOCAO","DESCONTO",
  "PARCELAMENTO","BOLETO","MARGEM","COMISSAO",
  "PRECO","LOJA","ESTOQUE","GAZIN","NEGOCIACAO"
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
        let valid = true;
        for (let i = 0; i < word.length; i++) {
          const nr = r + dir.r * i;
          const nc = c + dir.c * i;
          if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) {
            valid = false;
            break;
          }
          if (g[nr][nc] && g[nr][nc] !== word[i]) {
            valid = false;
            break;
          }
          cells.push({ row: nr, col: nc });
        }

        if (valid && cells.length === word.length) {
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
    <div className="h-full flex flex-col p-4">
      {/* Cabeçalho */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">🔍 Caça-Palavras</h2>
        <p className="text-sm text-muted-foreground">⏱️ {seconds}s</p>
      </div>

      {/* Conteúdo principal com flex-1 e rolagem */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Área do grid com rolagem */}
        <div className="flex-1 overflow-auto border rounded-lg bg-white shadow-sm">
          <div className="p-4">
            <div 
              className="grid gap-1 select-none mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${COLS}, 34px)`,
                width: 'fit-content'
              }}
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
                        w-[34px] h-[34px]
                        flex items-center justify-center
                        text-lg font-bold
                        border rounded cursor-pointer
                        transition-colors
                        ${found ? "bg-green-500 text-white" : ""}
                        ${selected && !found ? "bg-blue-400 text-white" : ""}
                        hover:bg-gray-200 active:bg-blue-300
                      `}
                    >
                      {char}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Lista de palavras (com rolagem própria se necessário) */}
        <div className="w-48 min-w-[192px] overflow-y-auto border rounded-lg bg-gray-50 shadow-sm">
          <div className="p-4">
            <h4 className="font-bold mb-3 text-center sticky top-0 bg-gray-50 z-10 py-1">
              Palavras ({foundWords.length} / {WORDS.length})
            </h4>
            <div className="space-y-1">
              {WORDS.map(w => (
                <div
                  key={w}
                  className={`p-1.5 rounded text-center ${foundWords.includes(w) 
                    ? "line-through text-green-600 bg-green-50" 
                    : "text-gray-800 hover:bg-gray-100"}`}
                >
                  {w}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botão Nova Rodada */}
      <div className="mt-4 text-center">
        <Button 
          size="lg" 
          onClick={startGame}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          🔄 Nova rodada
        </Button>
      </div>
    </div>
  );
}

/* HELPERS */
function buildLine(a: Cell, b: Cell): Cell[] {
  const dr = Math.sign(b.row - a.row);
  const dc = Math.sign(b.col - a.col);
  const len = Math.max(Math.abs(b.row - a.row), Math.abs(b.col - a.col)) + 1;

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
