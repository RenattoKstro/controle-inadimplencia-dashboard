import { Chrome, ExternalLink, Sparkles } from "lucide-react";

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

const MatrizLinks = () => {
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="space-y-8">
      <div className={isDark ? "rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl" : "rounded-3xl border border-slate-200 bg-white p-6 shadow-lg"}>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Matriz de Atalhos
        </h2>
        <p className={isDark ? "mt-2 text-zinc-400" : "mt-2 text-slate-600"}>
          Links rápidos para Aciona One, extensões do Chrome e ferramentas de IA.
        </p>
      </div>

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
    </div>
  );
};

export default MatrizLinks;
