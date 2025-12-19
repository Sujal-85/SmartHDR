import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Copy,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileResult {
    id: string;
    name: string;
    status: "processing" | "success" | "error";
    content?: string;
    downloadUrl?: string;
    error?: string;
}

interface MultiFileViewProps {
    files: FileResult[];
    onSelect: (index: number) => void;
    onAdd: () => void;
    selectedIndex: number;
    onCopy?: (content: string) => void;
    onDownload?: (url: string) => void;
    renderContent?: (file: FileResult) => React.ReactNode;
}

export function MultiFileView({
    files,
    onSelect,
    onAdd,
    selectedIndex,
    onCopy,
    onDownload,
    renderContent
}: MultiFileViewProps) {
    const activeFile = files[selectedIndex];

    const handlePrevious = () => {
        if (selectedIndex > 0) onSelect(selectedIndex - 1);
    };

    const handleNext = () => {
        if (selectedIndex < files.length - 1) onSelect(selectedIndex + 1);
    };

    return (
        <div className="flex flex-col h-full gap-3 sm:gap-4">
            <Card className="flex-1 relative overflow-hidden flex flex-col min-h-[350px] sm:min-h-[400px] border shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4 bg-muted/30 border-b">
                    <CardTitle className="text-sm font-semibold truncate max-w-[200px] flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {activeFile?.name || "No file selected"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {activeFile?.status === "success" && (
                            <div className="flex items-center gap-1">
                                {onCopy && activeFile.content && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onCopy(activeFile.content!)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                )}
                                {onDownload && (activeFile.downloadUrl || activeFile.content) && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onDownload!(activeFile.content || activeFile.downloadUrl!)}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 relative flex items-center justify-center p-0 overflow-hidden bg-card/50">
                    {/* Navigation Arrows */}
                    {files.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 sm:left-4 z-10 rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-lg border w-8 h-8 sm:w-10 sm:h-10 group"
                                onClick={handlePrevious}
                                disabled={selectedIndex === 0}
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 group-hover:-translate-x-0.5 transition-transform" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 sm:right-4 z-10 rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-lg border w-8 h-8 sm:w-10 sm:h-10 group"
                                onClick={handleNext}
                                disabled={selectedIndex === files.length - 1}
                            >
                                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                        </>
                    )}

                    <div className="w-full h-full overflow-auto p-4 sm:p-8">
                        {activeFile?.status === "processing" ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[350px] gap-6 text-muted-foreground animate-in fade-in zoom-in duration-300">
                                <div className="relative">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary/20" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-semibold text-foreground">Analyzing document...</p>
                                    <p className="text-xs">Applying AI models to extract insights</p>
                                </div>
                            </div>
                        ) : activeFile?.status === "error" ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[350px] gap-4 text-destructive animate-in fade-in zoom-in duration-300">
                                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <p className="font-medium">{activeFile.error || "Processing failed"}</p>
                                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
                            </div>
                        ) : renderContent ? (
                            renderContent(activeFile)
                        ) : activeFile?.content ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90 p-4 rounded-xl bg-background border shadow-inner">
                                    {activeFile.content}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-muted-foreground text-center animate-in fade-in duration-500">
                                <FileText className="h-12 w-12 mb-4 opacity-10" />
                                <p className="italic">Ready for processing</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Selection Bar */}
            <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border shadow-lg">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-primary"
                    onClick={onAdd}
                    title="Add more files"
                >
                    <Plus className="h-6 w-6" />
                </Button>

                <div className="h-10 w-px bg-border/50 mx-1" />

                <ScrollArea className="w-full">
                    <div className="flex gap-3 px-1 py-1">
                        {files.map((file, index) => (
                            <button
                                key={file.id}
                                onClick={() => onSelect(index)}
                                className={cn(
                                    "relative h-14 w-14 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 hover:scale-105 active:scale-95",
                                    selectedIndex === index
                                        ? "border-primary bg-primary/10 shadow-md ring-4 ring-primary/5"
                                        : "border-transparent bg-muted/30 hover:bg-muted"
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center",
                                    selectedIndex === index ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground border shadow-sm"
                                )}>
                                    <FileText className="h-5 w-5" />
                                </div>

                                {/* Status Indicator */}
                                <div className="absolute -top-1.5 -right-1.5 shadow-sm">
                                    {file.status === "success" && (
                                        <div className="bg-emerald-500 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center">
                                            <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                        </div>
                                    )}
                                    {file.status === "error" && (
                                        <div className="bg-destructive h-4 w-4 rounded-full border-2 border-background flex items-center justify-center">
                                            <AlertCircle className="h-2.5 w-2.5 text-white" />
                                        </div>
                                    )}
                                    {file.status === "processing" && (
                                        <div className="bg-primary h-4 w-4 rounded-full border-2 border-background flex items-center justify-center animate-pulse">
                                            <Loader2 className="h-2.5 w-2.5 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="hidden" />
                </ScrollArea>
            </div>
        </div>
    );
}
