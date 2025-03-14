
import { useState } from "react";
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const resetError = () => {
    setErrorMessage("");
    setIsEmailSent(false);
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
      setErrorMessage(error.message || "Ocorreu um erro ao reenviar o email.");
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao reenviar o email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetError();
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
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
        
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        setIsEmailSent(true);
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Por favor, verifique seu email para confirmar o cadastro.",
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro durante a autenticação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
