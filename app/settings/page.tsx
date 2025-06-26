"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";

const THEME_COLORS = [
  { name: "Default", value: "default", primary: "hsl(221.2 83.2% 53.3%)" },
  { name: "Red", value: "red", primary: "hsl(0 72% 51%)" },
  { name: "Green", value: "green", primary: "hsl(142 76% 36%)" },
  { name: "Purple", value: "purple", primary: "hsl(262 83% 58%)" },
  { name: "Orange", value: "orange", primary: "hsl(24 95% 53%)" },
  { name: "Teal", value: "teal", primary: "hsl(168 76% 42%)" },
  { name: "Pink", value: "pink", primary: "hsl(330 81% 60%)" },
  { name: "Yellow", value: "yellow", primary: "hsl(48 96% 53%)" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { getItem, setItem } = useLocalStorage();
  const [theme, setTheme] = useState("system");
  const [themeColor, setThemeColor] = useState("default");
  const [exportData, setExportData] = useState("");
  const [settings, setSettings] = useState({
    autoPlayAudio: false,
    showImageFirst: true,
    enableSpacedRepetition: true,
    cardsPerSession: 20,
  });

  useEffect(() => {
    const storedSettings = getItem<typeof settings>("flashmaster:settings");
    if (storedSettings) {
      setSettings(storedSettings);
    }

    const storedTheme = getItem<string>("flashmaster:theme");
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    }

    const storedThemeColor = getItem<string>("flashmaster:theme-color");
    if (storedThemeColor) {
      setThemeColor(storedThemeColor);
      applyThemeColor(storedThemeColor);
    }
  }, [getItem]);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    setItem("flashmaster:settings", updatedSettings);

    toast({
      title: "Settings updated",
      description: "Your preferences have been saved.",
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setItem("flashmaster:theme", newTheme);
    applyTheme(newTheme);
  };

  const handleThemeColorChange = (newColor: string) => {
    setThemeColor(newColor);
    setItem("flashmaster:theme-color", newColor);
    applyThemeColor(newColor);

    toast({
      title: "Theme color updated",
      description: "Your color preference has been saved.",
    });
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const applyThemeColor = (colorName: string) => {
    const root = document.documentElement;
    const color = THEME_COLORS.find((c) => c.value === colorName);

    if (color) {
      // Convert HSL to hue, saturation, lightness values
      const hslMatch = color.primary.match(
        /hsl\((\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%\)/
      );

      if (hslMatch) {
        const [_, h, s, l] = hslMatch;
        root.style.setProperty("--primary-hue", h);
        root.style.setProperty("--primary-saturation", `${s}%`);
        root.style.setProperty("--primary-lightness", `${l}%`);
      }
    }
  };

  const handleExportData = () => {
    try {
      const decks = getItem<any[]>("flashmaster:decks") || [];
      const allData: Record<string, any> = {
        decks,
        settings: settings,
        theme,
        themeColor,
      };

      // Add cards for each deck
      decks.forEach((deck) => {
        const deckCards = getItem<any[]>(`flashmaster:cards:${deck.id}`) || [];
        allData[`cards:${deck.id}`] = deckCards;
      });

      // Add study sessions
      const studySessions = getItem<any[]>("flashmaster:study-sessions") || [];
      allData["study-sessions"] = studySessions;

      const dataStr = JSON.stringify(allData, null, 2);
      setExportData(dataStr);

      // Create download link
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;
      const exportFileDefaultName = `flashmaster-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Data exported",
        description: "Your flashcards have been exported successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Import decks
        if (importedData.decks) {
          setItem("flashmaster:decks", importedData.decks);
        }

        // Import settings
        if (importedData.settings) {
          setItem("flashmaster:settings", importedData.settings);
          setSettings(importedData.settings);
        }

        // Import theme settings
        if (importedData.theme) {
          setItem("flashmaster:theme", importedData.theme);
          setTheme(importedData.theme);
          applyTheme(importedData.theme);
        }

        if (importedData.themeColor) {
          setItem("flashmaster:theme-color", importedData.themeColor);
          setThemeColor(importedData.themeColor);
          applyThemeColor(importedData.themeColor);
        }

        // Import study sessions
        if (importedData["study-sessions"]) {
          setItem("flashmaster:study-sessions", importedData["study-sessions"]);
        }

        // Import cards for each deck
        Object.keys(importedData).forEach((key) => {
          if (key.startsWith("cards:")) {
            setItem(
              key.replace("cards:", "flashmaster:cards:"),
              importedData[key]
            );
          }
        });

        toast({
          title: "Data imported",
          description: "Your flashcards have been imported successfully.",
        });
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import failed",
          description: "There was an error importing your data.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full">
      <div className="container max-w-4xl py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            <div className="grid gap-8">
              <Card className="bg-muted/60 border-none">
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>
                    Choose between light and dark mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <RadioGroup
                      value={theme}
                      onValueChange={handleThemeChange}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label
                          htmlFor="light"
                          className="flex items-center gap-1"
                        >
                          <Sun className="h-4 w-4" /> Light
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label
                          htmlFor="dark"
                          className="flex items-center gap-1"
                        >
                          <Moon className="h-4 w-4" /> Dark
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Label htmlFor="system">System</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/60 border-none">
                <CardHeader>
                  <CardTitle>Color Theme</CardTitle>
                  <CardDescription>
                    Customize the primary color of the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {THEME_COLORS.map((color) => (
                      <div key={color.value} className="text-center">
                        <button
                          className="w-10 h-10 rounded-full inline-flex items-center justify-center border-2 transition-all"
                          style={{
                            backgroundColor: color.primary,
                            borderColor:
                              themeColor === color.value
                                ? "hsl(var(--foreground))"
                                : "transparent",
                          }}
                          onClick={() => handleThemeColorChange(color.value)}
                          title={color.name}
                        >
                          {themeColor === color.value && (
                            <Check className="h-5 w-5 text-white" />
                          )}
                        </button>
                        <div className="text-xs mt-1">{color.name}</div>
                      </div>
                    ))}

                    <div className="text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-10 h-10 rounded-full inline-flex items-center justify-center border-2 bg-muted"
                            title="Custom color"
                          >
                            <Palette className="h-5 w-5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-4">
                            <h4 className="font-medium">Custom Color</h4>
                            <div className="space-y-2">
                              <Label htmlFor="custom-color">
                                Select a color
                              </Label>
                              <input
                                id="custom-color"
                                type="color"
                                className="w-full h-10 cursor-pointer"
                                onChange={(e) => {
                                  // Convert hex to HSL and apply
                                  const hexToRgb = (hex: string) => {
                                    const r =
                                      Number.parseInt(hex.slice(1, 3), 16) /
                                      255;
                                    const g =
                                      Number.parseInt(hex.slice(3, 5), 16) /
                                      255;
                                    const b =
                                      Number.parseInt(hex.slice(5, 7), 16) /
                                      255;
                                    return [r, g, b];
                                  };

                                  const rgbToHsl = (
                                    r: number,
                                    g: number,
                                    b: number
                                  ) => {
                                    const max = Math.max(r, g, b);
                                    const min = Math.min(r, g, b);
                                    let h = 0,
                                      s = 0,
                                      l = (max + min) / 2;

                                    if (max !== min) {
                                      const d = max - min;
                                      s =
                                        l > 0.5
                                          ? d / (2 - max - min)
                                          : d / (max + min);

                                      switch (max) {
                                        case r:
                                          h = (g - b) / d + (g < b ? 6 : 0);
                                          break;
                                        case g:
                                          h = (b - r) / d + 2;
                                          break;
                                        case b:
                                          h = (r - g) / d + 4;
                                          break;
                                      }

                                      h = Math.round(h * 60);
                                    }

                                    s = Math.round(s * 100);
                                    l = Math.round(l * 100);

                                    return [h, s, l];
                                  };

                                  const [r, g, b] = hexToRgb(e.target.value);
                                  const [h, s, l] = rgbToHsl(r, g, b);

                                  document.documentElement.style.setProperty(
                                    "--primary-hue",
                                    h.toString()
                                  );
                                  document.documentElement.style.setProperty(
                                    "--primary-saturation",
                                    `${s}%`
                                  );
                                  document.documentElement.style.setProperty(
                                    "--primary-lightness",
                                    `${l}%`
                                  );

                                  setThemeColor("custom");
                                  setItem("flashmaster:theme-color", "custom");
                                  setItem(
                                    "flashmaster:custom-color",
                                    e.target.value
                                  );
                                }}
                              />
                            </div>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                toast({
                                  title: "Custom color applied",
                                  description:
                                    "Your custom color has been saved.",
                                });
                              }}
                            >
                              Apply Custom Color
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <div className="text-xs mt-1">Custom</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="study">
            <Card className="bg-muted/60 border-none">
              <CardHeader>
                <CardTitle>Study Preferences</CardTitle>
                <CardDescription>
                  Customize your study experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-spaced-repetition">
                    Enable spaced repetition
                  </Label>
                  <Switch
                    id="enable-spaced-repetition"
                    checked={settings.enableSpacedRepetition}
                    onCheckedChange={(checked) =>
                      handleSettingChange("enableSpacedRepetition", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cards per study session</Label>
                  <RadioGroup
                    value={settings.cardsPerSession.toString()}
                    onValueChange={(value) =>
                      handleSettingChange(
                        "cardsPerSession",
                        Number.parseInt(value)
                      )
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10" id="cards-10" />
                      <Label htmlFor="cards-10">10</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="20" id="cards-20" />
                      <Label htmlFor="cards-20">20</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="50" id="cards-50" />
                      <Label htmlFor="cards-50">50</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="100" id="cards-100" />
                      <Label htmlFor="cards-100">100</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card className="bg-muted/60 border-none">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export and import your flashcard data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button onClick={handleExportData}>Export All Data</Button>
                  <p className="text-sm text-muted-foreground">
                    Download all your decks, cards, and study history as a JSON
                    file
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="import-file">Import Data</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Import previously exported flashcard data
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
