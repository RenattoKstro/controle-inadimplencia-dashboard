
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface EmailSentMessageProps {
  isEmailSent: boolean;
  isLogin: boolean;
}

export const EmailSentMessage = ({ isEmailSent, isLogin }: EmailSentMessageProps) => {
  if (!isEmailSent || isLogin) return null;
  
  return (
    <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 text-sm">
      <Info className="h-4 w-4 mr-2" />
      <AlertDescription>
        Email de confirmação enviado. Por favor, verifique sua caixa de entrada.
      </AlertDescription>
    </Alert>
  );
};
