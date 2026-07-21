import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatViewer = {
  user_id?: string;
  nome_usuario?: string;
  avatar_url?: string;
  filial?: number | string | null;
};

type ChatMessageRow = {
  id: string | number;
  created_at?: string | null;
  user_id?: string | null;
  nome_usuario?: string | null;
  user_name?: string | null;
  avatar_url?: string | null;
  user_avatar_url?: string | null;
  filial?: number | string | null;
  user_filial?: number | string | null;
  mensagem?: string | null;
  message?: string | null;
  recipient_user_id?: string | null;
  target_user_id?: string | null;
  is_private?: boolean | null;
  chat_type?: string | null;
  scope?: string | null;
};

const CHAT_TABLE = "member_chat_messages";
const ONE_HOUR_MS = 60 * 60 * 1000;

const formatTime = (dateString?: string | null) => {
  if (!dateString) return "agora";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

const getInitials = (name?: string | null) => {
  if (!name) return "M";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const MemberChatWidget = ({
  viewer,
}: {
  viewer: ChatViewer;
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState<string>(new Date().toISOString());
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async () => {
    setLoading(true);

    const cutoff = new Date(Date.now() - ONE_HOUR_MS).toISOString();
    await supabase.from(CHAT_TABLE).delete().lt("created_at", cutoff);

    const { data } = await supabase
      .from(CHAT_TABLE)
      .select("*")
      .order("created_at", { ascending: true });

    setMessages((data as ChatMessageRow[] | null) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();

    const interval = setInterval(loadMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("member-chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: CHAT_TABLE },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sortedMessages = useMemo(() => messages.slice().sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return aTime - bTime;
  }), [messages]);

  useEffect(() => {
    if (open) {
      setLastSeenAt(new Date().toISOString());
    }
  }, [open, sortedMessages.length]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);
  const isPrivateMessage = (message: ChatMessageRow) => (
    Boolean(message.is_private)
    || (message.chat_type || "").toLowerCase() === "private"
    || (message.scope || "").toLowerCase() === "private"
    || Boolean(message.recipient_user_id)
    || Boolean(message.target_user_id)
  );

  const visibleMessages = useMemo(() => {
    return sortedMessages.filter((message) => !isPrivateMessage(message));
  }, [sortedMessages]);

  const unreadCount = useMemo(() => {
    const seenAt = new Date(lastSeenAt).getTime();

    return sortedMessages.filter((message) => {
      const createdAt = message.created_at ? new Date(message.created_at).getTime() : 0;
      const isOwn = message.user_id && viewer.user_id && message.user_id === viewer.user_id;
      const visibleToViewer = !isPrivateMessage(message);

      return !isOwn && visibleToViewer && createdAt > seenAt;
    }).length;
  }, [sortedMessages, lastSeenAt, viewer.user_id]);

  const buildPayloads = (chatText: string) => {
    const filialNumber = viewer.filial ? Number(viewer.filial) : null;
    const basePublicPayloads = [
      {
        user_id: viewer.user_id,
        nome_usuario: viewer.nome_usuario || "Usuário",
        avatar_url: viewer.avatar_url || null,
        filial: filialNumber,
        mensagem: chatText,
      },
      {
        user_id: viewer.user_id,
        user_name: viewer.nome_usuario || "Usuário",
        user_avatar_url: viewer.avatar_url || null,
        user_filial: filialNumber,
        message: chatText,
      },
      {
        user_id: viewer.user_id,
        nome_usuario: viewer.nome_usuario || "Usuário",
        avatar_url: viewer.avatar_url || null,
        filial: filialNumber,
        message: chatText,
      },
      {
        user_id: viewer.user_id,
        user_name: viewer.nome_usuario || "Usuário",
        user_avatar_url: viewer.avatar_url || null,
        user_filial: filialNumber,
        mensagem: chatText,
      },
      {
        user_id: viewer.user_id,
        nome_usuario: viewer.nome_usuario || "Usuário",
        avatar_url: viewer.avatar_url || null,
        filial: filialNumber,
        content: chatText,
      },
    ];

    return basePublicPayloads;
  };

  const handleSend = async () => {
    if (!text.trim() || !viewer.user_id) return;
    setSending(true);

    const chatText = text.trim();
    const payloads = buildPayloads(chatText);

    let lastError: { message?: string } | null = null;
    for (const payload of payloads) {
      const { error } = await supabase.from(CHAT_TABLE).insert(payload as never);
      if (!error) {
        setSending(false);
        setText("");
        loadMessages();
        return;
      }
      lastError = error;
    }

    setSending(false);
    alert(lastError?.message || "Não foi possível enviar a mensagem no chat.");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={isDark
          ? "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl transition hover:bg-indigo-500"
          : "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl transition hover:bg-indigo-500"
        }
        aria-label="Abrir chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={isDark
          ? "fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
          : "fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        }>
          <div className={isDark
            ? "flex items-center justify-between border-b border-white/10 bg-zinc-900/90 px-4 py-3"
            : "flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"
          }>
            <div>
              <p className="font-semibold">Chat</p>
              <p className={isDark ? "text-xs text-zinc-400" : "text-xs text-slate-500"}>
                Mensagens expiram automaticamente em 1 hora.
              </p>
            </div>
            <MessageCircle className="h-5 w-5 text-indigo-400" />
          </div>

          <div className={isDark ? "flex-1 space-y-3 overflow-y-auto bg-zinc-950 px-4 py-4" : "flex-1 space-y-3 overflow-y-auto bg-white px-4 py-4"}>
                {loading ? (
                  <p className={isDark ? "text-sm text-zinc-400" : "text-sm text-slate-500"}>Carregando mensagens...</p>
                ) : visibleMessages.length === 0 ? (
                  <p className={isDark ? "text-sm text-zinc-400" : "text-sm text-slate-500"}>Nenhuma mensagem por enquanto.</p>
                ) : (
                  visibleMessages.map((message) => {
                    const nome = message.nome_usuario || message.user_name || "Usuário";
                    const avatar = message.avatar_url || message.user_avatar_url || null;
                    const filial = message.filial || message.user_filial;
                    const body = message.mensagem || message.message || "";
                    const own = message.user_id && viewer.user_id && message.user_id === viewer.user_id;

                    return (
                      <div key={String(message.id)} className={own ? "flex justify-end" : "flex justify-start"}>
                        <div className={isDark
                          ? `max-w-[85%] rounded-2xl border px-3 py-3 ${own ? "border-indigo-500/40 bg-indigo-500/15" : "border-white/10 bg-zinc-900"}`
                          : `max-w-[85%] rounded-2xl border px-3 py-3 ${own ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-slate-50"}`
                        }>
                          <button
                            type="button"
                            className="mb-2 flex items-center gap-2 text-left"
                          >
                            {avatar ? (
                              <img src={avatar} alt={nome} className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
                                {getInitials(nome)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold leading-none">{nome}</p>
                              <p className={isDark ? "text-[11px] text-zinc-400" : "text-[11px] text-slate-500"}>
                                Filial {String(filial || "00000").padStart(5, "0")} • {formatTime(message.created_at)}
                              </p>
                            </div>
                          </button>
                          <p className={isDark ? "text-sm text-zinc-100" : "text-sm text-slate-800"}>{body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
          </div>

          <div className={isDark
            ? "border-t border-white/10 bg-zinc-900/90 px-4 py-3"
            : "border-t border-slate-200 bg-slate-50 px-4 py-3"
          }>
                <div className="flex items-center gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Digite sua mensagem"
                    className={isDark ? "border-white/10 bg-zinc-950 text-zinc-100" : "border-slate-300 bg-white text-slate-900"}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button onClick={handleSend} disabled={sending || !text.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberChatWidget;
