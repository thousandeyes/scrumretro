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
