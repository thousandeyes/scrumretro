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
