import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { MultiFileView, FileResult } from "@/components/MultiFileView";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  FileText, Layers, Scissors, Minimize2, Image,
  Download, FileType, Unlock, RotateCw, Globe
} from "lucide-react";

import { pdfAPI, historyAPI } from "@/services/api";
import { toast } from "sonner";

interface PDFResult extends FileResult {
  tool: string;
}

const PDFToolsPage = () => {
  const [activeTab, setActiveTab] = useState("merge");
  const [results, setResults] = useState<PDFResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Tool Specific Options
  const [splitRange, setSplitRange] = useState("all");
  const [compressionLevel, setCompressionLevel] = useState([70]);
  const [rotation, setRotation] = useState(90);
  const [password, setPassword] = useState("");
  const [useAPI, setUseAPI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await historyAPI.getHistory("pdf");
        const mappedResults: PDFResult[] = data.map((item: any) => ({
          id: item.id,
          name: item.input,
          status: "success",
          tool: item.taskType.replace("pdf_", ""),
          downloadUrl: "#" // History doesn't have direct download URLs for generated files yet
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
        console.error("Failed to fetch PDF history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [location.state]);

  const handleProcess = async (files: File[]) => {
    if (files.length === 0) return;

    const id = Math.random().toString(36).substring(7);
    const newResult: PDFResult = {
      id,
      name: files.length > 1 ? `${files.length} files merged` : files[0].name,
      status: "processing",
      tool: activeTab
    };

    setResults(prev => [newResult, ...prev]);
    setCurrentIndex(0);

    try {
      let resultBlob: Blob;
      let filename = "output.pdf";

      if (activeTab === "merge") {
        resultBlob = await pdfAPI.merge(files, useAPI);
        filename = "merged_document.pdf";
      } else if (activeTab === "compress") {
        resultBlob = await pdfAPI.compress(files[0], useAPI);
        filename = `compressed_${files[0].name}`;
      } else if (activeTab === "split") {
        resultBlob = await pdfAPI.split(files[0]);
        filename = "split_pages.zip";
      } else if (activeTab === "image-to-pdf") {
        resultBlob = await pdfAPI.imageToPDF(files);
        filename = "images_converted.pdf";
      } else if (activeTab === "word-to-pdf") {
        resultBlob = await pdfAPI.convert(files[0], "officepdf");
        filename = files[0].name.replace(/\.[^/.]+$/, "") + ".pdf";
      } else if (activeTab === "pdf-to-word") {
        resultBlob = await pdfAPI.convert(files[0], "pdfword");
        filename = files[0].name.replace(/\.[^/.]+$/, "") + ".docx";
      } else if (activeTab === "pdf-to-image") {
        resultBlob = await pdfAPI.convert(files[0], "pdfjpg");
        filename = files[0].name.replace(/\.[^/.]+$/, "") + "_images.zip";
      } else if (activeTab === "unlock") {
        resultBlob = await pdfAPI.unlock(files[0], password);
        filename = `unlocked_${files[0].name}`;
      } else if (activeTab === "rotate") {
        resultBlob = await pdfAPI.rotate(files[0], rotation);
        filename = `rotated_${files[0].name}`;
      } else {
        throw new Error("Invalid tool selected");
      }

      const url = window.URL.createObjectURL(resultBlob);
      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "success",
        name: filename,
        downloadUrl: url
      } : r));
      toast.success(`${activeTab} completed!`);
    } catch (error) {
      console.error("PDF Tools Error:", error);
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: "error", error: "Failed to process PDF" } : r));
      toast.error(`Failed to ${activeTab}`);
    }
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  // Rest of tabConfig and logic remains similar but adapted for MultiFileView
  const tabConfig = {
    merge: { icon: Layers, title: "Merge", btn: "Merge Files" },
    split: { icon: Scissors, title: "Split", btn: "Split PDF" },
    compress: { icon: Minimize2, title: "Compress", btn: "Compress PDF" },
    "image-to-pdf": { icon: Image, title: "Img2PDF", btn: "Convert" },
    "word-to-pdf": { icon: FileType, title: "Word2PDF", btn: "Convert" },
    "pdf-to-word": { icon: FileText, title: "PDF2Word", btn: "Convert" },
    "pdf-to-image": { icon: Image, title: "PDF2Img", btn: "Convert" },
    "unlock": { icon: Unlock, title: "Unlock", btn: "Unlock" },
    "rotate": { icon: RotateCw, title: "Rotate", btn: "Rotate" }
  };

  const renderPDFResult = (file: FileResult) => {
    const pdfFile = file as PDFResult;
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in">
        <div className="relative">
          <div className="w-24 h-32 bg-white dark:bg-zinc-900 border-2 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-0">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-[10px] font-bold uppercase">
            {pdfFile.tool}
          </div>
        </div>

        <div className="space-y-1">
          <p className="font-bold text-lg">{pdfFile.name}</p>
          <p className="text-sm text-muted-foreground">Your processed file is ready</p>
        </div>

        {pdfFile.downloadUrl && pdfFile.downloadUrl !== "#" ? (
          <PrimaryButton
            gradient
            size="lg"
            className="w-full max-w-xs gap-2"
            onClick={() => {
              const a = document.createElement("a");
              a.href = pdfFile.downloadUrl!;
              a.download = pdfFile.name;
              a.click();
            }}
          >
            <Download className="h-5 w-5" />
            Download {pdfFile.name.split('.').pop()?.toUpperCase()}
          </PrimaryButton>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg text-sm italic text-muted-foreground w-full max-w-xs">
            Download not available for historical results (Direct generation only)
          </div>
        )}
      </div>
    );
  };

  return (
    <PageLayout>
      <TopHeader
        title="PDF Tools"
        description="Merge, split, compress, and convert your PDF documents"
      />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => e.target.files && handleProcess(Array.from(e.target.files))}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 md:grid-cols-5 xl:grid-cols-9 h-auto p-1 gap-1 bg-muted/30">
          {Object.entries(tabConfig).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="py-1.5 sm:py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <config.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 hidden xs:block" />
              <span className="text-[9px] sm:text-xs font-semibold">{config.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mt-2 sm:mt-0">
          <div className="lg:col-span-1 space-y-6">
            <UploadCard
              title={`Upload for ${activeTab}`}
              description="Supports PDF and relevant formats"
              onFilesChange={handleProcess}
              multiple={activeTab === "merge" || activeTab === "image-to-pdf"}
              icon="file"
            />

            {/* Config Card */}
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-sm">Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {activeTab === "compress" && (
                  <Slider value={compressionLevel} onValueChange={setCompressionLevel} max={100} min={10} step={10} />
                )}
                {activeTab === "rotate" && (
                  <div className="grid grid-cols-3 gap-2">
                    {[90, 180, 270].map(a => (
                      <PrimaryButton key={a} variant={rotation === a ? "default" : "outline"} onClick={() => setRotation(a)} size="sm">{a}°</PrimaryButton>
                    ))}
                  </div>
                )}
                {activeTab === "unlock" && <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />}

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
                  <Label className="text-xs">Pro Engine (API)</Label>
                  <Switch checked={useAPI} onCheckedChange={setUseAPI} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading previous PDF tasks...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed rounded-xl p-8 text-center">
                <FileText className="h-12 w-12 mb-4 opacity-10" />
                <h3 className="text-lg font-medium text-foreground mb-1">No PDF tasks found</h3>
                <p>Select a tool and upload files to begin.</p>
              </div>
            ) : (
              <MultiFileView
                files={results}
                selectedIndex={currentIndex}
                onSelect={setCurrentIndex}
                onAdd={handleAddMore}
                renderContent={renderPDFResult}
              />
            )}
          </div>
        </div>
      </Tabs>
    </PageLayout>
  );
};

export default PDFToolsPage;
