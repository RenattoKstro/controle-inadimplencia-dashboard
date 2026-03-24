import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Camera, Chrome, ExternalLink, Goal, Sparkles, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
    title: "Aciona One",
    description: "Atalhos rápidos para o dashboard e operador da Aciona.",
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

const MatrizLinks = ({ userId, receivedAmount = 0 }: MatrizLinksProps) => {
  const isDark = document.documentElement.classList.contains("dark");
  const [metaDiariaInput, setMetaDiariaInput] = useState("0");
  const [cobrancasRows, setCobrancasRows] = useState<CobrancaRow[]>([]);
  const [selectedLoja, setSelectedLoja] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const dashboardRef = useRef<HTMLDivElement | null>(null);

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

  const chartData = useMemo(() => rowsFiltradasPorLoja.map((row) => ({
    vendedor: row.vendedor.split(" ").slice(0, 2).join(" "),
    fila: row.fila,
    cobrancas: row.qtdCobranca,
    agendamentos: row.agendamentosMes,
  })), [rowsFiltradasPorLoja]);

  const pieData = useMemo(() => {
    if (!selectedLoja) return [];
    return [
      { name: "Meta", value: resumoLoja.totalMeta },
      { name: "Recebido", value: resumoLoja.totalRecebido },
      { name: "Falta", value: Math.max(0, resumoLoja.totalMeta - resumoLoja.totalRecebido) },
    ];
  }, [resumoLoja, selectedLoja]);

  const handleUploadExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
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

      const headerRowIndex = matrixRows.findIndex((row) =>
        hasAnyCandidate(row[0], ["situacao"]) &&
        hasAnyCandidate(row[1], columnsMatchers.vendedor) &&
        hasAnyCandidate(row[2], columnsMatchers.loja)
      );

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
          efetividade: efetividadeIndex >= 0 ? parseNumericValue(row[efetividadeIndex]) : 0,
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
    } catch {
      setUploadError("Erro ao processar o arquivo. Envie um Excel válido (.xlsx ou .xls).");
      setCobrancasRows([]);
    } finally {
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

  return (
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
                <p className={isDark ? "mt-2 text-xs text-zinc-500" : "mt-2 text-xs text-slate-500"}>
                  A leitura considera a primeira aba do arquivo.
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
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-indigo-400">Cobranças por vendedor</h4>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#3f3f46" : "#cbd5e1"} />
                        <XAxis dataKey="vendedor" tick={{ fontSize: 11 }} stroke={isDark ? "#e4e4e7" : "#1e293b"} />
                        <YAxis stroke={isDark ? "#e4e4e7" : "#1e293b"} />
                        <Tooltip />
                        <Bar dataKey="cobrancas" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="agendamentos" fill="#22c55e" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={isDark ? "rounded-2xl border border-white/10 bg-zinc-950/80 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-indigo-400">Meta x Recebido</h4>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={70}
                          outerRadius={100}
                          label={(item) => `${item.name}: ${formatCurrency(Number(item.value || 0))}`}
                        />
                        <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatrizLinks;
