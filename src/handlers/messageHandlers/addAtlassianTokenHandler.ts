import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { AtlassianTokenAddMessage, MessageType } from "../../../messages";
import { findRoomByPersistentId, saveRoom } from "../../db/rooms";
import { respondToWebsocket } from "../../utils/websockets";

export default async function confluenceNotesSyncHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: AtlassianTokenAddMessage
): Promise<APIGatewayProxyResult> {
  let { persistentId, username, token } = request;
  if (persistentId == null) {
    await respondToWebsocket(client, event, {
      type: MessageType.ATLASSIAN_TOKEN_ADDED,
      result: false
    });
    return { statusCode: 200, body: "handled" };
  }

  const result = await addAtlassianToken(client, persistentId, username, token);
  await respondToWebsocket(client, event, {
    type: MessageType.ATLASSIAN_TOKEN_ADDED,
    result
  });
  return { statusCode: 200, body: "handled" };
}

async function addAtlassianToken(
  client: ApiGatewayManagementApi,
  persistentId: string,
  username: string,
  token: string
): Promise<boolean> {

  const room = await findRoomByPersistentId(persistentId);
  if (!room || username.length === 0 || token.length === 0) {
    return false;
  }

  room.atlassian_username = username;
  room.atlassian_token = token;
  await saveRoom(room);
  return true;
}
