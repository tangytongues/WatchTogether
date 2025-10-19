import { useEffect, useRef, useState } from "react";

export function useMediaStream(enabled: boolean) {
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function getStream() {
      if (!enabled) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (mounted) {
          streamRef.current = stream;
          setIsLoading(false);
        } else {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to access camera/microphone');
          setIsLoading(false);
        }
      }
    }

    getStream();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [enabled]);

  const muteAudio = (muted: boolean) => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  };

  const toggleVideo = (enabled: boolean) => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  };

  return {
    stream: streamRef.current,
    isLoading,
    error,
    muteAudio,
    toggleVideo,
  };
}
