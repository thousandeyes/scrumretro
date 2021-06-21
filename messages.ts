import Column from "./client/models/Column";

export enum MessageType {
    PARTICIPANT_LOGIN = 'PARTICIPANT_LOGIN',
    SCRUM_MASTER_LOGIN = 'SCRUM_MASTER_LOGIN',
    PERSISTENT_ID_GENERATED = 'PERSISTENT_ID_GENERATED',
    ROOM_JOINED = 'ROOM_JOINED',
    ACTION_FAILED = 'ACTION_FAILED',
}

export type ClientMessage =
    | ScrumMasterLoginMessage
    | ParticipantLoginMessage;

export type ServerMessage =
    | PersistentIdGeneratedMessage
    | RoomJoinedMessage
    | ActionFailedMessage;

export interface ScrumMasterLoginMessage {
    type: MessageType.SCRUM_MASTER_LOGIN;
    persistentId?: string;
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
    type: MessageType.ROOM_JOINED,
    roomName: string;
    columns: Column[];
}

export interface ActionFailedMessage {
    type: MessageType.ACTION_FAILED;
    request: ClientMessage;
    details: any;
}
