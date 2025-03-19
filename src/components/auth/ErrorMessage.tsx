
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  isLoading: boolean;
  isEmailSent: boolean;
  handleResendConfirmation: () => void;
  handleRetry: (e: React.FormEvent) => void | Promise<void>;
}

export const ErrorMessage = ({
  message,
  isLoading,
  isEmailSent,
  handleResendConfirmation,
  handleRetry
}: ErrorMessageProps) => {
  if (!message) return null;
  
  return (
    <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200 text-sm">
      <Info className="h-4 w-4 mr-2" />
      <AlertDescription>{message}</AlertDescription>
      {message.includes("não confirmado") && (
        <Button 
          variant="link" 
          className="p-0 h-auto text-amber-800 underline mt-2" 
          onClick={handleResendConfirmation}
          disabled={isLoading || isEmailSent}
        >
          {isEmailSent ? "Email reenviado!" : "Reenviar email de confirmação"}
        </Button>
      )}
      {message.includes("conexão") && (
        <Button 
          variant="link" 
          className="p-0 h-auto text-amber-800 underline mt-2" 
          onClick={(e) => handleRetry(e)}
          disabled={isLoading}
        >
          Tentar novamente
        </Button>
      )}
    </Alert>
  );
};
