import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { ScrumMasterAddColumnMessage, MessageType } from "../../../messages";
import { saveColumn, findColumnsByRoomName } from "../../db/columns";
import { findRoomByPersistentId } from "../../db/rooms";
import { getDefaultEmptyColumn } from "../../utils/defaultColumns";
import { mapColumnsToView } from "../../utils/mappers";
import { respondToWebsocket } from "../../utils/websockets";

export default async function addColumnHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ScrumMasterAddColumnMessage
): Promise<APIGatewayProxyResult> {
  await addColumn(client, event, request);
  return { statusCode: 200, body: "handled" };
}

async function addColumn(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ScrumMasterAddColumnMessage
): Promise<void> {
  let { persistentId } = request;
  if (persistentId == null) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request: request,
      details: "Invalid persistentId"
    });
    return;
  }

  let room = await findRoomByPersistentId(persistentId);

  if (room == null) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request,
      details: "Room not found for the persistent id"
    });
    return;
  }

  const column = getDefaultEmptyColumn(room.room_name);
  await saveColumn(column);

  await respondToWebsocket(client, event, {
    type: MessageType.COLUMNS_UPDATED,
    columns: mapColumnsToView(await findColumnsByRoomName(room.room_name), [])
  });

  return;
}
