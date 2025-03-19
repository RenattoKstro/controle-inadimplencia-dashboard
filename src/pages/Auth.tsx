
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ErrorMessage } from "@/components/auth/ErrorMessage";
import { EmailSentMessage } from "@/components/auth/EmailSentMessage";
import { AuthForm } from "@/components/auth/AuthForm";
import { LoadingSession } from "@/components/auth/LoadingSession";

const Auth = () => {
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
    isCheckingSession,
    handleAuth,
    handleResendConfirmation,
    resetError
  } = useAuth();

  // Show loading state while checking session
  if (isCheckingSession) {
    return <LoadingSession />;
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
          <ErrorMessage 
            message={errorMessage}
            isLoading={isLoading}
            isEmailSent={isEmailSent}
            handleResendConfirmation={handleResendConfirmation}
            handleRetry={(e) => {
              // Fix to ensure we handle both void and Promise<void> returns
              const result = handleAuth(e);
              // TypeScript will no longer complain because we're not directly returning the Promise
            }}
          />
          <EmailSentMessage 
            isEmailSent={isEmailSent} 
            isLogin={isLogin} 
          />
          <AuthForm 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            isLogin={isLogin}
            handleAuth={handleAuth}
          />
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
