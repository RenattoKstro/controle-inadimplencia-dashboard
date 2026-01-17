import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/* CONFIG */
const ROWS = 25;
const COLS = 20;

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

type Cell = { row: number; col: number };

export default function WordSearch() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());

  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<Cell[]>([]);

  /* TIMER */
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [finished, setFinished] = useState(false);

  /* INIT */
  useEffect(() => {
    startNewGame();
    return () => stopTimer();
  }, []);

  /* TIMER CONTROL */
  function startTimer() {
    stopTimer();
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  /* GAME */
  function startNewGame() {
    generateGrid();
    setFoundWords([]);
    setFoundCells(new Set());
    setSelection([]);
    setFinished(false);
    setSeconds(0);
    startTimer();
  }

  /* GRID */
  function generateGrid() {
    const empty = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => "")
    );

    WORDS.forEach(word => {
      let placed = false;
      let tries = 0;

      while (!placed && tries < 300) {
        tries++;
        const dir = randomDirection();
        const sr = Math.floor(Math.random() * ROWS);
        const sc = Math.floor(Math.random() * COLS);

        const cells: Cell[] = [];
        for (let i = 0; i < word.length; i++) {
          const r = sr + dir.r * i;
          const c = sc + dir.c * i;
          if (r < 0 || c < 0 || r >= ROWS || c >= COLS) break;
          if (empty[r][c] && empty[r][c] !== word[i]) break;
          cells.push({ row: r, col: c });
        }

        if (cells.length === word.length) {
          cells.forEach((cell, i) => {
            empty[cell.row][cell.col] = word[i];
          });
          placed = true;
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
  }

  /* SELECTION */
  function startSelection(cell: Cell) {
    if (finished) return;
    setIsSelecting(true);
    setSelection([cell]);
  }

  function updateSelection(cell: Cell) {
    if (!isSelecting || finished) return;
    const path = buildLine(selection[0], cell);
    setSelection(path);
  }

  function endSelection() {
    if (!isSelecting) return;
    setIsSelecting(false);
    validateSelection();
    setSelection([]);
  }

  /* LOGIC */
  function buildLine(a: Cell, b: Cell): Cell[] {
    const dr = Math.sign(b.row - a.row);
    const dc = Math.sign(b.col - a.col);

    if (dr !== 0 && dc !== 0 &&
        Math.abs(b.row - a.row) !== Math.abs(b.col - a.col)) {
      return [a];
    }

    const len = Math.max(
      Math.abs(b.row - a.row),
      Math.abs(b.col - a.col)
    ) + 1;

    return Array.from({ length: len }, (_, i) => ({
      row: a.row + dr * i,
      col: a.col + dc * i
    }));
  }

  function validateSelection() {
    const word = selection.map(c => grid[c.row][c.col]).join("");
    const reversed = word.split("").reverse().join("");

    const found = WORDS.find(
      w => (w === word || w === reversed) && !foundWords.includes(w)
    );

    if (!found) return;

    setFoundWords(prev => {
      const next = [...prev, found];
      if (next.length === WORDS.length) {
        stopTimer();
        setFinished(true);
      }
      return next;
    });

    setFoundCells(prev => {
      const next = new Set(prev);
      selection.forEach(c => next.add(`${c.row}-${c.col}`));
      return next;
    });
  }

  /* UI */
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-bold">🔍 Caça-Palavras</h2>

      <p className="text-lg">
        ⏱️ Tempo: <b>{seconds}s</b>
      </p>

      {finished && (
        <div className="text-green-600 font-bold text-xl">
          🏆 Concluído em {seconds} segundos!
        </div>
      )}

      <div className="flex justify-center gap-10">
        {/* GRID COM SCROLL */}
        <div
          className="border rounded-lg p-2 overflow-auto"
          style={{ maxHeight: "500px", maxWidth: "720px" }}
        >
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
        </div>

        {/* WORD LIST */}
        <div className="text-left space-y-1">
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

      <Button onClick={startNewGame}>🔄 Nova Rodada</Button>
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
