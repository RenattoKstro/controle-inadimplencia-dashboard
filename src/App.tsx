import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import { supabase } from "./integrations/supabase/client";

// Componente para lidar com o callback do OAuth
const Callback: React.FC = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Callback started, current URL:", window.location.href);
        console.log("Search params:", new URLSearchParams(window.location.search));

        const { data, error } = await supabase.auth.getSession();
        console.log("Callback session data:", data);
        console.log("Callback error:", error);

        if (error) {
          console.error("Error during callback:", error.message);
          throw new Error(`Falha no callback: ${error.message}`);
        } else if (data.session) {
          console.log("Session established, redirecting to dashboard...");
          window.location.href = "/dashboard";
        } else {
          console.log("No session found, redirecting to auth...");
          window.location.href = "/auth";
        }
      } catch (error: any) {
        console.error("Unexpected error in callback:", error);
        window.location.href = "/auth?error=" + encodeURIComponent(error.message);
      }
    };
    handleCallback();
  }, []);

  return <div>Processando login... Redirecionando...</div>; // Placeholder
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<Callback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
