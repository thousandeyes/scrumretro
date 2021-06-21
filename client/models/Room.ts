import Column from './Column';
import Participant from './Participant';

export default interface Room {
    persistentId?: string;
    roomName?: string;
    createDate?: boolean;
    columns: Column[];
    participants: Participant[];
    connected: boolean;
}
