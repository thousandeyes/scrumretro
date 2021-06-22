import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { ConfluenceNotesSyncMessage, MessageType } from "../../../messages";
import { findRoomByPersistentId } from "../../db/rooms";
import { respondToWebsocket } from "../../utils/websockets";

export default async function confluenceNotesSyncHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ConfluenceNotesSyncMessage
): Promise<APIGatewayProxyResult> {
  let { persistentId } = request;
  if (persistentId == null) {
    respondToWebsocket(client, event, {
      type: MessageType.CONFLUENCE_NOTES_SYNCED,
      response: "Unknown room to sync notes from"
    });
    return { statusCode: 200, body: "handled" };
  }

  const pageUrl = await syncConfluenceNotes(client, persistentId);
  respondToWebsocket(client, event, {
    type: MessageType.CONFLUENCE_NOTES_SYNCED,
    response: pageUrl ? "OK" : "Failed to sync notes",
    confluencePageUrl: pageUrl
  });
  return { statusCode: 200, body: "handled" };
}

async function syncConfluenceNotes(
  client: ApiGatewayManagementApi,
  persistentId: string
): Promise<string> {
  const room = await findRoomByPersistentId(persistentId);
  if (!room) {
    return Promise.reject();
  }

  return "https://confluence.com;";
}
