import Column from './Column';

export default interface Room {
    persistentId: string;
    roomName: string;
    createDate: boolean;
    columns: Column[];
}
