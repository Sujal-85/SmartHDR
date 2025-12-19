import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [entryLoading, setEntryLoading] = useState(true);
    const { signup, login } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        const timer = setTimeout(() => setEntryLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (entryLoading) return <LoadingScreen />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signup(email, password, fullName);
            await login(email, password); // Log in immediately after signup
            toast.success("Account created! Welcome.");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            <div className="flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1 relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight">IntelliScan</span>
                        </div>
                    </div>

                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
                        <p className="text-muted-foreground">
                            Start your 7-day free trial today.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12"
                                />
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground leading-relaxed">
                            By creating an account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                        </div>

                        <PrimaryButton
                            type="submit"
                            gradient
                            className="w-full h-12 text-lg font-semibold"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Sign Up"}
                        </PrimaryButton>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <Link
                    to="/"
                    className="absolute top-8 left-8 p-2 rounded-full hover:bg-muted transition-colors flex items-center gap-2 text-sm text-muted-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Link>
            </div>

            <div className="hidden lg:flex flex-col justify-between p-12 gradient-bg text-primary-foreground relative overflow-hidden order-1 lg:order-2">
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 mb-12">
                        <Sparkles className="h-6 w-6" />
                        <span className="font-bold text-2xl tracking-tight">IntelliScan</span>
                    </Link>
                    <div className="space-y-12">
                        <h1 className="text-5xl font-bold leading-tight">
                            Scale Your Productivity with AI
                        </h1>

                        <div className="space-y-8">
                            {[
                                "Unlimited Documents",
                                "Advanced LaTeX Support",
                                "Neural TTS Voices",
                                "Encrypted Data History"
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-4 text-xl">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="relative z-10 text-sm opacity-60">
                    Trusted by 10,000+ professionals worldwide.
                </div>

                {/* Abstract Background Shapes */}
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
        </div>
    );
}
