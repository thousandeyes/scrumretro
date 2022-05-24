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
