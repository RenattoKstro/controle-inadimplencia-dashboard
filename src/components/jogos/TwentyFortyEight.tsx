import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";

type Direction = "left" | "right" | "up" | "down";

const SIZE = 4;

type RankingItem = {
  user_id: string;
  nome_usuario: string;
  score: number;
  posicao: number;
};

const TwentyFortyEight = () => {
  const { userData } = useUserData();
  const userId = userData?.user_id || "";
  const { toast } = useToast();

  const [board, setBoard] = useState<number[][]>(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const [ranking, setRanking] = useState<RankingItem[]>([]);

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
    loadRanking();
    initBoard();
  }, [userId]);

  /* =====================
     LOAD RANKING
  ====================== */
  const loadRanking = async () => {
    const { data, error } = await supabase
      .from("ranking_2048")
      .select("*")
      .order("posicao", { ascending: true })
      .limit(10);

    if (!error && data) {
      setRanking(data);
    }
  };

  /* =====================
     SAVE SCORE
  ====================== */
  const saveScore = async (newScore: number) => {
    if (!userId) return;

    await supabase.from("user_scores").upsert(
      {
        user_id: userId,
        game_name: "2048",
        score: newScore,
      },
      {
        onConflict: "user_id,game_name",
      }
    );

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

  /* =====================
     MOVE LOGIC
  ====================== */
  const move = useCallback(
    (dir: Direction) => {
      let moved = false;
      let gainedTotal = 0;
      const newBoard = board.map(row => [...row]);

      if (dir === "left" || dir === "right") {
        for (let r = 0; r < SIZE; r++) {
          const original = [...newBoard[r]];
          const working = dir === "right" ? [...original].reverse() : original;
          const { row, gained } = slide(working);
          const finalRow = dir === "right" ? [...row].reverse() : row;

          if (finalRow.join() !== original.join()) moved = true;

          newBoard[r] = finalRow;
          gainedTotal += gained;
        }
      }

      if (dir === "up" || dir === "down") {
        for (let c = 0; c < SIZE; c++) {
          const original = newBoard.map(r => r[c]);
          const working = dir === "down" ? [...original].reverse() : original;
          const { row, gained } = slide(working);
          const finalCol = dir === "down" ? [...row].reverse() : row;

          if (finalCol.join() !== original.join()) moved = true;

          for (let r = 0; r < SIZE; r++) newBoard[r][c] = finalCol[r];
          gainedTotal += gained;
        }
      }

      if (!moved) return;

      addRandomTile(newBoard);
      setBoard(newBoard);

      setScore(prev => {
        const newScore = prev + gainedTotal;
        if (newScore > bestScore) saveScore(newScore);
        return newScore;
      });
    },
    [board, bestScore]
  );

  /* =====================
     KEYBOARD
  ====================== */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
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

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [move]);

  /* =====================
     UI
  ====================== */
  return (
    <div className="space-y-6 text-center">
      <h3 className="text-3xl font-bold">2048</h3>

      <div className="flex justify-center gap-8">
        <p>Atual: <b>{score}</b></p>
        <p>
          Recorde: <b>{bestScore}</b>
          {isNewRecord && <span className="ml-2 text-yellow-400">🔥</span>}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 w-80 mx-auto">
        {board.flat().map((val, i) => (
          <div key={i} className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded">
            {val || ""}
          </div>
        ))}
      </div>

      <Button onClick={initBoard}>Reiniciar</Button>

      {/* RANKING */}
      <div className="mt-6 space-y-2">
        <h4 className="text-xl font-bold">🏆 Ranking</h4>

        {ranking.map(r => (
          <div
            key={r.user_id}
            className={`flex justify-between px-3 py-2 rounded ${
              r.user_id === userId ? "bg-yellow-100 font-bold" : "bg-gray-100"
            }`}
          >
            <span>#{r.posicao} {r.nome_usuario}</span>
            <span>{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TwentyFortyEight;
