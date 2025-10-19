import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { WebSocketMessageType, type WebSocketMessage } from "@shared/schema";

interface ExtendedWebSocket extends WebSocket {
  participantId?: string;
  roomId?: string;
  isAlive?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Map<string, ExtendedWebSocket>();

  function broadcastToRoom(roomId: string, message: WebSocketMessage, excludeId?: string) {
    const roomParticipants = Array.from(clients.entries())
      .filter(([id, ws]) => ws.roomId === roomId && id !== excludeId);
    
    const messageStr = JSON.stringify(message);
    
    roomParticipants.forEach(([, ws]) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  function sendToParticipant(participantId: string, message: WebSocketMessage) {
    const ws = clients.get(participantId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('New WebSocket connection');
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        switch (message.type) {
          case WebSocketMessageType.JOIN_ROOM: {
            const { roomId, username, roomName } = message.payload;
            
            let room = await storage.getRoom(roomId);
            if (!room) {
              const firstParticipant = (await storage.getRoomParticipants(roomId)).length === 0;
              room = await storage.createRoom(roomName || `Room ${roomId}`, roomId);
            }

            const existingParticipants = await storage.getRoomParticipants(roomId);
            const participant = await storage.addParticipant({
              roomId,
              username,
              isHost: existingParticipants.length === 0,
              isMuted: false,
              isCameraOff: false,
              isSharingScreen: false,
            });

            ws.participantId = participant.id;
            ws.roomId = roomId;
            clients.set(participant.id, ws);

            const roomParticipants = await storage.getRoomParticipants(roomId);
            const roomMessages = await storage.getRoomMessages(roomId);

            sendToParticipant(participant.id, {
              type: WebSocketMessageType.JOIN_ROOM,
              payload: {
                participantId: participant.id,
                room,
                participants: roomParticipants,
                messages: roomMessages,
              },
            });

            broadcastToRoom(roomId, {
              type: WebSocketMessageType.PARTICIPANT_UPDATE,
              payload: {
                participants: roomParticipants,
              },
            }, participant.id);

            break;
          }

          case WebSocketMessageType.LEAVE_ROOM: {
            if (ws.participantId && ws.roomId) {
              await storage.removeParticipant(ws.participantId);
              clients.delete(ws.participantId);

              const roomParticipants = await storage.getRoomParticipants(ws.roomId);
              
              broadcastToRoom(ws.roomId, {
                type: WebSocketMessageType.PARTICIPANT_UPDATE,
                payload: {
                  participants: roomParticipants,
                },
              });

              if (roomParticipants.length === 0) {
                await storage.deleteRoom(ws.roomId);
              }

              ws.participantId = undefined;
              ws.roomId = undefined;
            }
            break;
          }

          case WebSocketMessageType.CHAT_MESSAGE: {
            if (!ws.participantId || !ws.roomId) break;

            const participant = await storage.getParticipant(ws.participantId);
            if (!participant) break;

            const chatMessage = await storage.addMessage({
              roomId: ws.roomId,
              senderId: ws.participantId,
              senderUsername: participant.username,
              content: message.payload.content,
            });

            broadcastToRoom(ws.roomId, {
              type: WebSocketMessageType.CHAT_MESSAGE,
              payload: chatMessage,
            });

            break;
          }

          case WebSocketMessageType.MEDIA_STATE_UPDATE: {
            if (!ws.roomId) break;

            broadcastToRoom(ws.roomId, {
              type: WebSocketMessageType.MEDIA_STATE_UPDATE,
              payload: message.payload,
            }, ws.participantId);

            break;
          }

          case WebSocketMessageType.PARTICIPANT_UPDATE: {
            if (!ws.participantId || !ws.roomId) break;

            await storage.updateParticipant(ws.participantId, message.payload);
            const roomParticipants = await storage.getRoomParticipants(ws.roomId);

            broadcastToRoom(ws.roomId, {
              type: WebSocketMessageType.PARTICIPANT_UPDATE,
              payload: {
                participants: roomParticipants,
              },
            });

            break;
          }

          case WebSocketMessageType.WEBRTC_OFFER:
          case WebSocketMessageType.WEBRTC_ANSWER:
          case WebSocketMessageType.WEBRTC_ICE_CANDIDATE: {
            const { targetParticipantId, ...data } = message.payload;
            
            sendToParticipant(targetParticipantId, {
              type: message.type,
              payload: {
                ...data,
                fromParticipantId: ws.participantId,
              },
            });

            break;
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      console.log('WebSocket connection closed');
      
      if (ws.participantId && ws.roomId) {
        await storage.removeParticipant(ws.participantId);
        clients.delete(ws.participantId);

        const roomParticipants = await storage.getRoomParticipants(ws.roomId);
        
        broadcastToRoom(ws.roomId, {
          type: WebSocketMessageType.PARTICIPANT_UPDATE,
          payload: {
            participants: roomParticipants,
          },
        });

        if (roomParticipants.length === 0) {
          await storage.deleteRoom(ws.roomId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const extWs = ws as ExtendedWebSocket;
      
      if (extWs.isAlive === false) {
        return ws.terminate();
      }

      extWs.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  return httpServer;
}
