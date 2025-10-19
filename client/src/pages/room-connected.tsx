import { useEffect, useState, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { 
  Video, 
  Copy, 
  Settings, 
  Users,
  MessageSquare,
  X,
} from "lucide-react";
import { VideoGrid } from "@/components/video-grid";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ParticipantList } from "@/components/participant-list";
import { ControlBar } from "@/components/control-bar";
import { VideoPlayer } from "@/components/video-player";
import type { Participant, ChatMessage } from "@shared/schema";

export default function RoomConnected() {
  const [match, params] = useRoute("/room/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const roomId = params?.id || "";

  useEffect(() => {
    if (!match) return;

    const storedUsername = localStorage.getItem('username');
    const storedRoomName = localStorage.getItem(`room_${roomId}_name`);
    
    if (!storedUsername) {
      setLocation('/');
      return;
    }

    setUsername(storedUsername);
    setRoomName(storedRoomName || `Room ${roomId}`);
  }, [match, roomId, setLocation]);

  const handleRoomJoined = useCallback((data: { 
    participantId: string; 
    participants: Participant[]; 
    messages: ChatMessage[] 
  }) => {
    setParticipantId(data.participantId);
    
    const participantsWithLocal = data.participants.map(p => 
      p.id === data.participantId ? { ...p, id: 'local-stream' } : p
    );
    setParticipants(participantsWithLocal);
    setMessages(data.messages);
    setIsInitialized(true);
  }, []);

  const handleParticipantsUpdate = useCallback((updatedParticipants: Participant[]) => {
    if (!participantId) {
      setParticipants(updatedParticipants);
      return;
    }
    
    const participantsWithLocal = updatedParticipants.map(p => 
      p.id === participantId ? { ...p, id: 'local-stream' } : p
    );
    setParticipants(participantsWithLocal);
  }, [participantId]);

  const handleMessageReceived = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const [remoteMediaState, setRemoteMediaState] = useState<{ isPlaying: boolean; currentTime: number; url: string } | null>(null);

  const handleMediaStateUpdate = useCallback((state: { isPlaying: boolean; currentTime: number; url: string }) => {
    setRemoteMediaState(state);
  }, []);

  const { isConnected, sendMessage, updateParticipant, updateMediaState } = useWebSocket({
    roomId,
    username,
    onRoomJoined: handleRoomJoined,
    onParticipantsUpdate: handleParticipantsUpdate,
    onMessageReceived: handleMessageReceived,
    onMediaStateUpdate: handleMediaStateUpdate,
  });

  const handleCopyLink = () => {
    const roomUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomUrl);
    toast({
      title: "Link copied!",
      description: "Share this link with friends to invite them to the room.",
    });
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    updateParticipant({ isMuted: newMuted });
  };

  const handleToggleCamera = () => {
    const newCameraOff = !isCameraOff;
    setIsCameraOff(newCameraOff);
    updateParticipant({ isCameraOff: newCameraOff });
  };

  const handleToggleScreenShare = () => {
    const newSharing = !isSharingScreen;
    setIsSharingScreen(newSharing);
    updateParticipant({ isSharingScreen: newSharing });
  };

  const handleLeaveRoom = () => {
    setLocation('/');
  };

  if (!match || !username) return null;

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">
            {isConnected ? "Joining room..." : "Connecting..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Video className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-semibold text-lg" data-testid="text-room-name">
              {roomName}
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-chart-2' : 'bg-destructive'}`} />
              <p className="text-xs text-muted-foreground">
                {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="rounded-lg hidden sm:flex"
            data-testid="button-copy-link"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyLink}
            className="rounded-lg sm:hidden"
            data-testid="button-copy-link-mobile"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
            className="rounded-lg lg:hidden"
            data-testid="button-toggle-participants"
          >
            <Users className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="rounded-lg lg:hidden"
            data-testid="button-toggle-chat"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-lg"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {isVideoPlayerOpen ? (
            <div className="flex-1 relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVideoPlayerOpen(false)}
                className="absolute top-4 right-4 z-10 rounded-lg backdrop-blur-sm bg-background/50"
                data-testid="button-close-video-player"
              >
                <X className="w-4 h-4 mr-2" />
                Close Player
              </Button>
              <VideoPlayer 
                roomId={roomId}
                onMediaStateUpdate={(state) => {
                  if (state.isPlaying !== undefined || state.currentTime !== undefined || state.url) {
                    updateMediaState({
                      isPlaying: state.isPlaying ?? false,
                      currentTime: state.currentTime ?? 0,
                      url: state.url ?? ''
                    });
                  }
                }}
                onMediaStateReceived={remoteMediaState ? () => remoteMediaState : undefined}
              />
            </div>
          ) : (
            <div className="flex-1 p-4 overflow-auto">
              <VideoGrid 
                participants={participants}
                isSharingScreen={isSharingScreen}
              />
            </div>
          )}

          <ControlBar
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isSharingScreen={isSharingScreen}
            isVideoPlayerOpen={isVideoPlayerOpen}
            onToggleMute={handleToggleMute}
            onToggleCamera={handleToggleCamera}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleVideoPlayer={() => setIsVideoPlayerOpen(!isVideoPlayerOpen)}
            onLeaveRoom={handleLeaveRoom}
          />
        </div>

        {isParticipantsOpen && (
          <div className="w-80 border-l border-border bg-card/30 backdrop-blur-sm lg:hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-heading font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsParticipantsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ParticipantList participants={participants} />
          </div>
        )}

        <div className="hidden lg:block w-64 border-l border-border bg-card/30 backdrop-blur-sm">
          <div className="p-4 border-b border-border">
            <h2 className="font-heading font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants
            </h2>
          </div>
          <ParticipantList participants={participants} />
        </div>

        {isChatOpen && (
          <div className="w-full lg:w-80 border-l border-border bg-card/30 backdrop-blur-sm flex flex-col absolute lg:relative inset-0 lg:inset-auto z-20 lg:z-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-heading font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 lg:hidden"
                data-testid="button-close-chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ChatSidebar 
              messages={messages}
              currentUserId={participantId}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
