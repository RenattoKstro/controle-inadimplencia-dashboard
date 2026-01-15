import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* CONFIGURAÇÃO DO TABULEIRO */
const ROWS = 25;
const COLS = 20;

/* PALAVRAS DO VAREJO */
const ALL_WORDS = [
  "PROMOCAO","BOLETO","JUROS","SEGURO","META","PARCELAMENTO","GATILHO",
  "PIX","ATENDIMENTO","LUCRO","VENDAS","VENDEDOR","CREDIARIO","CAIXA",
  "RECEBIMENTO","LOJA","MARGEM","VAREJO","CONSORCIO","ASSISTENCIA",
  "GAZIN","DESCONTO","FATURAMENTO","COMISSAO","CARTAO","PRECO"
];

/* DIREÇÕES (horizontal, vertical, diagonal + reverso) */
const DIRECTIONS = [
  [1,0],[-1,0],[0,1],[0,-1],
  [1,1],[-1,-1],[1,-1],[-1,1]
];

type Cell = { x: number; y: number };

export default function WordSearch() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [selected, setSelected] = useState<Cell[]>([]);
  const [time, setTime] = useState(0);
  const [name, setName] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* INICIAR JOGO */
  useEffect(() => {
    startGame();
  }, []);

  /* CRONÔMETRO */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTime(0);
    setFound([]);
    setSelected([]);
    setName("");

    const selectedWords = shuffle([...ALL_WORDS]).slice(0, 20);

    const board: string[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => "")
    );

    selectedWords.forEach(word => placeWord(board, word));
    fillBoard(board);

    setWords(selectedWords);
    setGrid(board);
  }

  function placeWord(board: string[][], word: string) {
    while (true) {
      const [dx, dy] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startX = Math.floor(Math.random() * COLS);
      const startY = Math.floor(Math.random() * ROWS);

      let fits = true;

      for (let i = 0; i < word.length; i++) {
        const x = startX + dx * i;
        const y = startY + dy * i;
        if (
          x < 0 || y < 0 || x >= COLS || y >= ROWS ||
          (board[y][x] && board[y][x] !== word[i])
        ) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          board[startY + dy * i][startX + dx * i] = word[i];
        }
        return;
      }
    }
  }

  function fillBoard(board: string[][]) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!board[y][x]) {
          board[y][x] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }

  function endSelection() {
    if (selected.length === 0) return;

    const word = selected.map(c => grid[c.y][c.x]).join("");
    const reverse = word.split("").reverse().join("");

    const match = words.find(
      w => w === word || w === reverse
    );

    if (match && !found.includes(match)) {
      setFound(f => [...f, match]);
    }

    setSelected([]);
  }

  function saveRecord() {
    if (!name) return;

    const records = JSON.parse(
      localStorage.getItem("wordsearch-ranking") || "[]"
    );

    records.push({ name, time });
    records.sort((a: any, b: any) => a.time - b.time);

    localStorage.setItem(
      "wordsearch-ranking",
      JSON.stringify(records.slice(0, 10))
    );
  }

  const finished = found.length === words.length;

  return (
    <div className="flex gap-6 p-4 max-h-[80vh] overflow-y-auto">
      {/* GRID */}
      <div>
        <div className="mb-2 font-bold text-lg">⏱ {time}s</div>

        <div
          className="grid gap-1 select-none"
          style={{ gridTemplateColumns: `repeat(${COLS}, 2rem)` }}
          onMouseUp={endSelection}
        >
          {grid.map((row, y) =>
            row.map((letter, x) => {
              const isSelected = selected.some(
                c => c.x === x && c.y === y
              );

              return (
                <div
                  key={`${x}-${y}`}
                  onMouseDown={() => setSelected([{ x, y }])}
                  onMouseEnter={() =>
                    setSelected(s => [...s, { x, y }])
                  }
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold cursor-pointer
                    ${isSelected ? "bg-green-500 text-white" : "bg-muted"}
                  `}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>

        <Button className="w-full mt-4" onClick={startGame}>
          🔄 Nova Rodada
        </Button>
      </div>

      {/* PAINEL LATERAL */}
      <div className="w-64">
        <h3 className="font-bold mb-2">📋 Palavras</h3>
        <div className="space-y-1">
          {words.map(word => (
            <div
              key={word}
              className={found.includes(word) ? "text-green-500 font-bold" : ""}
            >
              {word}
            </div>
          ))}
        </div>

        {finished && (
          <div className="mt-6 space-y-2">
            <h3 className="font-bold">🏆 Recorde</h3>
            <Input
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Button className="w-full" onClick={saveRecord}>
              Salvar Tempo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* UTIL */
function shuffle<T>(array: T[]) {
  return array.sort(() => Math.random() - 0.5);
}
