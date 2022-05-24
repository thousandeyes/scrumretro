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
