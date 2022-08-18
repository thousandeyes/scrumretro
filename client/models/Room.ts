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
