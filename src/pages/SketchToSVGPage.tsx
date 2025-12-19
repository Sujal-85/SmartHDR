import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { MultiFileView, FileResult } from "@/components/MultiFileView";
import { Card, CardContent } from "@/components/ui/card";
import { PenTool, Download } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { toast } from "sonner";

import { sketchAPI, historyAPI } from "@/services/api";

interface SketchResult extends FileResult {
  svgContent: string;
}

const SketchToSVGPage = () => {
  const [results, setResults] = useState<SketchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await historyAPI.getHistory("sketch");
        const mappedResults: SketchResult[] = data.map((item: any) => ({
          id: item.id,
          name: item.input,
          status: "success",
          svgContent: item.output
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
        console.error("Failed to fetch Sketch history", error);
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
    const newResult: SketchResult = {
      id,
      name: file.name,
      status: "processing",
      svgContent: ""
    };

    setResults(prev => [newResult, ...prev]);
    setCurrentIndex(0);

    try {
      const result = await sketchAPI.vectorize(file);
      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "success",
        svgContent: result
      } : r));
    } catch (error) {
      console.error("Sketch conversion failed:", error);
      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "error",
        error: "Failed to convert sketch"
      } : r));
      toast.error(`Failed to vectorize ${file.name}`);
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

  const downloadSVG = (svgContent: string, fileName: string) => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.[^/.]+$/, "") + ".svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderSketchContent = (file: FileResult) => {
    const sketchFile = file as SketchResult;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="w-full h-auto min-h-[300px] sm:min-h-[400px] flex items-center justify-center bg-white dark:bg-zinc-950 rounded-xl border shadow-inner p-4 sm:p-8 overflow-hidden relative group">
          <div
            className="w-full h-full flex items-center justify-center text-foreground transition-transform duration-300 group-hover:scale-105"
            dangerouslySetInnerHTML={{ __html: sketchFile.svgContent }}
          />
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 px-4 sm:px-0">
          <PrimaryButton
            gradient
            size="lg"
            className="gap-2 sm:gap-3 h-12 sm:h-14 px-4 sm:px-8 text-sm sm:text-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            onClick={() => downloadSVG(sketchFile.svgContent, sketchFile.name)}
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            Download SVG
          </PrimaryButton>
          <PrimaryButton
            variant="outline"
            size="lg"
            className="gap-2 sm:gap-3 h-12 sm:h-14 px-4 sm:px-8 text-sm sm:text-lg font-semibold border-2"
            onClick={() => {
              navigator.clipboard.writeText(sketchFile.svgContent);
              toast.success("SVG code copied to clipboard");
            }}
          >
            Copy SVG Code
          </PrimaryButton>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <TopHeader
        title="Sketch to SVG"
        description="Convert hand-drawn sketches into clean, scalable vector graphics"
      />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleExternalUpload}
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mt-4 sm:mt-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <UploadCard
            title="Upload Sketch"
            description="Upload a hand-drawn sketch image"
            accept="image/*"
            icon="image"
            onFilesChange={handleFilesUpload}
            multiple={true}
          />

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PenTool className="h-4 w-4 text-primary" />
                <span>AI detects shapes and converts to vector paths</span>
              </div>
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
                <PenTool className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No sketches processed</h3>
              <p>Upload hand-drawn images on the left to vectorize them.</p>
            </div>
          ) : (
            <MultiFileView
              files={results}
              selectedIndex={currentIndex}
              onSelect={setCurrentIndex}
              onAdd={handleAddMore}
              renderContent={renderSketchContent}
              onDownload={(svgContent) => downloadSVG(svgContent, results[currentIndex].name)}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SketchToSVGPage;
