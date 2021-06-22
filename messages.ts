import Column from "./client/models/Column";
import Post from "./client/models/Post";

export enum MessageType {
  PARTICIPANT_LOGIN = "PARTICIPANT_LOGIN",
  PARTICIPANT_JOINED = "PARTICIPANT_JOINED",
  PARTICIPANT_LEFT = "PARTICIPANT_LEFT",
  SCRUM_MASTER_LOGIN = "SCRUM_MASTER_LOGIN",
  SCRUM_MASTER_ADD_COLUMN = "SCRUM_MASTER_ADD_COLUMN",
  COLUMNS_UPDATED = "COLUMNS_UPDATED",
  ATLASSIAN_TOKEN_ADD = "ATLASSIAN_TOKEN_ADD",
  ATLASSIAN_TOKEN_ADDED = "ATLASSIAN_TOKEN_ADDED",
  CONFLUENCE_NOTES_SYNC = "CONFLUENCE_NOTES_SYNC",
  CONFLUENCE_NOTES_SYNCED = "CONFLUENCE_NOTES_SYNCED",
  PERSISTENT_ID_GENERATED = "PERSISTENT_ID_GENERATED",
  ROOM_JOINED = "ROOM_JOINED",
  ACTION_FAILED = "ACTION_FAILED",
  ADD_POST = "ADD_POST",
  POST_ADDED = "POST_ADDED",
  CHANGE_COLUMN_OPEN_STATE = "CHANGE_COLUMN_OPEN_STATE",
  COLUMN_OPEN_STATE_CHANGED = "COLUMN_OPEN_STATE_CHANGED",
  CHANGE_COLUMN_NAME = "CHANGE_COLUMN_NAME",
  COLUMN_NAME_CHANGED = "COLUMN_NAME_CHANGED",
  DELETE_COLUMN = "DELETE_COLUMN",
  DELETE_POST = "DELETE_POST",
  POST_DELETED = "POST_DELETED",
}

export type ClientMessage =
  | ScrumMasterLoginMessage
  | ScrumMasterAddColumnMessage
  | ParticipantLoginMessage
  | AtlassianTokenAddMessage
  | ConfluenceNotesSyncMessage
  | AddPostMessage
  | ChangeColumnOpenStateMessage
  | ChangeColumnNameMessage
  | DeleteColumnMessage
  | DeletePostMessage;

export type ServerMessage =
  | PersistentIdGeneratedMessage
  | RoomJoinedMessage
  | ParticipantJoinedMessage
  | ParticipantLeftMessage
  | ActionFailedMessage
  | ColumnsUpdatedMessage
  | InternalError
  | AtlassianTokenAddedMessage
  | ConfluenceNotesSyncedMessage
  | PostAddedMessage
  | ColumnOpenStateChangedMessage
  | ColumnNameChangedMessage
  | PostDeletedMessage;

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

export interface ParticipantLeftMessage {
  type: MessageType.PARTICIPANT_LEFT;
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

export interface AtlassianTokenAddMessage {
  type: MessageType.ATLASSIAN_TOKEN_ADD;
  persistentId: string;
  username: string;
  token: string;
}

export interface AtlassianTokenAddedMessage {
  type: MessageType.ATLASSIAN_TOKEN_ADDED;
  result: boolean;
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

export interface AddPostMessage {
  type: MessageType.ADD_POST;
  participantId: string;
  columnId: string;
  roomName: string;
  content: string;
}

export interface PostAddedMessage {
  type: MessageType.POST_ADDED;
  post: Post;
}

export interface ChangeColumnOpenStateMessage {
  type: MessageType.CHANGE_COLUMN_OPEN_STATE;
  columnId: string;
  roomName: string;
  isOpen: boolean;
}

export interface ColumnOpenStateChangedMessage {
  type: MessageType.COLUMN_OPEN_STATE_CHANGED;
  columnId: string;
  isOpen: boolean;
}

export interface ChangeColumnNameMessage {
  type: MessageType.CHANGE_COLUMN_NAME;
  columnId: string;
  roomName: string;
  columnName: string;
}

export interface ColumnNameChangedMessage {
  type: MessageType.COLUMN_NAME_CHANGED;
  columnId: string;
  columnName: string;
}

export interface DeleteColumnMessage {
  type: MessageType.DELETE_COLUMN;
  columnId: string;
  roomName: string;
}

export interface DeletePostMessage {
  type: MessageType.DELETE_POST;
  postId: string;
  roomName: string;
}

export interface PostDeletedMessage {
  type: MessageType.POST_DELETED;
  postId: string;
}
