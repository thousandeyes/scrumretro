import { v4 as uuidv4 } from "uuid";
import Column from "../models/Column";

export function getDefaultColumns(roomName: string): Column[] {
  return [
    {
      column_id: uuidv4(),
      column_name: "Sprint events",
      room_name: roomName,
      is_open: false,
      created_date: Date.now() / 1000,
    },
    {
      column_id: uuidv4(),
      column_name: "Start",
      room_name: roomName,
      is_open: false,
      created_date: Date.now() / 1000,
    },
    {
      column_id: uuidv4(),
      column_name: "Stop",
      room_name: roomName,
      is_open: false,
      created_date: Date.now() / 1000,
    },
    {
      column_id: uuidv4(),
      column_name: "Continue",
      room_name: roomName,
      is_open: false,
      created_date: Date.now() / 1000,
    }
  ];
}

export function getDefaultEmptyColumn(roomName: string): Column {
  return {
    column_id: uuidv4(),
    column_name: "New Column",
    room_name: roomName,
    is_open: false,
    created_date: Date.now() / 1000,
  };
}
