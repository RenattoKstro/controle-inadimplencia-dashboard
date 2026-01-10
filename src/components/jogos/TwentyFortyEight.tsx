import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";

type Direction = "left" | "right" | "up" | "down";

const SIZE = 4;

const TwentyFortyEight = () => {
  const { userData } = useUserData();
  const userId = userData?.user_id;
  const { toast } = useToast();

  const [board, setBoard] = useState<number[][]>(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  );

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
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
     SAVE SCORE (EFFECT)
  ====================== */
  useEffect(() => {
    if (!userId) return;
    if (bestScore === null) return;
    if (score <= bestScore) return;

    saveScore(score);
  }, [score, bestScore, userId]);

  const saveScore = async (newScore: number) => {
    const { error } = await supabase
      .from("user_scores")
      .upsert(
        {
          user_id: userId,
          game_name: "2048",
          score: newScore,
        },
        {
          onConflict: "user_id,game_name",
        }
      );

    if (!error) {
      setBestScore(newScore);
      setIsNewRecord(true);

      toast({
        title: "🔥 Novo Recorde!",
        description: `Sua melhor pontuação agora é ${newScore}`,
      });

      setTimeout(() => setIsNewRecord(false), 3000);
    } else {
      console.error("Erro ao salvar score:", error);
    }
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

    if (empty.length === 0) return;

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
     GAME OVER
  ====================== */
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
     MOVE LOGIC
  ====================== */
  const move = useCallback(
    (dir: Direction) => {
      let moved = false;
      let gainedTotal = 0;

      const newBoard = board.map(row => [...row]);

      const handleRow = (row: number[]) => {
        const { row: slid, gained } = slide(row);
        gainedTotal += gained;
        return slid;
      };

      if (dir === "left" || dir === "right") {
        for (let r = 0; r < SIZE; r++) {
          const original = [...newBoard[r]];
          const working =
            dir === "right" ? [...original].reverse() : original;

          const result = handleRow(working);
          const finalRow =
            dir === "right" ? [...result].reverse() : result;

          if (finalRow.join() !== original.join()) moved = true;
          newBoard[r] = finalRow;
        }
      }

      if (dir === "up" || dir === "down") {
        for (let c = 0; c < SIZE; c++) {
          const original = newBoard.map(r => r[c]);
          const working =
            dir === "down" ? [...original].reverse() : original;

          const result = handleRow(working);
          const finalCol =
            dir === "down" ? [...result].reverse() : result;

          if (finalCol.join() !== original.join()) moved = true;

          for (let r = 0; r < SIZE; r++) {
            newBoard[r][c] = finalCol[r];
          }
        }
      }

      if (!moved) return;

      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(prev => prev + gainedTotal);

      if (isGameOver(newBoard)) {
        toast({
          title: "😢 Game Over",
          description: `Pontuação final: ${score + gainedTotal}`,
        });
      }
    },
    [board, score]
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

  if (bestScore === null) {
    return <p className="text-center py-10">Carregando...</p>;
  }

  return (
    <div className="space-y-6 text-center">
      <h3 className="text-3xl font-bold">2048</h3>

      <div className="flex justify-center gap-8">
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
            className={`w-20 h-20 flex items-center justify-center text-3xl font-bold rounded-lg ${
              val === 0
                ? "bg-gray-200"
                : val <= 8
                ? "bg-gray-300"
                : val <= 32
                ? "bg-orange-300"
                : val <= 128
                ? "bg-orange-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {val || ""}
          </div>
        ))}
      </div>

      <Button onClick={initBoard}>Reiniciar</Button>
    </div>
  );
};

export default TwentyFortyEight;
