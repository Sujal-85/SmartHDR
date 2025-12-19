import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ocrAPI, historyAPI } from "@/services/api";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { MultiFileView, FileResult } from "@/components/MultiFileView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScanLine, Type, PenTool } from "lucide-react";
import { toast } from "sonner";

interface OCRResult extends FileResult {
  confidence?: number;
  wordCount?: number;
}

const ScanOCRPage = () => {
  const [results, setResults] = useState<OCRResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ocrMode, setOcrMode] = useState<"printed" | "handwritten">("printed");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await historyAPI.getHistory("ocr");
        const mappedResults: OCRResult[] = data.map((item: any) => ({
          id: item.id,
          name: item.input,
          status: "success",
          content: item.output,
          wordCount: item.output.split(/\s+/).length
        }));
        setResults(mappedResults);

        // Check if we navigated here with a specific result ID
        const selectedId = location.state?.selectedId;
        if (selectedId) {
          const index = mappedResults.findIndex(r => r.id === selectedId);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        }
      } catch (error) {
        console.error("Failed to fetch OCR history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [location.state]);

  const handleFilesUpload = async (files: File[]) => {
    for (const file of files) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const id = Math.random().toString(36).substring(7);
    const newResult: OCRResult = {
      id,
      name: file.name,
      status: "processing",
      content: ""
    };

    setResults(prev => [newResult, ...prev]);
    setCurrentIndex(0); // Select the newest file

    try {
      const mode = ocrMode === "handwritten" ? "high_accuracy" : "standard";
      const result = await ocrAPI.extractText(file, mode);

      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "success",
        content: result.text,
        wordCount: result.text.split(/\s+/).length
      } : r));
    } catch (error) {
      console.error("OCR Error:", error);
      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "error",
        error: "Failed to extract text"
      } : r));
      toast.error(`Failed to process ${file.name}`);
    }
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  const handleExternalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesUpload(Array.from(e.target.files));
    }
  };

  return (
    <PageLayout>
      <TopHeader
        title="Scan & OCR"
        description="Extract text from scanned documents and handwritten notes using AI-powered recognition"
      />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*,.pdf"
        onChange={handleExternalUpload}
      />

      <div className="grid gap-6 lg:grid-cols-3 mt-4 sm:mt-6">
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
            <CardContent className="pt-0 p-4 sm:p-6 sm:pt-0">
              <RadioGroup
                value={ocrMode}
                onValueChange={(value) => setOcrMode(value as "printed" | "handwritten")}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                <Label
                  htmlFor="printed"
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${ocrMode === "printed"
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
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${ocrMode === "handwritten"
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

        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse">Loading previous results...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ScanLine className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No documents processed</h3>
              <p>Upload files on the left to start extracting text with AI.</p>
            </div>
          ) : (
            <MultiFileView
              files={results}
              selectedIndex={currentIndex}
              onSelect={setCurrentIndex}
              onAdd={handleAddMore}
              onCopy={(content) => {
                navigator.clipboard.writeText(content);
                toast.success("Text copied to clipboard");
              }}
              onDownload={(content) => {
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = results[currentIndex].name.replace(/\.[^/.]+$/, "") + ".txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ScanOCRPage;
