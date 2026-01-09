// src/components/jogos/TicTacToe.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";

const TicTacToe = () => {
  const { userData } = useUserData();
  const userId = userData?.user_id || "";
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // Jogador = X, IA = O
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    const loadScore = async () => {
      const { data } = await supabase
        .from("user_scores")
        .select("score")
        .eq("user_id", userId)
        .eq("game_name", "tic_tac_toe")
        .single();
      setScore(data?.score ?? 0);
    };
    loadScore();
  }, [userId]);

  const saveScore = async (newScore: number) => {
    if (!userId) return;
    await supabase.from("user_scores").upsert({
      user_id: userId,
      game_name: "tic_tac_toe",
      score: newScore,
    });
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || !isXNext) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXNext(false);

    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      handleGameEnd(newWinner);
      return;
    }

    setTimeout(() => {
      const iaMove = getBestMove(newBoard);
      if (iaMove !== null) {
        const iaBoard = [...newBoard];
        iaBoard[iaMove] = "O";
        setBoard(iaBoard);
        setIsXNext(true);

        const iaWinner = calculateWinner(iaBoard);
        if (iaWinner) handleGameEnd(iaWinner);
      }
    }, 500);
  };

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(Boolean)) return "draw";
    return null;
  };

  const getBestMove = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] === "O" && board[b] === "O" && board[c] === null) return c;
      if (board[a] === "O" && board[c] === "O" && board[b] === null) return b;
      if (board[b] === "O" && board[c] === "O" && board[a] === null) return a;
    }

    for (const [a, b, c] of lines) {
      if (board[a] === "X" && board[b] === "X" && board[c] === null) return c;
      if (board[a] === "X" && board[c] === "X" && board[b] === null) return b;
      if (board[b] === "X" && board[c] === "X" && board[a] === null) return a;
    }

    if (board[4] === null) return 4;

    const corners = [0, 2, 6, 8];
    for (const corner of corners) if (board[corner] === null) return corner;

    for (let i = 0; i < 9; i++) if (board[i] === null) return i;

    return null;
  };

  const handleGameEnd = (win: string) => {
    setWinner(win);
    if (win === "X") {
      const newScore = (score ?? 0) + 1;
      setScore(newScore);
      saveScore(newScore);
      toast({ title: "Você venceu!", description: `Vitórias: ${newScore}` });
    } else if (win === "draw") {
      toast({ title: "Empate!" });
    } else {
      toast({ title: "IA venceu!" });
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  if (score === null) return <p className="text-center text-xl">Carregando pontuação...</p>;

  return (
    <div className="space-y-6 text-center">
      <h3 className="text-3xl font-bold">Tic Tac Toe (vs IA)</h3>
      <p className="text-xl">Suas vitórias: <span className="font-bold text-green-600">{score}</span></p>
      <div className="grid grid-cols-3 gap-1 mx-auto w-fit">
        {board.map((val, i) => (
          <button
            key={i}
            className="w-20 h-20 text-5xl font-bold border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100 transition"
            onClick={() => handleClick(i)}
          >
            {val}
          </button>
        ))}
      </div>
      {winner && (
        <p className="text-2xl font-bold mt-4">
          {winner === "draw" ? "Empate!" : `Vencedor: ${winner}`}
        </p>
      )}
      <Button onClick={resetGame} className="mt-4">Novo Jogo</Button>
      <p className="text-sm text-muted-foreground">Você é X • IA é O</p>
    </div>
  );
};

export default TicTacToe;
