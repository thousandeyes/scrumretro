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
import { MessageType, ParticipantLoginMessage } from "../../../messages";
import { findColumnsByRoomName } from "../../db/columns";
import {
  findParticipantByRoomNameAndPersistentId,
  saveRoomParticipant
} from "../../db/participants";
import { findPostsByColumnIdAndParticipantId } from "../../db/posts";
import { findRoomByName } from "../../db/rooms";
import { mapPostsToView, mapColumnsToView } from "../../utils/mappers";
import { createPersistentId } from "../../utils/persistentId";
import { respondToWebsocket, sendToWebsocket } from "../../utils/websockets";

export default async function participantLoginHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ParticipantLoginMessage
): Promise<APIGatewayProxyResult> {
  let { persistentId } = request;
  if (persistentId == null) {
    persistentId = createPersistentId();
    await respondToWebsocket(client, event, {
      type: MessageType.PERSISTENT_ID_GENERATED,
      persistentId
    });
  }

  await joinRoom(client, event, { ...request, persistentId });
  return { statusCode: 200, body: "handled" };
}

async function joinRoom(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  wsMessage: ParticipantLoginMessage & { persistentId: string }
): Promise<void> {
  console.log("joining a room");
  const room = await findRoomByName(wsMessage.roomName);
  console.log(`Room with name ${wsMessage.roomName}:`, room);
  if (!room) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request: wsMessage,
      details: `Cannot find room ${wsMessage.roomName}`
    });
    return;
  }

  let existingParticipant = await findParticipantByRoomNameAndPersistentId(
    wsMessage.roomName,
    wsMessage.persistentId
  );

  if (!existingParticipant) {
    existingParticipant = {
      room_name: wsMessage.roomName,
      participant_name: wsMessage.participantName,
      persistent_id: wsMessage.persistentId,
      connection_id: event.requestContext.connectionId!,
      online: true
    };
    await saveRoomParticipant(existingParticipant);
  } else {
    existingParticipant.connection_id = event.requestContext.connectionId!;
    await saveRoomParticipant(existingParticipant);
  }

  const columns = await findColumnsByRoomName(room.room_name);
  const posts = flatten(
    await Promise.all(
      columns.map(({ column_id }) =>
        findPostsByColumnIdAndParticipantId(column_id, wsMessage.persistentId)
      )
    )
  );
  const viewPosts = mapPostsToView(posts, [existingParticipant]);
  console.log("sending ROOM_JOINED");
  await respondToWebsocket(client, event, {
    type: MessageType.ROOM_JOINED,
    roomName: room.room_name,
    columns: mapColumnsToView(columns, viewPosts)
  });

  console.log("sending PARTICIPANT_JOINED");
  await sendToWebsocket(client, room.connection_id, {
    type: MessageType.PARTICIPANT_JOINED,
    roomName: wsMessage.roomName,
    participantName: wsMessage.participantName,
    persistentId: wsMessage.persistentId
  });
}
