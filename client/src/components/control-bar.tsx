import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorStop,
  PhoneOff,
  Play,
  X
} from "lucide-react";

interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isSharingScreen: boolean;
  isVideoPlayerOpen: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleVideoPlayer: () => void;
  onLeaveRoom: () => void;
}

export function ControlBar({
  isMuted,
  isCameraOff,
  isSharingScreen,
  isVideoPlayerOpen,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onToggleVideoPlayer,
  onLeaveRoom,
}: ControlBarProps) {
  return (
    <div className="h-20 border-t border-border bg-card/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="flex items-center gap-2">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="icon"
          onClick={onToggleMute}
          className="w-12 h-12 rounded-full"
          data-testid="button-toggle-mute"
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>

        <Button
          variant={isCameraOff ? "destructive" : "outline"}
          size="icon"
          onClick={onToggleCamera}
          className="w-12 h-12 rounded-full"
          data-testid="button-toggle-camera"
        >
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </Button>

        <Button
          variant={isSharingScreen ? "default" : "outline"}
          size="icon"
          onClick={onToggleScreenShare}
          className="w-12 h-12 rounded-full"
          data-testid="button-toggle-screen-share"
        >
          {isSharingScreen ? <MonitorStop className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </Button>

        <div className="w-px h-8 bg-border mx-2" />

        <Button
          variant={isVideoPlayerOpen ? "default" : "outline"}
          size="icon"
          onClick={onToggleVideoPlayer}
          className="w-12 h-12 rounded-full"
          data-testid="button-toggle-video-player"
          title="Watch Together"
        >
          <Play className="w-5 h-5" />
        </Button>

        <div className="w-px h-8 bg-border mx-2" />

        <Button
          variant="destructive"
          size="icon"
          onClick={onLeaveRoom}
          className="w-12 h-12 rounded-full"
          data-testid="button-leave-room"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
