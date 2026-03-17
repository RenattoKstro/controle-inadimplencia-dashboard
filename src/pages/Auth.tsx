import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Mail, Lock } from "lucide-react";

export default function Auth() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    isLogin,
    setIsLogin,
    errorMessage,
    isEmailSent,
    handleAuth,
    handleGoogleLogin,
    resetError,
  } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/85 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-xs">
            <Shield className="h-3.5 w-3.5" /> Acesso Seguro
          </div>
          <h1 className="text-2xl font-bold">Meu Fiado</h1>
          <p className="text-sm text-zinc-400">
            {isLogin ? "Faça login na sua conta" : "Crie sua conta"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300">E-mail</label>
            <div className="mt-1 relative">
              <Mail className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  resetError();
                }}
                className="h-11 pl-9 pr-3 block w-full rounded-md bg-zinc-950 border border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">Senha</label>
            <div className="mt-1 relative">
              <Lock className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  resetError();
                }}
                className="h-11 pl-9 pr-3 block w-full rounded-md bg-zinc-950 border border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-500" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? "Entrar" : "Cadastrar"}
          </Button>

          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-11 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar com Google"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetError();
              }}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
            </button>
          </div>

          {errorMessage && <p className="text-rose-400 text-sm">{errorMessage}</p>}
          {isEmailSent && <p className="text-emerald-400 text-sm">E-mail de confirmação enviado!</p>}
        </form>
      </div>
    </div>
  );
}
