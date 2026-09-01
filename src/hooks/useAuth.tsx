// src/hooks/useAuth.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const isNetworkError = (error: any) => {
  const message = (error?.message || "").toLowerCase();
  const name = (error?.name || "").toLowerCase();

  return (
    message === "failed to fetch" ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed") ||
    message.includes("timeout") ||
    name === "typeerror" && message.includes("fetch")
  );
};

const getAuthErrorMessage = (error: any, isLoginMode: boolean) => {
  const raw = (error?.message || "").toLowerCase();
  const status = error?.status;

  if (
    raw.includes("invalid login credentials") ||
    raw.includes("invalid credentials") ||
    raw.includes("email not confirmed") === false && status === 400 && isLoginMode
  ) {
    if (raw.includes("email not confirmed")) {
      return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
    }
    return "E-mail ou senha incorretos. Verifique e tente novamente.";
  }

  if (raw.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
  }

  if (raw.includes("user already registered") || raw.includes("already been registered")) {
    return "Este e-mail já está cadastrado. Faça login ou recupere a senha.";
  }

  if (raw.includes("password should be at least") || raw.includes("password is too short")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  if (raw.includes("unable to validate email") || raw.includes("invalid email")) {
    return "E-mail inválido. Verifique o endereço digitado.";
  }

  if (raw.includes("too many requests") || status === 429) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }

  return error?.message || "Ocorreu um erro durante a autenticação.";
};

export const useAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data } = await supabase.auth.getSession();
        console.log("Initial session data:", data);
        if (data.session) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão inicial:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        navigate("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const resetError = () => {
    setErrorMessage("");
    setIsEmailSent(false);
  };

  const handleConnectionError = (error: any) => {
    console.error("Erro de conexão:", error);
    let errorMsg = "Falha ao conectar ao servidor. Verifique sua conexão com a internet e tente novamente.";
    if (retryCount > 0) {
      errorMsg += ` Tentativa ${retryCount} falhou.`;
    }
    setErrorMessage(errorMsg);
    toast({
      title: "Erro de conexão",
      description: errorMsg,
      variant: "destructive",
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetError();

    if (!navigator.onLine) {
      handleConnectionError({ message: "Offline" });
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log("Attempting login with:", { email });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log("Login response:", { data, error });
        if (error) throw error;
        toast({
          title: "Login efetuado com sucesso!",
          description: "Bem vindo ao Meu Fiado.",
        });
      } else {
        console.log("Attempting signup with:", { email });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        console.log("Signup response:", { data, error });
        if (error) throw error;
        setIsEmailSent(true);
        toast({
          title: "Inscrição realizada com sucesso!",
          description: "Verifique seu e-mail para confirmar sua conta.",
        });
      }
    } catch (error: any) {
      console.error("Erro de autenticação:", error);

      // Só trata como erro de conexão se for realmente falha de rede
      if (isNetworkError(error)) {
        handleConnectionError(error);
        setRetryCount((prev) => prev + 1);
        return;
      }

      const friendlyMessage = getAuthErrorMessage(error, isLogin);
      setErrorMessage(friendlyMessage);
      toast({
        title: isLogin ? "Falha no login" : "Falha no cadastro",
        description: friendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log("Initiating Google login, redirectTo:", redirectTo);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      console.log("Google login initial response:", data);
      console.log("Google login initial error:", error);
      if (error) throw error;
    } catch (error: any) {
      console.error("Erro no login com Google:", error);

      if (isNetworkError(error)) {
        handleConnectionError(error);
        return;
      }

      toast({
        title: "Erro",
        description: error.message || "Falha ao efetuar login com o Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    isLogin,
    setIsLogin,
    errorMessage,
    isEmailSent,
    isCheckingSession,
    handleAuth,
    handleGoogleLogin,
    resetError,
  };
};
