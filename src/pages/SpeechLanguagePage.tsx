import { useState, useRef } from "react";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusType } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause, Volume2, Languages, Globe } from "lucide-react";
import { speechAPI } from "@/services/api";

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

const SpeechLanguagePage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<StatusType>("idle");
  const [language, setLanguage] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);

  // Audio Playback State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [transcribedText, setTranscribedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

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
        const url = URL.createObjectURL(audioBlob);
        // setAudioUrl(url); // Optional: Play back recording
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleTranscribe = async () => {
    if (files.length === 0 && !recordedAudio) return;

    try {
      setStatus("processing");

      let fileToUpload: File;
      if (files.length > 0) {
        fileToUpload = files[0];
      } else if (recordedAudio) {
        fileToUpload = new File([recordedAudio], "recording.wav", { type: "audio/wav" });
      } else {
        return;
      }

      const result = await speechAPI.transcribe(fileToUpload);
      setTranscribedText(result.text);
      setStatus("success");
    } catch (error) {
      console.error("Transcription failed:", error);
      setStatus("error");
    }
  };

  const handleTTS = async () => {
    if (!transcribedText) return;
    try {
      const blob = await speechAPI.synthesize(transcribedText);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("TTS Failed", e);
    }
  };

  const handleTranslate = async () => {
    if (!transcribedText) return;
    try {
      const res = await speechAPI.translate(transcribedText, targetLang);
      setTranslatedText(res.translated_text);
    } catch (e) {
      console.error("Translation Failed", e);
    }
  };

  // Handle Play/Pause for TTS
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <PageLayout>
      <TopHeader
        title="Speech & Language"
        description="Transcribe, Translate, and Listen with AI Pro features"
      />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="hidden"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel */}
        <div className="space-y-6">
          <UploadCard
            title="Upload Audio"
            description="MP3, WAV, M4A"
            accept="audio/*"
            icon="audio"
            onFilesChange={setFiles}
          />

          {/* Recording Option */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                Live Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg gap-4">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "outline"}
                  className={`rounded-full w-20 h-20 transition-all ${isRecording ? 'animate-pulse scale-110' : ''}`}
                  onClick={toggleRecording}
                >
                  {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </Button>
                <p className="text-sm font-medium">
                  {isRecording ? "Recording... Click to stop" : (recordedAudio ? "Recording Saved! Ready to Transcribe." : "Click to Start Recording")}
                </p>
              </div>
            </CardContent>
          </Card>

          <PrimaryButton
            gradient
            className="w-full"
            disabled={(files.length === 0 && !recordedAudio) || isRecording}
            isLoading={status === "processing"}
            loadingText="Processing..."
            onClick={handleTranscribe}
          >
            <Mic className="h-4 w-4 mr-2" />
            Transcribe Audio
          </PrimaryButton>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          <ResultCard
            title="Transcription"
            status={status}
            showCopy
            showDownload
            onCopy={() => navigator.clipboard.writeText(transcribedText)}
            className="min-h-[200px] h-[350px]"
          >
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <p>Output will appear here</p>
              </div>
            )}
            {status === "success" && (
              <div className="space-y-4">
                <p className="whitespace-pre-wrap">{transcribedText}</p>
                {translatedText && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Translation ({targetLang})</h4>
                    <p>{translatedText}</p>
                  </div>
                )}
              </div>
            )}
          </ResultCard>

          {/* Tools: TTS & Translate */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Translation */}
              <div className="flex gap-2 items-end">
                <div className="grid gap-1.5 flex-1">
                  <Label>Translate To</Label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {languages.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="secondary" onClick={handleTranslate} disabled={!transcribedText}>
                  <Globe className="h-4 w-4 mr-2" /> Translate
                </Button>
              </div>

              <Separator />

              {/* TTS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">Text-to-Speech</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleTTS} disabled={!transcribedText}>
                  {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                  {isPlaying ? "Pause" : "Listen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default SpeechLanguagePage;
