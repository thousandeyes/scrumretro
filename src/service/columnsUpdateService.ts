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
