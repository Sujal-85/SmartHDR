import { useState, useEffect } from "react";
import { PageLayout } from "@/layouts/PageLayout";
import { TopHeader } from "@/components/TopHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, Palette } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
];

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";
  });
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem("notifications");
    return stored === null ? true : stored === "true";
  });
  const [autoSave, setAutoSave] = useState(() => {
    const stored = localStorage.getItem("autoSave");
    return stored === null ? true : stored === "true";
  });
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("highContrast") === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("notifications", String(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("autoSave", String(autoSave));
  }, [autoSave]);

  useEffect(() => {
    localStorage.setItem("highContrast", String(highContrast));
  }, [highContrast]);

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <PageLayout>
      <TopHeader
        title="Settings"
        description="Configure your preferences and application settings"
      >
        <Button onClick={handleSave} gradient className="hidden sm:flex">
          Save Changes
        </Button>
      </TopHeader>

      <div className="w-full space-y-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Appearance */}
          <Card className="h-full">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${isDarkMode ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-muted/80"}`}>
                    {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>

              <Separator />

              {/* High Contrast */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-muted/80">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">High Contrast</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="h-full">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Default Language</Label>
                    <p className="text-sm text-muted-foreground">Used for OCR and transcription</p>
                  </div>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="h-full">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-muted/80">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Processing Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when tasks complete
                    </p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-muted/80">
                    <SettingsIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Auto-Save Results</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save processed files
                    </p>
                  </div>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="h-full">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <SettingsIcon className="h-4 w-4 text-primary" />
                About Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Software Version</span>
                  <Badge variant="outline">v1.0.0-stable</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">Dec 19, 2024</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">System Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-500 font-medium">All Systems Operational</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="h-10">Docs</Button>
                <Button variant="outline" size="sm" className="h-10">Support</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background/80 backdrop-blur-lg sm:hidden z-20">
          <Button onClick={handleSave} gradient className="w-full h-12 text-lg font-bold">
            Save All Changes
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
