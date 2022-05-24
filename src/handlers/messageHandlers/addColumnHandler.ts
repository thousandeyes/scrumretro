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
import { flatten } from "lodash";
import { ScrumMasterAddColumnMessage, MessageType } from "../../../messages";
import { saveColumn, findColumnsByRoomName } from "../../db/columns";
import { findParticipantsByRoomName } from "../../db/participants";
import { findPostsByColumnId } from "../../db/posts";
import { findRoomByPersistentId } from "../../db/rooms";
import columnsUpdateService from "../../service/columnsUpdateService";
import { getDefaultEmptyColumn } from "../../utils/defaultColumns";
import { mapColumnsToView, mapPostsToView } from "../../utils/mappers";
import { respondToWebsocket, sendToWebsocket } from "../../utils/websockets";

export default async function addColumnHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ScrumMasterAddColumnMessage
): Promise<APIGatewayProxyResult> {
  await addColumn(client, event, request);
  return { statusCode: 200, body: "handled" };
}

async function addColumn(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ScrumMasterAddColumnMessage
): Promise<void> {
  let { persistentId } = request;
  if (persistentId == null) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request: request,
      details: "Invalid persistentId"
    });
    return;
  }

  let room = await findRoomByPersistentId(persistentId);

  if (room == null) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request,
      details: "Room not found for the persistent id"
    });
    return;
  }

  const column = getDefaultEmptyColumn(room.room_name);
  await saveColumn(column);

  const columns = await findColumnsByRoomName(room.room_name);
  const posts = flatten(
    await Promise.all(
      columns.map(({ column_id }) => findPostsByColumnId(column_id))
    )
  );
  const participants = await findParticipantsByRoomName(room.room_name);
  const viewPosts = mapPostsToView(posts, participants);
  const viewColumns = mapColumnsToView(columns, viewPosts);

  await columnsUpdateService.sendColumnUpdatedMessages(
    client,
    room.connection_id,
    participants,
    viewColumns
  );
}
