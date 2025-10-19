import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  Room,
  InsertRoom,
  Participant,
  InsertParticipant,
  ChatMessage,
  InsertChatMessage,
  SharedFile,
  InsertSharedFile,
  SharedMedia,
  InsertSharedMedia,
  User,
  InsertUser,
  RoomTheme,
  InsertRoomTheme,
  Annotation,
  InsertAnnotation,
} from "@shared/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(userId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  
  createRoom(name: string, hostId: string, roomId: string, theme?: string, layout?: string): Promise<Room>;
  getRoom(roomId: string): Promise<Room | undefined>;
  deleteRoom(roomId: string): Promise<void>;
  updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | undefined>;
  
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipant(participantId: string): Promise<Participant | undefined>;
  getRoomParticipants(roomId: string): Promise<Participant[]>;
  updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined>;
  removeParticipant(participantId: string): Promise<void>;
  
  addMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getRoomMessages(roomId: string): Promise<ChatMessage[]>;
  
  addSharedFile(file: InsertSharedFile): Promise<SharedFile>;
  getRoomFiles(roomId: string): Promise<SharedFile[]>;
  
  addSharedMedia(media: InsertSharedMedia): Promise<SharedMedia>;
  getRoomMedia(roomId: string): Promise<SharedMedia[]>;
  
  createRoomTheme(theme: InsertRoomTheme): Promise<RoomTheme>;
  getUserThemes(userId: string): Promise<RoomTheme[]>;
  getPublicThemes(): Promise<RoomTheme[]>;
  
  addAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
  getRoomAnnotations(roomId: string): Promise<Annotation[]>;
  clearRoomAnnotations(roomId: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(schema.users).values(user as any).returning();
    return created;
  }

  async getUser(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createRoom(name: string, hostId: string, roomId: string, theme: string = "default", layout: string = "grid"): Promise<Room> {
    const [room] = await db.insert(schema.rooms).values({
      id: roomId,
      name,
      hostId,
      theme,
      layout,
    }).returning();
    return room;
  }

  async getRoom(roomId: string): Promise<Room | undefined> {
    const [room] = await db.select().from(schema.rooms).where(eq(schema.rooms.id, roomId));
    return room;
  }

  async deleteRoom(roomId: string): Promise<void> {
    await db.delete(schema.rooms).where(eq(schema.rooms.id, roomId));
  }

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | undefined> {
    const [updated] = await db.update(schema.rooms)
      .set(updates)
      .where(eq(schema.rooms.id, roomId))
      .returning();
    return updated;
  }

  async addParticipant(participant: InsertParticipant): Promise<Participant> {
    const [created] = await db.insert(schema.participants).values(participant).returning();
    return created;
  }

  async getParticipant(participantId: string): Promise<Participant | undefined> {
    const [participant] = await db.select().from(schema.participants)
      .where(eq(schema.participants.id, participantId));
    return participant;
  }

  async getRoomParticipants(roomId: string): Promise<Participant[]> {
    return await db.select().from(schema.participants)
      .where(eq(schema.participants.roomId, roomId))
      .orderBy(schema.participants.joinedAt);
  }

  async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined> {
    const [updated] = await db.update(schema.participants)
      .set(updates)
      .where(eq(schema.participants.id, participantId))
      .returning();
    return updated;
  }

  async removeParticipant(participantId: string): Promise<void> {
    await db.delete(schema.participants).where(eq(schema.participants.id, participantId));
  }

  async addMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(schema.chatMessages).values(message).returning();
    return created;
  }

  async getRoomMessages(roomId: string): Promise<ChatMessage[]> {
    return await db.select().from(schema.chatMessages)
      .where(eq(schema.chatMessages.roomId, roomId))
      .orderBy(schema.chatMessages.timestamp);
  }

  async addSharedFile(file: InsertSharedFile): Promise<SharedFile> {
    const [created] = await db.insert(schema.sharedFiles).values(file).returning();
    return created;
  }

  async getRoomFiles(roomId: string): Promise<SharedFile[]> {
    return await db.select().from(schema.sharedFiles)
      .where(eq(schema.sharedFiles.roomId, roomId))
      .orderBy(desc(schema.sharedFiles.uploadedAt));
  }

  async addSharedMedia(media: InsertSharedMedia): Promise<SharedMedia> {
    const [created] = await db.insert(schema.sharedMedia).values(media).returning();
    return created;
  }

  async getRoomMedia(roomId: string): Promise<SharedMedia[]> {
    return await db.select().from(schema.sharedMedia)
      .where(eq(schema.sharedMedia.roomId, roomId))
      .orderBy(desc(schema.sharedMedia.createdAt));
  }

  async createRoomTheme(theme: InsertRoomTheme): Promise<RoomTheme> {
    const [created] = await db.insert(schema.roomThemes).values(theme).returning();
    return created;
  }

  async getUserThemes(userId: string): Promise<RoomTheme[]> {
    return await db.select().from(schema.roomThemes)
      .where(eq(schema.roomThemes.userId, userId))
      .orderBy(desc(schema.roomThemes.createdAt));
  }

  async getPublicThemes(): Promise<RoomTheme[]> {
    return await db.select().from(schema.roomThemes)
      .where(eq(schema.roomThemes.isPublic, true))
      .orderBy(desc(schema.roomThemes.createdAt));
  }

  async addAnnotation(annotation: InsertAnnotation): Promise<Annotation> {
    const [created] = await db.insert(schema.annotations).values(annotation).returning();
    return created;
  }

  async getRoomAnnotations(roomId: string): Promise<Annotation[]> {
    return await db.select().from(schema.annotations)
      .where(eq(schema.annotations.roomId, roomId))
      .orderBy(schema.annotations.createdAt);
  }

  async clearRoomAnnotations(roomId: string): Promise<void> {
    await db.delete(schema.annotations).where(eq(schema.annotations.roomId, roomId));
  }
}

export const storage = new DbStorage();
