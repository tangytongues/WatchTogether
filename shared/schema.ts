import { z } from "zod";

export interface Room {
  id: string;
  name: string;
  createdAt: Date;
  hostId: string;
}

export interface Participant {
  id: string;
  roomId: string;
  username: string;
  isHost: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isSharingScreen: boolean;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: Date;
}

export interface MediaState {
  isPlaying: boolean;
  currentTime: number;
  url: string;
}

export const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required").max(100),
  username: z.string().min(1, "Username is required").max(50),
});

export const joinRoomSchema = z.object({
  roomId: z.string(),
  username: z.string().min(1, "Username is required").max(50),
});

export const sendMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1).max(1000),
});

export const updateMediaStateSchema = z.object({
  roomId: z.string(),
  isPlaying: z.boolean(),
  currentTime: z.number(),
  url: z.string().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateMediaStateInput = z.infer<typeof updateMediaStateSchema>;

export enum WebSocketMessageType {
  JOIN_ROOM = "JOIN_ROOM",
  LEAVE_ROOM = "LEAVE_ROOM",
  CHAT_MESSAGE = "CHAT_MESSAGE",
  MEDIA_STATE_UPDATE = "MEDIA_STATE_UPDATE",
  PARTICIPANT_UPDATE = "PARTICIPANT_UPDATE",
  WEBRTC_OFFER = "WEBRTC_OFFER",
  WEBRTC_ANSWER = "WEBRTC_ANSWER",
  WEBRTC_ICE_CANDIDATE = "WEBRTC_ICE_CANDIDATE",
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
}
