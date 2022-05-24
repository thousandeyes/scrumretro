// Copyright (C) 2022 Cisco Systems, Inc. and its affiliates
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
