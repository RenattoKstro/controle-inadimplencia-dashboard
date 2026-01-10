// src/components/jogos/TwentyFortyEight.tsx
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";

type Direction = "left" | "right" | "up" | "down";
const SIZE = 4;

type RankingItem = {
  posicao: number;
  nome_usuario: string;
  score: number;
};

const TwentyFortyEight = () => {
  const { userData } = useUserData();
  const userId = userData?.user_id;
  const { toast } = useToast();

  const [board, setBoard] = useState<number[][]>(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isNewRecord, setIsNewRecord] = useState(false);

  /* =====================
     LOAD BEST SCORE
  ====================== */
  useEffect(() => {
    if (!userId) return;

    const loadBest = async () => {
      const { data } = await supabase
        .from("user_scores")
        .select("score")
        .eq("user_id", userId)
        .eq("game_name", "2048")
        .single();

      setBestScore(data?.score ?? 0);
    };

    loadBest();
    initBoard();
  }, [userId]);

  /* =====================
     LOAD RANKING
  ====================== */
  const loadRanking = async () => {
    const { data } = await supabase
      .from("ranking_2048")
      .select("*")
      .order("posicao", { ascending: true })
      .limit(10);

    setRanking(data || []);
  };

  useEffect(() => {
    loadRanking();
  }, []);

  /* =====================
     SAVE SCORE
  ====================== */
  const saveScore = async (newScore: number) => {
    if (!userId) return;

    await supabase.from("user_scores").upsert({
      user_id: userId,
      game_name: "2048",
      score: newScore,
    });

    setBestScore(newScore);
    setIsNewRecord(true);
    loadRanking();

    toast({
      title: "🔥 Novo Recorde!",
      description: `Sua melhor pontuação agora é ${newScore}`,
    });

    setTimeout(() => setIsNewRecord(false), 3000);
  };

  /* =====================
     BOARD HELPERS
  ====================== */
  const addRandomTile = (b: number[][]) => {
    const empty: [number, number][] = [];

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (b[i][j] === 0) empty.push([i, j]);
      }
    }

    if (!empty.length) return;

    const [x, y] = empty[Math.floor(Math.random() * empty.length)];
    b[x][y] = Math.random() < 0.9 ? 2 : 4;
  };

  const initBoard = () => {
    const newBoard = Array.from({ length: SIZE }, () =>
      Array(SIZE).fill(0)
    );
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setIsNewRecord(false);
  };

  /* =====================
     TILE STYLE (CLÁSSICO)
  ====================== */
  const getTileStyle = (val: number) => {
    if (val === 0) return "bg-gray-200";

    if (val <= 4) return "bg-gray-300 text-4xl";
    if (val <= 16) return "bg-orange-300 text-4xl";
    if (val <= 64) return "bg-orange-400 text-4xl text-white";
    if (val <= 256) return "bg-orange-500 text-3xl text-white";
    if (val <= 1024) return "bg-red-500 text-2xl text-white";

    return "bg-purple-700 text-xl text-white";
  };

  /* =====================
     SLIDE
  ====================== */
  const slide = (row: number[]) => {
    const arr = row.filter(v => v !== 0);
    let gained = 0;

    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        gained += arr[i];
        arr.splice(i + 1, 1);
      }
    }

    while (arr.length < SIZE) arr.push(0);
    return { row: arr, gained };
  };

  const isGameOver = (b: number[][]) => {
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (b[i][j] === 0) return false;
        if (j < SIZE - 1 && b[i][j] === b[i][j + 1]) return false;
        if (i < SIZE - 1 && b[i][j] === b[i + 1][j]) return false;
      }
    }
    return true;
  };

  /* =====================
     MOVE
  ====================== */
  const move = useCallback(
    (dir: Direction) => {
      let moved = false;
      let gainedTotal = 0;
      const newBoard = board.map(r => [...r]);

      const handle = (line: number[], reverse: boolean) => {
        const working = reverse ? [...line].reverse() : line;
        const { row, gained } = slide(working);
        const final = reverse ? [...row].reverse() : row;
        return { final, gained };
      };

      if (dir === "left" || dir === "right") {
        for (let r = 0; r < SIZE; r++) {
          const { final, gained } = handle(
            newBoard[r],
            dir === "right"
          );
          if (final.join() !== newBoard[r].join()) moved = true;
          newBoard[r] = final;
          gainedTotal += gained;
        }
      }

      if (dir === "up" || dir === "down") {
        for (let c = 0; c < SIZE; c++) {
          const col = newBoard.map(r => r[c]);
          const { final, gained } = handle(
            col,
            dir === "down"
          );
          if (final.join() !== col.join()) moved = true;
          for (let r = 0; r < SIZE; r++) newBoard[r][c] = final[r];
          gainedTotal += gained;
        }
      }

      if (!moved) return;

      addRandomTile(newBoard);
      setBoard(newBoard);

      setScore(prev => {
        const next = prev + gainedTotal;
        if (next > bestScore) saveScore(next);
        return next;
      });

      if (isGameOver(newBoard)) {
        toast({
          title: "😢 Game Over",
          description: `Pontuação final: ${score + gainedTotal}`,
        });
      }
    },
    [board, bestScore, score]
  );

  /* =====================
     KEYBOARD
  ====================== */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      if (map[e.key]) {
        e.preventDefault();
        move(map[e.key]);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [move]);

  /* =====================
     RENDER
  ====================== */
  return (
    <div className="space-y-6 text-center">
      <h3 className="text-3xl font-bold">2048</h3>

      <div className="flex justify-center gap-10">
        <p className="text-xl">
          Atual: <span className="font-bold text-green-600">{score}</span>
        </p>
        <p className="text-xl">
          Recorde:{" "}
          <span className="font-bold text-purple-600">{bestScore}</span>
          {isNewRecord && <span className="ml-2">🔥</span>}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 w-80 mx-auto">
        {board.flat().map((val, i) => (
          <div
            key={i}
            className={`w-20 h-20 flex items-center justify-center font-bold rounded-lg transition-all ${getTileStyle(val)}`}
          >
            {val || ""}
          </div>
        ))}
      </div>

      <Button onClick={initBoard}>Reiniciar</Button>

      {/* RANKING */}
      <div className="mt-8">
        <h4 className="text-xl font-bold mb-2">🏆 Ranking</h4>
        <ul className="space-y-1">
          {ranking.map(r => (
            <li key={r.posicao}>
              {r.posicao}º — {r.nome_usuario} ({r.score})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TwentyFortyEight;
