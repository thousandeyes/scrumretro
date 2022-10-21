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

import { ApiGatewayManagementApi } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ClientMessage, MessageType } from "../../messages";
import MessageHandlerFn from "./messageHandlers/MessageHandlerFn";
import participantLoginHandler from "./messageHandlers/participantLoginHandler";
import { respondToWebsocket } from "../utils/websockets";
import scrumMasterLoginHandler from "./messageHandlers/scrumMasterLoginHandler";
import addColumnHandler from "./messageHandlers/addColumnHandler";
import addPostHandler from "./messageHandlers/addPostHandler";
import changeColumnOpenStateHandler from "./messageHandlers/changeColumnOpenStateHandler";
import addAtlassianTokenHandler from "./messageHandlers/addAtlassianTokenHandler";
import confluenceNotesSyncHandler from "./messageHandlers/confluenceNotesSyncHandler";
import changeColumnNameHandler from "./messageHandlers/changeColumnNameHandler";
import deleteColumnHandler from "./messageHandlers/deleteColumnHandler";
import deletePostHandler from "./messageHandlers/deletePostHandler";

const MessageHandlers: Record<ClientMessage["type"], MessageHandlerFn> = {
  PARTICIPANT_LOGIN: participantLoginHandler,
  SCRUM_MASTER_LOGIN: scrumMasterLoginHandler,
  SCRUM_MASTER_ADD_COLUMN: addColumnHandler,
  ADD_POST: addPostHandler,
  CHANGE_COLUMN_OPEN_STATE: changeColumnOpenStateHandler,
  ATLASSIAN_TOKEN_ADD: addAtlassianTokenHandler,
  CONFLUENCE_NOTES_SYNC: confluenceNotesSyncHandler,
  CHANGE_COLUMN_NAME: changeColumnNameHandler,
  DELETE_COLUMN: deleteColumnHandler,
  DELETE_POST: deletePostHandler,
  async CLIENT_PING(client, event) {
    await respondToWebsocket(client, event, {
      type: MessageType.SERVER_PONG
    });
    return { statusCode: 200, body: 'handled' };
  }
};

export default async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const client = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`
  });

  const message: ClientMessage = JSON.parse(event.body!);
  console.log(`received message ${message.type}`);

  if (MessageHandlers[message.type]) {
    return await MessageHandlers[message.type](client, event, message);
  }

  await respondToWebsocket(client, event, {
    type: MessageType.ACTION_FAILED,
    request: message,
    details: "Unknown message type"
  });
  return { statusCode: 200, body: "handled" };
}
