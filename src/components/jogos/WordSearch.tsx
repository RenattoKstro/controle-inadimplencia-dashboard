// src/components/jogos/CacaPalavras.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";

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
  const { userData } = useUserData();
  const userId = userData?.user_id || "";
  const { toast } = useToast();

  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<Cell[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (userId) loadBestScore();
    startGame();
    return stopTimer;
  }, [userId]);

  const loadBestScore = async () => {
    const { data } = await supabase
      .from("user_scores")
      .select("score")
      .eq("user_id", userId)
      .eq("game_name", "cacapalavras")
      .single();

    setBestScore(data?.score || null);
  };

  const saveBestScore = async (newScore: number) => {
    if (bestScore === null || newScore < bestScore) {
      await supabase.from("user_scores").upsert({
        user_id: userId,
        game_name: "cacapalavras",
        score: newScore,
      });
      setBestScore(newScore);
      toast({
        title: "Novo recorde!",
        description: `Você completou em ${newScore} segundos!`,
      });
    }
  };

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
        saveBestScore(seconds + 1); // +1 porque o timer ainda não contou o último segundo
      }
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">🔍 Caça-Palavras</h2>
        <div className="flex justify-center gap-8 mt-2 text-lg">
          <p>⏱️ Tempo: <span className="font-bold text-green-600">{seconds}s</span></p>
          {bestScore !== null && (
            <p>Recorde: <span className="font-bold text-purple-600">{bestScore}s</span></p>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* GRID */}
        <div className="flex-1 overflow-auto border rounded-md p-4 bg-white">
          <div
            className="grid gap-1 select-none mx-auto"
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
                      w-8 h-8
                      flex items-center justify-center
                      text-lg font-bold
                      border rounded cursor-pointer
                      transition-colors
                      ${found ? "bg-green-500 text-white" : ""}
                      ${selected && !found ? "bg-blue-400 text-white" : ""}
                      hover:bg-gray-200
                    `}
                  >
                    {char}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PALAVRAS */}
        <div className="w-48 overflow-y-auto text-sm bg-gray-50 p-4 rounded border">
          <h4 className="font-bold mb-2 text-center">Palavras ({foundWords.length} / {WORDS.length})</h4>
          {WORDS.map(w => (
            <div
              key={w}
              className={`p-1 ${foundWords.includes(w) ? "line-through text-green-600" : ""}`}
            >
              {w}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <Button size="lg" onClick={startGame} className="bg-gradient-to-r from-blue-600 to-indigo-600">
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
