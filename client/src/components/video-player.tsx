import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Link as LinkIcon
} from "lucide-react";

interface VideoPlayerProps {
  roomId: string;
  onMediaStateUpdate?: (state: { isPlaying?: boolean; currentTime?: number; url?: string }) => void;
  onMediaStateReceived?: (state: { isPlaying: boolean; currentTime: number; url: string }) => void;
}

export function VideoPlayer({ roomId, onMediaStateUpdate, onMediaStateReceived }: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!onMediaStateReceived) return;
    
    const state = onMediaStateReceived({ isPlaying, currentTime, url: currentUrl });
    if (!state) return;
    
    isSyncingRef.current = true;
    
    if (state.url && state.url !== currentUrl) {
      setCurrentUrl(state.url);
    }
    
    if (videoRef.current) {
      const timeDiff = Math.abs(videoRef.current.currentTime - state.currentTime);
      if (timeDiff > 1) {
        videoRef.current.currentTime = state.currentTime;
      }
      
      if (state.isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
      } else if (!state.isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
    
    setIsPlaying(state.isPlaying);
    setCurrentTime(state.currentTime);
    
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 100);
  }, [onMediaStateReceived]);

  const handleLoadVideo = () => {
    if (!videoUrl.trim()) return;
    setCurrentUrl(videoUrl);
    setVideoUrl("");
    
    if (onMediaStateUpdate) {
      onMediaStateUpdate({ url: videoUrl, isPlaying: false, currentTime: 0 });
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    const newPlayingState = !isPlaying;
    
    if (newPlayingState) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setIsPlaying(newPlayingState);
    
    if (onMediaStateUpdate && !isSyncingRef.current) {
      onMediaStateUpdate({ 
        isPlaying: newPlayingState, 
        currentTime: videoRef.current.currentTime,
        url: currentUrl 
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    const newTime = value[0];
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    if (onMediaStateUpdate && !isSyncingRef.current) {
      onMediaStateUpdate({ 
        currentTime: newTime,
        isPlaying,
        url: currentUrl 
      });
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    videoRef.current.volume = newVolume / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste video URL (mp4, webm, etc.)"
            className="flex-1 h-11 rounded-lg"
            data-testid="input-video-url"
            onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
          />
          <Button
            onClick={handleLoadVideo}
            disabled={!videoUrl.trim()}
            className="rounded-lg"
            data-testid="button-load-video"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Load
          </Button>
        </div>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center">
        {currentUrl ? (
          <video
            ref={videoRef}
            src={currentUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            data-testid="video-element"
          />
        ) : (
          <div className="text-center space-y-3 p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <p className="font-heading font-semibold text-lg text-white">No video loaded</p>
            <p className="text-sm text-gray-400">
              Paste a video URL above to start watching together
            </p>
          </div>
        )}
      </div>

      {currentUrl && (
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1"
              data-testid="slider-video-progress"
            />
            <span className="text-sm text-muted-foreground w-12">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlayPause}
                className="rounded-full w-10 h-10"
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleMute}
                  className="rounded-full w-8 h-8"
                  data-testid="button-toggle-volume"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                  data-testid="slider-volume"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="rounded-full w-8 h-8"
              data-testid="button-fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
