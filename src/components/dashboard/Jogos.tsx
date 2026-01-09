// src/pages/dashboard/Jogos.tsx
import { useState, useEffect } from "react";
import { useUserData } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tic Tac Toe contra IA
const TicTacToe = ({ userId }: { userId: string }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // Jogador = X, IA = O
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null); // null = carregando
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    const loadScore = async () => {
      const { data, error } = await supabase
        .from("user_scores")
        .select("score")
        .eq("user_id", userId)
        .eq("game_name", "tic_tac_toe")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar score:", error);
      }
      setScore(data?.score ?? 0);
    };
    loadScore();
  }, [userId]);

  const saveScore = async (newScore: number) => {
    if (!userId) return;
    const { error } = await supabase.from("user_scores").upsert({
      user_id: userId,
      game_name: "tic_tac_toe",
      score: newScore,
    });
    if (error) console.error("Erro ao salvar score:", error);
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

    // 1. Tentar ganhar
    for (const [a, b, c] of lines) {
      if (board[a] === "O" && board[b] === "O" && board[c] === null) return c;
      if (board[a] === "O" && board[c] === "O" && board[b] === null) return b;
      if (board[b] === "O" && board[c] === "O" && board[a] === null) return a;
    }

    // 2. Bloquear jogador
    for (const [a, b, c] of lines) {
      if (board[a] === "X" && board[b] === "X" && board[c] === null) return c;
      if (board[a] === "X" && board[c] === "X" && board[b] === null) return b;
      if (board[b] === "X" && board[c] === "X" && board[a] === null) return a;
    }

    // 3. Centro
    if (board[4] === null) return 4;

    // 4. Canto
    const corners = [0, 2, 6, 8];
    for (const corner of corners) if (board[corner] === null) return corner;

    // 5. Qualquer livre
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

  if (score === null) return <p className="text-center text-xl py-10">Carregando pontuação...</p>;

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

// 2048 - Correção completa do bug de save prematuro e NaN
const TwentyFortyEight = ({ userId }: { userId: string }) => {
  const [board, setBoard] = useState<number[][]>(Array(4).fill(0).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    const loadBest = async () => {
      const { data, error } = await supabase
        .from("user_scores")
        .select("score")
        .eq("user_id", userId)
        .eq("game_name", "2048")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar recorde:", error);
      }
      setBestScore(data?.score ?? 0);
    };
    loadBest();
    initBoard();
  }, [userId]);

  const saveScore = async (newScore: number) => {
    if (!userId || newScore <= (bestScore ?? 0)) return; // Só salva se realmente for maior

    setBestScore(newScore);
    setIsNewRecord(true);

    const { error } = await supabase.from("user_scores").upsert({
      user_id: userId,
      game_name: "2048",
      score: newScore,
    });

    if (error) {
      console.error("Erro ao salvar recorde:", error);
    } else {
      toast({ title: "Novo Recorde! 🔥", description: `Sua melhor agora é ${newScore} pontos` });
      setTimeout(() => setIsNewRecord(false), 3000);
    }
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
    saveScore(newScore); // Só salva se for maior que o recorde (verificação dentro da função)

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

// Componente principal: Jogos
const Jogos = () => {
  const { userData, isLoading: userLoading } = useUserData();
  const userId = userData?.user_id || "";

  if (userLoading || !userId) {
    return <p className="text-center text-xl py-10">Carregando usuário...</p>;
  }

  return (
    <div className="space-y-8 p-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Jogos
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Relaxe, jogue e dispute o ranking de pontuação!
        </p>
      </div>

      <Tabs defaultValue="tic-tac-toe" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tic-tac-toe">Tic Tac Toe (vs IA)</TabsTrigger>
          <TabsTrigger value="2048">2048</TabsTrigger>
        </TabsList>

        <TabsContent value="tic-tac-toe" className="mt-6">
          <TicTacToe userId={userId} />
        </TabsContent>

        <TabsContent value="2048" className="mt-6">
          <TwentyFortyEight userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Jogos;
