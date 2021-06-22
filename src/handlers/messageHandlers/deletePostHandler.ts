import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import {
  DeletePostMessage,
  MessageType
} from "../../../messages";
import { deletePostById } from "../../db/posts";
import { findRoomByName } from "../../db/rooms";
import { respondToWebsocket, sendToWebsocket } from "../../utils/websockets";

export default async function deletePostHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: DeletePostMessage
): Promise<APIGatewayProxyResult> {
  await deletePost(client, event, request);
  return { statusCode: 200, body: "handled" };
}

async function deletePost(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: DeletePostMessage
): Promise<void> {
  const { postId, roomName } = request;
  const room = await findRoomByName(roomName);
  if (!room) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request,
      details: "Room not found"
    });
    return;
  }

  // TODO add authorization checks
  await deletePostById(postId);

  await sendToWebsocket(client, room.connection_id, {
    type: MessageType.POST_DELETED,
    postId
  });

  await respondToWebsocket(client, event, {
    type: MessageType.POST_DELETED,
    postId
  });
}
