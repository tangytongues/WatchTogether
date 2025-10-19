import { VideoTile } from "./video-tile";
import type { Participant } from "@shared/schema";
import { Monitor } from "lucide-react";

interface VideoGridProps {
  participants: Participant[];
  isSharingScreen: boolean;
}

export function VideoGrid({ participants, isSharingScreen }: VideoGridProps) {
  const getGridClass = () => {
    const count = participants.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2";
    if (count <= 6) return "grid-cols-2 md:grid-cols-3";
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  };

  if (isSharingScreen) {
    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex-1 rounded-xl bg-card border border-card-border overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-chart-3/10 flex items-center justify-center">
                <Monitor className="w-8 h-8 text-chart-3" />
              </div>
              <p className="font-heading font-semibold text-lg">Screen Sharing Active</p>
              <p className="text-sm text-muted-foreground">Your screen is being shared</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 h-32">
          {participants.map((participant) => (
            <VideoTile 
              key={participant.id} 
              participant={participant}
              isCompact
            />
          ))}
        </div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Monitor className="w-8 h-8 text-primary" />
          </div>
          <p className="font-heading font-semibold text-lg">Waiting for participants...</p>
          <p className="text-sm text-muted-foreground">Share the room link to invite friends</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${getGridClass()} gap-4 h-full content-center`}>
      {participants.map((participant) => (
        <VideoTile 
          key={participant.id} 
          participant={participant}
        />
      ))}
    </div>
  );
}
