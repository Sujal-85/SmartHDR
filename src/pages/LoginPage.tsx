import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [entryLoading, setEntryLoading] = useState(true);
    const { login, loginWithGoogle } = useAuth();
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
            await login(email, password);
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            <div className="hidden lg:flex flex-col justify-between p-12 gradient-bg text-primary-foreground relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 mb-12">
                        <Sparkles className="h-6 w-6" />
                        <span className="font-bold text-2xl tracking-tight">IntelliScan</span>
                    </Link>
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Intelligent Data <br />At Your Fingertips
                    </h1>
                    <p className="text-xl opacity-80 max-w-md">
                        Unlock the potential of your documents with our AI-driven recognition suite.
                    </p>
                </div>
                <div className="relative z-10 text-sm opacity-60">
                    © 2024 IntelliScan AI. Professional Document Intelligence.
                </div>

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="flex items-center justify-center p-6 sm:p-12 relative">
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
                        <h2 className="text-3xl font-bold tracking-tight">Login</h2>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12"
                                />
                            </div>
                        </div>

                        <PrimaryButton
                            type="submit"
                            gradient
                            className="w-full h-12 text-lg font-semibold"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Sign In"}
                        </PrimaryButton>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        className="w-full h-12 flex items-center justify-center gap-3 font-semibold "
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await loginWithGoogle();
                                toast.success("Welcome back!");
                                navigate("/dashboard");
                            } catch (error) {
                                toast.error("Google authentication failed");
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Sign in with Google
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary font-semibold hover:underline">
                            Sign up
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
        </div>
    );
}
