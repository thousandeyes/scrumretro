// Copyright 2022 Cisco Systems, Inc. and its affiliates
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
