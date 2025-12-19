import { User, Mail, Calendar, Shield, LogOut, Settings, Bell, History, Camera, Upload } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "sonner";
import { ImageCropper } from "@/components/ImageCropper";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";

export default function ProfilePage() {
    const { user, logout, updateAvatar } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = async (croppedImage: string) => {
        setIsCropperOpen(false);
        setIsUploading(true);
        try {
            await updateAvatar(croppedImage);
            toast.success("Profile picture updated!");
        } catch (error) {
            toast.error("Failed to update profile picture");
        } finally {
            setIsUploading(false);
            setSelectedImage(null);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    if (!user) return null;

    return (
        <PageLayout>
            <TopHeader
                title="Profile"
                description="Manage your account settings and preferences"
            />

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Overview */}
                <Card className="md:col-span-1">
                    <CardContent className="pt-8 flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Avatar className="h-28 w-28 border-4 border-background shadow-xl mb-4 group-hover:opacity-90 transition-opacity">
                                <AvatarImage src={user.avatar} className="object-cover" />
                                <AvatarFallback className="bg-primary/5 text-primary text-3xl">
                                    {user.fullName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center translate-y-2 opacity-0 group-hover:opacity-100 transition-all">
                                <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                                    <Camera className="h-5 w-5" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-center mt-2">{user.fullName}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                        <Badge variant="secondary" className="mb-6">Professional Plan</Badge>

                        <div className="w-full space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate("/dashboard")}>
                                <History className="h-4 w-4" />
                                Recent Activity
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4" />
                                Change Photo
                            </Button>
                            <Separator className="my-2" />
                            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Details & Security */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Personal details and authentication status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold italic">Full Name</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-primary" />
                                        <span>{user.fullName}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold italic">Email Address</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <span>{user.email}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold italic">Joined On</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>December 2024</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold italic">Security Level</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <span>Verified with Google</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Configure how you receive alerts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Bell className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Email Notifications</p>
                                        <p className="text-xs text-muted-foreground">Receive weekly analytics reports</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Configure</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Cropper Modal */}
                {selectedImage && (
                    <ImageCropper
                        image={selectedImage}
                        open={isCropperOpen}
                        onCropComplete={onCropComplete}
                        onCancel={() => {
                            setIsCropperOpen(false);
                            setSelectedImage(null);
                        }}
                    />
                )}
            </div>
        </PageLayout>
    );
}

// Helper for labels
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <p className={className}>{children}</p>;
}
