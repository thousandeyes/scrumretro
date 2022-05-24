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
