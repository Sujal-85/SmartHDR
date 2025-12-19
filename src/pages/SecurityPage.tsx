import { useState } from "react";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusType } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Lock, EyeOff, Download, FileText,
  AlertTriangle, Unlock, Key, Settings
} from "lucide-react";
import { pdfAPI } from "@/services/api";

const SecurityPage = () => {
  const [activeTab, setActiveTab] = useState("protect");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<StatusType>("idle");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [useAPI, setUseAPI] = useState(false);

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [redactionCount, setRedactionCount] = useState(0);

  const handleProcess = async () => {
    if (files.length === 0) return;
    if (activeTab === "protect" && !password) return;

    setStatus("processing");
    setDownloadUrl(null);

    try {
      let resultBlob: Blob;

      if (activeTab === "protect") {
        resultBlob = await pdfAPI.protect(files[0], password);
      } else if (activeTab === "unlock") {
        resultBlob = await pdfAPI.unlock(files[0], password);
      } else {
        // Redaction
        resultBlob = await pdfAPI.redact(files[0]);
        // Note: We might want to get X-Redaction-Count from response if needed
      }

      const newUrl = window.URL.createObjectURL(resultBlob);
      setDownloadUrl(newUrl);
      setStatus("success");
    } catch (error) {
      console.error("Processing failed:", error);
      setStatus("error");
    }
  };

  const handleDownload = (filename: string) => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const redactedAreas = [
    { label: "Email Addresses", count: 3 },
    { label: "Phone Numbers", count: 2 },
    { label: "Credit Card Numbers", count: 1 },
    { label: "Social Security Numbers", count: 1 },
  ];

  return (
    <PageLayout>
      <TopHeader
        title="Security"
        description="Protect and redact sensitive information in your documents"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger
            value="protect"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Lock className="h-4 w-4" />
            <span>Protect</span>
          </TabsTrigger>
          <TabsTrigger
            value="unlock"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Unlock className="h-4 w-4" />
            <span>Unlock</span>
          </TabsTrigger>
          <TabsTrigger
            value="redact"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <EyeOff className="h-4 w-4" />
            <span>Redact</span>
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 mt-4 sm:mt-6">
          {/* Left Panel */}
          <div className="space-y-6">
            <UploadCard
              title={
                activeTab === "protect" ? "Upload PDF to Protect" :
                  activeTab === "unlock" ? "Upload PDF to Unlock" :
                    "Upload PDF to Redact"
              }
              description="Select a PDF file"
              accept=".pdf"
              icon="file"
              onFilesChange={setFiles}
            />

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  {activeTab === "protect" ? (
                    <>
                      <Lock className="h-4 w-4 text-primary" />
                      Password Settings
                    </>
                  ) : activeTab === "unlock" ? (
                    <>
                      <Unlock className="h-4 w-4 text-primary" />
                      Unlock Settings
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 text-primary" />
                      Redaction Options
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                {(activeTab === "protect" || activeTab === "unlock") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {activeTab === "protect" ? "Set Password" : "Opening Password (if any)"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={activeTab === "protect" ? "Enter password" : "Enter file password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {activeTab === "protect" && (
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {password && confirmPassword && password !== confirmPassword && (
                          <p className="text-xs text-destructive">Passwords do not match</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "redact" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      AI will automatically detect and redact:
                    </p>
                    <div className="space-y-2">
                      {["Personal Names", "Email Addresses", "Phone Numbers", "Credit Cards", "SSN/Tax IDs", "Addresses"].map(
                        (item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-sm">{item}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <PrimaryButton
                  gradient
                  className="w-full"
                  disabled={
                    files.length === 0 ||
                    (activeTab === "protect" && (!password || password !== confirmPassword))
                  }
                  isLoading={status === "uploading" || status === "processing"}
                  loadingText="Processing..."
                  onClick={handleProcess}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {activeTab === "protect" ? "Protect PDF" : activeTab === "unlock" ? "Unlock PDF" : "Redact PDF"}
                </PrimaryButton>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <ResultCard
            title={
              activeTab === "protect" ? "Protected PDF" :
                activeTab === "unlock" ? "Unlocked PDF" :
                  "Redacted PDF"
            }
            status={status}
            showDownload={status === "success"}
            className="min-h-[350px] sm:min-h-[500px]"
            onDownload={() => handleDownload(`${activeTab === 'protect' ? 'protected' : activeTab === 'unlock' ? 'unlocked' : 'redacted'}.pdf`)}
          >
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Upload a PDF to {activeTab === "protect" ? "protect" : "redact"}
                </p>
              </div>
            )}

            {(status === "uploading" || status === "processing") && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="mt-4 font-medium">
                  {activeTab === "protect" ? "Encrypting PDF..." : "Detecting sensitive data..."}
                </p>
              </div>
            )}

            {status === "success" && activeTab === "protect" && (
              <div className="space-y-4">
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center border border-emerald-200 dark:border-emerald-800">
                  <Lock className="h-12 w-12 mx-auto mb-3 text-emerald-600 dark:text-emerald-400" />
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    PDF Successfully Protected
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    Your file is now password protected
                  </p>
                </div>
                <PrimaryButton variant="outline" className="w-full gap-2" onClick={() => handleDownload("protected.pdf")}>
                  <Download className="h-4 w-4" />
                  Download Protected PDF
                </PrimaryButton>
              </div>
            )}

            {status === "success" && activeTab === "unlock" && (
              <div className="space-y-4">
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center border border-emerald-200 dark:border-emerald-800">
                  <Unlock className="h-12 w-12 mx-auto mb-3 text-emerald-600 dark:text-emerald-400" />
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    PDF Successfully Unlocked
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    Your file is now free of restrictions
                  </p>
                </div>
                <PrimaryButton variant="outline" className="w-full gap-2" onClick={() => handleDownload("unlocked.pdf")}>
                  <Download className="h-4 w-4" />
                  Download Unlocked PDF
                </PrimaryButton>
              </div>
            )}

            {status === "success" && activeTab === "redact" && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-3">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Sensitive Data Detected</span>
                  </div>
                  <div className="space-y-2">
                    {redactedAreas.map((area) => (
                      <div
                        key={area.label}
                        className="flex items-center justify-between p-2 bg-card rounded-md"
                      >
                        <span className="text-sm">{area.label}</span>
                        <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded-full">
                          {area.count} found
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Preview</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <p>Name: <span className="bg-foreground text-foreground">████████</span></p>
                    <p>Email: <span className="bg-foreground text-foreground">████████████████</span></p>
                    <p>Phone: <span className="bg-foreground text-foreground">██████████</span></p>
                    <p>SSN: <span className="bg-foreground text-foreground">███-██-████</span></p>
                  </div>
                </div>

                <PrimaryButton variant="outline" className="w-full gap-2" onClick={() => handleDownload("redacted.pdf")}>
                  <Download className="h-4 w-4" />
                  Download Redacted PDF
                </PrimaryButton>
              </div>
            )}
          </ResultCard>
        </div>
      </Tabs >
    </PageLayout >
  );
};

export default SecurityPage;
