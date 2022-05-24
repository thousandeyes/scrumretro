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
import { MessageType, ScrumMasterLoginMessage } from "../../../messages";
import { findColumnsByRoomName, saveColumns } from "../../db/columns";
import { findParticipantsByRoomName } from "../../db/participants";
import { findPostsByColumnId } from "../../db/posts";
import { findRoomByPersistentId, saveRoom } from "../../db/rooms";
import { getDefaultColumns } from "../../utils/defaultColumns";
import { mapPostsToView, mapColumnsToView } from "../../utils/mappers";
import { createPersistentId } from "../../utils/persistentId";
import { getRoomName } from "../../utils/roomName";
import { respondToWebsocket } from "../../utils/websockets";

export default async function scrumMasterLoginHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ScrumMasterLoginMessage
): Promise<APIGatewayProxyResult> {
  let { persistentId } = request;
  if (persistentId == null) {
    persistentId = createPersistentId();
    await respondToWebsocket(client, event, {
      type: MessageType.PERSISTENT_ID_GENERATED,
      persistentId
    });
  }

  await joinRoomAsScrumMaster(client, event, { ...request, persistentId });
  return { statusCode: 200, body: "handled" };
}

async function joinRoomAsScrumMaster(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  wsMessage: ScrumMasterLoginMessage & { persistentId: string }
): Promise<void> {
  console.log("joining room as scrum master");
  let room = await findRoomByPersistentId(wsMessage.persistentId);
  if (room) {
    console.log(`found room for supplied persistent id: ${room.room_name}`);
    const columns = await findColumnsByRoomName(room.room_name);
    const posts = flatten(
      await Promise.all(
        columns.map(({ column_id }) => findPostsByColumnId(column_id))
      )
    );
    const participants = await findParticipantsByRoomName(room.room_name);
    const viewPosts = mapPostsToView(posts, participants);

    console.log(
      `Updating ${room.room_name} connection_id from ${room.connection_id} to ${event.requestContext.connectionId}`
    );
    room.connection_id = event.requestContext.connectionId!;
    await saveRoom(room);

    await respondToWebsocket(client, event, {
      type: MessageType.ROOM_JOINED,
      roomName: room.room_name,
      columns: mapColumnsToView(columns, viewPosts)
    });

    const onlineParticipants = participants.filter(p => p.online);
    for (const participant of onlineParticipants) {
      await respondToWebsocket(client, event, {
        type: MessageType.PARTICIPANT_JOINED,
        roomName: room.room_name,
        persistentId: participant.persistent_id,
        participantName: participant.participant_name,
      });
    }
  } else {
    console.log("creating new room (no persistent room found)");
    room = {
      room_name: getRoomName(),
      persistent_id: wsMessage.persistentId,
      connection_id: event.requestContext.connectionId!,
      created_date: Date.now() / 1000
    };
    await saveRoom(room);

    const columns = getDefaultColumns(room.room_name);
    await saveColumns(columns);

    await respondToWebsocket(client, event, {
      type: MessageType.ROOM_JOINED,
      roomName: room.room_name,
      columns: mapColumnsToView(columns, [])
    });
  }
}
