// src/hooks/useAuth.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data } = await supabase.auth.getSession();
        console.log("Initial session data:", data);
        if (data.session) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        navigate("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const resetError = () => {
    setErrorMessage("");
    setIsEmailSent(false);
  };

  const handleConnectionError = (error: any) => {
    console.error("Connection error:", error);
    let errorMsg = "Failed to connect to the server. Check your internet connection and try again.";
    if (retryCount > 0) {
      errorMsg += ` Attempt ${retryCount} failed.`;
    }
    setErrorMessage(errorMsg);
    toast({
      title: "Connection Error",
      description: errorMsg,
      variant: "destructive",
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetError();

    if (!navigator.onLine) {
      handleConnectionError({ message: "Browser is offline" });
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log("Attempting login with:", { email });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log("Login response:", { data, error });
        if (error) throw error;
        toast({
          title: "Login successful!",
          description: "Welcome to the Inadimplência Dashboard.",
        });
      } else {
        console.log("Attempting signup with:", { email });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: "https://cotroledeinadimpleciateste.netlify.app/auth",
          },
        });
        console.log("Signup response:", { data, error });
        if (error) throw error;
        setIsEmailSent(true);
        toast({
          title: "Signup successful!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      if (error.message === "Failed to fetch" || error.__isAuthError) {
        handleConnectionError(error);
        setRetryCount((prev) => prev + 1);
      } else {
        setErrorMessage(error.message);
        toast({
          title: "Error",
          description: error.message || "An error occurred during authentication.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      console.log("Initiating Google login, redirectTo:", "https://cotroledeinadimpleciateste.netlify.app/auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://cotroledeinadimpleciateste.netlify.app/auth/callback",
        },
      });
      console.log("Google login initial response:", data);
      console.log("Google login initial error:", error);
      if (error) throw error;
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to log in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    handleGoogleLogin,
    resetError,
  };
};
