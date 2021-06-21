export enum MessageType {
    PARTICIPANT_LOGIN = 'PARTICIPANT_LOGIN',
    SCRUM_MASTER_LOGIN = 'SCRUM_MASTER_LOGIN',
    PERSISTENT_ID_GENERATED = 'PERSISTENT_ID_GENERATED',
}

export type ClientMessage =
    | ScrumMasterLoginMessage
    | ParticipantLoginMessage;

export type ServerMessage =
    | PersistentIdGeneratedMessage;

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
