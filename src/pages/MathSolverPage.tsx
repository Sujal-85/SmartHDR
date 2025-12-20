import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { useLocation } from "react-router-dom";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { MultiFileView, FileResult } from "@/components/MultiFileView";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Code } from "lucide-react";
import { toast } from "sonner";

import { mathAPI, historyAPI } from "@/services/api";

interface MathResult extends FileResult {
  latex: string;
  solution?: string;
}

const MathSolverPage = () => {
  const [results, setResults] = useState<MathResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await historyAPI.getHistory("math");
        const mappedResults: MathResult[] = data.map((item: any) => {
          // Extract LaTeX if possible, otherwise use full output
          const latexMatch = item.output.match(/\$(.*?)\$/);
          return {
            id: item.id,
            name: item.input,
            status: "success",
            latex: latexMatch ? latexMatch[1] : (item.output.split('\n')[0] || ""),
            solution: item.output,
            content: item.output
          };
        });
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
        console.error("Failed to fetch Math history", error);
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
    const newResult: MathResult = {
      id,
      name: file.name,
      status: "processing",
      latex: "",
      content: "" // We'll use solution as content for generic copy
    };

    setResults(prev => [newResult, ...prev]);
    setCurrentIndex(0);

    try {
      const result = await mathAPI.solve(file);
      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "success",
        latex: result.latex,
        solution: result.solution,
        content: result.solution || result.latex
      } : r));
    } catch (error) {
      console.error("Math solver failed:", error);
      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "error",
        error: "Failed to solve equation"
      } : r));
      toast.error(`Failed to solve ${file.name}`);
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

  const renderMathContent = (file: FileResult) => {
    const mathFile = file as MathResult;
    return (
      <Tabs defaultValue="rendered" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="rendered">Rendered</TabsTrigger>
          <TabsTrigger value="latex">LaTeX Code</TabsTrigger>
        </TabsList>
        <TabsContent value="rendered" className="space-y-4">
          <div className="p-6 bg-muted/50 rounded-lg text-center overflow-x-auto shadow-inner border">
            <p className="text-xl font-serif">{mathFile.latex}</p>
          </div>
          <div className="p-4 bg-card border rounded-lg shadow-sm">
            <h4 className="font-medium mb-4 flex items-center gap-2 border-b pb-2">
              <Code className="h-4 w-4 text-primary" />
              Step-by-Step Solution
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {mathFile.solution || "No solution generated."}
              </ReactMarkdown>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="latex">
          <div className="p-4 bg-muted/50 rounded-lg border font-mono text-sm shadow-inner overflow-auto max-h-[400px]">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Code className="h-3.5 w-3.5" />
              <span>LaTeX Code</span>
            </div>
            <code className="block break-all">{mathFile.latex}</code>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <PageLayout>
      <TopHeader
        title="Math Solver"
        description="Recognize handwritten mathematical equations and solve them step by step"
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
            title="Upload Math Image"
            description="Upload an image of a mathematical equation"
            accept="image/*"
            icon="image"
            onFilesChange={handleFilesUpload}
            multiple={true}
          />

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4" />
                <span>Supports algebra, calculus, trigonometry, and more</span>
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
                <Calculator className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No equations solved</h3>
              <p>Upload math images on the left to see step-by-step solutions.</p>
            </div>
          ) : (
            <MultiFileView
              files={results}
              selectedIndex={currentIndex}
              onSelect={setCurrentIndex}
              onAdd={handleAddMore}
              renderContent={renderMathContent}
              onCopy={(content) => {
                navigator.clipboard.writeText(content);
                toast.success("Solution copied to clipboard");
              }}
              onDownload={(content) => {
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `solution-${results[currentIndex].name.replace(/\.[^/.]+$/, "")}.txt`;
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

export default MathSolverPage;
