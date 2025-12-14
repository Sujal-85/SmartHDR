import { useState } from "react";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusType } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { FileText, Layers, Scissors, Minimize2, Image, Download } from "lucide-react";

import { pdfAPI } from "@/services/api";

const PDFToolsPage = () => {
  const [activeTab, setActiveTab] = useState("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<StatusType>("idle");
  const [splitRange, setSplitRange] = useState("1-5");
  const [compressionLevel, setCompressionLevel] = useState([70]);

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");

  const handleProcess = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setDownloadUrl(null);

    try {
      let resultBlob: Blob;
      let filename = "output.pdf";

      if (activeTab === "merge") {
        resultBlob = await pdfAPI.merge(files);
        filename = "merged_document.pdf";
      } else if (activeTab === "compress") {
        resultBlob = await pdfAPI.compress(files[0]);
        filename = `compressed_${files[0].name}`;
      } else if (activeTab === "split") {
        resultBlob = await pdfAPI.split(files[0]);
        filename = "split_pages.zip";
      } else { // image-to-pdf
        resultBlob = await pdfAPI.imageToPDF(files);
        filename = "images_converted.pdf";
      }

      const url = window.URL.createObjectURL(resultBlob);
      setDownloadUrl(url);
      setDownloadName(filename);
      setStatus("success");
    } catch (error) {
      console.error("PDF Tools Error:", error);
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const tabConfig = {
    merge: {
      icon: Layers,
      title: "Merge PDFs",
      description: "Combine multiple PDF files into one",
      uploadTitle: "Upload PDFs to Merge",
      uploadDesc: "Select multiple PDF files",
      buttonText: "Merge Files",
    },
    split: {
      icon: Scissors,
      title: "Split PDF",
      description: "Extract specific pages from a PDF",
      uploadTitle: "Upload PDF to Split",
      uploadDesc: "Select a PDF file",
      buttonText: "Split PDF",
    },
    compress: {
      icon: Minimize2,
      title: "Compress PDF",
      description: "Reduce PDF file size",
      uploadTitle: "Upload PDF to Compress",
      uploadDesc: "Select a PDF file",
      buttonText: "Compress PDF",
    },
    "image-to-pdf": {
      icon: Image,
      title: "Image to PDF",
      description: "Convert images to PDF format",
      uploadTitle: "Upload Images",
      uploadDesc: "Select images to convert",
      buttonText: "Convert to PDF",
    },
  };

  const currentConfig = tabConfig[activeTab as keyof typeof tabConfig];
  const CurrentIcon = currentConfig.icon;

  return (
    <PageLayout>
      <TopHeader
        title="PDF Tools"
        description="Merge, split, compress, and convert your PDF documents"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          {Object.entries(tabConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.title.split(" ")[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Panel */}
          <div className="space-y-6">
            <UploadCard
              title={currentConfig.uploadTitle}
              description={currentConfig.uploadDesc}
              accept={activeTab === "image-to-pdf" ? "image/*" : ".pdf"}
              multiple={activeTab === "merge" || activeTab === "image-to-pdf"}
              icon={activeTab === "image-to-pdf" ? "image" : "file"}
              onFilesChange={setFiles}
            />

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CurrentIcon className="h-4 w-4 text-primary" />
                  {currentConfig.title} Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTab === "split" && (
                  <div className="space-y-2">
                    <Label htmlFor="page-range">Page Range</Label>
                    <Input
                      id="page-range"
                      placeholder="e.g., all (Splits every page separately)"
                      value={splitRange}
                      onChange={(e) => setSplitRange(e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Currently splits all pages into individual files (Download as ZIP).
                    </p>
                  </div>
                )}

                {activeTab === "compress" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Compression Level</Label>
                        <span className="text-sm font-medium">{compressionLevel[0]}%</span>
                      </div>
                      <Slider
                        value={compressionLevel}
                        onValueChange={setCompressionLevel}
                        max={100}
                        min={10}
                        step={10}
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher values = smaller file, lower quality
                      </p>
                    </div>
                  </div>
                )}

                {(activeTab === "merge" || activeTab === "image-to-pdf") && (
                  <p className="text-sm text-muted-foreground">
                    Files will be combined in the order they appear
                  </p>
                )}

                <Separator />

                <PrimaryButton
                  gradient
                  className="w-full"
                  disabled={files.length === 0}
                  isLoading={status === "uploading" || status === "processing"}
                  loadingText="Processing..."
                  onClick={handleProcess}
                >
                  <CurrentIcon className="h-4 w-4 mr-2" />
                  {currentConfig.buttonText}
                </PrimaryButton>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <ResultCard
            title="Output"
            status={status}
            showDownload={status === "success"}
            className="min-h-[400px]"
            onDownload={handleDownload}
          >
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Upload files and click "{currentConfig.buttonText}"
                </p>
              </div>
            )}

            {(status === "uploading" || status === "processing") && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="mt-4 font-medium">Processing on Server...</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="p-6 bg-muted/50 rounded-lg text-center">
                  <div className="w-16 h-20 mx-auto mb-4 bg-card border rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium">{downloadName}</p>
                  <p className="text-sm text-muted-foreground">Ready to download</p>
                </div>
                <PrimaryButton variant="outline" className="w-full gap-2" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download File
                </PrimaryButton>
              </div>
            )}

            {status === "error" && (
              <div className="text-center text-destructive py-10">
                <p>An error occurred while processing your file.</p>
              </div>
            )}
          </ResultCard>
        </div>
      </Tabs>
    </PageLayout>
  );
};


export default PDFToolsPage;
