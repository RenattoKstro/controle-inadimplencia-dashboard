```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { EmailSentMessage } from '@/components/auth/EmailSentMessage';
import { AuthForm } from '@/components/auth/AuthForm';
import { LoadingSession } from '@/components/auth/LoadingSession';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    resetError,
  } = useAuth();
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [isRecoverLoading, setIsRecoverLoading] = useState(false);
  const [recoverMessage, setRecoverMessage] = useState('');
  const { toast } = useToast();

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecoverLoading(true);
    setRecoverMessage('');

    try {
      if (!navigator.onLine) {
        throw new Error('Sem conexão com a internet. Verifique sua rede e tente novamente.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(recoverEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setRecoverMessage('Se o e-mail estiver cadastrado, você receberá um link de recuperação.');
      setRecoverEmail('');
      setIsRecoverOpen(false);
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada para o link de recuperação.',
      });
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao enviar e-mail de recuperação.';
      setRecoverMessage(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsRecoverLoading(false);
    }
  };

  if (isCheckingSession) {
    return <LoadingSession />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            Controle de Inadimplência
          </CardTitle>
          <CardDescription className="text-center text-blue-100">
            {isLogin ? 'Entre com sua conta' : 'Crie sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <ErrorMessage
            message={errorMessage}
            isLoading={isLoading}
            isEmailSent={isEmailSent}
            handleResendConfirmation={handleResendConfirmation}
            handleRetry={handleAuth}
          />
          <EmailSentMessage isEmailSent={isEmailSent} isLogin={isLogin} />
          <AuthForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            isLogin={isLogin}
            handleAuth={handleAuth}
          />
          {isLogin && (
            <div className="mt-4 text-right">
              <Dialog open={isRecoverOpen} onOpenChange={setIsRecoverOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-blue-500 hover:text-blue-600 p-0 h-auto text-sm">
                    Esqueceu a senha?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Recuperar Senha</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRecoverPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="recover-email" className="text-sm font-medium text-slate-700">
                        Digite seu e-mail
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <Input
                          id="recover-email"
                          type="email"
                          value={recoverEmail}
                          onChange={(e) => setRecoverEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="h-11 font-semibold border-blue-200 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    {recoverMessage && (
                      <p className={recoverMessage.includes('Erro') ? 'text-sm text-red-600' : 'text-sm text-green-600'}>
                        {recoverMessage}
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white text-base"
                      disabled={isRecoverLoading}
                    >
                      {isRecoverLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar Link de Recuperação'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            className="w-full text-sm text-blue-500 hover:text-blue-600"
            onClick={() => {
              setIsLogin(!isLogin);
              resetError();
            }}
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
```
