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
