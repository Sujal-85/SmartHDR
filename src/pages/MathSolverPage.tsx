import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Code, Trash2 } from "lucide-react";

import { mathAPI } from "@/services/api";
import { StatusType } from "@/components/ui/status-badge";

interface MathResult {
  id: string;
  file: File;
  status: StatusType;
  latex: string;
  solution?: string;
  error?: string;
}

const MathSolverPage = () => {
  const [results, setResults] = useState<MathResult[]>([]);

  const handleFilesUpload = async (files: File[]) => {
    for (const file of files) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const id = Math.random().toString(36).substring(7);
    const newResult: MathResult = {
      id,
      file,
      status: "processing",
      latex: ""
    };

    setResults(prev => [newResult, ...prev]);

    try {
      const result = await mathAPI.solve(file);
      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "success",
        latex: result.latex,
        solution: result.solution // Direct from AI
      } : r));
    } catch (error) {
      console.error("Math solver failed:", error);
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: "error", error: "Failed to solve equation" } : r));
    }
  };

  const removeResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  return (
    <PageLayout>
      <TopHeader
        title="Math Solver"
        description="Recognize handwritten mathematical equations and solve them step by step"
      />

      <div className="grid gap-6 lg:grid-cols-3">
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
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4" />
                <span>Supports algebra, calculus, trigonometry, and more</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed rounded-xl">
              <p>Upload math equations to solve.</p>
            </div>
          )}

          {results.map((item) => (
            <ResultCard
              key={item.id}
              title={`Solution: ${item.file.name}`}
              status={item.status}
              showCopy={item.status === 'success'}
              showDownload={item.status === 'success'}
              onCopy={() => navigator.clipboard.writeText(item.solution || "")}
              onDownload={() => {
                const element = document.createElement("a");
                const file = new Blob([item.solution || ""], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = `solution-${item.id}.txt`;
                document.body.appendChild(element);
                element.click();
              }}
              className="min-h-[300px]"
            >
              {item.status === "processing" && (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p>Solving equation...</p>
                </div>
              )}

              {item.status === "success" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => removeResult(item.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                  <Tabs defaultValue="rendered" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="rendered">Rendered</TabsTrigger>
                      <TabsTrigger value="latex">LaTeX Code</TabsTrigger>
                    </TabsList>
                    <TabsContent value="rendered" className="space-y-4">
                      <div className="p-6 bg-muted/50 rounded-lg text-center overflow-x-auto">
                        <p className="text-xl font-serif">{item.latex}</p>
                      </div>
                      <div className="p-4 bg-card border rounded-lg">
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                            <Code className="h-4 w-4 text-primary" />
                            Step-by-Step Solution
                        </h4>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {item.solution || "No solution generated."}
                            </ReactMarkdown>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="latex">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                          <Code className="h-3.5 w-3.5" />
                          <span>LaTeX Code</span>
                        </div>
                        <code className="block font-mono text-sm break-all">{item.latex}</code>
                      </div>
                    </TabsContent>
                  </Tabs>
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

export default MathSolverPage;
