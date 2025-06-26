import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Controle de Inadimplência</h1>
          <p className="text-sm text-gray-600">
            {isLogin ? "Faça login na sua conta" : "Crie sua conta"}
          </p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); resetError(); }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); resetError(); }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? "Login" : "Cadastrar"}
          </Button>
          {/* Botão de Login com Google */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login com Google"}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); resetError(); }}
              className="text-blue-600 hover:text-blue-800"
            >
              {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
            </button>
            {!isLogin && (
              <button
                type="button"
                onClick={() => {/* Adicione lógica para "Esqueceu a senha" se desejar */}}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Esqueceu a senha?
              </button>
            )}
          </div>
          {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
          {isEmailSent && <p className="text-green-600 text-sm">E-mail de confirmação enviado!</p>}
        </form>
      </div>
    </div>
  );
}
