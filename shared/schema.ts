import { pgTable, text, timestamp, boolean, integer, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  preferences: jsonb("preferences").$type<{
    theme?: string;
    defaultMuted?: boolean;
    defaultCameraOff?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hostId: text("host_id").notNull(),
  theme: text("theme").default("default"),
  layout: text("layout").default("grid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  username: text("username").notNull(),
  isHost: boolean("is_host").default(false).notNull(),
  isMuted: boolean("is_muted").default(false).notNull(),
  isCameraOff: boolean("is_camera_off").default(false).notNull(),
  isSharingScreen: boolean("is_sharing_screen").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull(),
  senderUsername: text("sender_username").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const sharedFiles = pgTable("shared_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  uploaderId: text("uploader_id").notNull(),
  uploaderUsername: text("uploader_username").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const sharedMedia = pgTable("shared_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  mediaType: text("media_type").notNull(),
  mediaUrl: text("media_url").notNull(),
  title: text("title"),
  thumbnail: text("thumbnail"),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roomThemes = pgTable("room_themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  primaryColor: text("primary_color").notNull(),
  secondaryColor: text("secondary_color").notNull(),
  backgroundColor: text("background_color").notNull(),
  textColor: text("text_color").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const annotations = pgTable("annotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  type: text("type").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, createdAt: true });
export const insertParticipantSchema = createInsertSchema(participants).omit({ id: true, joinedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });
export const insertSharedFileSchema = createInsertSchema(sharedFiles).omit({ id: true, uploadedAt: true });
export const insertSharedMediaSchema = createInsertSchema(sharedMedia).omit({ id: true, createdAt: true });
export const insertRoomThemeSchema = createInsertSchema(roomThemes).omit({ id: true, createdAt: true });
export const insertAnnotationSchema = createInsertSchema(annotations).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type SharedFile = typeof sharedFiles.$inferSelect;
export type InsertSharedFile = z.infer<typeof insertSharedFileSchema>;
export type SharedMedia = typeof sharedMedia.$inferSelect;
export type InsertSharedMedia = z.infer<typeof insertSharedMediaSchema>;
export type RoomTheme = typeof roomThemes.$inferSelect;
export type InsertRoomTheme = z.infer<typeof insertRoomThemeSchema>;
export type Annotation = typeof annotations.$inferSelect;
export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;

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
  FILE_SHARED = "FILE_SHARED",
  MEDIA_SHARED = "MEDIA_SHARED",
  ANNOTATION_ADDED = "ANNOTATION_ADDED",
  ANNOTATION_CLEARED = "ANNOTATION_CLEARED",
  POINTER_MOVED = "POINTER_MOVED",
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
}
