import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Palette } from "lucide-react";
import type { RoomTheme } from "@shared/schema";

interface ThemeCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  roomId: string;
}

export function ThemeCustomizer({ open, onOpenChange, userId, roomId }: ThemeCustomizerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: publicThemes = [] } = useQuery<RoomTheme[]>({
    queryKey: ['/api/themes/public'],
    enabled: open,
  });

  const [themeName, setThemeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [isPublic, setIsPublic] = useState(false);

  const createThemeMutation = useMutation<RoomTheme, Error, any>({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/themes', 'POST', data);
      return response;
    },
    onSuccess: async (theme: RoomTheme) => {
      queryClient.invalidateQueries({ queryKey: ['/api/themes'] });
      
      await apiRequest(`/api/rooms/${roomId}`, 'PATCH', { theme: theme.id });
      
      toast({
        title: "Theme created",
        description: "Your theme has been created and applied",
      });
      onOpenChange(false);
    },
  });

  const applyThemeMutation = useMutation({
    mutationFn: (themeId: string) => apiRequest(`/api/rooms/${roomId}`, 'PATCH', { theme: themeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId] });
      toast({
        title: "Theme applied",
        description: "Theme has been applied to the room",
      });
    },
  });

  const handleCreateTheme = () => {
    if (!themeName) {
      toast({
        title: "Error",
        description: "Please provide a theme name",
        variant: "destructive",
      });
      return;
    }

    createThemeMutation.mutate({
      userId,
      name: themeName,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      isPublic,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-theme-customizer" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize Room Theme</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Public Themes</h3>
            <div className="grid grid-cols-2 gap-2">
              {publicThemes.map((theme) => (
                <Button
                  key={theme.id}
                  data-testid={`button-theme-${theme.id}`}
                  variant="outline"
                  onClick={() => applyThemeMutation.mutate(theme.id)}
                  disabled={applyThemeMutation.isPending}
                  className="justify-start"
                >
                  <Palette className="mr-2 h-4 w-4" />
                  {theme.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Create Custom Theme</h3>
            <div className="space-y-3">
              <div>
                <Label>Theme Name</Label>
                <Input
                  data-testid="input-theme-name"
                  value={themeName}
                  onChange={(e: any) => setThemeName(e.target.value)}
                  placeholder="My Custom Theme"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Primary Color</Label>
                  <input
                    data-testid="input-primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-10 rounded border cursor-pointer"
                  />
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <input
                    data-testid="input-secondary-color"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full h-10 rounded border cursor-pointer"
                  />
                </div>
                <div>
                  <Label>Background Color</Label>
                  <input
                    data-testid="input-background-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-10 rounded border cursor-pointer"
                  />
                </div>
                <div>
                  <Label>Text Color</Label>
                  <input
                    data-testid="input-text-color"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded border cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Make Public</Label>
                <Switch
                  data-testid="switch-public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <Button
                data-testid="button-create-theme"
                onClick={handleCreateTheme}
                disabled={createThemeMutation.isPending}
                className="w-full"
              >
                {createThemeMutation.isPending ? "Creating..." : "Create & Apply Theme"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
