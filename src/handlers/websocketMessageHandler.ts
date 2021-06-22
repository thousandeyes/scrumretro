import { ApiGatewayManagementApi } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  AddPostMessage,
  ChangeColumnOpenStateMessage,
  ClientMessage,
  MessageType,
  ParticipantLoginMessage,
  ScrumMasterAddColumnMessage,
  ScrumMasterLoginMessage,
  ServerMessage
} from "../../messages";
import { findRoomByName, findRoomByPersistentId, saveRoom } from "../db/rooms";
import {
  findParticipantByRoomNameAndPersistentId,
  findParticipantsByRoomName,
  saveRoomParticipant
} from "../db/participants";
import { getRoomName } from "../utils/roomName";
import {
  getDefaultColumns,
  getDefaultEmptyColumn
} from "../utils/defaultColumns";
import { findColumnByColumnIdAndRoomName, findColumnsByRoomName, saveColumn, saveColumns, updateColumnOpenStateByColumnId } from "../db/columns";
import DbColumn from "../models/Column";
import DbPost from "../models/Post";
import DbParticipant from "../models/Participant";
import ViewColumn from "../../client/models/Column";
import ViewPost from "../../client/models/Post";
import ViewParticipant from "../../client/models/Participant";
import {
  findPostsByRoomName,
  findPostsByRoomNameAndParticipantId,
  savePost
} from "../db/posts";
import { keyBy } from "lodash";

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
      return { statusCode: 200, body: "handled" };
    }
    case MessageType.SCRUM_MASTER_ADD_COLUMN: {
      await addColumn(client, event, message);
      return { statusCode: 200, body: "handled" };
    }
    case MessageType.CONFLUENCE_NOTES_SYNC: {
      let { persistentId } = message;
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
    case MessageType.ADD_POST: {
      await addPost(client, event, message);
      return { statusCode: 200, body: "handled" };
    }
    case MessageType.CHANGE_COLUMN_OPEN_STATE: {
      await changeColumnOpenState(client, event, message);
      return { statusCode: 200, body: "handled" };
    }
    default:
      await respondToWebsocket(client, event, {
        type: MessageType.ACTION_FAILED,
        request: message,
        details: "Unknown message type"
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

async function joinRoomAsScrumMaster(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  wsMessage: ScrumMasterLoginMessage & { persistentId: string }
): Promise<void> {
  console.log("joining room as scrum master");
  let room = await findRoomByPersistentId(wsMessage.persistentId);
  if (room) {
    console.log(`found room for supplied persistent id: ${room.room_name}`);
    const columns = await findColumnsByRoomName(room.room_name);
    const posts = await findPostsByRoomName(room.room_name);
    const participants = await findParticipantsByRoomName(room.room_name);
    const viewPosts = mapPostsToView(posts, participants);

    console.log(`Updating ${room.room_name} connection_id from ${room.connection_id} to ${event.requestContext.connectionId}`);
    room.connection_id = event.requestContext.connectionId!;
    await saveRoom(room);

    await respondToWebsocket(client, event, {
      type: MessageType.ROOM_JOINED,
      roomName: room.room_name,
      columns: mapColumnsToView(columns, viewPosts)
    });
  } else {
    console.log("creating new room (no persistent room found)");
    room = {
      room_name: getRoomName(),
      persistent_id: wsMessage.persistentId,
      connection_id: event.requestContext.connectionId!,
      created_date: Date.now() / 1000
    };
    await saveRoom(room);

    const columns = getDefaultColumns(room.room_name);
    await saveColumns(columns);

    await respondToWebsocket(client, event, {
      type: MessageType.ROOM_JOINED,
      roomName: room.room_name,
      columns: mapColumnsToView(columns, [])
    });
  }
}

function mapColumnsToView(
  columns: DbColumn[],
  posts: ViewPost[]
): ViewColumn[] {
  const postsByColumnId: Record<string, ViewPost[]> = {};
  for (const post of posts) {
    if (!postsByColumnId[post.columnId]) {
      postsByColumnId[post.columnId] = [];
    }
    postsByColumnId[post.columnId].push(post);
  }
  return columns
    .map(dbColumn => ({
      columnId: dbColumn.column_id,
      columnName: dbColumn.column_name,
      isOpen: dbColumn.is_open,
      posts: postsByColumnId[dbColumn.column_id] || [],
      createdDate: dbColumn.created_date
    }))
    .sort(({ createdDate: dateA }, { createdDate: dateB }) => dateA - dateB);
}

function mapPostsToView(
  posts: DbPost[],
  participants: DbParticipant[]
): ViewPost[] {
  const participantsById = keyBy(
    mapParticipantsToView(participants),
    "persistentId"
  );
  return posts.map(dbPost => ({
    postId: dbPost.post_id,
    columnId: dbPost.column_id,
    participant: participantsById[dbPost.participant_id],
    submittedDate: dbPost.submitted_date,
    text: dbPost.content
  }));
}

function mapParticipantsToView(
  participants: DbParticipant[]
): ViewParticipant[] {
  return participants.map(dbParticipant => ({
    persistentId: dbParticipant.persistent_id,
    participantName: dbParticipant.participant_name
  }));
}

function createPersistentId(): string {
  return uuidv4();
}

async function respondToWebsocket<M extends ServerMessage>(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  wsMessage: M
): Promise<void> {
  await sendToWebsocket(client, event.requestContext.connectionId!, wsMessage);
}

async function sendToWebsocket<M extends ServerMessage>(
  client: ApiGatewayManagementApi,
  connectionId: string,
  wsMessage: M
): Promise<void> {
  try {
    await client
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(wsMessage)
      })
      .promise();
  } catch (e) {
    console.error(`Error sending message to client at ${connectionId}`, e);
  }
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

async function addPost(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: AddPostMessage
): Promise<void> {
  const column = await findColumnByColumnIdAndRoomName(request.columnId, request.roomName);
  if (!column) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request,
      details: 'Invalid columnId or roomName',
    });
    return;
  }

  const room = await findRoomByName(request.roomName);
  if (!room) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request,
      details: 'Room not found',
    });
    return;
  }

  const post: DbPost = {
    post_id: uuidv4(),
    column_id: request.columnId,
    participant_id: request.participantId,
    submitted_date: Date.now() / 1000,
    content: request.content,
  };
  await savePost(post);

  const participant = await findParticipantByRoomNameAndPersistentId(request.roomName, request.participantId);
  const viewPost = mapPostsToView([post], participant ? [participant] : [])[0];

  await sendToWebsocket(client, room.connection_id, {
    type: MessageType.POST_ADDED,
    post: viewPost,
  });

  await respondToWebsocket(client, event, {
    type: MessageType.POST_ADDED,
    post: viewPost,
  });
}

async function changeColumnOpenState(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ChangeColumnOpenStateMessage
): Promise<void> {
  const column = await findColumnByColumnIdAndRoomName(request.columnId, request.roomName);
  if (!column) {
    await respondToWebsocket(client, event, {
      type: MessageType.ACTION_FAILED,
      request,
      details: 'Column not found'
    });
    return;
  }

  await updateColumnOpenStateByColumnId(request.columnId, request.isOpen);
  
  const participants = await findParticipantsByRoomName(request.roomName);
  for (const participant of participants) {
    await sendToWebsocket(client, participant.connection_id, {
      type: MessageType.COLUMN_OPEN_STATE_CHANGED,
      columnId: request.columnId,
      isOpen: request.isOpen,
    });
  }

  await respondToWebsocket(client, event, {
    type: MessageType.COLUMN_OPEN_STATE_CHANGED,
    columnId: request.columnId,
    isOpen: request.isOpen,
  });
}
