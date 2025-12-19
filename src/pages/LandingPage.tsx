import React from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Badge } from "@/components/ui/badge";
import { GlowCard } from "@/components/GlowCard";
import {
    ScanLine,
    Calculator,
    PenTool,
    FileText,
    Mic,
    Shield,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Zap,
    Users,
    Globe,
    Lock,
    UserCircle
} from "lucide-react";

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    const features = [
        { icon: ScanLine, title: "OCR Pro", desc: "Handwritten & Printed text recognition with AI refinement.", color: "rgba(59, 130, 246, 0.3)" },
        { icon: Calculator, title: "Math AI", desc: "Complex equation solving with step-by-step LaTeX output.", color: "rgba(139, 92, 246, 0.3)" },
        { icon: PenTool, title: "Vectorize", desc: "Turn simple sketches into professional SVG graphics.", color: "rgba(236, 72, 153, 0.3)" },
        { icon: FileText, title: "Doc Suite", desc: "Full PDF toolkit: Merge, Compress, Protect, and Convert.", color: "rgba(16, 185, 129, 0.3)" },
        { icon: Mic, title: "Audio AI", desc: "Neural STT and natural sounding TTS in multiple languages.", color: "rgba(245, 158, 11, 0.3)" },
        { icon: Shield, title: "Privacy", desc: "Automatic sensitive data redaction and secure processing.", color: "rgba(107, 114, 128, 0.3)" }
    ];

    const stats = [
        { label: "Active Users", value: "10K+", icon: Users },
        { label: "Documents Daily", value: "50K+", icon: FileText },
        { label: "Success Rate", value: "99.9%", icon: Zap },
        { label: "Global Nodes", value: "24", icon: Globe }
    ];

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/30 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-500/20 blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-purple-500/20 blur-[80px]" />
            </div>

            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 border-b bg-background/60 backdrop-blur-xl transition-colors duration-500">
                <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => navigate("/")}>
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5 }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20"
                        >
                            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                        </motion.div>
                        <span className="font-bold text-xl sm:text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            IntelliScan
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-primary transition-colors">Workflow</a>
                        <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {user ? (
                            <div
                                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border bg-background/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                                onClick={() => navigate("/dashboard")}
                            >
                                <span className="hidden sm:inline text-sm font-medium">{user.fullName || "Dashboard"}</span>
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                                    <AvatarImage src={user.avatar} alt={user.fullName} />
                                    <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <>
                                <PrimaryButton variant="ghost" className="hidden sm:flex" onClick={() => navigate("/login")}>Login</PrimaryButton>
                                <PrimaryButton gradient className="shadow-xl shadow-primary/20 h-9 sm:h-11 px-4 sm:px-6 text-sm sm:text-base" onClick={() => navigate("/signup")}>Get Started</PrimaryButton>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-4 sm:px-6">
                <motion.div
                    style={{ opacity, scale }}
                    className="container mx-auto text-center relative z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 inline-block"
                    >
                        <Badge variant="secondary" className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-primary/5 text-primary border-primary/20 backdrop-blur-md">
                            🚀 The Future of Document AI is Here
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1] mb-6 sm:mb-8"
                    >
                        Digitize Everything <br />
                        <span className="gradient-text">Instant Intelligence.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10 sm:mb-12"
                    >
                        Harness the power of Gemini 1.5 Flash to transform handwritten notes,
                        complex equations, and voice recordings into professional digital assets.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.0, delay: 0.6 }}
                        className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6"
                    >
                        <PrimaryButton gradient size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl gap-3 rounded-2xl shadow-2xl shadow-primary/30 group" onClick={() => navigate("/signup")}>
                            Claim Your Trial <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                        </PrimaryButton>
                        <PrimaryButton variant="outline" size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl rounded-2xl backdrop-blur-md" onClick={() => navigate("/login")}>
                            Watch Demo
                        </PrimaryButton>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-20 flex flex-wrap justify-center gap-12 grayscale opacity-50 contrast-125"
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png" className="h-6 block" alt="Google" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png" className="h-6 block" alt="Amazon" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png" className="h-6 block" alt="Netflix" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/1200px-Slack_Technologies_Logo.svg.png" className="h-6 block" alt="Slack" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Feature Marquee / Stats */}
            <section className="py-20 bg-muted/20 relative border-y border-border/50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center text-center space-y-2"
                            >
                                <stat.icon className="h-8 w-8 text-primary mb-2" />
                                <span className="text-4xl font-black">{stat.value}</span>
                                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Features Grid */}
            <section id="features" className="py-20 sm:py-32 px-4 sm:px-6">
                <div className="container mx-auto text-center">
                    <div className="max-w-3xl mx-auto mb-12 sm:mb-20 space-y-4">
                        <Badge variant="outline" className="text-primary font-bold border-primary/20 px-4 py-1">Capabilities</Badge>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight">One Hub. Infinite Tools.</h2>
                        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                            Stop switching between multiple apps. IntelliScan integrates every cutting-edge
                            AI tool you need to process handwritten data and beyond.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((f, i) => (
                            <GlowCard key={f.title} delay={i * 0.1} glowColor={f.color}>
                                <div className="p-8 text-left h-full flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <f.icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-bold">{f.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed text-lg">{f.desc}</p>
                                        </div>
                                    </div>
                                    <div className="pt-8 mt-auto border-t border-border/10 flex items-center gap-2 text-primary font-bold cursor-pointer group/link">
                                        Learn more <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </GlowCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Highlight Section */}
            <section className="py-20 sm:py-32 bg-primary group overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 sm:gap-20">
                        <div className="flex-1 space-y-8 sm:space-y-10">
                            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-primary-foreground leading-[1] tracking-tighter">
                                Military-Grade <br />Data Security.
                            </h2>
                            <p className="text-lg sm:text-xl text-primary-foreground/80 leading-relaxed font-medium">
                                Your data is your own. We use enterprise-level encryption (AES-256) and
                                automatic sensitive data redaction before any processing starts.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                {[
                                    { icon: Lock, title: "Zero Knowledge", desc: "We can't see your data." },
                                    { icon: CheckCircle2, title: "GDPR Compliant", desc: "100% data sovereignty." }
                                ].map((item) => (
                                    <div key={item.title} className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                                        <item.icon className="h-8 w-8 text-white mb-4" />
                                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                                        <p className="text-white/70 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: -2 }}
                                className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
                                    alt="Cyber Security"
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                            </motion.div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent rounded-full blur-3xl opacity-50 animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ / Simple Pricing */}
            <section id="pricing" className="py-20 sm:py-32 bg-muted/10">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-12 sm:mb-20 tracking-tight">Flexible Intelligence.</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { name: "Free", price: "$0", features: ["10 Docs/Day", "Core OCR", "LaTeX Export", "7-Day Storage"] },
                            { name: "Pro", price: "$19", features: ["Unlimited Docs", "Math Solver Pro", "Voice To Text", "Priority AI"], featured: true },
                            { name: "Enterprise", price: "Custom", features: ["SSO Login", "Advanced API", "Custom Models", "Dedicated Support"] }
                        ].map((plan) => (
                            <GlowCard key={plan.name} glowColor={plan.featured ? "rgba(var(--primary), 0.5)" : undefined}>
                                <div className={cn("p-6 sm:p-10 text-left h-full flex flex-col", plan.featured && "bg-primary/5")}>
                                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="text-4xl sm:text-5xl font-black mb-6 sm:mb-8">{plan.price}<span className="text-base sm:text-lg text-muted-foreground font-medium">/mo</span></div>
                                    <ul className="space-y-4 mb-10 flex-1">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-center gap-2 text-muted-foreground font-medium">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <PrimaryButton
                                        gradient={plan.featured}
                                        variant={plan.featured ? "default" : "outline"}
                                        className="w-full h-14 text-xl rounded-xl"
                                        onClick={() => navigate("/signup")}
                                    >
                                        {plan.name === "Enterprise" ? "Contact Us" : "Get Started"}
                                    </PrimaryButton>
                                </div>
                            </GlowCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 sm:py-40 px-4 sm:px-6 overflow-hidden">
                <div className="container mx-auto text-center relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="p-8 sm:p-20 rounded-[2rem] sm:rounded-[4rem] gradient-bg text-primary-foreground space-y-8 sm:space-y-10 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="relative z-10">
                            <h2 className="text-3xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6">Start Scaling Productivity.</h2>
                            <p className="text-lg sm:text-2xl opacity-90 max-w-2xl mx-auto mb-8 sm:mb-12 font-medium">
                                Join 10,000+ professionals and teams today.
                                No setup fee, no long-term contracts.
                            </p>
                            <PrimaryButton size="lg" variant="secondary" className="h-16 sm:h-20 px-10 sm:px-16 text-xl sm:text-2xl font-black rounded-2xl sm:rounded-3xl shadow-2xl hover:scale-105 transition-transform" onClick={() => navigate("/signup")}>
                                Start 7-Day Free Trial Now
                            </PrimaryButton>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Modern Footer */}
            <footer className="py-20 border-t bg-card">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <span className="font-bold text-2xl tracking-tighter">IntelliScan</span>
                            </div>
                            <p className="text-muted-foreground text-lg max-w-xs uppercase tracking-tight font-medium">
                                Empowering teams with cutting edge AI data extraction.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-bold text-xl">Product</h4>
                            <ul className="space-y-4 text-muted-foreground font-medium">
                                <li>AI Search</li>
                                <li>Doc Analysis</li>
                                <li>Integrations</li>
                                <li>API Docs</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-bold text-xl">Company</h4>
                            <ul className="space-y-4 text-muted-foreground font-medium">
                                <li>About Us</li>
                                <li>Careers</li>
                                <li>Privacy</li>
                                <li>Terms</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground font-medium">
                        <p>© 2024 IntelliScan AI. Global Document Intelligence.</p>
                        <div className="flex gap-8">
                            <span>Twitter</span>
                            <span>LinkedIn</span>
                            <span>GitHub</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
