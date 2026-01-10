import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";

type Direction = "left" | "right" | "up" | "down";
const SIZE = 4;

type RankingItem = {
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
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [ranking, setRanking] = useState<RankingItem[]>([]);

  /* =====================
     LOAD BEST + RANKING
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

  const loadRanking = async () => {
    const { data } = await supabase
      .from("user_scores")
      .select(
        `
        score,
        user_dashboard (
          nome_usuario
        )
      `
      )
      .eq("game_name", "2048")
      .order("score", { ascending: false })
      .limit(10);

    if (data) {
      setRanking(
        data.map((r: any) => ({
          score: r.score,
          nome_usuario: r.user_dashboard?.nome_usuario ?? "Anônimo",
        }))
      );
    }
  };

  /* =====================
     SAVE SCORE
  ====================== */
  useEffect(() => {
    if (!userId) return;
    if (bestScore === null) return;
    if (score <= bestScore) return;

    saveScore(score);
  }, [score]);

  const saveScore = async (newScore: number) => {
    const { error } = await supabase
      .from("user_scores")
      .upsert(
        {
          user_id: userId,
          game_name: "2048",
          score: newScore,
        },
        { onConflict: "user_id,game_name" }
      );

    if (!error) {
      setBestScore(newScore);
      setIsNewRecord(true);
      loadRanking();

      toast({
        title: "🔥 Novo Recorde!",
        description: `Sua melhor pontuação agora é ${newScore}`,
      });

      setTimeout(() => setIsNewRecord(false), 3000);
    }
  };

  /* =====================
     TILE STYLE (CORES)
  ====================== */
  const tileStyle = (val: number) => {
    if (val === 0) return "bg-gray-200";
    if (val === 2) return "bg-yellow-100 text-4xl";
    if (val === 4) return "bg-yellow-200 text-4xl";
    if (val === 8) return "bg-orange-300 text-white text-4xl";
    if (val === 16) return "bg-orange-400 text-white text-4xl";
    if (val === 32) return "bg-orange-500 text-white text-3xl";
    if (val === 64) return "bg-red-500 text-white text-3xl";
    if (val === 128) return "bg-red-600 text-white text-3xl";
    if (val === 256) return "bg-purple-600 text-white text-2xl";
    if (val === 512) return "bg-purple-700 text-white text-2xl";
    return "bg-black text-white text-xl";
  };

  /* =====================
     BOARD HELPERS
  ====================== */
  const addRandomTile = (b: number[][]) => {
    const empty: [number, number][] = [];
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE; j++)
        if (b[i][j] === 0) empty.push([i, j]);

    if (!empty.length) return;
    const [x, y] = empty[Math.floor(Math.random() * empty.length)];
    b[x][y] = Math.random() < 0.9 ? 2 : 4;
  };

  const initBoard = () => {
    const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    addRandomTile(b);
    addRandomTile(b);
    setBoard(b);
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
     MOVE
  ====================== */
  const move = useCallback(
    (dir: Direction) => {
      let moved = false;
      let gained = 0;
      const newBoard = board.map(r => [...r]);

      const handle = (r: number[]) => {
        const res = slide(r);
        gained += res.gained;
        return res.row;
      };

      if (dir === "left" || dir === "right") {
        for (let r = 0; r < SIZE; r++) {
          const ori = [...newBoard[r]];
          const w = dir === "right" ? [...ori].reverse() : ori;
          const f = dir === "right" ? [...handle(w)].reverse() : handle(w);
          if (f.join() !== ori.join()) moved = true;
          newBoard[r] = f;
        }
      }

      if (dir === "up" || dir === "down") {
        for (let c = 0; c < SIZE; c++) {
          const ori = newBoard.map(r => r[c]);
          const w = dir === "down" ? [...ori].reverse() : ori;
          const f = dir === "down" ? [...handle(w)].reverse() : handle(w);
          if (f.join() !== ori.join()) moved = true;
          for (let r = 0; r < SIZE; r++) newBoard[r][c] = f[r];
        }
      }

      if (!moved) return;
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(s => s + gained);
    },
    [board]
  );

  /* =====================
     KEYBOARD
  ====================== */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const m: any = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      if (m[e.key]) {
        e.preventDefault();
        move(m[e.key]);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [move]);

  if (bestScore === null) return <p>Carregando...</p>;

  return (
    <div className="flex gap-10 justify-center">
      {/* GAME */}
      <div className="space-y-6 text-center">
        <h3 className="text-3xl font-bold">2048</h3>

        <div className="flex justify-center gap-6">
          <p>Atual: <b>{score}</b></p>
          <p>Recorde: <b>{bestScore}</b>{isNewRecord && " 🔥"}</p>
        </div>

        <div className="grid grid-cols-4 gap-2 w-80 mx-auto">
          {board.flat().map((v, i) => (
            <div
              key={i}
              className={`w-20 h-20 flex items-center justify-center font-bold rounded-lg transition-all ${tileStyle(v)}`}
            >
              {v || ""}
            </div>
          ))}
        </div>

        <Button onClick={initBoard}>Reiniciar</Button>
      </div>

      {/* RANKING */}
      <div className="w-64">
        <h4 className="text-xl font-bold mb-3">🏆 Ranking</h4>
        <ul className="space-y-2">
          {ranking.map((r, i) => (
            <li key={i} className="flex justify-between">
              <span>
                {i === 0 && "🥇"}
                {i === 1 && "🥈"}
                {i === 2 && "🥉"}
                {i > 2 && `#${i + 1}`} {r.nome_usuario}
              </span>
              <b>{r.score}</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TwentyFortyEight;
