// src/pages/dashboard/Jogos.tsx
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import TicTacToe from "@/components/jogos/TicTacToe";
import TwentyFortyEight from "@/components/jogos/TwentyFortyEight";
import WordSearch from "@/components/jogos/WordSearch";

const Jogos = () => {
  return (
    <div className="space-y-8 p-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Jogos
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* ================= Tic Tac Toe ================= */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-xl transition-shadow border-2 border-purple-500 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/32/Tic_tac_toe.svg"
                    alt="Tic Tac Toe"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <h3 className="text-3xl font-bold text-white">Tic Tac Toe</h3>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Jogue contra a IA e acumule vitórias!
                  </p>
                  <Button className="w-full">Jogar</Button>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <div className="p-6">
              <TicTacToe />
            </div>
          </DialogContent>
        </Dialog>

        {/* ================= 2048 ================= */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-xl transition-shadow border-2 border-purple-500 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/2/28/2048_finished_game.png"
                    alt="2048"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <h3 className="text-3xl font-bold text-white">2048</h3>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Faça 2048 e bata seu recorde!
                  </p>
                  <Button className="w-full">Jogar</Button>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <div className="p-6">
              <TwentyFortyEight />
            </div>
          </DialogContent>
        </Dialog>

        {/* ================= CAÇA-PALAVRAS ================= */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-xl transition-shadow border-2 border-purple-500 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/1/1e/Slangesiker_FP.jpg"
                    alt="Caça-Palavras"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <h3 className="text-3xl font-bold text-white">
                      Caça-Palavras
                    </h3>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Encontre as palavras e suba no ranking!
                  </p>
                  <Button className="w-full">Jogar</Button>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
           <div className="h-[90vh]">
          <WordSearch />
          </div>
         </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Jogos;
