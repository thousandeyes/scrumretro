import { ApiGatewayManagementApi } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  ClientMessage,
  MessageType,
  ParticipantLoginMessage,
  ScrumMasterLoginMessage,
  ServerMessage
} from "../../messages";
import { findRoomByName, findRoomByPersistentId, saveRoom } from "../db/rooms";
import { findParticipantByRoomNameAndPersistentId, saveRoomParticipant } from "../db/participants";
import { getRoomName } from "../utils/roomName";

export default async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const client = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`
  });

  const message: ClientMessage = JSON.parse(event.body!);

  console.log(`received message ${message.type}`);

  switch (message.type) {
    case MessageType.PARTICIPANT_LOGIN: {
      let { persistentId } = message;
      if (persistentId == null) {
        persistentId = createPersistentId();
        await respondToWebsocket(client, event, {
          type: MessageType.PERSISTENT_ID_GENERATED,
          persistentId
        });
      }

      await joinRoom(client, event, { ...message, persistentId });
      return { statusCode: 200, body: "handled" };
    }
    case MessageType.SCRUM_MASTER_LOGIN: {
      let { persistentId } = message;
      if (persistentId == null) {
        persistentId = createPersistentId();
        await respondToWebsocket(client, event, {
          type: MessageType.PERSISTENT_ID_GENERATED,
          persistentId
        });
      }

      await joinRoomAsScrumMaster(client, event, { ...message, persistentId });
      return { statusCode: 200, body: 'handled' };
    }
    default:
      await respondToWebsocket(client, event, {
        type: MessageType.ACTION_FAILED,
        request: message,
        details: 'Unknown message type'
      });
      return { statusCode: 200, body: "handled" };
  }
}

async function joinRoom(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  wsMessage: ParticipantLoginMessage & { persistentId: string }
): Promise<void> {
  console.log("joining a room");
  const room = await findRoomByName(wsMessage.roomName);
  if (!room) {
    await respondToWebsocket(client, event, {
        type: MessageType.ACTION_FAILED,
        request: wsMessage,
        details: `Cannot find room ${wsMessage.roomName}`,
    });
    return;
  }

  console.log("sending ROOM_JOINED");
  await respondToWebsocket(client, event, {
    type: MessageType.ROOM_JOINED,
    roomName: room.room_name,
    columns: [] // TODO fetch columns and return them here
  });

  const existingParticipant = await findParticipantByRoomNameAndPersistentId(
    wsMessage.roomName,
    wsMessage.persistentId
  );

  if (!existingParticipant) {
    await saveRoomParticipant({
      room_name: wsMessage.roomName,
      participant_name: wsMessage.participantName,
      persistent_id: wsMessage.persistentId,
      connection_id: event.requestContext.connectionId!
    });
  }

  await client.postToConnection({
    ConnectionId: room.connection_id,
    Data: JSON.stringify({
        type: MessageType.PARTICIPANT_JOINED,
        roomName: wsMessage.roomName,
        participantName: wsMessage.participantName,
        persistentId: wsMessage.persistentId
    }),
  }).promise();
}

async function joinRoomAsScrumMaster(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  wsMessage: ScrumMasterLoginMessage & { persistentId: string }
): Promise<void> {
  console.log('joining room as scrum master')
  let room = await findRoomByPersistentId(wsMessage.persistentId);
  if (room) {
    console.log(`found room for supplied persistent id: ${room.room_name}`)
    await respondToWebsocket(client, event, {
      type: MessageType.ROOM_JOINED,
      roomName: room.room_name,
      columns: [] // TODO fetch columns and return them here
    });
  } else {
    console.log('creating new room (no persistent room found)')
    room = {
      room_name: getRoomName(),
      persistent_id: wsMessage.persistentId,
      connection_id: event.requestContext.connectionId!,
      created_date: Date.now() / 1000,
    };
    await saveRoom(room);
    await respondToWebsocket(client, event, {
      type: MessageType.ROOM_JOINED,
      roomName: room.room_name,
      columns: [] // TODO create some default columns and return them here
    })
  }
}

function createPersistentId(): string {
  return uuidv4();
}

async function respondToWebsocket<M extends ServerMessage>(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  wsMessage: M
): Promise<void> {
  try {
    await client
      .postToConnection({
        ConnectionId: event.requestContext.connectionId!,
        Data: JSON.stringify(wsMessage)
      })
      .promise();
  } catch (e) {
    console.error(
      `Error sending message to client at ${event.requestContext.connectionId}`,
      e
    );
  }
}
