import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Sparkles, LogOut, User } from "lucide-react";
import { navItems, bottomNavItems } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        setOpen(false);
        navigate("/login");
    };

    return (
        <div className="lg:hidden flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-sidebar border-r-sidebar-border">
                    <SheetHeader className="p-4 flex flex-row items-center gap-3 text-left">
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg gradient-bg flex items-center justify-center cursor-pointer" onClick={() => { navigate("/"); setOpen(false); }}>
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <SheetTitle className="text-base font-semibold text-sidebar-foreground">SmartHDR</SheetTitle>
                            <p className="text-[10px] text-muted-foreground">Recognition Platform</p>
                        </div>
                    </SheetHeader>

                    <Separator className="bg-sidebar-border" />

                    {/* User Info */}
                    {user && (
                        <div className="px-4 py-4">
                            <NavLink
                                to="/profile"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/30 border border-sidebar-border/50 hover:bg-sidebar-accent/50 transition-colors group"
                            >
                                <Avatar className="w-8 h-8 rounded-full border border-primary/20">
                                    <AvatarImage src={user.avatar} className="object-cover" />
                                    <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                                        {user.fullName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{user.fullName}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </NavLink>
                        </div>
                    )}

                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5 flex-shrink-0 transition-colors",
                                            isActive ? "text-primary" : "group-hover:text-primary"
                                        )}
                                    />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <Separator className="bg-sidebar-border" />

                    <div className="p-3 space-y-1">
                        {bottomNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5 flex-shrink-0 transition-colors",
                                            isActive ? "text-primary" : "group-hover:text-primary"
                                        )}
                                    />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}

                        {user && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="w-full justify-start gap-3 px-3 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </Button>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
