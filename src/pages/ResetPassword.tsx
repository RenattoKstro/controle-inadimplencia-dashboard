import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react'; // Adicionado para consistência com outros componentes

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({
        title: 'Senha redefinida',
        description: 'Sua senha foi atualizada com sucesso.',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao redefinir a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            Redefinir Senha
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="new-password" className="text-sm font-medium text-slate-700">
                Nova Senha
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                required
                className="h-11 font-semibold border-blue-200 focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white text-base"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redefinir Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
