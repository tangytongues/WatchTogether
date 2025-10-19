import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff, Crown, Monitor } from "lucide-react";
import type { Participant } from "@shared/schema";

interface ParticipantListProps {
  participants: Participant[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-2">
        {participants.map((participant) => {
          const initials = participant.username
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-card-border/50 hover-elevate"
              data-testid={`participant-${participant.id}`}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary font-heading font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">
                    {participant.username}
                  </p>
                  {participant.isHost && (
                    <Crown className="w-4 h-4 text-chart-3 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {participant.isMuted ? (
                    <MicOff className="w-3 h-3 text-destructive" />
                  ) : (
                    <Mic className="w-3 h-3 text-chart-2" />
                  )}
                  {participant.isCameraOff ? (
                    <VideoOff className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Video className="w-3 h-3 text-chart-2" />
                  )}
                  {participant.isSharingScreen && (
                    <Monitor className="w-3 h-3 text-chart-3" />
                  )}
                </div>
              </div>

              <div className="w-2 h-2 rounded-full bg-chart-2 flex-shrink-0" title="Online" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
