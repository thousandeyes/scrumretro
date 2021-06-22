import Column from "./Column";
import Participant from "./Participant";
export enum ROOM_MODE {
  HOST = "HOST",
  PLAYER = "PLAYER"
}
export default interface Room {
  stage?: string;
  roomMode?: ROOM_MODE;
  connected: boolean;
  persistentId?: string;
  roomName?: string;
  columns: Column[];
  createDate?: boolean;
  participants: Participant[];
}
