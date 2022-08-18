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

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { AtlassianTokenAddMessage, MessageType } from "../../../messages";
import { findRoomByPersistentId, saveRoom } from "../../db/rooms";
import { respondToWebsocket } from "../../utils/websockets";

export default async function confluenceNotesSyncHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: AtlassianTokenAddMessage
): Promise<APIGatewayProxyResult> {
  let { persistentId, username, token } = request;
  console.log(`adding confluence token for username ${username} to room with persistent id ${persistentId}`);
  if (persistentId == null) {
    await respondToWebsocket(client, event, {
      type: MessageType.ATLASSIAN_TOKEN_ADDED,
      result: false
    });
    return { statusCode: 200, body: "handled" };
  }

  const result = await addAtlassianToken(client, persistentId, username, token);
  await respondToWebsocket(client, event, {
    type: MessageType.ATLASSIAN_TOKEN_ADDED,
    result
  });
  return { statusCode: 200, body: "handled" };
}

async function addAtlassianToken(
  client: ApiGatewayManagementApi,
  persistentId: string,
  username: string,
  token: string
): Promise<boolean> {

  const room = await findRoomByPersistentId(persistentId);
  if (!room || username.length === 0 || token.length === 0) {
    console.log(`error adding persistent token to room ${room?.room_name}`);
    return false;
  }

  room.atlassian_username = username;
  room.atlassian_token = token;
  await saveRoom(room);
  console.log(`added token to room ${room.room_name}`);
  return true;
}
