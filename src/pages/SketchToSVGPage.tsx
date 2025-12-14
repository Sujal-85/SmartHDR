import { useState } from "react";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusType } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { PenTool, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { sketchAPI } from "@/services/api";

interface SketchResult {
  id: string;
  file: File;
  status: StatusType;
  svgContent: string;
  error?: string;
}

const SketchToSVGPage = () => {
  const [results, setResults] = useState<SketchResult[]>([]);

  const handleFilesUpload = async (files: File[]) => {
    for (const file of files) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const id = Math.random().toString(36).substring(7);
    const newResult: SketchResult = {
      id,
      file,
      status: "processing",
      svgContent: ""
    };

    setResults(prev => [newResult, ...prev]);

    try {
      const result = await sketchAPI.vectorize(file);
      setResults(prev => prev.map(r => r.id === id ? {
        ...r, 
        status: "success",
        svgContent: result
      } : r));
    } catch (error) {
      console.error("Sketch conversion failed:", error);
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: "error", error: "Failed to convert sketch" } : r));
    }
  };

  const removeResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const downloadSVG = (svgContent: string, fileName: string) => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.[^/.]+$/, "") + ".svg";
    a.click();
  };

  return (
    <PageLayout>
      <TopHeader
        title="Sketch to SVG"
        description="Convert hand-drawn sketches into clean, scalable vector graphics"
      />

      <div className="grid gap-6 lg:grid-cols-3">
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
            <CardContent className="p-6">
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PenTool className="h-4 w-4" />
                  <span>AI detects shapes and converts to vector paths</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
           {results.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed rounded-xl">
                 <p>Upload sketches to convert them to SVG.</p>
             </div>
           )}

           {results.map((item) => (
             <ResultCard
               key={item.id}
               title={`SVG Preview: ${item.file.name}`}
               status={item.status}
               showDownload={item.status === 'success'}
               onDownload={() => downloadSVG(item.svgContent, item.file.name)}
               className="min-h-[500px]"
             >
                {item.status === "processing" && (
                   <div className="flex flex-col items-center justify-center py-10">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                      <p>Vectorizing sketch...</p>
                   </div>
                )}

                {item.status === "success" && (
                   <div className="space-y-4">
                      <div className="flex justify-end">
                         <Button variant="ghost" size="sm" onClick={() => removeResult(item.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/>
                         </Button>
                      </div>
                      <div className="w-full h-auto min-h-[300px] flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border p-4 overflow-hidden">
                        <div
                          className="w-full h-full flex items-center justify-center text-foreground"
                          dangerouslySetInnerHTML={{ __html: item.svgContent }}
                        />
                      </div>
                      <div className="flex justify-center">
                        <PrimaryButton variant="outline" className="gap-2" onClick={() => downloadSVG(item.svgContent, item.file.name)}>
                          <Download className="h-4 w-4" />
                          Download SVG
                        </PrimaryButton>
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

export default SketchToSVGPage;
