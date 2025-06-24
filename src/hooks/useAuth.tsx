import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const resetError = () => {
    setErrorMessage("");
    setIsEmailSent(false);
  };

  const handleConnectionError = (error: any) => {
    console.error('Erro de conexão:', error);
    let errorMsg = "Falha na conexão com o servidor. Verifique sua internet.";
    if (retryCount > 0) errorMsg += ` Tentativa ${retryCount} falhou.`;
    setErrorMessage(errorMsg);
    toast({ title: "Erro de conexão", description: errorMsg, variant: "destructive" });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetError();

    if (!navigator.onLine) {
      handleConnectionError({ message: "Browser is offline" });
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Login realizado!", description: "Bem-vindo ao dashboard." });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: 'https://cotroledeinadimpleciateste.netlify.app/auth' },
        });
        if (error) throw error;
        setIsEmailSent(true);
        toast({ title: "Cadastro realizado!", description: "Confirme seu e-mail." });
      }
    } catch (error: any) {
      console.error('Erro durante autenticação:', error);
      if (error.message === "Failed to fetch" || error.__isAuthError) {
        handleConnectionError(error);
        setRetryCount(prev => prev + 1);
      } else {
        setErrorMessage(error.message);
        toast({ title: "Erro", description: error.message || "Erro na autenticação.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Nova função para login com Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://cotroledeinadimpleciateste.netlify.app/auth',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      toast({ title: "Erro", description: error.message || "Falha ao logar com Google.", variant: "destructive" });
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
    handleGoogleLogin, // Adicionada
    resetError,
  };
};
