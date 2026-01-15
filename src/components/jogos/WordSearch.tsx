import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const ROWS = 25;
const COLS = 20;

const WORD_POOL = [
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

type Cell = {
  letter: string;
  selected: boolean;
  found: boolean;
};

const randomLetter = () =>
  String.fromCharCode(65 + Math.floor(Math.random() * 26));

const CacaPalavras = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [path, setPath] = useState<[number, number][]>([]);
  const [gameOver, setGameOver] = useState(false);

  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    startGame();
  }, []);

  /* =========================
     INIT GAME
  ========================= */
  const startGame = () => {
    const selectedWords = [...WORD_POOL]
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);

    const emptyGrid: Cell[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({
        letter: "",
        selected: false,
        found: false,
      }))
    );

    placeWords(emptyGrid, selectedWords);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!emptyGrid[r][c].letter) {
          emptyGrid[r][c].letter = randomLetter();
        }
      }
    }

    setGrid(emptyGrid);
    setWords(selectedWords);
    setFoundWords([]);
    setGameOver(false);
    setPlayerName("");
  };

  /* =========================
     PLACE WORDS
  ========================= */
  const placeWords = (g: Cell[][], list: string[]) => {
    list.forEach(word => {
      let placed = false;

      while (!placed) {
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);

        if (horizontal && col + word.length <= COLS) {
          let ok = true;
          for (let i = 0; i < word.length; i++) {
            if (g[row][col + i].letter && g[row][col + i].letter !== word[i]) {
              ok = false;
              break;
            }
          }
          if (ok) {
            for (let i = 0; i < word.length; i++) {
              g[row][col + i].letter = word[i];
            }
            placed = true;
          }
        }

        if (!horizontal && row + word.length <= ROWS) {
          let ok = true;
          for (let i = 0; i < word.length; i++) {
            if (g[row + i][col].letter && g[row + i][col].letter !== word[i]) {
              ok = false;
              break;
            }
          }
          if (ok) {
            for (let i = 0; i < word.length; i++) {
              g[row + i][col].letter = word[i];
            }
            placed = true;
          }
        }
      }
    });
  };

  /* =========================
     SELECTION
  ========================= */
  const startSelect = (r: number, c: number) => {
    setSelecting(true);
    setPath([[r, c]]);
    mark([[r, c]]);
  };

  const enterCell = (r: number, c: number) => {
    if (!selecting) return;

    const [sr, sc] = path[0];
    if (r !== sr && c !== sc) return;

    const cells: [number, number][] = [];

    if (r === sr) {
      const min = Math.min(sc, c);
      const max = Math.max(sc, c);
      for (let i = min; i <= max; i++) cells.push([r, i]);
    } else {
      const min = Math.min(sr, r);
      const max = Math.max(sr, r);
      for (let i = min; i <= max; i++) cells.push([i, c]);
    }

    setPath(cells);
    mark(cells);
  };

  const endSelect = () => {
    setSelecting(false);

    const word = path.map(([r, c]) => grid[r][c].letter).join("");
    const reversed = word.split("").reverse().join("");

    const found =
      words.includes(word) || words.includes(reversed);

    if (found) {
      const w = words.includes(word) ? word : reversed;

      if (!foundWords.includes(w)) {
        const newFound = [...foundWords, w];
        setFoundWords(newFound);

        if (newFound.length === words.length) {
          setGameOver(true);
        }
      }

      setGrid(g =>
        g.map((row, r) =>
          row.map((cell, c) =>
            path.some(p => p[0] === r && p[1] === c)
              ? { ...cell, found: true, selected: false }
              : cell
          )
        )
      );
    } else {
      clearTemp();
    }

    setPath([]);
  };

  const mark = (cells: [number, number][]) => {
    setGrid(g =>
      g.map((row, r) =>
        row.map((cell, c) => ({
          ...cell,
          selected: cells.some(p => p[0] === r && p[1] === c),
        }))
      )
    );
  };

  const clearTemp = () => {
    setGrid(g =>
      g.map(row => row.map(cell => ({ ...cell, selected: false })))
    );
  };

  const score = foundWords.length * 100;

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      <div className="flex gap-6">
        {/* GRID */}
        <div className="max-h-[75vh] overflow-y-auto border rounded-lg p-2">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${COLS}, 2.2rem)` }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={() => startSelect(r, c)}
                  onMouseEnter={() => enterCell(r, c)}
                  onMouseUp={endSelect}
                  className={`w-9 h-9 flex items-center justify-center font-bold rounded cursor-pointer select-none
                    ${cell.found ? "bg-green-500 text-white" : ""}
                    ${cell.selected ? "bg-blue-500 text-white" : ""}
                    ${!cell.selected && !cell.found ? "bg-gray-100" : ""}
                  `}
                >
                  {cell.letter}
                </div>
              ))
            )}
          </div>
        </div>

        {/* WORD LIST */}
        <div className="w-72">
          <h3 className="font-bold mb-3">🔎 Palavras</h3>
          <ul className="space-y-1 text-sm">
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
      </div>

      {/* GAME OVER MODAL */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4 text-center">
            <h3 className="text-2xl font-bold">🎉 Jogo Finalizado!</h3>
            <p>Pontuação: <b>{score}</b></p>

            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Seu nome no ranking"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
            />

            <Button className="w-full" onClick={startGame}>
              Nova Rodada
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CacaPalavras;
