import { ApiGatewayManagementApi } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ClientMessage, MessageType } from "../../messages";
import MessageHandlerFn from "./messageHandlers/MessageHandlerFn";
import participantLoginHandler from "./messageHandlers/participantLoginHandler";
import { respondToWebsocket } from "../utils/websockets";
import scrumMasterLoginHandler from "./messageHandlers/scrumMasterLoginHandler";
import addColumnHandler from "./messageHandlers/addColumnHandler";
import addPostHandler from "./messageHandlers/addPostHandler";
import changeColumnOpenStateHandler from "./messageHandlers/changeColumnOpenStateHandler";
import confluenceNotesSyncHandler from "./messageHandlers/confluenceNotesSyncHandler";
import changeColumnNameHandler from "./messageHandlers/changeColumnNameHandler";
import deleteColumnHandler from "./messageHandlers/deleteColumnHandler";
import deletePostHandler from "./messageHandlers/deletePostHandler";

const MessageHandlers: Record<ClientMessage["type"], MessageHandlerFn> = {
  PARTICIPANT_LOGIN: participantLoginHandler,
  SCRUM_MASTER_LOGIN: scrumMasterLoginHandler,
  SCRUM_MASTER_ADD_COLUMN: addColumnHandler,
  ADD_POST: addPostHandler,
  CHANGE_COLUMN_OPEN_STATE: changeColumnOpenStateHandler,
  CONFLUENCE_NOTES_SYNC: confluenceNotesSyncHandler,
  CHANGE_COLUMN_NAME: changeColumnNameHandler,
  DELETE_COLUMN: deleteColumnHandler,
  DELETE_POST: deletePostHandler,
};

export default async function(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const client = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`
  });

  const message: ClientMessage = JSON.parse(event.body!);
  console.log(`received message ${message.type}`);

  if (MessageHandlers[message.type]) {
    return await MessageHandlers[message.type](client, event, message);
  }

  await respondToWebsocket(client, event, {
    type: MessageType.ACTION_FAILED,
    request: message,
    details: "Unknown message type"
  });
  return { statusCode: 200, body: "handled" };
}
