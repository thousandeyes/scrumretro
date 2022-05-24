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
import { ChangeColumnOpenStateMessage, MessageType } from "../../../messages";
import {
  findColumnByColumnIdAndRoomName,
  updateColumnOpenStateByColumnId
} from "../../db/columns";
import { findParticipantsByRoomName } from "../../db/participants";
import { respondToWebsocket, sendToWebsocket } from "../../utils/websockets";

export default async function changeColumnOpenStateHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ChangeColumnOpenStateMessage
): Promise<APIGatewayProxyResult> {
  await changeColumnOpenState(client, event, request);
  return { statusCode: 200, body: "handled" };
}

async function changeColumnOpenState(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ChangeColumnOpenStateMessage
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

  await updateColumnOpenStateByColumnId(request.columnId, request.isOpen);

  const participants = await findParticipantsByRoomName(request.roomName);
  for (const participant of participants) {
    await sendToWebsocket(client, participant.connection_id, {
      type: MessageType.COLUMN_OPEN_STATE_CHANGED,
      columnId: request.columnId,
      isOpen: request.isOpen
    });
  }

  await respondToWebsocket(client, event, {
    type: MessageType.COLUMN_OPEN_STATE_CHANGED,
    columnId: request.columnId,
    isOpen: request.isOpen
  });
}
