import { randomUUID } from "crypto";
import type { Room, Participant, ChatMessage } from "@shared/schema";

export interface IStorage {
  createRoom(name: string, hostId: string): Promise<Room>;
  getRoom(roomId: string): Promise<Room | undefined>;
  deleteRoom(roomId: string): Promise<void>;
  
  addParticipant(participant: Omit<Participant, 'id' | 'joinedAt'>): Promise<Participant>;
  getParticipant(participantId: string): Promise<Participant | undefined>;
  getRoomParticipants(roomId: string): Promise<Participant[]>;
  updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined>;
  removeParticipant(participantId: string): Promise<void>;
  
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;
  getRoomMessages(roomId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private participants: Map<string, Participant>;
  private messages: Map<string, ChatMessage>;

  constructor() {
    this.rooms = new Map();
    this.participants = new Map();
    this.messages = new Map();
  }

  async createRoom(name: string, roomId: string): Promise<Room> {
    const room: Room = {
      id: roomId,
      name,
      createdAt: new Date(),
      hostId: roomId,
    };
    this.rooms.set(roomId, room);
    return room;
  }

  async getRoom(roomId: string): Promise<Room | undefined> {
    return this.rooms.get(roomId);
  }

  async deleteRoom(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
    
    const participants = Array.from(this.participants.values())
      .filter(p => p.roomId === roomId);
    participants.forEach(p => this.participants.delete(p.id));
    
    const messages = Array.from(this.messages.values())
      .filter(m => m.roomId === roomId);
    messages.forEach(m => this.messages.delete(m.id));
  }

  async addParticipant(participantData: Omit<Participant, 'id' | 'joinedAt'>): Promise<Participant> {
    const id = randomUUID();
    const participant: Participant = {
      ...participantData,
      id,
      joinedAt: new Date(),
    };
    this.participants.set(id, participant);
    return participant;
  }

  async getParticipant(participantId: string): Promise<Participant | undefined> {
    return this.participants.get(participantId);
  }

  async getRoomParticipants(roomId: string): Promise<Participant[]> {
    return Array.from(this.participants.values())
      .filter(p => p.roomId === roomId)
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
  }

  async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined> {
    const participant = this.participants.get(participantId);
    if (!participant) return undefined;
    
    const updated = { ...participant, ...updates };
    this.participants.set(participantId, updated);
    return updated;
  }

  async removeParticipant(participantId: string): Promise<void> {
    this.participants.delete(participantId);
  }

  async addMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...messageData,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getRoomMessages(roomId: string): Promise<ChatMessage[]> {
    return Array.from(this.messages.values())
      .filter(m => m.roomId === roomId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new MemStorage();
