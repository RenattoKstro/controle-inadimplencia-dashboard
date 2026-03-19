import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Send, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ChatUser = {
  user_id?: string | null;
  nome_usuario?: string | null;
  filial?: number | string | null;
  avatar_url?: string | null;
  membro?: boolean | null;
  role?: string | null;
};

type ChatMessage = Tables<"member_chat_messages">;

type MemberChatProps = {
  userData: ChatUser | null;
  isDark: boolean;
};

const CHAT_TABLE = "member_chat_messages" as const;
const MESSAGE_TTL_MS = 60 * 60 * 1000;
const REFRESH_INTERVAL_MS = 15 * 1000;

const normalizeFilial = (filial: ChatUser["filial"]) => {
  if (filial === null || filial === undefined || filial === "") return "Sem filial";
  const numeric = Number(filial);
  if (Number.isFinite(numeric)) return `Filial ${String(numeric).padStart(5, "0")}`;
  return `Filial ${String(filial)}`;
};

const getInitials = (name?: string | null) =>
  (name || "Membro")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "M";

const getRemainingLabel = (expiresAt: string) => {
  const parsedDate = parseISO(expiresAt);
  if (Number.isNaN(parsedDate.getTime())) return "Expira em breve";

  if (parsedDate.getTime() <= Date.now()) return "Expirando";

  return `Expira em ${formatDistanceToNowStrict(parsedDate, {
    locale: ptBR,
    addSuffix: false,
    roundingMethod: "floor",
  })}`;
};

const MemberChat = ({ userData, isDark }: MemberChatProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chatUnavailable, setChatUnavailable] = useState(false);
  const [tick, setTick] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const isMembro = useMemo(
    () => Boolean(userData?.membro) || (userData?.role || "").toLowerCase() === "membro",
    [userData?.membro, userData?.role]
  );

  const currentUserId = userData?.user_id || null;

  const purgeExpiredMessages = useCallback(async () => {
    const { error } = await supabase
      .from(CHAT_TABLE)
      .delete()
      .lte("expires_at", new Date().toISOString());

    if (error) {
      const message = (error.message || "").toLowerCase();
      if (message.includes("does not exist") || message.includes("could not find")) {
        setChatUnavailable(true);
      }
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!isMembro || chatUnavailable) return;

    setLoading(true);

    await purgeExpiredMessages();

    const { data, error } = await supabase
      .from(CHAT_TABLE)
      .select("id, user_id, message, created_at, expires_at, author_name, author_filial, author_avatar_url")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      const lowered = (error.message || "").toLowerCase();
      if (lowered.includes("does not exist") || lowered.includes("could not find")) {
        setChatUnavailable(true);
        setMessages([]);
        return;
      }

      toast({
        title: "Erro ao carregar chat",
        description: "Não foi possível buscar as mensagens agora.",
        variant: "destructive",
      });
      return;
    }

    setMessages((data || []) as ChatMessage[]);
    setChatUnavailable(false);
    setLoading(false);
  }, [chatUnavailable, isMembro, purgeExpiredMessages, toast]);

  useEffect(() => {
    if (!open || !isMembro || chatUnavailable) return;

    fetchMessages();

    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
      fetchMessages();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [open, isMembro, chatUnavailable, fetchMessages]);

  useEffect(() => {
    if (!open || !isMembro || chatUnavailable) return;

    const channel = supabase
      .channel("member-chat-room")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: CHAT_TABLE },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [open, isMembro, chatUnavailable, fetchMessages]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isMembro) {
      toast({
        title: "Acesso restrito",
        description: "Apenas membro tem acesso ao chat.",
        variant: "destructive",
      });
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage || !currentUserId) return;

    setSubmitting(true);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + MESSAGE_TTL_MS).toISOString();

    await purgeExpiredMessages();

    const { error } = await supabase.from(CHAT_TABLE).insert({
      user_id: currentUserId,
      message: trimmedMessage,
      expires_at: expiresAt,
      author_name: userData?.nome_usuario || "Membro",
      author_filial: normalizeFilial(userData?.filial),
      author_avatar_url: userData?.avatar_url || null,
    });

    if (error) {
      const lowered = (error.message || "").toLowerCase();
      if (lowered.includes("does not exist") || lowered.includes("could not find")) {
        setChatUnavailable(true);
        toast({
          title: "Chat indisponível",
          description: "A tabela do chat ainda não foi criada no Supabase.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao enviar mensagem",
          description: "Tente novamente em instantes.",
          variant: "destructive",
        });
      }
      setSubmitting(false);
      return;
    }

    setMessage("");
    setSubmitting(false);
    fetchMessages();
  };

  const panelClasses = isDark
    ? "border-white/10 bg-zinc-950 text-zinc-100"
    : "border-slate-200 bg-white text-slate-900";

  const mutedTextClasses = isDark ? "text-zinc-400" : "text-slate-500";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 z-[70] h-14 w-14 rounded-full shadow-2xl transition-transform hover:scale-105",
            isDark
              ? "border border-white/10 bg-indigo-600 text-white hover:bg-indigo-500"
              : "border border-indigo-200 bg-indigo-600 text-white hover:bg-indigo-500"
          )}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Abrir chat de membros</span>
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("w-[calc(100vw-2rem)] max-w-md rounded-3xl border p-0 sm:right-6 sm:top-auto sm:translate-x-0 sm:translate-y-0", panelClasses)}>
        <DialogHeader className={cn("border-b px-5 py-4", isDark ? "border-white/10" : "border-slate-200")}>
          <DialogTitle className="flex items-center gap-3 text-left text-base">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700")}>
              <MessageCircle className="h-5 w-5" />
            </span>
            <span>
              Chat de membros
              <span className={cn("mt-1 block text-xs font-normal", mutedTextClasses)}>
                Mensagens somem automaticamente após 1 hora.
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>

        {!isMembro ? (
          <div className="px-5 py-10 text-center">
            <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full", isDark ? "bg-amber-500/15 text-amber-300" : "bg-amber-100 text-amber-700")}>
              <ShieldAlert className="h-7 w-7" />
            </div>
            <p className="text-lg font-semibold">Apenas membro tem acesso ao chat</p>
            <p className={cn("mt-2 text-sm", mutedTextClasses)}>
              O botão fica visível para todos, mas somente usuários marcados como membros pelo admin podem conversar.
            </p>
          </div>
        ) : chatUnavailable ? (
          <div className="px-5 py-10 text-center">
            <p className="text-lg font-semibold">Chat indisponível</p>
            <p className={cn("mt-2 text-sm", mutedTextClasses)}>
              Falta criar a tabela <code className="rounded bg-black/10 px-1 py-0.5">member_chat_messages</code> no Supabase para ativar as mensagens compartilhadas.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[22rem] px-5 py-4">
              <div className="space-y-3">
                {loading && messages.length === 0 ? (
                  <p className={cn("text-sm", mutedTextClasses)}>Carregando mensagens...</p>
                ) : messages.length === 0 ? (
                  <div className={cn("rounded-2xl border border-dashed p-4 text-sm", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50") }>
                    Nenhuma mensagem ativa no momento. Envie a primeira conversa da equipe.
                  </div>
                ) : (
                  messages.map((chatMessage) => {
                    const isOwnMessage = chatMessage.user_id === currentUserId;

                    return (
                      <div
                        key={chatMessage.id}
                        className={cn(
                          "flex gap-3 rounded-2xl border p-3",
                          isOwnMessage
                            ? isDark
                              ? "border-indigo-400/30 bg-indigo-500/10"
                              : "border-indigo-200 bg-indigo-50"
                            : isDark
                              ? "border-white/10 bg-white/5"
                              : "border-slate-200 bg-slate-50"
                        )}
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                          {chatMessage.author_avatar_url ? (
                            <img src={chatMessage.author_avatar_url} alt={chatMessage.author_name || "Membro"} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                              {getInitials(chatMessage.author_name)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="font-semibold">{chatMessage.author_name || "Membro"}</p>
                            <span className={cn("text-xs", mutedTextClasses)}>{chatMessage.author_filial || "Sem filial"}</span>
                            <span className={cn("text-[11px]", mutedTextClasses)}>
                              {getRemainingLabel(chatMessage.expires_at)}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{chatMessage.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className={cn("border-t px-5 py-4", isDark ? "border-white/10" : "border-slate-200")}>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escreva sua mensagem para os membros..."
                maxLength={400}
                className={cn(
                  "min-h-[92px] resize-none rounded-2xl border",
                  isDark ? "border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500" : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                )}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className={cn("text-xs", mutedTextClasses)}>
                  Atualização automática a cada 15s. {tick > 0 ? `Última atualização recente.` : ""}
                </p>
                <Button type="submit" disabled={submitting || !message.trim()} className="gap-2 rounded-full px-5">
                  <Send className="h-4 w-4" />
                  Enviar
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemberChat;
