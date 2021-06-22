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
