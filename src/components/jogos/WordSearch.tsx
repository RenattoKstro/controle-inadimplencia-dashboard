// src/components/jogos/CacaPalavras.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const ROWS = 18;
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
  const containerRef = useRef<HTMLDivElement>(null);

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
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
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

    // Preenche o restante com letras aleatórias
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

    if (match) {
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
  }

  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho compacto */}
      <div className="text-center py-2 bg-gradient-to-b from-gray-50 to-white border-b">
        <h2 className="text-xl font-bold">🔍 Caça-Palavras</h2>
        <p className="text-sm text-muted-foreground">⏱️ {seconds}s</p>
      </div>

      {/* Área principal com scroll */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto p-2 sm:p-4"
        >
          <div className="flex justify-center">
            <div
              className="grid gap-0.5 sm:gap-1 select-none touch-manipulation"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(24px, 34px))`,
                width: 'fit-content',
                maxWidth: '100%'
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
                      onTouchStart={(e) => {
                        e.preventDefault();
                        startSelect({ row: r, col: c });
                      }}
                      onTouchMove={(e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const el = document.elementFromPoint(touch.clientX, touch.clientY);
                        if (el && (el as any).dataset?.row !== undefined) {
                          updateSelect({
                            row: parseInt((el as any).dataset.row),
                            col: parseInt((el as any).dataset.col)
                          });
                        }
                      }}
                      onTouchEnd={endSelect}
                      data-row={r}
                      data-col={c}
                      className={`
                        aspect-square flex items-center justify-center
                        text-base sm:text-lg font-bold
                        border border-gray-300 rounded-sm
                        cursor-pointer select-none touch-manipulation
                        transition-colors duration-100
                        ${found ? "bg-green-500 text-white border-green-600" : ""}
                        ${selected && !found ? "bg-blue-500 text-white border-blue-600" : ""}
                        active:bg-blue-600 active:scale-105
                        hover:bg-gray-100
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

        {/* Lista de palavras - fixa na parte inferior em telas pequenas */}
        <div className="border-t bg-white p-3 sm:p-4">
          <h4 className="font-bold text-center mb-2">
            Palavras ({foundWords.length} / {WORDS.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm max-h-32 overflow-y-auto">
            {WORDS.map(w => (
              <div
                key={w}
                className={`p-1.5 rounded text-center border ${
                  foundWords.includes(w)
                    ? "line-through bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {w}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botão Nova Rodada */}
      <div className="p-4 border-t bg-white">
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={startGame}
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
