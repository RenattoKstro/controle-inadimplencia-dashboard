// src/components/jogos/TwentyFortyEight.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";

const TwentyFortyEight = () => {
  const { userData } = useUserData();
  const userId = userData?.user_id || "";
  const [board, setBoard] = useState<number[][]>(Array(4).fill(0).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const { toast } = useToast();

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

  const saveScore = async (newScore: number) => {
    if (!userId || newScore <= (bestScore ?? 0)) return;
    setBestScore(newScore);
    setIsNewRecord(true);
    await supabase.from("user_scores").upsert({
      user_id: userId,
      game_name: "2048",
      score: newScore,
    });
    toast({ title: "Novo Recorde! 🔥", description: `Sua melhor agora é ${newScore} pontos` });
    setTimeout(() => setIsNewRecord(false), 3000);
  };

  const initBoard = () => {
    const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setIsNewRecord(false);
  };

  const addRandomTile = (b: number[][]) => {
    const empty = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (b[i][j] === 0) empty.push([i, j]);
      }
    }
    if (empty.length) {
      const [x, y] = empty[Math.floor(Math.random() * empty.length)];
      b[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const slide = (row: number[]) => {
    let arr = row.filter(v => v !== 0);
    let addedScore = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        addedScore += arr[i];
        arr.splice(i + 1, 1);
        i--;
      }
    }
    while (arr.length < 4) arr.push(0);
    const newScore = score + addedScore;
    setScore(newScore);
    saveScore(newScore);
    return arr;
  };

  const move = (dir: "left" | "right" | "up" | "down") => {
    let newBoard = board.map(row => [...row]);
    let moved = false;

    if (dir === "left") {
      newBoard = newBoard.map(row => {
        const slid = slide(row);
        if (slid.join() !== row.join()) moved = true;
        return slid;
      });
    } else if (dir === "right") {
      newBoard = newBoard.map(row => slide(row.reverse()).reverse());
    } else if (dir === "up") {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        const slid = slide(col);
        if (slid.join() !== col.join()) moved = true;
        for (let r = 0; r < 4; r++) newBoard[r][c] = slid[r];
      }
    } else if (dir === "down") {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        const slid = slide(col.reverse()).reverse();
        if (slid.join() !== col.join()) moved = true;
        for (let r = 0; r < 4; r++) newBoard[r][c] = slid[r];
      }
    }

    if (moved) addRandomTile(newBoard);
    setBoard(newBoard);

    if (isGameOver(newBoard)) {
      toast({ title: "Game Over!", description: `Pontuação final: ${score}` });
    }
  };

  const isGameOver = (b: number[][]) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (b[i][j] === 0) return false;
        if (j < 3 && b[i][j] === b[i][j + 1]) return false;
        if (i < 3 && b[i][j] === b[i + 1][j]) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        move(e.key.replace("Arrow", "").toLowerCase() as any);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [board]);

  if (bestScore === null) return <p className="text-center text-xl py-10">Carregando pontuação...</p>;

  return (
    <div className="space-y-6 text-center">
      <h3 className="text-3xl font-bold">2048</h3>
      <div className="flex justify-center gap-8">
        <p className="text-xl">
          Atual: <span className="font-bold text-green-600">{score}</span>
        </p>
        <p className="text-xl">
          Recorde: <span className="font-bold text-purple-600">{bestScore}</span>
          {isNewRecord && <span className="ml-2 text-yellow-400 animate-pulse">Novo! 🔥</span>}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 w-80 mx-auto">
        {board.flat().map((val, i) => (
          <div
            key={i}
            className={`w-20 h-20 flex items-center justify-center text-3xl font-bold rounded-lg ${
              val === 0 ? "bg-gray-200" :
              val <= 8 ? "bg-gray-300" :
              val <= 32 ? "bg-orange-300" :
              val <= 128 ? "bg-orange-500 text-white" :
              "bg-red-500 text-white"
            }`}
          >
            {val || ""}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        <Button onClick={initBoard}>Reiniciar</Button>
      </div>
      <p className="text-sm text-muted-foreground">Use as setas do teclado</p>
    </div>
  );
};

export default TwentyFortyEight;
