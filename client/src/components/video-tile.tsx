import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Crown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Participant } from "@shared/schema";

interface VideoTileProps {
  participant: Participant;
  isCompact?: boolean;
}

export function VideoTile({ participant, isCompact = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.id === 'local-stream') {
      navigator.mediaDevices.getUserMedia({ video: !participant.isCameraOff, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            stream.getAudioTracks().forEach(track => {
              track.enabled = !participant.isMuted;
            });
          }
        })
        .catch(err => {
          console.error('Error accessing media devices:', err);
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [participant.id, participant.isCameraOff, participant.isMuted]);

  const initials = participant.username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div 
      className={`relative rounded-xl bg-card border border-card-border overflow-hidden group ${
        isCompact ? 'aspect-video' : 'aspect-video md:aspect-square lg:aspect-video'
      }`}
      data-testid={`video-tile-${participant.id}`}
    >
      {participant.isCameraOff ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Avatar className={isCompact ? "w-8 h-8" : "w-16 h-16 md:w-20 md:h-20"}>
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-heading font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover bg-muted"
          autoPlay
          playsInline
          muted
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm flex items-center gap-1.5 ${
            isCompact ? 'text-xs' : 'text-sm'
          }`}>
            <span className="font-medium text-white truncate max-w-[120px]">
              {participant.username}
            </span>
            {participant.isHost && (
              <Crown className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-chart-3 flex-shrink-0`} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {participant.isMuted ? (
            <div className="w-7 h-7 rounded-md bg-destructive/90 backdrop-blur-sm flex items-center justify-center">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-md bg-chart-2/90 backdrop-blur-sm flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {participant.isSharingScreen && (
        <div className="absolute top-3 right-3">
          <div className="px-2 py-1 rounded-md bg-chart-3/90 backdrop-blur-sm text-xs font-medium text-white flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Sharing
          </div>
        </div>
      )}
    </div>
  );
}
