import { useEffect, useRef } from "react";
import gsap from "gsap"; // Instale com: npm install gsap

const AnimatedNavBar = ({ progress = 50 }: { progress: number }) => {
  const swimmerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animação da água
    gsap.fromTo(
      ".water",
      { backgroundPositionX: "0%" },
      { backgroundPositionX: "-100%", duration: 2, repeat: -1, ease: "linear" }
    );

    // Atualiza a posição do nadador com base no progresso
    if (swimmerRef.current) {
      const maxWidth = 80; // % da barra (excluindo a praia)
      const newPosition = (progress / 100) * maxWidth;
      gsap.to(swimmerRef.current, {
        left: `${newPosition}%`,
        duration: 1,
        ease: "power2.out",
      });
    }
  }, [progress]);

  return (
    <div className="w-full h-16 relative bg-gray-200 overflow-hidden">
      {/* Praia à direita */}
      <div className="absolute right-0 top-0 h-full w-20 bg-yellow-300 flex items-center justify-center">
        <span className="text-white font-bold">Praia</span>
      </div>

      {/* Água animada */}
      <div className="water absolute top-0 left-0 h-full w-[80%] bg-gradient-to-r from-blue-500 to-blue-300 animate-wave" />

      {/* Nadador */}
      <div
        ref={swimmerRef}
        className="absolute top-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
        style={{ left: "0%" }}
      >
        🏊‍♂️
      </div>

      {/* Texto de progresso */}
      <div className="absolute top-16 w-full text-center text-sm">
        Progresso: {progress}%
      </div>
    </div>
  );
};

export default AnimatedNavBar;