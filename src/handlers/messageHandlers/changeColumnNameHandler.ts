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
import {
  ChangeColumnNameMessage,
  ChangeColumnOpenStateMessage,
  MessageType
} from "../../../messages";
import {
  findColumnByColumnIdAndRoomName,
  updateColumnNameByColumnId,
  updateColumnOpenStateByColumnId
} from "../../db/columns";
import { findParticipantsByRoomName } from "../../db/participants";
import { respondToWebsocket, sendToWebsocket } from "../../utils/websockets";

export default async function changeColumnNameHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ChangeColumnNameMessage
): Promise<APIGatewayProxyResult> {
  await changeColumnName(client, event, request);
  return { statusCode: 200, body: "handled" };
}

async function changeColumnName(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ChangeColumnNameMessage
): Promise<void> {
  const column = await findColumnByColumnIdAndRoomName(
    request.columnId,
    request.roomName
  );
  if (!column) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request,
      details: "Column not found"
    });
    return;
  }

  await updateColumnNameByColumnId(request.columnId, request.columnName);

  const participants = await findParticipantsByRoomName(request.roomName);
  for (const participant of participants) {
    await sendToWebsocket(client, participant.connection_id, {
      type: MessageType.COLUMN_NAME_CHANGED,
      columnId: request.columnId,
      columnName: request.columnName
    });
  }

  await respondToWebsocket(client, event, {
    type: MessageType.COLUMN_NAME_CHANGED,
    columnId: request.columnId,
    columnName: request.columnName
  });
}
