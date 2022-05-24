// Copyright (C) 2022 Cisco Systems, Inc. and its affiliates
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
