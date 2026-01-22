// src/components/jogos/CacaPalavras.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const ROWS = 18;
const COLS = 18;

// 20 palavras visíveis (obrigatórias)
const VISIBLE_WORDS = [
"ABATEDORES", "ANTECIPACAO", "ASSISTENCIA", "ATENDIMENTO", "AUDITORIA",
"BOLETO", "CAIXA", "CCG", "CLIENTE", "COBRANCA",
"COMISSAO", "CONSORCIO", "CREDIARIO", "DESCONTO", "DNA",
"EMPRESTIMO", "ENTREGAS", "ESTOQUE", "ESTORNO", "FATURA",
"FIDELIZACAO", "FILIAL", "FORNECEDOR", "GARANTIA", "GATILHO",
"GAZIN", "INADIMPLENCIA", "INVENTARIO", "JUROS", "LIQUIDACAO",
"LOGISTICA", "LOJA", "LUCRO", "MARGEM", "META",
"MONTAGENS", "NEGOCIACAO", "ORCAMENTO", "PARCELAMENTO", "PIX",
"POSVENDA", "PRECO", "PROMOCAO", "PROSPECCAO", "RECEBIMENTO",
"RECIBO", "RENEGOCIACAO", "ROBOZIN", "SABIUM", "SEGURO",
"SIGA", "VAREJO", "VENDAS", "VENDEDOR"

// 10 palavras secretas (bônus)
const SECRET_WORDS = [
 "CARTAO", "CHEQUE", "COFRE", "CRACHA", "DCC", "DIVIDA",
"ECF", "EPRAJA", "FATURAMENTO", "NOTAS",
"OPCADASTRO", "QLIK", "RENDIMENTO", "TIGER", "TROQUINHO",
"VEX"

];

const ALL_WORDS = [...VISIBLE_WORDS, ...SECRET_WORDS];

type Cell = { row: number; col: number };

type RankingEntry = {
  player_name: string;
  time_seconds: number;
  score: number;
};

function CacaPalavras() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<Cell[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [showRanking, setShowRanking] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    startGame();
    loadRanking();
    return stopTimer;
  }, []);

  const loadRanking = async () => {
    try {
      const { data, error } = await supabase
        .from("game_rankings")
        .select("player_name, time_seconds, score")
        .eq("game_name", "cacapalavras")
        .order("time_seconds", { ascending: true })
        .limit(10);

      if (error) throw error;
      setRanking(data || []);
    } catch (err) {
      console.error("Erro ao carregar ranking:", err);
    }
  };

  const saveRecord = async () => {
    if (!playerName.trim()) {
      setSaveError("Digite um apelido válido.");
      return;
    }

    setSaveError(null);

    try {
      const { error } = await supabase.from("game_rankings").insert({
        player_name: playerName.trim(),
        game_name: "cacapalavras",
        score: score,
        time_seconds: seconds,
      });

      if (error) throw error;

      loadRanking();
      setShowNamePrompt(false);
      alert(`Recorde salvo com sucesso! 🎉\n\nNome: ${playerName.trim()}\nTempo: ${seconds}s\nPontos: ${score}`);
    } catch (err: any) {
      console.error("Erro completo ao salvar:", err);
      setSaveError(err.message || "Erro ao salvar o recorde. Tente novamente.");
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
    setScore(0);
    setShowNamePrompt(false);
    setSaveError(null);
    startTimer();
  }

  function generateGrid() {
    const g = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => "")
    );

    ALL_WORDS.forEach(word => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 300) {
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
      setFoundWords(prev => {
        const newFound = [...prev, match];

        const pointsToAdd = SECRET_WORDS.includes(match) ? 10 : 5;
        setScore(s => s + pointsToAdd);

        if (SECRET_WORDS.includes(match)) {
          setSeconds(s => Math.max(0, s - 30));
        }

        const visibleFound = newFound.filter(w => VISIBLE_WORDS.includes(w)).length;
        if (visibleFound === VISIBLE_WORDS.length) {
          stopTimer();
          setShowNamePrompt(true);
        }

        return newFound;
      });

      setFoundCells(prev => {
        const n = new Set(prev);
        selection.forEach(c => n.add(`${c.row}-${c.col}`));
        return n;
      });
    }
  }

  const visibleProgress = foundWords.filter(w => VISIBLE_WORDS.includes(w)).length;

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Cabeçalho */}
      <div className="text-center py-3 border-b bg-white shadow-sm">
        <h2 className="text-3xl font-bold">🔍 Caça-Palavras</h2>
        <div className="flex justify-center gap-8 mt-2 text-lg">
          <p>⏱️ Tempo: <span className="font-bold text-green-600">{seconds}s</span></p>
          <p>Encontradas: <span className="font-bold text-blue-600">{visibleProgress} / 20</span></p>
          <p>Pontos: <span className="font-bold text-purple-600">{score}</span></p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden p-4">
        {/* Grid */}
        <div className="flex-1 overflow-auto border rounded-lg bg-white shadow-sm">
          <div className="p-4 md:p-6 flex justify-center">
            <div
              className="grid gap-0.5 sm:gap-1 select-none touch-manipulation"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(28px, 40px))`,
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

        {/* Lista de palavras */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l bg-white shadow-sm overflow-y-auto">
          <div className="p-4 md:p-6">
            <h4 className="font-bold text-lg mb-4 text-center">Palavras Visíveis</h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 text-sm">
              {VISIBLE_WORDS.map(w => (
                <div
                  key={w}
                  className={`p-2 rounded border text-center ${
                    foundWords.includes(w)
                      ? "line-through bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {w}
                </div>
              ))}
            </div>

            {foundWords.some(w => SECRET_WORDS.includes(w)) && (
              <>
                <h4 className="font-bold text-md mt-8 mb-3 text-center text-purple-700">
                  Palavras Secretas Encontradas!
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 text-sm">
                  {SECRET_WORDS.filter(w => foundWords.includes(w)).map(w => (
                    <div
                      key={w}
                      className="p-2 rounded bg-purple-50 border border-purple-200 text-center font-medium text-purple-800"
                    >
                      {w}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="p-4 border-t bg-white flex justify-between items-center">
        <Button 
          size="lg" 
          onClick={startGame}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          🔄 Nova rodada
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => setShowRanking(true)}
        >
          🏆 Ver Ranking
        </Button>
      </div>

      {/* Modal de Ranking */}
      {showRanking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowRanking(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4 text-center">🏆 Ranking - Caça-Palavras</h3>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Posição</th>
                  <th className="p-3 text-left">Jogador</th>
                  <th className="p-3 text-right">Tempo</th>
                  <th className="p-3 text-right">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{index + 1}º</td>
                    <td className="p-3">{entry.player_name}</td>
                    <td className="p-3 text-right">{entry.time_seconds}s</td>
                    <td className="p-3 text-right">{entry.score}</td>
                  </tr>
                ))}
                {ranking.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      Ainda não há recordes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="mt-6 text-center">
              <Button onClick={() => setShowRanking(false)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt para nome */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
            <h3 className="text-2xl font-bold mb-4 text-center">Novo Recorde!</h3>
            <p className="text-center mb-6">
              Você completou as 20 palavras em {seconds}s com {score} pontos!<br />
              Digite seu apelido para registrar no ranking:
            </p>
            {saveError && (
              <p className="text-red-600 text-center mb-4 font-medium">
                {saveError}
              </p>
            )}
            <Input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Seu apelido..."
              className="mb-4"
            />
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setShowNamePrompt(false)}>Cancelar</Button>
              <Button 
                onClick={saveRecord}
                disabled={!playerName.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Registrar
              </Button>
            </div>
          </div>
        </div>
      )}
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
