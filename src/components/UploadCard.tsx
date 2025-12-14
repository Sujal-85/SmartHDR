import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Image, FileText, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadCardProps {
  title?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  icon?: "image" | "file" | "audio";
  onFilesChange?: (files: File[]) => void;
  className?: string;
}

const iconMap = {
  image: Image,
  file: FileText,
  audio: Music,
};

export function UploadCard({
  title = "Upload File",
  description = "Drag and drop or click to browse",
  accept = "*",
  multiple = false,
  icon = "file",
  onFilesChange,
  className,
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const Icon = iconMap[icon];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles = multiple ? [...files, ...droppedFiles] : droppedFiles.slice(0, 1);
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [files, multiple, onFilesChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        const newFiles = multiple ? [...files, ...selectedFiles] : selectedFiles;
        setFiles(newFiles);
        onFilesChange?.(newFiles);
      }
    },
    [files, multiple, onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [files, onFilesChange]
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            files.length > 0 && "pb-4"
          )}
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div
            className={cn(
              "flex flex-col items-center gap-3 transition-all",
              isDragging && "scale-105"
            )}
          >
            <div className="p-4 rounded-full bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3.5 w-3.5" />
              <span>Drop files here or click to browse</span>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="p-4 border-t border-border space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
