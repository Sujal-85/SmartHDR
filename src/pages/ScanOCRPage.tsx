import { useState } from "react";
import { ocrAPI } from "@/services/api";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusType } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ScanLine, Type, PenTool, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OCRResult {
  id: string;
  file: File;
  status: StatusType;
  text: string;
  confidence?: number;
  wordCount?: number;
  error?: string;
}

const ScanOCRPage = () => {
  const [results, setResults] = useState<OCRResult[]>([]);
  const [ocrMode, setOcrMode] = useState<"printed" | "handwritten">("printed");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesUpload = async (files: File[]) => {
    setIsProcessing(true);
    for (const file of files) {
      await processFile(file);
    }
    setIsProcessing(false);
  };

  const processFile = async (file: File) => {
    const id = Math.random().toString(36).substring(7);
    const newResult: OCRResult = {
      id,
      file,
      status: "processing",
      text: ""
    };

    setResults(prev => [newResult, ...prev]);

    try {
      const mode = ocrMode === "handwritten" ? "high_accuracy" : "standard";
      const result = await ocrAPI.extractText(file, mode);

      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "success",
        text: result.text,
        confidence: 0.98, // Mock confidence for now
        wordCount: result.text.split(/\s+/).length
      } : r));
    } catch (error) {
      console.error("OCR Error:", error);
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: "error", error: "Failed to extract text" } : r));
    }
  };

  const removeResult = (id: string) => {
    setResults(prev => {
      const newResults = prev.filter(r => r.id !== id);
      if (currentIndex >= newResults.length) {
        setCurrentIndex(Math.max(0, newResults.length - 1));
      }
      return newResults;
    });
  };

  return (
    <PageLayout>
      <TopHeader
        title="Scan & OCR"
        description="Extract text from scanned documents and handwritten notes using AI-powered recognition"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <UploadCard
            title="Upload Document"
            description="Supports PNG, JPG, PDF up to 10MB"
            accept="image/*,.pdf"
            icon="image"
            onFilesChange={handleFilesUpload}
            multiple={true}
          />

          {/* OCR Mode Selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-primary" />
                Recognition Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <RadioGroup
                value={ocrMode}
                onValueChange={(value) => setOcrMode(value as "printed" | "handwritten")}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="printed"
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${ocrMode === "printed"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <RadioGroupItem value="printed" id="printed" />
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Printed</p>
                      <p className="text-xs text-muted-foreground">Typed</p>
                    </div>
                  </div>
                </Label>

                <Label
                  htmlFor="handwritten"
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${ocrMode === "handwritten"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <RadioGroupItem value="handwritten" id="handwritten" />
                  <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-accent" />
                    <div>
                      <p className="font-medium">Handwritten</p>
                      <p className="text-xs text-muted-foreground">Notes</p>
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2 space-y-6">
          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed rounded-xl">
              <p>Upload documents to extract text.</p>
            </div>
          )}

          {results.map((item) => (
            <ResultCard
              key={item.id}
              title={`Extracted Text: ${item.file.name}`}
              status={item.status}
              showCopy
              showDownload
              onCopy={() => navigator.clipboard.writeText(item.text)}
              className="min-h-[300px]"
            >
              {item.status === "processing" && (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p>Analyzing document...</p>
                </div>
              )}

              {item.status === "success" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {ocrMode === "printed" ? "Printed" : "Handwritten"}
                      </span>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs rounded-full">
                        {item.wordCount} Words
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeResult(item.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm whitespace-pre-wrap">
                    {item.text}
                  </div>
                </div>
              )}

              {item.status === "error" && (
                <div className="text-center text-destructive py-10">
                  <p>{item.error}</p>
                </div>
              )}
            </ResultCard>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ScanOCRPage;
