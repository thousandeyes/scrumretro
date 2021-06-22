import { ApiGatewayManagementApi } from "aws-sdk";
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
      columns: viewColumns.map(col => ({
        ...col,
        posts: col.posts.filter(
          ({ participant: postAuthor }) =>
            postAuthor.persistentId === participant.persistent_id
        )
      }))
    });
  }
}
