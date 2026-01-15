import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 25;

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
  "GAZIN".toUpperCase(),
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

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const selectedWords = [...WORD_POOL]
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);

    const emptyGrid: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        letter: "",
        selected: false,
        found: false,
      }))
    );

    placeWords(emptyGrid, selectedWords);

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!emptyGrid[i][j].letter) {
          emptyGrid[i][j].letter = randomLetter();
        }
      }
    }

    setGrid(emptyGrid);
    setWords(selectedWords);
    setFoundWords([]);
  };

  /* =========================
     PLACE WORDS (H / V)
  ========================= */
  const placeWords = (g: Cell[][], list: string[]) => {
    list.forEach(word => {
      let placed = false;

      while (!placed) {
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (horizontal && col + word.length <= GRID_SIZE) {
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

        if (!horizontal && row + word.length <= GRID_SIZE) {
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
    clearTempSelection();
    setSelecting(true);
    setPath([[r, c]]);
    markSelected([[r, c]]);
  };

  const enterCell = (r: number, c: number) => {
    if (!selecting) return;

    const [sr, sc] = path[0];

    // only straight lines
    if (r !== sr && c !== sc) return;

    const newPath: [number, number][] = [];

    if (r === sr) {
      const min = Math.min(sc, c);
      const max = Math.max(sc, c);
      for (let i = min; i <= max; i++) newPath.push([r, i]);
    } else {
      const min = Math.min(sr, r);
      const max = Math.max(sr, r);
      for (let i = min; i <= max; i++) newPath.push([i, c]);
    }

    setPath(newPath);
    markSelected(newPath);
  };

  const endSelect = () => {
    setSelecting(false);

    const word = path.map(([r, c]) => grid[r][c].letter).join("");
    const reversed = word.split("").reverse().join("");

    const found =
      words.includes(word) || words.includes(reversed);

    if (found) {
      const w = words.includes(word) ? word : reversed;
      setFoundWords(f => [...f, w]);

      setGrid(g =>
        g.map((row, r) =>
          row.map((cell, c) => {
            if (path.some(p => p[0] === r && p[1] === c)) {
              return { ...cell, found: true, selected: false };
            }
            return cell;
          })
        )
      );
    } else {
      clearTempSelection();
    }

    setPath([]);
  };

  const markSelected = (cells: [number, number][]) => {
    setGrid(g =>
      g.map((row, r) =>
        row.map((cell, c) => ({
          ...cell,
          selected: cells.some(p => p[0] === r && p[1] === c),
        }))
      )
    );
  };

  const clearTempSelection = () => {
    setGrid(g =>
      g.map(row =>
        row.map(cell => ({ ...cell, selected: false }))
      )
    );
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* GRID */}
        <div className="max-h-[75vh] overflow-y-auto border rounded-lg p-2">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 2rem)` }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={() => startSelect(r, c)}
                  onMouseEnter={() => enterCell(r, c)}
                  onMouseUp={endSelect}
                  className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded cursor-pointer select-none
                    ${cell.found ? "bg-green-500 text-white" : ""}
                    ${cell.selected ? "bg-blue-400 text-white" : ""}
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
        <div className="w-64">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            🔎 Palavras
          </h3>
          <ul className="space-y-1 text-sm">
            {words.map(w => (
              <li
                key={w}
                className={foundWords.includes(w)
                  ? "line-through text-green-600 font-bold"
                  : ""}
              >
                {w}
              </li>
            ))}
          </ul>

          <Button className="mt-6 w-full" onClick={startGame}>
            Nova Rodada
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CacaPalavras;
