
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  isLogin: boolean;
  handleAuth: (e: React.FormEvent) => void;
}

export const AuthForm = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  isLogin,
  handleAuth
}: AuthFormProps) => {
  return (
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
  );
};
