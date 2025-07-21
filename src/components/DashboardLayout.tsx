import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Utensils, Gift, Sliders, LogOut, Menu, Calendar, AlertTriangle, History, Instagram, Video, File, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import MetaFiado from "./dashboard/MetaFiado";
import MetaDesafio from "./dashboard/MetaDesafio";
import MetaPerdido from "./dashboard/MetaPerdido";
import MetaAlimentacao from "./dashboard/MetaAlimentacao";
import MeusPremios from "./dashboard/MeusPremios";
import AjustesMetas from "./dashboard/AjustesMetas";
import Historicos from "./Historicos";
import { useUserData } from "@/hooks/useUserData";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"; // Usando Dialog da biblioteca ui
import RelatoriosSabium from "./RelatoriosSabium";
import html2canvas from "html2canvas";
import { FaWhatsapp } from "react-icons/fa";
import CalculadoraRentabilidade from "./dashboard/CalculadoraRentabilidade";
import { Calculator, Moon, Sun } from "lucide-react";
import VersaoLog from "./VersaoLog";
import Scripts from "./dashboard/Scripts";
import { RiScreenshot2Fill } from "react-icons/ri"; // Ícone para Print Tela
import { BiSolidReport } from "react-icons/bi"; // Ícone para Relatórios Sabium

export interface DashboardProps {
  userData: any;
  updateUserData: (data: any) => void;
  diasSemExpediente: Date[];
  updateDiasSemExpediente: (dias: Date[]) => void;
  diasRestantesCalculados: number;
  isLoading: boolean;
  bonusPerdidoAtivado: boolean;
  setBonusPerdidoAtivado: (value: boolean) => void;
}

const DashboardLayout = () => {
  console.log("DashboardLayout renderizado");
  const [activeTab, setActiveTab] = useState("meta-fiado");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bonusPerdidoAtivado, setBonusPerdidoAtivado] = useState(false);
  const { 
    userData, 
    updateUserData, 
    diasSemExpediente, 
    updateDiasSemExpediente,
    isLoading,
    diasRestantesCalculados
  } = useUserData();
  const [recebidoHoje, setRecebidoHoje] = useState(0); // Estado sincronizado
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showCalendar, setShowCalendar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isNewHistorico, setIsNewHistorico] = useState(true);
  const [showInstagramUsername, setShowInstagramUsername] = useState(false);
  const [isScriptsOpen, setIsScriptsOpen] = useState(false); // Estado para controlar o diálogo de Scripts

  // Sincroniza recebidoHoje com base em userData e historico_diario
  useEffect(() => {
    console.log("Sincronizando recebidoHoje com userData:", userData);
    const fetchReceivedToday = async () => {
      if (userData && userData.abertura_vencido_mes && userData.vencido_atual) {
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().slice(0, 10);
        const lastDay = currentDate.toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("historico_diario")
          .select("recebido, data_recebimento")
          .eq("user_id", userData.id)
          .gte("data_recebimento", firstDay)
          .lte("data_recebimento", lastDay);

        if (error) {
          console.error("Erro ao buscar histórico diário:", error.message);
          return;
        }

        if (data && data.length > 0) {
          const todayData = data.find((record) => record.data_recebimento === lastDay);
          const receivedToday = todayData ? todayData.recebido || 0 : 0;
          const receivedSoFar = userData.abertura_vencido_mes - userData.vencido_atual;
          const daysPassed = currentDate.getDate();
          const dailyAverage = receivedSoFar > 0 ? receivedSoFar / daysPassed : 0;
          const adjustedReceivedToday = Math.max(0, receivedToday || dailyAverage); // Usa o valor do dia ou a média
          setRecebidoHoje(adjustedReceivedToday);
          console.log("Recebido Hoje calculado:", adjustedReceivedToday);
        }
      }
    };
    fetchReceivedToday();
  }, [userData]);

  useEffect(() => {
    console.log("DashboardLayout useEffect executado", userData);
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Autenticação não verificada",
          description: "Você não está autenticado. Deve sair do app e entrar novamente.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    checkAuth();

    const hasVisitedHistorico = localStorage.getItem("hasVisitedHistorico");
    if (!hasVisitedHistorico) {
      setIsNewHistorico(true);
    } else {
      setIsNewHistorico(false);
    }

    // Aplica o tema ao montar o componente
    document.body.classList.toggle("dark", isDarkMode);
  }, [navigate, toast, isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.body.classList.toggle("dark", newMode);
      return newMode;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Saiu com sucesso",
      description: "Você saiu da sua conta.",
    });
    navigate("/auth");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isMobile) {
      setSheetOpen(false);
    }
    if (value === "historicos" && isNewHistorico) {
      setIsNewHistorico(false);
      localStorage.setItem("hasVisitedHistorico", "true");
    }
  };

  const handlePrintScreen = () => {
    if (contentRef.current) {
      html2canvas(document.body, {
        scale: 2,
        useCORS: true,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `dashboard_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const handleInstagramClick = () => {
    setShowInstagramUsername(true);
    setTimeout(() => setShowInstagramUsername(false), 2000);
  };

  const pdfList = [
    { id: 1, name: "CARTILHA - LIBERAÇÃO GERENCIAL", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Cartilha%20-%20Liberacao%20Gerencial.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NhcnRpbGhhIC0gTGliZXJhY2FvIEdlcmVuY2lhbC5wZGYiLCJpYXQiOjE3NTE2NTc1ODgsImV4cCI6MTc4MzE5MzU4OH0.Kyhu4erX_TsbmcaZ-8-fVNlEH21MAFIYD2v5neSjgEs" },
    { id: 2, name: "C.I. 006 2025 COMPROVANTE DE ENDEREÇO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/CI%20006%2025%20Revogacao%20da%20obrigatoriedade%20do%20comprovante%20de%20endereco.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NJIDAwNiAyNSBSZXZvZ2FjYW8gZGEgb2JyaWdhdG9yaWVkYWRlIGRvIGNvbXByb3ZhbnRlIGRlIGVuZGVyZWNvLnBkZiIsImlhdCI6MTc1MTY1NzYxOSwiZXhwIjoxNzgzMTkzNjE5fQ.Lz-wz8OzqkS_fPPF2AumohU8phWJbgOHfaRu3uGTBKg" },
    { id: 3, name: "C.I. 002 2025 RENDA CLIENTES AUTONOMOS", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/CI%202%202025%20Renda%20clientes%20autonomos.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NJIDIgMjAyNSBSZW5kYSBjbGllbnRlcyBhdXRvbm9tb3MucGRmIiwiaWF0IjoxNzUxNjU3NjMwLCJleHAiOjE3ODMxOTM2MzB9.U-kHPl8ib_KfxG8Q6-PJ99ku-rBUne7QMel5F1Zfr78" },
    { id: 4, name: "C.I. 007 2025 CADASTRO NÃO AUTENTICADO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/CI%20cadastro%20nao%20autenticado.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NJIGNhZGFzdHJvIG5hbyBhdXRlbnRpY2Fkby5wZGYiLCJpYXQiOjE3NTE2NTc2NDEsImV4cCI6MTc4MzE5MzY0MX0.cOfIUD8sR9f_yyI9qOKH93cTf6F3PNLXcERAYJV0kgQ" },
    { id: 5, name: "ENDEREÇO RURAL", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/ENDERECO%20RURAL.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0VOREVSRUNPIFJVUkFMLnBkZiIsImlhdCI6MTc1MTY1NzY1NSwiZXhwIjoxNzgzMTkzNjU1fQ.b7pHjnqufaYGz3k5259sWSL-YWWvwnr8tFClYXy_r9A" },
    { id: 6, name: "ESTORNO PIX", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/ESTORNO%20PIX.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0VTVE9STn20%20PIX.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0VTVE9STk8gUElYLnBkZiIsImlhdCI6MTc1MTY1NzY3MCwiZXhwIjoxNzgzMTkzNjcwfQ.kb6dKCz0smc8C1MoOQV_Vn_OM6LgXf7kR2myERYjGJQ" },
    { id: 7, name: "MANUAL ACIONA VENDEDOR", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Manual%20Aciona%20Vendedor.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL01hbnVhbCBBY2lvbmEgVmVuZGVkb3IucGRmIiwiaWF0IjoxNzUxNjU3NjgxLCJleHAiOjE3ODMxOTM2ODF9.KAg0YI2s8ZzTMqF1TkKNTR6I5WrJxbZaesEFh_06a0U" },
    { id: 8, name: "MANUAL DO PATRIMONIO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Manual%20do%20Patrimonio.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL01hbnVhbCBkbyBQYXRyaW1vbmlvLnBkZiIsImlhdCI6MTc1MTY1NzkxMiwiZXhwIjoxNzgzMTkzOTEyfQ.nHLabdtztWNLKtiD8iJ1sEwcUFW2_JpkaTK7jWPOZTA" },
    { id: 9, name: "C.I. SIGA - TELA DE RENEGOCIAÇÃO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/COMUNICADO%20INTERNO%20%20SIGA%20TELA%20DE%20RENEGOCIACAO.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NPTVVOSUNBRE8gSU5URVJOTyAgU0lHQSBURUxBIERFIFJFTkVHT0NJQUNBTy5wZGYiLCJpYXQiOjE3NTIwNjg3NjUsImV4cCI6MTc4MzYwNDc2NX0.SuF1pAb_Fz3W6lvtwzuEf_6oCM5QkuIKkfoqB1djmxg" },
    { id: 10, name: "TEMPLATE DE COBRANÇA", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Template%20Cobrancas.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL1RlbXBsYXRlIENvYnJhbmNhcy54bHN4IiwiaWF0IjoxNzUyNzgxODIzLCJleHAiOjE3ODQzMTc4MjN9.r5VeppFW_ZlW1nSOysSmEnQ7JxK68BO4IOdXlJAvr4Y" },
    { id: 11, name: "TEMPLATE DE COBRANÇA 2", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Template%20Cobrancas%203.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL1RlbXBsYXRlIENvYnJhbmNhcyAzLnhsc3giLCJpYXQiOjE3NTI4NDQ5ODUsImV4cCI6MTc4NDM4MDk4NX0.vUHF3pHMkPc2njoAmHygKDObu-vGNY0DDlRDaE2NRp4" },
    { id: 12, name: "TEMPLATE DE RENEGOCIAÇÃO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Template%20Renegociacao%20.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL1RlbXBsYXRlIFJlbmVnb2NpYWNhbyAueGxzeCIsImlhdCI6MTc1Mjg0NTE4NSwiZXhwIjoxNzg0MzgxMTg1fQ.EzrIi3rgp2VfNbSjK4yoW9EOgHNA7qBAZZ39fmRMdNk" },
  ];

  const renderTabs = () => (
    <TabsList className={`grid grid-cols-7 w-full p-1 bg-card shadow-sm rounded-xl ${isMobile ? 'grid-cols-1 gap-2' : ''}`}>
      <TabsTrigger 
        value="ajustes-metas" 
        className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
        onClick={() => handleTabChange("ajustes-metas")}
      >
        <Sliders className="h-4 w-4" />
        <span className="text-foreground">Ajustes de Metas</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meta-fiado" 
        className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
        onClick={() => handleTabChange("meta-fiado")}
      >
        <Wallet className="h-4 w-4" />
        <span className="text-foreground">Meta Fiado</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meta-desafio" 
        className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
        onClick={() => handleTabChange("meta-desafio")}
      >
        <Trophy className="h-4 w-4" />
        <span className="text-foreground">Meta Desafio</span>
      </TabsTrigger>
      {bonusPerdidoAtivado && (
        <TabsTrigger 
          value="meta-perdido" 
          className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
          onClick={() => handleTabChange("meta-perdido")}
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="text-foreground">Meta Perdido</span>
        </TabsTrigger>
      )}
      <TabsTrigger 
        value="meta-alimentacao" 
        className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
        onClick={() => handleTabChange("meta-alimentacao")}
      >
        <Utensils className="h-4 w-4" />
        <span className="text-foreground">Meta de Ticket</span>
      </TabsTrigger>
      <TabsTrigger 
        value="meus-premios" 
        className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
        onClick={() => handleTabChange("meus-premios")}
      >
        <Gift className="h-4 w-4" />
        <span className="text-foreground">Meus Prêmios</span>
      </TabsTrigger>
      <TabsTrigger 
        value="historicos" 
        className="flex items-center gap-2 data-[state=active]:bg-muted data-[state=active]:text-primary-foreground"
        onClick={() => handleTabChange("historicos")}
      >
        <History className="h-4 w-4" />
        <span className="text-foreground">Históricos</span>
        {isNewHistorico && <span className="text-destructive font-bold">N</span>}
      </TabsTrigger>
    </TabsList>
  );

  const renderTabsContent = () => (
    <>
      <TabsContent value="ajustes-metas" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
        <AjustesMetas
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
          setBonusPerdidoAtivado={setBonusPerdidoAtivado}
        />
      </TabsContent>
      <TabsContent value="meta-fiado" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
        <MetaFiado 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
          setRecebidoHoje={setRecebidoHoje} // Passa a função para MetaFiado
        />
      </TabsContent>
      <TabsContent value="meta-desafio" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
        <MetaDesafio 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
        />
      </TabsContent>
      <TabsContent value="meta-perdido" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
        {bonusPerdidoAtivado && (
          <MetaPerdido 
            userData={userData}
            updateUserData={updateUserData}
            diasSemExpediente={diasSemExpediente}
            updateDiasSemExpediente={updateDiasSemExpediente}
            diasRestantesCalculados={diasRestantesCalculados}
            isLoading={isLoading}
            bonusPerdidoAtivado={bonusPerdidoAtivado}
          />
        )}
      </TabsContent>
      <TabsContent value="meta-alimentacao" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
        <MetaAlimentacao 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
        />
      </TabsContent>
      <TabsContent value="meus-premios" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
        {userData ? (
          <MeusPremios 
            userData={userData}
            updateUserData={updateUserData}
            diasSemExpediente={diasSemExpediente}
            updateDiasSemExpediente={updateDiasSemExpediente}
            diasRestantesCalculados={diasRestantesCalculados}
            isLoading={isLoading}
            bonusPerdidoAtivado={bonusPerdidoAtivado}
            setBonusPerdidoAtivado={setBonusPerdidoAtivado}
          />
        ) : (
          <div className="text-foreground">Carregando dados...</div>
        )}
      </TabsContent>
      <TabsContent value="historicos" className="bg-card p-4 md:p-6 rounded-xl shadow-sm">
        <Historicos 
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
          recebido={recebidoHoje} // Passa o valor atualizado para Historicos
        />
      </TabsContent>
    </>
  );

  const getDaysInMonth = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return 0;
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return 0;
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getCalendarDays = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date provided to getCalendarDays:", date);
      return [];
    }
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(date.getFullYear(), date.getMonth(), i);
      days.push(d);
    }
    return days;
  };

  const getDayColor = (date: Date | null) => {
    if (!date) return "text-gray-400";
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return "text-red-500";
    if (dayOfWeek === 6) return "text-yellow-500";
    return "text-green-500";
  };

  const handleMonthNavigation = (direction: "prev" | "next") => {
    setCalendarMonth((prev) => {
      if (!(prev instanceof Date) || isNaN(prev.getTime())) {
        console.error("Invalid calendarMonth state:", prev);
        return new Date(today.getFullYear(), today.getMonth(), 1);
      }
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + (direction === "next" ? 1 : -1), 1);
      if (isNaN(newMonth.getTime())) {
        console.error("Invalid new month calculated:", newMonth);
        return prev;
      }
      return newMonth;
    });
  };

  const apps = [
    { id: "calculadora", name: "Calculadora de Rentabilidade", icon: Calculator, component: CalculadoraRentabilidade },
    { id: "external-calculator", name: "Calculadora Rentabilidade (Externa)", icon: Calculator, url: "https://abre.ai/calrent" },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background dark' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`} ref={contentRef}>
      <header className="bg-card shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {isMobile ? (
            <>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent flex items-center">
                Controle{" "}
                <VersaoLog className="ml-2" />
              </h1>
              <div className="flex items-center gap-2">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Menu size={18} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80vw] sm:w-[350px] bg-card">
                    <div className="flex flex-col h-full">
                      <div className="py-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Apps</h2>
                      </div>
                      <div className="py-4 flex-1 space-y-2">
                        {apps.map((app) => (
                          app.url ? (
                            <a
                              key={app.id}
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-foreground hover:text-primary"
                              >
                                <app.icon className="h-4 w-4 mr-2" />
                                {app.name}
                              </Button>
                            </a>
                          ) : (
                            <Dialog key={app.id}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-foreground hover:text-primary"
                                >
                                  <app.icon className="h-4 w-4 mr-2" />
                                  {app.name}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md bg-card">
                                <app.component />
                              </DialogContent>
                            </Dialog>
                          )
                        ))}
                      </div>
                      <div className="py-4 border-t border-border">
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2" />
                          Sair
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex items-center gap-2 text-foreground hover:text-primary"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">
                      {today.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </Button>
                  {showCalendar && (
                    <div className="absolute right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-3 z-50 w-72">
                      <div className="flex justify-between items-center mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lg font-bold text-foreground"
                          onClick={() => handleMonthNavigation("prev")}
                        >
                          {"<"}
                        </Button>
                        <span className="text-base font-semibold text-foreground">
                          {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lg font-bold text-foreground"
                          onClick={() => handleMonthNavigation("next")}
                        >
                          {">"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                          <div key={day} className="text-sm font-medium text-muted-foreground">
                            {day}
                          </div>
                        ))}
                        {getCalendarDays(calendarMonth).map((day, index) => (
                          <div
                            key={index}
                            className={`text-lg w-10 h-10 flex items-center justify-center rounded-full ${getDayColor(day)}`}
                          >
                            {day ? day.getDate() : ""}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent flex items-center">
                Controle de Inadimplência{" "}
                <VersaoLog className="ml-2" />
              </h1>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePrintScreen}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-2"
                >
                  <RiScreenshot2Fill className="h-4 w-4" />
                  Print Tela
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-foreground hover:text-primary"
                    >
                      <File className="h-4 w-4" />
                      Anexos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-card">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Lista de Anexos</h3>
                    <ul className="space-y-2">
                      {pdfList.map((pdf) => (
                        <li key={pdf.id} className="flex items-center gap-2">
                          <File className="h-4 w-4 text-gray-500" />
                          <a
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {pdf.name}
                          </a>
                        </li>
                      ))}
                      <li className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-gray-500" />
                        <a
                          href="https://archive.org/embed/tuto-cobranca-com-nome"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          TUTO DE COBRANÇA COM O NOME DO CLIENTE
                        </a>
                      </li>
                    </ul>
                  </DialogContent>
                </Dialog>
                <Dialog open={isScriptsOpen} onOpenChange={setIsScriptsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-foreground hover:text-primary"
                    >
                      <FileText className="h-4 w-4" />
                      Scripts
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-card custom-dialog-no-close">
                    <Scripts onClose={() => setIsScriptsOpen(false)} />
                  </DialogContent>
                </Dialog>
                <div className="relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-foreground hover:text-primary"
                        onClick={() => setShowCalendar(!showCalendar)}
                      >
                        <Calendar className="h-5 w-5" />
                        <span className="text-sm">
                          {today.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </Button>
                    </DialogTrigger>
                    {showCalendar && (
                      <div className="absolute right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-3 z-50 w-72">
                        <div className="flex justify-between items-center mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-lg font-bold text-foreground"
                            onClick={() => handleMonthNavigation("prev")}
                          >
                            {"<"}
                          </Button>
                          <span className="text-base font-semibold text-foreground">
                            {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-lg font-bold text-foreground"
                            onClick={() => handleMonthNavigation("next")}
                          >
                            {">"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center">
                          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                            <div key={day} className="text-sm font-medium text-muted-foreground">
                              {day}
                            </div>
                          ))}
                          {getCalendarDays(calendarMonth).map((day, index) => (
                            <div
                              key={index}
                              className={`text-lg w-10 h-10 flex items-center justify-center rounded-full ${getDayColor(day)}`}
                            >
                              {day ? day.getDate() : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Dialog>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-foreground hover:text-primary"
                    >
                      <BiSolidReport className="h-4 w-4" />
                      Relatórios Sabium
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-card">
                    <RelatoriosSabium />
                  </DialogContent>
                </Dialog>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-foreground hover:text-primary"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80vw] sm:w-[350px] bg-card">
                    <div className="flex flex-col h-full">
                      <div className="py-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Apps</h2>
                      </div>
                      <div className="py-4 flex-1 space-y-2">
                        {apps.map((app) => (
                          app.url ? (
                            <a
                              key={app.id}
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-foreground hover:text-primary"
                              >
                                <app.icon className="h-4 w-4 mr-2" />
                                {app.name}
                              </Button>
                            </a>
                          ) : (
                            <Dialog key={app.id}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-foreground hover:text-primary"
                                >
                                  <app.icon className="h-4 w-4 mr-2" />
                                  {app.name}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md bg-card">
                                <app.component />
                              </DialogContent>
                            </Dialog>
                          )
                        ))}
                      </div>
                      <div className="py-4 border-t border-border">
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2" />
                          Sair
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-card p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-3 shadow-sm mb-6">
          <div className="flex items-center gap-2 blink-slow" style={{ animation: "blink-slow 2s infinite" }}>
            <FaWhatsapp className="h-5 w-5 text-success" />
            <a
              href="https://chat.whatsapp.com/GTc7DQBgrzqG1fmmHAcmPl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-xs"
            >
              Ajuda, Dicas e Sugestões entre no grupo e fique atualizado sobre novas funções!
            </a>
          </div>
          <style>
            {`
              @keyframes blink-slow {
                0% { opacity: 1; }
                50% { opacity: 0.3; }
                100% { opacity: 1; }
              }
            `}
          </style>
          <div className="flex items-center gap-2 relative">
            <Instagram 
              className="h-5 w-5 text-pink-600 cursor-pointer"
              onClick={handleInstagramClick}
            />
            {showInstagramUsername && (
              <span className="absolute right-0 top-full mt-1 text-pink-600 text-xs bg-card p-1 rounded shadow-md">
                @renato_alme1da
              </span>
            )}
          </div>
        </div>

        <Tabs 
          defaultValue="meta-fiado" 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          {renderTabs()}
          {renderTabsContent()}
        </Tabs>
      </main>
      <style>
        {`
          .custom-dialog-no-close .radix-dialog-close {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default DashboardLayout;
