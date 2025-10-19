import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Upload, File, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SharedFile } from "@shared/schema";

interface FileSharingPanelProps {
  roomId: string;
  participantId: string;
  username: string;
}

export function FileSharingPanel({ roomId, participantId, username }: FileSharingPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const { data: files = [], isLoading } = useQuery<SharedFile[]>({
    queryKey: ['/api/rooms', roomId, 'files'],
  });

  const shareFileMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/rooms/${roomId}/files`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId, 'files'] });
      setFileName("");
      setFileUrl("");
      toast({
        title: "File shared",
        description: "File has been shared with the room",
      });
    },
  });

  const handleShare = () => {
    if (!fileName || !fileUrl) {
      toast({
        title: "Error",
        description: "Please provide both file name and URL",
        variant: "destructive",
      });
      return;
    }

    shareFileMutation.mutate({
      uploaderId: participantId,
      uploaderUsername: username,
      fileName,
      fileUrl,
      fileType: fileUrl.includes('.mp4') || fileUrl.includes('video') ? 'video' : 'file',
      fileSize: 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          data-testid="input-filename"
          placeholder="File name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <Input
          data-testid="input-fileurl"
          placeholder="File URL (video or document)"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
        />
        <Button
          data-testid="button-share-file"
          onClick={handleShare}
          disabled={shareFileMutation.isPending}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Share File
        </Button>
      </div>

      <ScrollArea className="h-[200px]">
        {isLoading ? (
          <div data-testid="text-loading">Loading files...</div>
        ) : files.length === 0 ? (
          <div data-testid="text-no-files" className="text-sm text-muted-foreground">No files shared yet</div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} data-testid={`card-file-${file.id}`} className="p-3">
                <div className="flex items-center gap-2">
                  {file.fileType === 'video' ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{file.fileName}</div>
                    <div className="text-xs text-muted-foreground">
                      Shared by {file.uploaderUsername}
                    </div>
                  </div>
                  <Button
                    data-testid={`button-view-${file.id}`}
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(file.fileUrl, '_blank')}
                  >
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
