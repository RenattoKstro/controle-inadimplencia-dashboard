
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
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
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Por favor, verifique seu email para confirmar o cadastro.",
        });
      }
    } catch (error: any) {
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Controle de Inadimplência
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Entre com sua conta" : "Crie sua conta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            variant="link" 
            className="w-full" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
