import React, { useEffect, useState } from "react";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ScanLine,
    Calculator,
    PenTool,
    FileText,
    Mic,
    Shield,
    ArrowRight,
    History,
    Trash2,
    FileCode,
    Languages,
    Clock,
    Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { historyAPI } from "@/services/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const features = [
    { icon: ScanLine, title: "OCR", badge: "AI", href: "/scan-ocr", color: "bg-blue-500/10 text-blue-500" },
    { icon: Calculator, title: "Math", badge: "LaTeX", href: "/math-solver", color: "bg-purple-500/10 text-purple-500" },
    { icon: PenTool, title: "Sketch", badge: "SVG", href: "/sketch-to-svg", color: "bg-orange-500/10 text-orange-500" },
    { icon: FileText, title: "PDF", badge: "Tools", href: "/pdf-tools", color: "bg-red-500/10 text-red-500" },
    { icon: Mic, title: "Speech", badge: "Neural", href: "/speech-language", color: "bg-green-500/10 text-green-500" },
    { icon: Shield, title: "Secure", badge: "Privacy", href: "/security", color: "bg-gray-500/10 text-gray-500" },
];

interface TaskHistory {
    id: string;
    taskType: string;
    input: string;
    output: string;
    timestamp: string;
}

export default function DashboardPage() {
    const [history, setHistory] = useState<TaskHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchHistory = async (type: string) => {
        setLoading(true);
        try {
            const data = await historyAPI.getHistory(type === "all" ? undefined : type);
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(activeTab);
    }, [activeTab]);

    const handleViewResult = (task: TaskHistory) => {
        let path = "/dashboard";
        const type = task.taskType.toLowerCase();
        if (type.includes("ocr")) path = "/scan-ocr";
        else if (type.includes("math")) path = "/math-solver";
        else if (type.includes("sketch")) path = "/sketch-to-svg";
        else if (type.includes("pdf")) path = "/pdf-tools";
        else if (type.includes("speech") || type.includes("transcription")) path = "/speech-language";

        navigate(path, { state: { selectedId: task.id } });
    };

    const deleteHistory = async (id: string) => {
        try {
            await historyAPI.deleteHistory(id);
            setHistory(prev => prev.filter(item => item.id !== id));
            toast.success("Task record removed");
        } catch (error) {
            toast.error("Failed to delete record");
        }
    };

    const getTaskIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes("ocr")) return <ScanLine className="h-4 w-4" />;
        if (lowerType.includes("math")) return <Calculator className="h-4 w-4" />;
        if (lowerType.includes("sketch")) return <PenTool className="h-4 w-4" />;
        if (lowerType.includes("pdf")) return <FileText className="h-4 w-4" />;
        if (lowerType.includes("transcription") || lowerType.includes("speech")) return <Mic className="h-4 w-4" />;
        if (lowerType.includes("translation") || lowerType.includes("language")) return <Languages className="h-4 w-4" />;
        return <FileCode className="h-4 w-4" />;
    };

    return (
        <PageLayout>
            <TopHeader
                title={`Welcome👋, ${user?.fullName || "Back"}`}
                description="Access your workspace and recent activity"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12">
                {features.map((feature) => (
                    <Card
                        key={feature.title}
                        className="hover:shadow-md transition-all cursor-pointer group border-transparent hover:border-primary/20"
                        onClick={() => navigate(feature.href)}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                            <div className={`p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform`}>
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{feature.title}</p>
                                <Badge variant="secondary" className="text-[10px] uppercase font-bold opacity-60">
                                    {feature.badge}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            <History className="h-5 w-5 sm:h-6 text-primary" />
                            Recent Activity
                        </h2>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                            <TabsList className="grid grid-cols-3 sm:flex h-9 bg-muted/50 p-1">
                                <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                                <TabsTrigger value="ocr" className="text-xs px-3">OCR</TabsTrigger>
                                <TabsTrigger value="math" className="text-xs px-3">Math</TabsTrigger>
                                <TabsTrigger value="pdf" className="text-xs px-3">PDF</TabsTrigger>
                                <TabsTrigger value="speech" className="text-xs px-3">Voice</TabsTrigger>
                                <TabsTrigger value="sketch" className="text-xs px-3">Sketch</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-muted flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-1/4 bg-muted" />
                                                <div className="h-4 w-3/4 bg-muted" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : history.length === 0 ? (
                            <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                    <Clock className="h-8 w-8 opacity-20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold">No recent tasks</p>
                                    <p className="text-sm text-muted-foreground">Start by using one of the tools above</p>
                                </div>
                                <PrimaryButton variant="outline" size="sm" onClick={() => navigate("/scan-ocr")}>
                                    Try OCR
                                </PrimaryButton>
                            </Card>
                        ) : (
                            history.map((task) => (
                                <Card key={task.id} className="group hover:border-primary/20 transition-colors">
                                    <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-6">
                                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 flex-shrink-0">
                                            {getTaskIcon(task.taskType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
                                                <span className="font-bold capitalize text-sm sm:text-base">{task.taskType}</span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">• {new Date(task.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate font-mono bg-muted/50 px-2 py-0.5 rounded border border-border/5">
                                                {task.input}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <PrimaryButton
                                                
                                                size="icon"
                                                className=" transition-opacity text-destructive hover:text-destructive bg-destructive/10 hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9"
                                                onClick={() => deleteHistory(task.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </PrimaryButton>
                                            <PrimaryButton
                                                variant="outline"
                                                size="sm"
                                                className="hidden sm:flex gap-2"
                                                onClick={() => handleViewResult(task)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Result
                                            </PrimaryButton>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="gradient-bg text-primary-foreground border-0">
                        <CardHeader>
                            <CardTitle className="text-xl">Pro Access</CardTitle>
                            <CardDescription className="text-primary-foreground/70">
                                You're currently on the free trial. Unlock unlimited processing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PrimaryButton variant="secondary" className="w-full font-bold">
                                Upgrade Now
                            </PrimaryButton>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tasks Today</span>
                                <span className="font-bold">12</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">OCR Accuracy</span>
                                <span className="font-bold text-green-500">99.8%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tokens Used</span>
                                <span className="font-bold">2.4k</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
}
