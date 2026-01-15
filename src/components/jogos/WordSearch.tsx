import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const GRID_SIZE = 10;

const WORDS = ["REACT", "JOGO", "SCORE", "RANK", "SUPABASE"];

type Cell = {
  letter: string;
  selected: boolean;
  found: boolean;
};

type RankingItem = {
  player_name: string;
  score: number;
};

const WordSearch = () => {
  const { toast } = useToast();

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedWord, setSelectedWord] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [playerName, setPlayerName] = useState("");

  /* =====================
     INIT
  ====================== */
  useEffect(() => {
    initGrid();
    loadRanking();
  }, []);

  /* =====================
     GRID
  ====================== */
  const initGrid = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const g: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        letter: letters[Math.floor(Math.random() * letters.length)],
        selected: false,
        found: false,
      }))
    );

    // Coloca palavras na horizontal
    WORDS.forEach(word => {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * (GRID_SIZE - word.length));

      for (let i = 0; i < word.length; i++) {
        g[row][col + i].letter = word[i];
      }
    });

    setGrid(g);
    setScore(0);
    setFoundWords([]);
  };

  /* =====================
     CLICK LETTER
  ====================== */
  const clickCell = (r: number, c: number) => {
    if (grid[r][c].found) return;

    const g = grid.map(row => row.map(cell => ({ ...cell })));
    g[r][c].selected = !g[r][c].selected;
    setGrid(g);

    const word = g
      .flat()
      .filter(c => c.selected)
      .map(c => c.letter)
      .join("");

    setSelectedWord(word);
  };

  /* =====================
     CHECK WORD
  ====================== */
  useEffect(() => {
    if (!selectedWord) return;

    if (WORDS.includes(selectedWord) && !foundWords.includes(selectedWord)) {
      toast({
        title: "🎉 Palavra encontrada!",
        description: selectedWord,
      });

      setScore(s => s + selectedWord.length * 10);
      setFoundWords(f => [...f, selectedWord]);

      const g = grid.map(row =>
        row.map(cell =>
          cell.selected
            ? { ...cell, selected: false, found: true }
            : cell
        )
      );

      setGrid(g);
      setSelectedWord("");
    }
  }, [selectedWord]);

  /* =====================
     GAME OVER
  ====================== */
  useEffect(() => {
    if (foundWords.length === WORDS.length && WORDS.length > 0) {
      setShowModal(true);
    }
  }, [foundWords]);

  /* =====================
     SAVE SCORE
  ====================== */
  const saveScore = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Nome obrigatório",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("games_rankings").insert({
      game_name: "word_search",
      player_name: playerName.trim(),
      score,
    });

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "🏆 Pontuação salva!",
    });

    setShowModal(false);
    setPlayerName("");
    loadRanking();
    initGrid();
  };

  /* =====================
     RANKING
  ====================== */
  const loadRanking = async () => {
    const { data } = await supabase
      .from("games_rankings")
      .select("player_name, score")
      .eq("game_name", "word_search")
      .order("score", { ascending: false })
      .limit(10);

    setRanking(data ?? []);
  };

  return (
    <>
      <div className="flex gap-10 justify-center">
        {/* GAME */}
        <div className="space-y-4 text-center">
          <h3 className="text-3xl font-bold">🔤 Caça-Palavras</h3>
          <p>Pontuação: <b>{score}</b></p>

          <div className="grid grid-cols-10 gap-1 mx-auto">
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => clickCell(r, c)}
                  className={`
                    w-8 h-8 flex items-center justify-center
                    font-bold cursor-pointer rounded
                    ${cell.found ? "bg-green-500 text-white" :
                      cell.selected ? "bg-blue-400 text-white" :
                      "bg-gray-200"}
                  `}
                >
                  {cell.letter}
                </div>
              ))
            )}
          </div>

          <div>
            <h4 className="font-bold">Palavras:</h4>
            <div className="flex gap-2 justify-center flex-wrap">
              {WORDS.map(w => (
                <span
                  key={w}
                  className={foundWords.includes(w) ? "line-through text-green-600" : ""}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          <Button onClick={initGrid}>Reiniciar</Button>
        </div>

        {/* RANKING */}
        <div className="w-64">
          <h4 className="text-xl font-bold mb-3">🏆 Ranking</h4>
          <ul className="space-y-2">
            {ranking.map((r, i) => (
              <li key={i} className="flex justify-between">
                <span>{i + 1}. {r.player_name}</span>
                <b>{r.score}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-80 space-y-4 text-center">
            <h4 className="text-xl font-bold">🎉 Fim de Jogo</h4>
            <p>Sua pontuação: <b>{score}</b></p>

            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Seu nome no ranking"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
            />

            <Button className="w-full" onClick={saveScore}>
              Salvar Pontuação
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default WordSearch;
