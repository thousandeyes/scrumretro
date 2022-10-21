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
