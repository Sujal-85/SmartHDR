import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { MultiFileView, FileResult } from "@/components/MultiFileView";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause, Volume2, Globe } from "lucide-react";
import { speechAPI, historyAPI } from "@/services/api";
import { toast } from "sonner";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "ar", name: "Arabic" },
];

interface SpeechResult extends FileResult {
  translatedText?: string;
  targetLang?: string;
  audioUrl?: string;
}

const SpeechLanguagePage = () => {
  const [results, setResults] = useState<SpeechResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetLang, setTargetLang] = useState("hi");
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await historyAPI.getHistory("speech");
        const mappedResults: SpeechResult[] = data.map((item: any) => ({
          id: item.id,
          name: item.input,
          status: "success",
          content: item.output
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
        console.error("Failed to fetch Speech history", error);
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

  const processFile = async (file: File | Blob, customName?: string) => {
    const id = Math.random().toString(36).substring(7);
    const name = customName || (file instanceof File ? file.name : "recording.wav");

    const newResult: SpeechResult = {
      id,
      name,
      status: "processing",
      content: ""
    };

    setResults(prev => [newResult, ...prev]);
    setCurrentIndex(0);

    try {
      const fileToUpload = file instanceof File ? file : new File([file], name, { type: "audio/wav" });
      const result = await speechAPI.transcribe(fileToUpload);

      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "success",
        content: result.text
      } : r));
    } catch (error) {
      console.error("Transcription failed:", error);
      setResults(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "error",
        error: "Failed to transcribe audio"
      } : r));
      toast.error(`Failed to transcribe ${name}`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleTranslate = async () => {
    const activeFile = results[currentIndex];
    if (!activeFile?.content || activeFile.status !== "success") return;

    try {
      const res = await speechAPI.translate(activeFile.content, targetLang);
      setResults(prev => prev.map((r, i) => i === currentIndex ? {
        ...r,
        translatedText: res.translated_text,
        targetLang: targetLang
      } : r));
      toast.success("Translation complete");
    } catch (e) {
      console.error("Translation Failed", e);
      toast.error("Translation failed");
    }
  };

  const handleTTS = async () => {
    const activeFile = results[currentIndex];
    const text = activeFile?.content;
    if (!text) return;

    try {
      const blob = await speechAPI.synthesize(text);
      const url = URL.createObjectURL(blob);

      setResults(prev => prev.map((r, i) => i === currentIndex ? {
        ...r,
        audioUrl: url
      } : r));

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("TTS Failed", e);
      toast.error("Speech synthesis failed");
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

  const renderSpeechContent = (file: FileResult) => {
    const speechFile = file as SpeechResult;
    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-xl border shadow-inner min-h-[150px]">
          <p className="whitespace-pre-wrap leading-relaxed">{speechFile.content}</p>
        </div>

        {speechFile.translatedText && (
          <div className="p-4 bg-primary/5 rounded-xl border-2 border-primary/10 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold uppercase text-primary mb-2 flex items-center gap-2">
              <Globe className="h-3 w-3" />
              Translation ({languages.find(l => l.code === speechFile.targetLang)?.name || speechFile.targetLang})
            </h4>
            <p className="leading-relaxed">{speechFile.translatedText}</p>
          </div>
        )}

        {/* Tools Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="shadow-none border-dashed">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Translate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 flex flex-col sm:flex-row gap-2">
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="flex-1 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {languages.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" className="w-full sm:w-auto text-xs" onClick={handleTranslate}>Translate</Button>
            </CardContent>
          </Card>

          <Card className="shadow-none border-dashed">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                Listen
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button
                variant="outline"
                className="w-full gap-2 text-xs sm:text-sm"
                onClick={() => {
                  if (speechFile.audioUrl && audioRef.current) {
                    if (isPlaying) audioRef.current.pause();
                    else audioRef.current.play();
                    setIsPlaying(!isPlaying);
                  } else {
                    handleTTS();
                  }
                }}
              >
                {isPlaying && audioRef.current?.src === speechFile.audioUrl ? (
                  <> <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> Pause </>
                ) : (
                  <> <Play className="h-3 w-3 sm:h-4 sm:w-4" /> Listen </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <TopHeader
        title="Speech & Language"
        description="Transcribe, Translate, and Listen with AI Pro features"
      />

      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="hidden"
      />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="audio/*"
        onChange={handleExternalUpload}
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mt-4 sm:mt-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <UploadCard
            title="Upload Audio"
            description="MP3, WAV, M4A"
            accept="audio/*"
            icon="audio"
            onFilesChange={handleFilesUpload}
            multiple={true}
          />

          <Card className="overflow-hidden border-2 border-primary/5">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                Live Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-col items-center justify-center py-4 gap-4">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "outline"}
                  className={`rounded-full w-20 h-20 sm:w-24 sm:h-24 shadow-lg transition-all ${isRecording ? 'animate-pulse scale-110 shadow-destructive/20' : 'hover:border-primary/50'}`}
                  onClick={toggleRecording}
                >
                  {isRecording ? <MicOff className="h-8 w-8 sm:h-10 sm:w-10" /> : <Mic className="h-8 w-8 sm:h-10 sm:w-10" />}
                </Button>
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    {isRecording ? "Recording..." : "Ready to record"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRecording ? "Click to finish and save" : (recordedAudio ? "Recording saved! Use button below to transcribe." : "Capture voice notes directly")}
                  </p>
                </div>
              </div>

              {recordedAudio && (
                <PrimaryButton
                  gradient
                  className="w-full"
                  onClick={() => processFile(recordedAudio, `Recording_${new Date().toLocaleTimeString()}.wav`)}
                  disabled={isRecording}
                >
                  Transcribe Recording
                </PrimaryButton>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse">Loading transcriptions...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Mic className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No audio transcribed</h3>
              <p>Upload files or record live audio on the left to start.</p>
            </div>
          ) : (
            <MultiFileView
              files={results}
              selectedIndex={currentIndex}
              onSelect={setCurrentIndex}
              onAdd={handleAddMore}
              renderContent={renderSpeechContent}
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

export default SpeechLanguagePage;
