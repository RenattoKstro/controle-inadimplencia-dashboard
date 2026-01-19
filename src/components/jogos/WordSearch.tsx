// src/components/jogos/CacaPalavras.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const ROWS = 18;
const COLS = 18;

// Palavras visíveis (obrigatórias)
const VISIBLE_WORDS = [
  "VENDAS","LUCRO","META","CREDIARIO","JUROS",
  "CAIXA","CLIENTE","PROMOCAO","DESCONTO",
  "PARCELAMENTO","BOLETO","MARGEM","COMISSAO",
  "PRECO","LOJA","ESTOQUE","GAZIN","NEGOCIACAO"
];

// Palavras ocultas (secretas - bônus)
const SECRET_WORDS = [
  "FATURAMENTO", "RENDIMENTO", "EMPRESTIMO", "CHEQUE", "CARTAO",
  "DIVIDA", "COBRANCA", "RENEGOCIACAO", "FLUXOCAIXA", "LUCROBRUTO"
];

const ALL_WORDS = [...VISIBLE_WORDS, ...SECRET_WORDS];

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

    ALL_WORDS.forEach(word => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 200) { // mais tentativas para caber tudo
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

    const match = ALL_WORDS.find(
      w => (w === word || w === reversed) && !foundWords.includes(w)
    );

    if (match) {
      setFoundWords(f => [...f, match]);
      setFoundCells(prev => {
        const n = new Set(prev);
        selection.forEach(c => n.add(`${c.row}-${c.col}`));
        return n;
      });

      if (foundWords.length + 1 === ALL_WORDS.length) {
        stopTimer();
        alert(`Parabéns! Você encontrou todas as ${ALL_WORDS.length} palavras em ${seconds} segundos!`);
      }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Cabeçalho compacto */}
      <div className="text-center py-3 border-b bg-white shadow-sm">
        <h2 className="text-2xl font-bold">🔍 Caça-Palavras - Varejo & Finanças</h2>
        <p className="text-sm text-muted-foreground mt-1">
          ⏱️ {seconds}s • Palavras: {foundWords.length} / {ALL_WORDS.length}
        </p>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Grid com rolagem */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-white">
          <div className="flex justify-center">
            <div
              className="grid gap-0.5 sm:gap-1 select-none touch-manipulation"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(28px, 36px))`,
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
                        text-base sm:text-lg md:text-xl font-bold
                        border border-gray-200 rounded
                        cursor-pointer select-none touch-manipulation
                        transition-all duration-100
                        ${found ? "bg-green-500 text-white shadow-md border-green-600" : ""}
                        ${selected && !found ? "bg-blue-500 text-white shadow-sm border-blue-600" : ""}
                        active:bg-blue-600 active:scale-110 hover:bg-gray-100
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

        {/* Lista de palavras - lateral direita */}
        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l bg-gray-50 overflow-y-auto">
          <div className="p-4 md:p-6">
            <h4 className="font-bold text-lg mb-3 text-center">Palavras a Encontrar</h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 text-sm">
              {VISIBLE_WORDS.map(w => (
                <div
                  key={w}
                  className={`p-2 rounded border text-center ${
                    foundWords.includes(w)
                      ? "line-through bg-green-50 text-green-700 border-green-200"
                      : "bg-white border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {w}
                </div>
              ))}
            </div>

            <h4 className="font-bold text-md mt-6 mb-3 text-center text-gray-700">
              Palavras Secretas (Bônus)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 text-sm">
              {SECRET_WORDS.map(w => (
                <div
                  key={w}
                  className={`p-2 rounded border text-center italic text-gray-600 ${
                    foundWords.includes(w)
                      ? "line-through bg-green-50/50 text-green-600 border-green-200"
                      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {w}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé com botão */}
      <div className="p-4 border-t bg-white flex justify-center">
        <Button 
          size="lg" 
          onClick={startGame}
          className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
