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

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data } = await supabase.auth.getSession();
        console.log("Session data:", data);
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
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
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
    console.error('Erro de conexão:', error);
    
    let errorMsg = "Falha na conexão com o servidor. Verifique sua conexão de internet e tente novamente.";
    
    if (retryCount > 0) {
      errorMsg += ` Tentativa ${retryCount} de conexão falhou.`;
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
    
    // First check if browser is online
    if (!navigator.onLine) {
      handleConnectionError({ message: "Browser is offline" });
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
        
        if (error) {
          if (error.message === "Invalid login credentials") {
            throw new Error("Email ou senha incorretos. Verifique suas credenciais.");
          } else if (error.message.includes("Email not confirmed")) {
            throw new Error("Email não confirmado. Por favor, verifique seu email para confirmar o cadastro.");
          } else {
            throw error;
          }
        }
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Dashboard de Controle de Inadimplência.",
        });
        
        // Navigation is handled by the useEffect listener for auth state changes
      } else {
        console.log("Attempting signup with:", { email });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://cotroledeinadimpleciateste.netlify.app/auth',
          }
        });
        
        console.log("Signup response:", { data, error });
        
        if (error) throw error;
        
        setIsEmailSent(true);
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Por favor, verifique seu email para confirmar o cadastro.",
        });
      }
    } catch (error: any) {
      console.error('Erro durante autenticação:', error);
      
      if (error.message === "Failed to fetch" || error.__isAuthError) {
        handleConnectionError(error);
        setRetryCount(prev => prev + 1);
      } else {
        // Handle other errors
        setErrorMessage(error.message);
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro durante a autenticação.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para login com Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      console.log("Attempting Google login with redirectTo:", 'https://cotroledeinadimpleciateste.netlify.app/auth/callback');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://cotroledeinadimpleciateste.netlify.app/auth/callback',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao logar com Google.",
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
    resetError
  };
};
