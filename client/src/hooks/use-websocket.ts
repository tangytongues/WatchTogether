import { useEffect, useRef, useState, useCallback } from "react";
import { WebSocketMessageType, type WebSocketMessage } from "@shared/schema";
import type { Participant, ChatMessage, MediaState } from "@shared/schema";

interface UseWebSocketProps {
  roomId: string;
  username: string;
  onParticipantsUpdate?: (participants: Participant[]) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onMediaStateUpdate?: (state: MediaState) => void;
  onRoomJoined?: (data: { participantId: string; participants: Participant[]; messages: ChatMessage[] }) => void;
}

export function useWebSocket({
  roomId,
  username,
  onParticipantsUpdate,
  onMessageReceived,
  onMediaStateUpdate,
  onRoomJoined,
}: UseWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      const roomName = localStorage.getItem(`room_${roomId}_name`) || undefined;
      
      const joinMessage: WebSocketMessage = {
        type: WebSocketMessageType.JOIN_ROOM,
        payload: { roomId, username, roomName },
      };
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case WebSocketMessageType.JOIN_ROOM:
            setParticipantId(message.payload.participantId);
            onRoomJoined?.({
              participantId: message.payload.participantId,
              participants: message.payload.participants,
              messages: message.payload.messages,
            });
            break;

          case WebSocketMessageType.PARTICIPANT_UPDATE:
            onParticipantsUpdate?.(message.payload.participants);
            break;

          case WebSocketMessageType.CHAT_MESSAGE:
            onMessageReceived?.(message.payload);
            break;

          case WebSocketMessageType.MEDIA_STATE_UPDATE:
            onMediaStateUpdate?.(message.payload);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      wsRef.current = null;

      if (reconnectAttemptsRef.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };
  }, [roomId, username, onParticipantsUpdate, onMessageReceived, onMediaStateUpdate, onRoomJoined]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        const ws = wsRef.current;
        wsRef.current = null;
        
        if (ws.readyState === WebSocket.OPEN) {
          const leaveMessage: WebSocketMessage = {
            type: WebSocketMessageType.LEAVE_ROOM,
            payload: {},
          };
          ws.send(JSON.stringify(leaveMessage));
          ws.close();
        }
      }
    };
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WebSocketMessage = {
      type: WebSocketMessageType.CHAT_MESSAGE,
      payload: { content },
    };
    wsRef.current.send(JSON.stringify(message));
  }, []);

  const updateParticipant = useCallback((updates: Partial<Participant>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WebSocketMessage = {
      type: WebSocketMessageType.PARTICIPANT_UPDATE,
      payload: updates,
    };
    wsRef.current.send(JSON.stringify(message));
  }, []);

  const updateMediaState = useCallback((state: Partial<MediaState>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WebSocketMessage = {
      type: WebSocketMessageType.MEDIA_STATE_UPDATE,
      payload: state,
    };
    wsRef.current.send(JSON.stringify(message));
  }, []);

  return {
    isConnected,
    participantId,
    sendMessage,
    updateParticipant,
    updateMediaState,
  };
}
