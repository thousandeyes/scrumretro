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

import { ApiGatewayManagementApi } from "aws-sdk";
import sortBy from "lodash/sortBy";
import Column from "../../client/models/Column";
import { MessageType } from "../../messages";
import Participant from "../models/Participant";
import { sendToWebsocket } from "../utils/websockets";

export default {
  sendColumnUpdatedMessages
};

async function sendColumnUpdatedMessages(
  client: ApiGatewayManagementApi,
  roomConnectionId: string,
  participants: Participant[],
  viewColumns: Column[]
): Promise<void> {
  await sendToWebsocket(client, roomConnectionId, {
    type: MessageType.COLUMNS_UPDATED,
    columns: viewColumns
  });

  for (const participant of participants) {
    await sendToWebsocket(client, participant.connection_id, {
      type: MessageType.COLUMNS_UPDATED,
      columns: viewColumns.map(columns => ({
        ...columns,
        posts: columns.posts.filter(
          ({ participant: { persistentId } }) =>
            persistentId === participant.persistent_id
        )
      }))
    });
  }
}
