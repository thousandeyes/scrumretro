import Column from "./Column";
import Participant from "./Participant";

export default interface Room {
  connected: boolean;
  persistentId?: string;
  roomName?: string;
  columns: Column[];
  createDate?: boolean;
  participants: Participant[];
}
