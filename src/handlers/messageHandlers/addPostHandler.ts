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
import { AddPostMessage, MessageType } from "../../../messages";
import { findColumnByColumnIdAndRoomName } from "../../db/columns";
import { findParticipantByRoomNameAndPersistentId } from "../../db/participants";
import { savePost } from "../../db/posts";
import { findRoomByName } from "../../db/rooms";
import { mapPostsToView } from "../../utils/mappers";
import { respondToWebsocket, sendToWebsocket } from "../../utils/websockets";
import DbPost from "../../models/Post";
import { createPersistentId } from "../../utils/persistentId";

export default async function addPostHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: AddPostMessage
): Promise<APIGatewayProxyResult> {
  await addPost(client, event, request);
  return { statusCode: 200, body: "handled" };
}

async function addPost(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: AddPostMessage
): Promise<void> {
  const column = await findColumnByColumnIdAndRoomName(
    request.columnId,
    request.roomName
  );
  if (!column) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request,
      details: "Invalid columnId or roomName"
    });
    return;
  }

  const room = await findRoomByName(request.roomName);
  if (!room) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request,
      details: "Room not found"
    });
    return;
  }

  const post: DbPost = {
    post_id: createPersistentId(),
    column_id: request.columnId,
    participant_id: request.participantId,
    submitted_date: Date.now() / 1000,
    content: request.content
  };
  await savePost(post);

  const participant = await findParticipantByRoomNameAndPersistentId(
    request.roomName,
    request.participantId
  );
  const viewPost = mapPostsToView([post], participant ? [participant] : [])[0];

  await sendToWebsocket(client, room.connection_id, {
    type: MessageType.POST_ADDED,
    post: viewPost
  });

  await respondToWebsocket(client, event, {
    type: MessageType.POST_ADDED,
    post: viewPost
  });
}
