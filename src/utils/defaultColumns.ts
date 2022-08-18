// Copyright 2022 Cisco Systems, Inc. and its affiliates
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
