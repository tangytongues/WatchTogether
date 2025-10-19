import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video } from "lucide-react";

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
  const [, setLocation] = useLocation();
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !username.trim()) return;

    setIsCreating(true);
    
    const roomId = `room-${Math.random().toString(36).substring(2, 10)}`;
    
    localStorage.setItem('username', username);
    localStorage.setItem(`room_${roomId}_name`, roomName);
    localStorage.setItem(`room_${roomId}_host`, 'true');
    
    setTimeout(() => {
      setLocation(`/room/${roomId}`);
      onOpenChange(false);
      setIsCreating(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-create-room">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-heading">Create Your Room</DialogTitle>
          </div>
          <DialogDescription>
            Set up your personal hangout space. Share the link with friends to invite them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateRoom} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Movie Night, Game Session, Study Group..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={100}
              data-testid="input-room-name"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              placeholder="What should we call you?"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              data-testid="input-username"
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-lg"
            disabled={!roomName.trim() || !username.trim() || isCreating}
            data-testid="button-submit-create-room"
          >
            {isCreating ? "Creating Room..." : "Create Room & Join"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
