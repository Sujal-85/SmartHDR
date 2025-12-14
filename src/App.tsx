import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ScanOCRPage from "./pages/ScanOCRPage";
import MathSolverPage from "./pages/MathSolverPage";
import SketchToSVGPage from "./pages/SketchToSVGPage";
import PDFToolsPage from "./pages/PDFToolsPage";
import SpeechLanguagePage from "./pages/SpeechLanguagePage";
import SecurityPage from "./pages/SecurityPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan-ocr" element={<ScanOCRPage />} />
          <Route path="/math-solver" element={<MathSolverPage />} />
          <Route path="/sketch-to-svg" element={<SketchToSVGPage />} />
          <Route path="/pdf-tools" element={<PDFToolsPage />} />
          <Route path="/speech-language" element={<SpeechLanguagePage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
