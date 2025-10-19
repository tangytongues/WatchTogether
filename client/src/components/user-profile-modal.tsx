import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, InsertUser } from "@shared/schema";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}

export function UserProfileModal({ open, onOpenChange, username }: UserProfileModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/users', username],
    enabled: open,
  });

  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [defaultMuted, setDefaultMuted] = useState(false);
  const [defaultCameraOff, setDefaultCameraOff] = useState(false);

  const createUserMutation = useMutation({
    mutationFn: (data: InsertUser) => apiRequest('/api/users', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Profile created",
        description: "Your profile has been created successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    createUserMutation.mutate({
      username,
      email: email || null,
      avatarUrl: avatarUrl || null,
      preferences: {
        defaultMuted,
        defaultCameraOff,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-user-profile">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div data-testid="text-loading">Loading...</div>
        ) : user ? (
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <div data-testid="text-username" className="text-sm font-medium">{user.username}</div>
            </div>
            <div>
              <Label>Email</Label>
              <div data-testid="text-email" className="text-sm">{user.email || "Not set"}</div>
            </div>
            <div>
              <Label>Default Preferences</Label>
              <div className="text-sm">
                Muted: {user.preferences?.defaultMuted ? "Yes" : "No"}<br />
                Camera Off: {user.preferences?.defaultCameraOff ? "Yes" : "No"}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="avatar">Avatar URL (Optional)</Label>
              <Input
                id="avatar"
                data-testid="input-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="muted">Default Muted</Label>
              <Switch
                id="muted"
                data-testid="switch-muted"
                checked={defaultMuted}
                onCheckedChange={setDefaultMuted}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="camera">Default Camera Off</Label>
              <Switch
                id="camera"
                data-testid="switch-camera"
                checked={defaultCameraOff}
                onCheckedChange={setDefaultCameraOff}
              />
            </div>
            <Button
              data-testid="button-save"
              onClick={handleSave}
              disabled={createUserMutation.isPending}
              className="w-full"
            >
              {createUserMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
