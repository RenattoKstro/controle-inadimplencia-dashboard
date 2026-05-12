import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Camera, Chrome, ExternalLink, Goal, Sparkles, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type LinkItem = {
  id: string;
  title: string;
  url: string;
  subtitle: string;
  iconSrc: string;
};

type LinkSection = {
  id: string;
  title: string;
  description: string;
  icon: typeof ExternalLink;
  items: LinkItem[];
};

const acionaIcon = "/aciona-one.svg";

const sections: LinkSection[] = [
  {
    id: "aciona",
    title: "Links",
    description: "Links rápidos de sistemas e portais utilizados no dia a dia.",
    icon: ExternalLink,
    items: [
      {
        id: "aciona-dashboard",
        title: "Aciona Dashboard",
        subtitle: "Painel principal da Aciona One",
        url: "https://painel.acionaone.com.br/dashboard",
        iconSrc: acionaIcon,
      },
      {
        id: "aciona-operador",
        title: "Aciona Operador",
        subtitle: "Portal do operador Gazin / Aciona",
        url: "https://gazin.acionaone.com.br/",
        iconSrc: acionaIcon,
      },
      {
        id: "cadastro-digital",
        title: "Cadastro Digital e Pagamentos",
        subtitle: "Portal Gazin Gazin",
        url: "https://https://portalcliente.gazin.com.br/",
        iconSrc: "https://portalcliente.gazin.com.br/favicon-96x96.png",
      },
      {
        id: "gazin-express",
        title: "Gazin Express",
        subtitle: "Minha Gazin",
        url: "https://minhagazin.com.br/",
        iconSrc: "https://portalcliente.gazin.com.br/favicon-96x96.png",
      },
      {
        id: "area-cliente-gazin",
        title: "Area do Cliente Gazin",
        subtitle: "Área do cliente Gazin",
        url: "https://areadocliente.gazin.com.br/",
        iconSrc: "https://portalcliente.gazin.com.br/favicon-96x96.png",
      },
      {
        id: "tv-gazin",
        title: "TV Gazin",
        subtitle: "Portal TV Gazin",
        url: "https://tvgazin.com.br/",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=tvgazin.com.br",
      },
      {
        id: "tv-crediario",
        title: "TV Crediario",
        subtitle: "TV Crediário Gazin Assis Brasil",
        url: "https://gazinassisbrasil.shop/tv",
        iconSrc: "https://portalcliente.gazin.com.br/favicon-96x96.png",
      },
    ],
  },
  {
    id: "extensoes",
    title: "Extensões do Chrome",
    description: "Plugins para disparo e automação de mensagens no WhatsApp.",
    icon: Chrome,
    items: [
      {
        id: "premium-sender",
        title: "Premium Sender Plus",
        subtitle: "Extensão para envio em massa via WhatsApp",
        url: "https://chromewebstore.google.com/detail/premium-sender-plus/cofbobkapfknpdllndaligcgmikmegbl?authuser=0&utm_source=app-launcher",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=chromewebstore.google.com",
      },
      {
        id: "bulk-sender",
        title: "Bulk Sender - Free WA Sender Plugin",
        subtitle: "Plugin gratuito para campanhas e disparos",
        url: "https://chromewebstore.google.com/detail/bulk-sender-free-wa-sende/fhkimgpddcmnleeaicdjggpedegolbkb?authuser=0&utm_source=app-launcher",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=chromewebstore.google.com",
      },
      {
        id: "wabot",
        title: "WABot - Enviador de mensagens em massa para WA",
        subtitle: "Automação de envios para WhatsApp",
        url: "https://chromewebstore.google.com/detail/wabot-enviador-de-mensage/kjcjhnnogkgeghpjnljkkdkmdhamfamh?authuser=0&utm_source=app-launcher",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=chromewebstore.google.com",
      },
      {
        id: "envio-massa",
        title: "Envio em Massa de Mensagens do WhatsApp",
        subtitle: "Extensão para campanhas em lote no WhatsApp",
        url: "https://chromewebstore.google.com/detail/envio-em-massa-de-mensage/ndodgpmobggdhmbhmgagpgbcgfokfkjb?authuser=0&utm_source=app-launcher",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=chromewebstore.google.com",
      },
    ],
  },
  {
    id: "ias",
    title: "IA",
    description: "Ferramentas de IA para pesquisa, atendimento e produtividade.",
    icon: Sparkles,
    items: [
      {
        id: "gemini",
        title: "Gemini",
        subtitle: "Google Gemini",
        url: "https://gemini.google.com/",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=gemini.google.com",
      },
      {
        id: "chatgpt",
        title: "ChatGPT",
        subtitle: "OpenAI ChatGPT",
        url: "https://chatgpt.com/",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=chatgpt.com",
      },
      {
        id: "perplexity",
        title: "Perplexity",
        subtitle: "Atalho via ChatOn / Perplexity",
        url: "https://chaton.ai/perplexity/",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=chaton.ai",
      },
      {
        id: "copilot",
        title: "Copilot",
        subtitle: "Microsoft Copilot",
        url: "https://copilot.microsoft.com/",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=copilot.microsoft.com",
      },
      {
        id: "deepseek",
        title: "DeepSeek",
        subtitle: "Chat DeepSeek",
        url: "https://chat.deepseek.com/",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=chat.deepseek.com",
      },
      {
        id: "grok",
        title: "Grok",
        subtitle: "xAI Grok",
        url: "https://grok.com/",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=grok.com",
      },
      {
        id: "claude",
        title: "Claude",
        subtitle: "Anthropic Claude",
        url: "https://claude.ai/",
        iconSrc: "https://www.google.com/s2/favicons?sz=128&domain=claude.ai",
      },
    ],
  },
];

type MatrizLinksProps = {
  userId?: string;
  receivedAmount?: number;
};

type CobrancaRow = {
  vendedor: string;
  loja: string;
  fila: number;
  qtdCobranca: number;
  agendamentosMes: number;
  faltaCobrancaMes: number;
  agendamentosValor: number;
  metaRecebimento: number;
  recebido: number;
  efetividade: number;
};

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
}).format(value || 0);

const formatNumber = (value: number) => new Intl.NumberFormat("pt-BR").format(value || 0);

const parseNumericValue = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;

  const normalized = value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace("%", "");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parsePercentageValue = (value: unknown): number => {
  const parsed = parseNumericValue(value);

  if (typeof value === "number") {
    return value > 0 && value <= 2 ? value * 100 : parsed;
  }

  if (typeof value === "string") {
    const hasPercentSignal = value.includes("%");
    if (hasPercentSignal) return parsed;
    return parsed > 0 && parsed <= 2 ? parsed * 100 : parsed;
  }

  return parsed;
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

const hasAnyCandidate = (cell: unknown, candidates: string[]) => {
  const normalized = normalizeText(cell);
  return candidates.some((candidate) => normalized.includes(candidate));
};

const PIE_COLORS = [
  "#16a34a",
  "#eab308",
  "#2563eb",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0d9488",
  "#db2777",
  "#7c3aed",
  "#0284c7",
  "#65a30d",
  "#be123c",
  "#4f46e5",
  "#84cc16",
  "#f59e0b",
  "#0891b2",
];
const META_COBRANCAS_PADRAO = 520;

const MatrizLinks = ({ userId, receivedAmount = 0 }: MatrizLinksProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [loadingDots, setLoadingDots] = useState(1);
  const [metaDiariaInput, setMetaDiariaInput] = useState("0");
  const [cobrancasRows, setCobrancasRows] = useState<CobrancaRow[]>([]);
  const [selectedLoja, setSelectedLoja] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingDetailsImage, setIsGeneratingDetailsImage] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const fullDetailsExportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
    console.log("[MatrizLinks] componente montado", { userId, receivedAmount });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const saved = localStorage.getItem(`matriz-meta-diaria:${userId}`);
    if (saved !== null) {
      setMetaDiariaInput(saved);
    }
  }, [userId]);

  const metaDiaria = useMemo(() => {
    const normalized = Number(metaDiariaInput.replace(",", "."));
    return Number.isFinite(normalized) ? Math.max(0, normalized) : 0;
  }, [metaDiariaInput]);

  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(`matriz-meta-diaria:${userId}`, String(metaDiaria));
  }, [metaDiaria, userId]);

  useEffect(() => {
    if (!isUploadingExcel) {
      setLoadingDots(1);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingDots((current) => (current >= 3 ? 1 : current + 1));
    }, 350);

    return () => window.clearInterval(interval);
  }, [isUploadingExcel]);

  const restante = Math.max(0, metaDiaria - receivedAmount);
  const percentual = metaDiaria > 0 ? (receivedAmount / metaDiaria) * 100 : 0;

  const lojasDisponiveis = useMemo(() => {
    const unique = new Set(cobrancasRows.map((row) => row.loja).filter(Boolean));
    return Array.from(unique).sort((a, b) => Number(a) - Number(b));
  }, [cobrancasRows]);

  const rowsFiltradasPorLoja = useMemo(() => {
    if (!selectedLoja) return [];
    return cobrancasRows.filter((row) => row.loja === selectedLoja);
  }, [cobrancasRows, selectedLoja]);

  const resumoLoja = useMemo(() => {
    return rowsFiltradasPorLoja.reduce((acc, row) => {
      acc.totalFila += row.fila;
      acc.totalCobrancas += row.qtdCobranca;
      acc.totalAgendamentos += row.agendamentosMes;
      acc.totalFalta += row.faltaCobrancaMes;
      acc.totalRecebido += row.recebido;
      acc.totalMeta += row.metaRecebimento;
      return acc;
    }, {
      totalFila: 0,
      totalCobrancas: 0,
      totalAgendamentos: 0,
      totalFalta: 0,
      totalRecebido: 0,
      totalMeta: 0,
    });
  }, [rowsFiltradasPorLoja]);

  const pieData = useMemo(() => {
    if (!selectedLoja) return [];
    const rowsWithCobranca = rowsFiltradasPorLoja.filter((row) => row.qtdCobranca > 0);
    if (rowsWithCobranca.length) {
      return rowsWithCobranca.map((row) => ({
        name: row.vendedor,
        value: row.qtdCobranca,
      }));
    }

    return rowsFiltradasPorLoja.map((row) => ({
      name: row.vendedor,
      value: row.agendamentosMes,
    }));
  }, [rowsFiltradasPorLoja, selectedLoja]);

  const readFileWithProgress = (file: File) =>
    new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
          return;
        }
        reject(new Error("Falha ao ler o arquivo como ArrayBuffer."));
      };

      reader.onerror = () => reject(reader.error ?? new Error("Falha desconhecida ao ler o arquivo."));
      reader.readAsArrayBuffer(file);
    });

  const handleUploadExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingExcel(true);
    setUploadError("");

    try {
      const buffer = await readFileWithProgress(file);
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const matrixRows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: "" });

      if (!matrixRows.length) {
        setUploadError("Não foi possível ler dados da planilha.");
        setCobrancasRows([]);
        return;
      }

      const columnsMatchers = {
        vendedor: ["vendedor"],
        loja: ["loja"],
        fila: ["fila"],
        qtdCobranca: ["qtd de cobranca", "qtd cobranca"],
        agendamentoMes: ["agendamento mes"],
        faltaCobrancaMes: ["falta cobranca mes"],
        agendamentoValor: ["agendamentos - r$", "agendamentos"],
        metaRecebimento: ["meta de recebimento", "meta recebimento"],
        recebido: ["recebido"],
        efetividade: ["% - efet", "% efet", "efet"],
      };

      const firstPossibleHeaderLine = 4; // linha 5 do Excel (0-indexado)
      const headerRowIndex = matrixRows.findIndex((row, index) => {
        if (index < firstPossibleHeaderLine) return false;
        const normalizedCells = row.map((cell) => normalizeText(cell));
        const hasSituacao = normalizedCells.some((cell) => cell.includes("situacao"));
        const hasVendedor = normalizedCells.some((cell) =>
          columnsMatchers.vendedor.some((candidate) => cell.includes(candidate))
        );
        const hasLoja = normalizedCells.some((cell) =>
          columnsMatchers.loja.some((candidate) => cell.includes(candidate))
        );
        return hasSituacao && hasVendedor && hasLoja;
      });

      if (headerRowIndex < 0) {
        setUploadError("Cabeçalho não encontrado. Verifique se a planilha contém as colunas esperadas.");
        setCobrancasRows([]);
        return;
      }

      const headerRow = matrixRows[headerRowIndex];

      const findColumnIndex = (candidates: string[]) =>
        headerRow.findIndex((cell) => hasAnyCandidate(cell, candidates));

      const vendedorIndex = findColumnIndex(columnsMatchers.vendedor);
      const lojaIndex = findColumnIndex(columnsMatchers.loja);
      const filaIndex = findColumnIndex(columnsMatchers.fila);
      const qtdCobrancaIndex = findColumnIndex(columnsMatchers.qtdCobranca);
      const agendamentoMesIndex = findColumnIndex(columnsMatchers.agendamentoMes);
      const faltaCobrancaMesIndex = findColumnIndex(columnsMatchers.faltaCobrancaMes);
      const agendamentoValorIndex = findColumnIndex(columnsMatchers.agendamentoValor);
      const metaRecebimentoIndex = findColumnIndex(columnsMatchers.metaRecebimento);
      const recebidoIndex = findColumnIndex(columnsMatchers.recebido);
      const efetividadeIndex = findColumnIndex(columnsMatchers.efetividade);

      if (
        vendedorIndex < 0 ||
        lojaIndex < 0 ||
        filaIndex < 0 ||
        qtdCobrancaIndex < 0 ||
        agendamentoMesIndex < 0
      ) {
        setUploadError("Colunas obrigatórias não encontradas. Verifique o layout da planilha.");
        setCobrancasRows([]);
        return;
      }

      const dataRows = matrixRows.slice(headerRowIndex + 1);

      const parsedRows: CobrancaRow[] = dataRows
        .map((row) => ({
          vendedor: String(row[vendedorIndex] ?? "").trim(),
          loja: String(row[lojaIndex] ?? "").replace(/\D/g, ""),
          fila: parseNumericValue(row[filaIndex]),
          qtdCobranca: parseNumericValue(row[qtdCobrancaIndex]),
          agendamentosMes: parseNumericValue(row[agendamentoMesIndex]),
          faltaCobrancaMes: faltaCobrancaMesIndex >= 0 ? parseNumericValue(row[faltaCobrancaMesIndex]) : 0,
          agendamentosValor: agendamentoValorIndex >= 0 ? parseNumericValue(row[agendamentoValorIndex]) : 0,
          metaRecebimento: metaRecebimentoIndex >= 0 ? parseNumericValue(row[metaRecebimentoIndex]) : 0,
          recebido: recebidoIndex >= 0 ? parseNumericValue(row[recebidoIndex]) : 0,
          efetividade: efetividadeIndex >= 0 ? parsePercentageValue(row[efetividadeIndex]) : 0,
        }))
        .filter((row) => row.vendedor && row.loja);

      if (!parsedRows.length) {
        setUploadError("A planilha foi lida, mas não foram encontrados registros válidos abaixo do cabeçalho.");
        setCobrancasRows([]);
        return;
      }

      setCobrancasRows(parsedRows);
      setSelectedLoja("");
      setUploadError("");
    } catch (error) {
      console.error("[MatrizLinks] erro ao processar planilha de cobranças.", error);
      setUploadError("Erro ao processar o arquivo. Envie um Excel válido (.xlsx ou .xls).");
      setCobrancasRows([]);
    } finally {
      setIsUploadingExcel(false);
      event.target.value = "";
    }
  };

  const handleDownloadDashboard = async () => {
    if (!dashboardRef.current) return;

    try {
      setIsGeneratingImage(true);
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: isDark ? "#09090b" : "#f8fafc",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `cobrancas-loja-${selectedLoja || "geral"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadFullDetails = async () => {
    if (!fullDetailsExportRef.current || !rowsFiltradasPorLoja.length) return;

    try {
      setIsGeneratingDetailsImage(true);
      const canvas = await html2canvas(fullDetailsExportRef.current, {
        backgroundColor: isDark ? "#09090b" : "#f8fafc",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `detalhes-vendedores-loja-${selectedLoja || "geral"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsGeneratingDetailsImage(false);
    }
  };

  const buildSellerAnalysis = (row: CobrancaRow) => {
    const percentualMeta = META_COBRANCAS_PADRAO > 0 ? (row.qtdCobranca / META_COBRANCAS_PADRAO) * 100 : 0;
    const header = `👤 ${row.vendedor.toUpperCase()}`;
    const metrics = `📊 ${formatNumber(row.qtdCobranca)} cobranças (${percentualMeta.toFixed(0)}% da meta)\n📈 Efetividade: ${row.efetividade.toFixed(2)}%`;

    if (row.qtdCobranca >= META_COBRANCAS_PADRAO * 0.9 && row.efetividade >= 90) {
      return `${header}\n${metrics}\n\n✅ Referência da equipe\n👉 Volume alto + boa qualidade`;
    }
    if (row.qtdCobranca >= META_COBRANCAS_PADRAO * 0.6 && row.efetividade < 60) {
      return `${header}\n${metrics}\n\n⚠️ Trabalha bem o volume, mas converte pouco\n👉 Precisa melhorar abordagem`;
    }
    if (row.efetividade >= 120 && row.qtdCobranca < META_COBRANCAS_PADRAO * 0.5) {
      return `${header}\n${metrics}\n\n💡 Excelente conversão\n❗ Precisa aumentar volume`;
    }
    if (row.qtdCobranca < META_COBRANCAS_PADRAO * 0.2 && row.efetividade < 60) {
      return `${header}\n${metrics}\n\n❌ Baixo volume\n❌ Baixa efetividade\n👉 Ponto crítico da equipe`;
    }
    return `${header}\n${metrics}\n\n👉 Equilibrado, mas pode aumentar produção`;
  };

  const handleAnalyzeData = () => {
    if (!selectedLoja || !rowsFiltradasPorLoja.length) {
      setAnalysisText("Selecione uma loja com dados para gerar a análise.");
      return;
    }

    const ordered = [...rowsFiltradasPorLoja].sort((a, b) => b.qtdCobranca - a.qtdCobranca);
    const acimaMeta = ordered.filter((row) => row.qtdCobranca >= META_COBRANCAS_PADRAO).length;
    const abaixoMeta = ordered.length - acimaMeta;
    const melhorGeral = ordered[0];
    const maiorPotencial = [...ordered].sort((a, b) => b.efetividade - a.efetividade)[0];
    const maiorAtencao = [...ordered].sort((a, b) => (a.qtdCobranca + a.efetividade) - (b.qtdCobranca + b.efetividade))[0];
    const melhorAjusteRapido = [...ordered]
      .sort((a, b) => (b.qtdCobranca - b.efetividade) - (a.qtdCobranca - a.efetividade))[0];

    const focoVolume = ordered
      .filter((row) => row.qtdCobranca < META_COBRANCAS_PADRAO * 0.7)
      .slice(0, 4)
      .map((row) => row.vendedor)
      .join(", ");
    const focoQualidade = ordered
      .filter((row) => row.efetividade < 70)
      .slice(0, 4)
      .map((row) => row.vendedor)
      .join(", ");
    const manterPadrao = ordered
      .filter((row) => row.qtdCobranca >= META_COBRANCAS_PADRAO * 0.9 && row.efetividade >= 90)
      .slice(0, 3)
      .map((row) => row.vendedor)
      .join(", ");

    const analysis = [
      `📊 ANÁLISE – EQUIPE LOJA ${selectedLoja}`,
      "",
      `🎯 Meta principal: ${META_COBRANCAS_PADRAO} cobranças por vendedor`,
      "⚠️ Efetividade é importante, mas o foco principal é VOLUME",
      "",
      "📌 VISÃO GERAL",
      "",
      `✅ ${acimaMeta} vendedor(es) em bom ritmo de volume`,
      `❗ ${abaixoMeta} vendedor(es) ainda abaixo da meta de volume`,
      "⚠️ Há diferença relevante de produtividade na equipe",
      "",
      "👉 Conclusão:",
      "Precisamos aumentar o volume da equipe para melhorar o resultado geral",
      "",
      "👤 ANÁLISE POR VENDEDOR",
      "",
      ordered.map((row) => buildSellerAnalysis(row)).join("\n\n"),
      "",
      "🎯 PLANO DE AÇÃO",
      "",
      "📌 Aumentar volume (PRIORIDADE)",
      `➡️ ${focoVolume || "Sem nomes críticos no momento"}`,
      "",
      "📌 Melhorar qualidade",
      `➡️ ${focoQualidade || "Sem nomes críticos no momento"}`,
      "",
      "📌 Manter padrão",
      `➡️ ${manterPadrao || "Definir referência após próximo ciclo"}`,
      "",
      "📌 Redistribuir carteira",
      `➡️ Avaliar redução de carteira de ${maiorAtencao?.vendedor || "vendedor crítico"}`,
      "➡️ Repassar para vendedores com melhor equilíbrio de volume + efetividade",
      "",
      "🔥 RESUMO FINAL",
      "",
      `👉 Melhor desempenho geral: ${melhorGeral?.vendedor || "-"}`,
      `👉 Maior potencial: ${maiorPotencial?.vendedor || "-"}`,
      `👉 Melhor ajuste rápido: ${melhorAjusteRapido?.vendedor || "-"}`,
      `👉 Maior atenção: ${maiorAtencao?.vendedor || "-"}`,
    ].join("\n");

    setAnalysisText(analysis);
  };

  const handleCopyAnalysis = async () => {
    if (!analysisText) return;
    await navigator.clipboard.writeText(analysisText);
  };

  const getPerformanceVisual = (row: CobrancaRow) => {
    if (row.qtdCobranca >= 481) {
      return {
        nameClass: isDark ? "text-emerald-400" : "text-emerald-700",
        valueClass: isDark ? "text-emerald-300" : "text-emerald-700",
      };
    }

    if (row.qtdCobranca >= 251) {
      return {
        nameClass: isDark ? "text-amber-300" : "text-amber-700",
        valueClass: isDark ? "text-amber-200" : "text-amber-700",
      };
    }

    return {
      nameClass: isDark ? "text-rose-400" : "text-rose-700",
      valueClass: isDark ? "text-rose-300" : "text-rose-700",
    };
  };

  return (
    !isClient ? (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-zinc-800/60" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200/60 dark:bg-zinc-800/60" />
      </div>
    ) : (
    <div className="space-y-8">
      <Tabs defaultValue="atalhos" className="space-y-6">
        <TabsList className={isDark ? "grid w-full grid-cols-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-1" : "grid w-full grid-cols-3 rounded-2xl border border-slate-200 bg-white p-1"}>
          <TabsTrigger value="atalhos" className="rounded-xl">Atalhos</TabsTrigger>
          <TabsTrigger value="meta-matriz" className="rounded-xl">Meta Matriz</TabsTrigger>
          <TabsTrigger value="cobrancas-vendedor" className="rounded-xl">Cobranças Vendedor</TabsTrigger>
        </TabsList>

        <TabsContent value="atalhos" className="space-y-8">
          {sections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <section key={section.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-900/80 p-3" : "rounded-2xl border border-slate-200 bg-white p-3"}>
                    <SectionIcon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                    <p className={isDark ? "text-sm text-zinc-400" : "text-sm text-slate-600"}>{section.description}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {section.items.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={isDark ? "group rounded-2xl border border-white/10 bg-zinc-900/80 p-4 transition-all hover:-translate-y-1 hover:border-indigo-400/60 hover:bg-zinc-900" : "group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"}
                    >
                      <div className="flex items-start gap-4">
                        <div className={isDark ? "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 ring-1 ring-white/10" : "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200"}>
                          <img
                            src={item.iconSrc}
                            alt={item.title}
                            className="h-10 w-10 rounded-xl object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-sm font-semibold leading-5 sm:text-base">{item.title}</h4>
                            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                          <p className={isDark ? "mt-2 text-sm text-zinc-400" : "mt-2 text-sm text-slate-600"}>{item.subtitle}</p>
                          <p className={isDark ? "mt-3 truncate text-xs text-zinc-500" : "mt-3 truncate text-xs text-slate-500"}>{item.url}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </TabsContent>

        <TabsContent value="meta-matriz" className="space-y-6">
          <section className={isDark ? "rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl" : "rounded-3xl border border-slate-200 bg-white p-6 shadow-lg"}>
            <div className="flex items-start gap-4">
              <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950 p-3" : "rounded-2xl border border-slate-200 bg-slate-50 p-3"}>
                <Goal className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Meta Matriz</h3>
                <p className={isDark ? "mt-1 text-sm text-zinc-400" : "mt-1 text-sm text-slate-600"}>
                  Informe a meta diária manualmente. Os demais campos acompanham automaticamente o resultado da guia Metas.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                <Label htmlFor="meta-diaria" className={isDark ? "text-zinc-300" : "text-slate-700"}>Meta diária</Label>
                <Input
                  id="meta-diaria"
                  inputMode="decimal"
                  value={metaDiariaInput}
                  onChange={(event) => setMetaDiariaInput(event.target.value)}
                  placeholder="0,00"
                  className={isDark ? "mt-3 border-white/10 bg-zinc-900 text-zinc-100" : "mt-3 border-slate-300 bg-white text-slate-900"}
                />
                <p className={isDark ? "mt-3 text-xs text-zinc-500" : "mt-3 text-xs text-slate-500"}>
                  Campo com edição manual.
                </p>
              </div>

              <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <p className={isDark ? "text-zinc-300" : "text-slate-700"}>Recebido Hoje</p>
                </div>
                <p className="mt-4 text-2xl font-semibold">{formatCurrency(receivedAmount)}</p>
              </div>

              <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                <p className={isDark ? "text-zinc-300" : "text-slate-700"}>Restante</p>
                <p className="mt-4 text-2xl font-semibold">{formatCurrency(restante)}</p>
              </div>

              <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                <p className={isDark ? "text-zinc-300" : "text-slate-700"}>Percentual</p>
                <p className="mt-4 text-2xl font-semibold">{percentual.toFixed(2)}%</p>
                <div className={isDark ? "mt-4 h-2 rounded-full bg-zinc-800" : "mt-4 h-2 rounded-full bg-slate-200"}>
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${Math.min(percentual, 100)}%` }}
                  />
                </div>
                <p className={isDark ? "mt-3 text-xs text-zinc-500" : "mt-3 text-xs text-slate-500"}>
                  Percentual de atingimento da meta diária.
                </p>
              </div>

            </div>
          </section>
        </TabsContent>

        <TabsContent value="cobrancas-vendedor" className="space-y-6">
          <section className={isDark ? "rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl" : "rounded-3xl border border-slate-200 bg-white p-6 shadow-lg"}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-2xl font-semibold">Cobranças por Vendedor</h3>
                </div>
                <p className={isDark ? "text-sm text-zinc-400" : "text-sm text-slate-600"}>
                  Faça upload da planilha, selecione a loja (somente números) e gere o painel de cobranças.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleDownloadDashboard}
                disabled={!rowsFiltradasPorLoja.length || isGeneratingImage}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                {isGeneratingImage ? "Gerando imagem..." : "Baixar imagem"}
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/70 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                <Label htmlFor="cobrancas-file">Arquivo Excel</Label>
                <Input id="cobrancas-file" type="file" accept=".xlsx,.xls" onChange={handleUploadExcel} className="mt-3" />
                {isUploadingExcel && (
                  <div className="mt-3 space-y-2">
                    <p className={isDark ? "text-xs text-zinc-300 animate-pulse" : "text-xs text-slate-700 animate-pulse"}>
                      Carregando{".".repeat(loadingDots)}
                    </p>
                  </div>
                )}
                <p className={isDark ? "mt-2 text-xs text-zinc-500" : "mt-2 text-xs text-slate-500"}>
                  A leitura considera a primeira aba do arquivo e procura cabeçalho a partir da linha 5.
                </p>
              </div>

              <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/70 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                <Label htmlFor="loja-select">Selecionar Loja</Label>
                <Input
                  id="loja-select"
                  value={selectedLoja}
                  onChange={(event) => setSelectedLoja(event.target.value.replace(/\D/g, ""))}
                  placeholder="Ex.: 10359"
                  className="mt-3"
                  list="lojas-disponiveis"
                />
                <datalist id="lojas-disponiveis">
                  {lojasDisponiveis.map((loja) => (
                    <option key={loja} value={loja} />
                  ))}
                </datalist>
                <p className={isDark ? "mt-2 text-xs text-zinc-500" : "mt-2 text-xs text-slate-500"}>
                  Lojas disponíveis: {lojasDisponiveis.length}
                </p>
              </div>
            </div>

            {uploadError && (
              <p className="mt-4 rounded-xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                {uploadError}
              </p>
            )}

            <div ref={dashboardRef} className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                  <p className={isDark ? "text-zinc-300" : "text-slate-600"}>Vendedores</p>
                  <p className="mt-3 text-3xl font-semibold">{formatNumber(rowsFiltradasPorLoja.length)}</p>
                </div>
                <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                  <p className={isDark ? "text-zinc-300" : "text-slate-600"}>Filas</p>
                  <p className="mt-3 text-3xl font-semibold">{formatNumber(resumoLoja.totalFila)}</p>
                </div>
                <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                  <p className={isDark ? "text-zinc-300" : "text-slate-600"}>Qtd. Cobranças</p>
                  <p className="mt-3 text-3xl font-semibold">{formatNumber(resumoLoja.totalCobrancas)}</p>
                </div>
                <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                  <p className={isDark ? "text-zinc-300" : "text-slate-600"}>Agendamentos</p>
                  <p className="mt-3 text-3xl font-semibold">{formatNumber(resumoLoja.totalAgendamentos)}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-indigo-400">Participação por vendedor</h4>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={105}
                          label={({ name }) => String(name || "").split(" ")[0] || ""}
                        >
                          {pieData.map((_, index) => {
                            const fallbackColor = `hsl(${(index * 31) % 360} 70% 50%)`;
                            return <Cell key={`cell-${index}`} fill={PIE_COLORS[index] ?? fallbackColor} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value) => formatNumber(Number(value || 0))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-indigo-400">Detalhes por vendedor</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleDownloadFullDetails}
                      disabled={!rowsFiltradasPorLoja.length || isGeneratingDetailsImage}
                      className="h-7 px-2 text-xs"
                    >
                      {isGeneratingDetailsImage ? "Baixando..." : "⬇ Detalhes"}
                    </Button>
                  </div>
                  <div className="max-h-[320px] space-y-2 overflow-auto pr-1">
                    {rowsFiltradasPorLoja.map((row) => (
                      <div
                        key={`${row.loja}-${row.vendedor}`}
                        className={isDark ? "rounded-xl border border-white/10 bg-zinc-900/70 p-3" : "rounded-xl border border-slate-200 bg-white p-3"}
                      >
                        <p className={`text-sm font-semibold ${getPerformanceVisual(row).nameClass}`}>{row.vendedor}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                          <p><span className="font-medium">Cobranças:</span> <span className={getPerformanceVisual(row).valueClass}>{formatNumber(row.qtdCobranca)}</span></p>
                          <p><span className="font-medium">Agend. mês:</span> <span className={getPerformanceVisual(row).valueClass}>{formatNumber(row.agendamentosMes)}</span></p>
                          <p><span className="font-medium">Efetividade:</span> <span className={getPerformanceVisual(row).valueClass}>{row.efetividade.toFixed(2)}%</span></p>
                          <p><span className="font-medium">Meta mês:</span> <span className={getPerformanceVisual(row).valueClass}>{formatCurrency(row.metaRecebimento)}</span></p>
                          <p><span className="font-medium">Falta:</span> <span className={getPerformanceVisual(row).valueClass}>{formatNumber(row.faltaCobrancaMes)}</span></p>
                          <p><span className="font-medium">Fila:</span> <span className={getPerformanceVisual(row).valueClass}>{formatNumber(row.fila)}</span></p>
                        </div>
                      </div>
                    ))}
                    {!rowsFiltradasPorLoja.length && (
                      <p className={isDark ? "text-sm text-zinc-500" : "text-sm text-slate-500"}>
                        Selecione uma loja para visualizar os vendedores.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-indigo-400">Analisador de Dados</h4>
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" onClick={handleAnalyzeData}>Analisar dados</Button>
                    <Button type="button" size="sm" variant="outline" disabled={!analysisText} onClick={handleCopyAnalysis}>
                      Copiar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={!analysisText}
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(analysisText)}`, "_blank")}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
                <textarea
                  value={analysisText}
                  onChange={(event) => setAnalysisText(event.target.value)}
                  placeholder={'Clique em "Analisar dados" para gerar uma análise automática da equipe.'}
                  className={isDark ? "mt-3 h-72 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm text-zinc-100" : "mt-3 h-72 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900"}
                />
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <div className="pointer-events-none fixed -left-[10000px] top-0 z-[-1] w-[1400px]">
        <div
          ref={fullDetailsExportRef}
          className={isDark ? "space-y-4 rounded-3xl border border-white/10 bg-zinc-950 p-6 text-zinc-100" : "space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900"}
        >
          <h3 className="text-xl font-semibold">Loja {selectedLoja || "-"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-900/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-indigo-400">Participação por vendedor</h4>
              <div className="flex h-[520px] items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={95}
                      outerRadius={170}
                      label={({ name }) => String(name || "").split(" ")[0] || ""}
                    >
                      {pieData.map((_, index) => {
                        const fallbackColor = `hsl(${(index * 31) % 360} 70% 50%)`;
                        return <Cell key={`export-cell-${index}`} fill={PIE_COLORS[index] ?? fallbackColor} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(Number(value || 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-900/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-indigo-400">Detalhes por vendedor</h4>
              <div className="space-y-2">
                {rowsFiltradasPorLoja.map((row) => (
                  <div
                    key={`export-${row.loja}-${row.vendedor}`}
                    className={isDark ? "rounded-xl border border-white/10 bg-zinc-800/80 p-3" : "rounded-xl border border-slate-200 bg-white p-3"}
                  >
                    <p className={`text-sm font-semibold ${getPerformanceVisual(row).nameClass}`}>{row.vendedor}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <p><span className="font-medium">Cobranças:</span> <span className={getPerformanceVisual(row).valueClass}>{formatNumber(row.qtdCobranca)}</span></p>
                      <p><span className="font-medium">Agend. mês:</span> <span className={getPerformanceVisual(row).valueClass}>{formatNumber(row.agendamentosMes)}</span></p>
                      <p><span className="font-medium">Efetividade:</span> <span className={getPerformanceVisual(row).valueClass}>{row.efetividade.toFixed(2)}%</span></p>
                      <p><span className="font-medium">Meta mês:</span> <span className={getPerformanceVisual(row).valueClass}>{formatCurrency(row.metaRecebimento)}</span></p>
                      <p><span className="font-medium">Falta:</span> <span className={getPerformanceVisual(row).valueClass}>{formatNumber(row.faltaCobrancaMes)}</span></p>
                      <p><span className="font-medium">Fila:</span> <span className={getPerformanceVisual(row).valueClass}>{formatNumber(row.fila)}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  );
};

export default MatrizLinks;
