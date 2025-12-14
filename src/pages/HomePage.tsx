import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Badge } from "@/components/ui/badge";
import { ScanLine, Calculator, PenTool, FileText, Mic, Shield, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: ScanLine,
    title: "Scan & OCR",
    description: "Extract text from handwritten notes and printed documents with high accuracy",
    badge: "AI Powered",
    href: "/scan-ocr",
  },
  {
    icon: Calculator,
    title: "Math Solver",
    description: "Recognize mathematical equations and solve them step by step",
    badge: "LaTeX Output",
    href: "/math-solver",
  },
  {
    icon: PenTool,
    title: "Sketch to SVG",
    description: "Convert hand-drawn sketches into clean, scalable vector graphics",
    badge: "Vector",
    href: "/sketch-to-svg",
  },
  {
    icon: FileText,
    title: "PDF Tools",
    description: "Merge, split, compress, and convert documents efficiently",
    badge: "Multi-tool",
    href: "/pdf-tools",
  },
  {
    icon: Mic,
    title: "Speech & Language",
    description: "Transcribe audio to text and convert text to natural speech",
    badge: "Multi-lingual",
    href: "/speech-language",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Protect and redact sensitive information in your documents",
    badge: "Secure",
    href: "/security",
  },
];

const HomePage = () => {
  return (
    <PageLayout>
      <TopHeader
        title="Smart Handwritten Data Recognition"
        description="AI-powered platform for document processing and recognition"
      />

      {/* Hero Section */}
      <Card className="mb-8 overflow-hidden border-0 subtle-gradient">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Recognition</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Transform Handwritten Content into{" "}
                <span className="gradient-text">Digital Data</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Upload documents, sketches, or audio files and let our advanced AI models extract,
                analyze, and transform your content with exceptional accuracy.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <PrimaryButton gradient size="lg" className="gap-2">
                  Start Analysis
                  <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
                <PrimaryButton variant="outline" size="lg">
                  Learn More
                </PrimaryButton>
              </div>
            </div>

            {/* Visual Element */}
            <div className="flex-shrink-0 w-64 h-64 relative">
              <div className="absolute inset-0 gradient-bg rounded-3xl opacity-20 blur-3xl" />
              <div className="relative w-full h-full rounded-3xl border border-border bg-card/50 backdrop-blur flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
                    <ScanLine className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Ready to Process</p>
                    <p className="text-sm text-muted-foreground">Upload your files</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="group hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer"
              onClick={() => (window.location.href = feature.href)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <div className="flex items-center text-sm text-primary font-medium pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Section */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Documents Processed", value: "1M+" },
              { label: "Recognition Accuracy", value: "99.2%" },
              { label: "Languages Supported", value: "50+" },
              { label: "Active Users", value: "10K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default HomePage;
