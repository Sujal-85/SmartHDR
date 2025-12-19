import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import HomePage from "./pages/HomePage";
import ScanOCRPage from "./pages/ScanOCRPage";
import MathSolverPage from "./pages/MathSolverPage";
import SketchToSVGPage from "./pages/SketchToSVGPage";
import PDFToolsPage from "./pages/PDFToolsPage";
import SpeechLanguagePage from "./pages/SpeechLanguagePage";
import SecurityPage from "./pages/SecurityPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />

    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/scan-ocr" element={<ProtectedRoute><ScanOCRPage /></ProtectedRoute>} />
    <Route path="/math-solver" element={<ProtectedRoute><MathSolverPage /></ProtectedRoute>} />
    <Route path="/sketch-to-svg" element={<ProtectedRoute><SketchToSVGPage /></ProtectedRoute>} />
    <Route path="/pdf-tools" element={<ProtectedRoute><PDFToolsPage /></ProtectedRoute>} />
    <Route path="/speech-language" element={<ProtectedRoute><SpeechLanguagePage /></ProtectedRoute>} />
    <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
