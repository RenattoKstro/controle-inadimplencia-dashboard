import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import { supabase } from "./integrations/supabase/client";

const Callback: React.FC = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Callback started, current URL:", window.location.href);
        console.log("Search params:", Object.fromEntries(new URLSearchParams(window.location.search)));

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Callback session data:", session);
        console.log("Callback session error:", sessionError);

        if (sessionError) {
          console.error("Session error details:", sessionError);
          throw new Error(`Falha na sessão: ${sessionError.message}`);
        } else if (session) {
          console.log("Session established, user:", session.user);
          window.location.href = "/dashboard";
        } else {
          console.log("No session, checking user...");
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          console.log("Callback user data:", user);
          console.log("Callback user error:", userError);
          if (userError) {
            console.error("User error details:", userError);
            throw new Error(`Falha no usuário: ${userError.message}`);
          } else if (user) {
            console.log("User found, redirecting to dashboard...");
            window.location.href = "/dashboard";
          } else {
            console.log("No user or session, redirecting to auth with details...");
            window.location.href = "/auth?error=login_failed_no_user&details=" + encodeURIComponent(JSON.stringify({ sessionError, userError }));
          }
        }
      } catch (error: any) {
        console.error("Unexpected error in callback:", error);
        window.location.href = "/auth?error=" + encodeURIComponent(error.message) + "&details=" + encodeURIComponent(JSON.stringify(error));
      }
    };
    handleCallback();
  }, []);

  return <div>Processando login... Redirecionando...</div>;
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
