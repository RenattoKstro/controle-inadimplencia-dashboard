
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Auth = () => {
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
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

  const handleResendConfirmation = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      setIsEmailSent(true);
      toast({
        title: "Email reenviado",
        description: "Verifique sua caixa de entrada para confirmar seu email.",
      });
    } catch (error: any) {
      console.error('Erro ao reenviar email:', error);
      
      if (!navigator.onLine) {
        handleConnectionError({ message: "Browser is offline" });
        return;
      }
      
      if (error.message === "Failed to fetch" || error.__isAuthError) {
        handleConnectionError(error);
        setRetryCount(prev => prev + 1);
      } else {
        let errorMsg = error.message || "Ocorreu um erro ao reenviar o email.";
        setErrorMessage(errorMsg);
        toast({
          title: "Erro",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
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
            emailRedirectTo: window.location.origin + '/auth'
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

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg p-8 text-center">
          <div className="animate-pulse">Verificando sessão...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            Controle de Inadimplência
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Entre com sua conta" : "Crie sua conta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200 text-sm">
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription>{errorMessage}</AlertDescription>
              {errorMessage.includes("não confirmado") && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-800 underline mt-2" 
                  onClick={handleResendConfirmation}
                  disabled={isLoading || isEmailSent}
                >
                  {isEmailSent ? "Email reenviado!" : "Reenviar email de confirmação"}
                </Button>
              )}
              {errorMessage.includes("conexão") && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-800 underline mt-2" 
                  onClick={handleAuth}
                  disabled={isLoading}
                >
                  Tentar novamente
                </Button>
              )}
            </Alert>
          )}
          {isEmailSent && !isLogin && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 text-sm">
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription>
                Email de confirmação enviado. Por favor, verifique sua caixa de entrada.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            variant="link" 
            className="w-full text-sm" 
            onClick={() => {
              setIsLogin(!isLogin);
              resetError();
            }}
          >
            {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
