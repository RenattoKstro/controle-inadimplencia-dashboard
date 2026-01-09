// src/pages/dashboard/Jogos.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TicTacToe from "@/components/jogos/TicTacToe";
import TwentyFortyEight from "@/components/jogos/TwentyFortyEight";

const Jogos = () => {
  return (
    <div className="space-y-8 p-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Jogos
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Relaxe, jogue e dispute sua própria pontuação!
        </p>
      </div>

      <Tabs defaultValue="tic-tac-toe" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tic-tac-toe">Tic Tac Toe (vs IA)</TabsTrigger>
          <TabsTrigger value="2048">2048</TabsTrigger>
        </TabsList>

        <TabsContent value="tic-tac-toe" className="mt-6">
          <TicTacToe />
        </TabsContent>

        <TabsContent value="2048" className="mt-6">
          <TwentyFortyEight />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Jogos;
