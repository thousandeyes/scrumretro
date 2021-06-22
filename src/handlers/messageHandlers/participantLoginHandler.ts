import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { MessageType, ParticipantLoginMessage } from "../../../messages";
import { findColumnsByRoomName } from "../../db/columns";
import { findParticipantByRoomNameAndPersistentId, saveRoomParticipant } from "../../db/participants";
import { findPostsByRoomNameAndParticipantId } from "../../db/posts";
import { findRoomByName } from "../../db/rooms";
import { mapPostsToView, mapColumnsToView } from "../../utils/mappers";
import { createPersistentId } from "../../utils/persistentId";
import { respondToWebsocket, sendToWebsocket } from "../../utils/websockets";

export default async function participantLoginHandler(
    client: ApiGatewayManagementApi,
    event: APIGatewayProxyEvent,
    request: ParticipantLoginMessage      
): Promise<APIGatewayProxyResult> {
    let { persistentId } = request;
    if (persistentId == null) {
      persistentId = createPersistentId();
      await respondToWebsocket(client, event, {
        type: MessageType.PERSISTENT_ID_GENERATED,
        persistentId
      });
    }

    await joinRoom(client, event, { ...request, persistentId });
    return { statusCode: 200, body: "handled" };
}

async function joinRoom(
    client: ApiGatewayManagementApi,
    event: APIGatewayProxyEvent,
    wsMessage: ParticipantLoginMessage & { persistentId: string }
  ): Promise<void> {
    console.log("joining a room");
    const room = await findRoomByName(wsMessage.roomName);
    console.log(`Room with name ${wsMessage.roomName}:`, room);
    if (!room) {
      await respondToWebsocket(client, event, {
        type: MessageType.ACTION_FAILED,
        request: wsMessage,
        details: `Cannot find room ${wsMessage.roomName}`
      });
      return;
    }
  
    let existingParticipant = await findParticipantByRoomNameAndPersistentId(
      wsMessage.roomName,
      wsMessage.persistentId
    );
  
    if (!existingParticipant) {
      existingParticipant = {
        room_name: wsMessage.roomName,
        participant_name: wsMessage.participantName,
        persistent_id: wsMessage.persistentId,
        connection_id: event.requestContext.connectionId!
      };
      await saveRoomParticipant(existingParticipant);
    }
  
    const columns = await findColumnsByRoomName(room.room_name);
    const posts = await findPostsByRoomNameAndParticipantId(
      room.room_name,
      wsMessage.persistentId
    );
    const viewPosts = mapPostsToView(posts, [existingParticipant]);
    console.log("sending ROOM_JOINED");
    await respondToWebsocket(client, event, {
      type: MessageType.ROOM_JOINED,
      roomName: room.room_name,
      columns: mapColumnsToView(columns, viewPosts)
    });
  
    console.log("sending PARTICIPANT_JOINED");
    await sendToWebsocket(client, room.connection_id, {
      type: MessageType.PARTICIPANT_JOINED,
      roomName: wsMessage.roomName,
      participantName: wsMessage.participantName,
      persistentId: wsMessage.persistentId
    });
  }
  