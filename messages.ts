import Column from "./client/models/Column";

export enum MessageType {
  PARTICIPANT_LOGIN = "PARTICIPANT_LOGIN",
  PARTICIPANT_JOINED = "PARTICIPANT_JOINED",
  SCRUM_MASTER_LOGIN = "SCRUM_MASTER_LOGIN",
  SCRUM_MASTER_ADD_COLUMN = "SCRUM_MASTER_ADD_COLUMN",
  COLUMNS_UPDATED = "COLUMNS_UPDATED",
  CONFLUENCE_NOTES_SYNC = "CONFLUENCE_NOTES_SYNC",
  CONFLUENCE_NOTES_SYNCED = "CONFLUENCE_NOTES_SYNCED",
  PERSISTENT_ID_GENERATED = "PERSISTENT_ID_GENERATED",
  ROOM_JOINED = "ROOM_JOINED",
  ACTION_FAILED = "ACTION_FAILED"
}

export type ClientMessage =
  | ScrumMasterLoginMessage
  | ScrumMasterAddColumnMessage
  | ParticipantLoginMessage
  | ConfluenceNotesSyncMessage;

export type ServerMessage =
  | PersistentIdGeneratedMessage
  | RoomJoinedMessage
  | ParticipantJoinedMessage
  | ActionFailedMessage
  | ColumnsUpdatedMessage
  | InternalError
  | ConfluenceNotesSyncedMessage;

export interface ScrumMasterLoginMessage {
  type: MessageType.SCRUM_MASTER_LOGIN;
  persistentId?: string;
}

export interface ScrumMasterAddColumnMessage {
  type: MessageType.SCRUM_MASTER_ADD_COLUMN;
  persistentId: string;
}

export interface ColumnsUpdatedMessage {
  type: MessageType.COLUMNS_UPDATED;
  columns: Column[];
}

export interface ParticipantLoginMessage {
  type: MessageType.PARTICIPANT_LOGIN;
  persistentId?: string;
  participantName: string;
  roomName: string;
}

export interface PersistentIdGeneratedMessage {
  type: MessageType.PERSISTENT_ID_GENERATED;
  persistentId: string;
}

export interface RoomJoinedMessage {
  type: MessageType.ROOM_JOINED;
  roomName: string;
  columns: Column[];
}

export interface ParticipantJoinedMessage {
  type: MessageType.PARTICIPANT_JOINED;
  roomName: string;
  participantName: string;
  persistentId: string;
}

export interface ActionFailedMessage {
  type: MessageType.ACTION_FAILED;
  request: ClientMessage;
  details: any;
}

export interface InternalError {
  type: undefined;
  message: string;
}

export interface ConfluenceNotesSyncMessage {
  type: MessageType.CONFLUENCE_NOTES_SYNC;
  persistentId?: string;
}

export interface ConfluenceNotesSyncedMessage {
  type: MessageType.CONFLUENCE_NOTES_SYNCED;
  response: string;
  confluencePageUrl?: string;
}
