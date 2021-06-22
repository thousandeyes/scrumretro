import { APIGatewayProxyEvent } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { ServerMessage } from "../../messages";

export async function respondToWebsocket<M extends ServerMessage>(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  wsMessage: M
): Promise<void> {
  await sendToWebsocket(client, event.requestContext.connectionId!, wsMessage);
}

export async function sendToWebsocket<M extends ServerMessage>(
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
