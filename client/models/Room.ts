import Column from "./Column";
import Participant from "./Participant";
export enum ROOM_MODE {
  HOST = "HOST",
  PLAYER = "PLAYER"
}
export enum Scenario {
  BOARD = "BOARD",
  POOLS = "POOLS",
  CONFUENCE = "CONFUENCE"
}
export default interface Room {
  joined: boolean;
  scenario: Scenario;
  stage?: string;
  roomMode?: ROOM_MODE;
  connected: boolean;
  persistentId?: string;
  roomName?: string;
  columns: Column[];
  createDate?: boolean;
  participants: Participant[];
}
