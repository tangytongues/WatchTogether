import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Youtube, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SharedMedia } from "@shared/schema";

interface MediaSharingPanelProps {
  roomId: string;
  participantId: string;
  username: string;
}

export function MediaSharingPanel({ roomId, participantId, username }: MediaSharingPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaTitle, setMediaTitle] = useState("");

  const { data: mediaList = [], isLoading } = useQuery<SharedMedia[]>({
    queryKey: ['/api/rooms', roomId, 'media'],
  });

  const shareMediaMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/rooms/${roomId}/media`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId, 'media'] });
      setMediaUrl("");
      setMediaTitle("");
      toast({
        title: "Media shared",
        description: "Media has been added to the room",
      });
    },
  });

  const handleShare = () => {
    if (!mediaUrl) {
      toast({
        title: "Error",
        description: "Please provide a media URL",
        variant: "destructive",
      });
      return;
    }

    const isYoutube = mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be');
    
    shareMediaMutation.mutate({
      userId: participantId,
      username,
      mediaType: isYoutube ? 'youtube' : 'other',
      mediaUrl,
      title: mediaTitle || 'Untitled',
    });
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          data-testid="input-media-title"
          placeholder="Media title"
          value={mediaTitle}
          onChange={(e) => setMediaTitle(e.target.value)}
        />
        <Input
          data-testid="input-media-url"
          placeholder="YouTube or streaming URL"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />
        <Button
          data-testid="button-share-media"
          onClick={handleShare}
          disabled={shareMediaMutation.isPending}
          className="w-full"
        >
          <Youtube className="mr-2 h-4 w-4" />
          Share Media
        </Button>
      </div>

      <ScrollArea className="h-[200px]">
        {isLoading ? (
          <div data-testid="text-loading">Loading media...</div>
        ) : mediaList.length === 0 ? (
          <div data-testid="text-no-media" className="text-sm text-muted-foreground">No media shared yet</div>
        ) : (
          <div className="space-y-2">
            {mediaList.map((media) => {
              const youtubeId = extractYouTubeId(media.mediaUrl);
              return (
                <Card key={media.id} data-testid={`card-media-${media.id}`} className="p-3">
                  <div className="flex items-start gap-2">
                    {youtubeId && (
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                        alt={media.title || ''}
                        className="w-20 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{media.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {media.mediaType} • Shared by {media.username}
                      </div>
                    </div>
                    <Button
                      data-testid={`button-play-${media.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(media.mediaUrl, '_blank')}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
