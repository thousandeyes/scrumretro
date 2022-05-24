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

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import Participant from "../models/Participant";
import { MessageType, ParticipantLeftMessage } from "../../messages";
import { findParticipantByConnectionId, saveRoomParticipant } from "../db/participants";
import { findRoomByName } from "../db/rooms";

export default async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const connectionId = event.requestContext.connectionId!;

    const client = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    // is this a participant disconnecting?
    const participant = await findParticipantByConnectionId(connectionId);
    if (participant) {
        await setParticipantOffline(client, participant);
        return { statusCode: 200, body: 'handled' };
    }

    // nothing found, probably fine
    return { statusCode: 200, body: 'nothing to do' };
}

async function setParticipantOffline(client: ApiGatewayManagementApi, participant: Participant): Promise<void> {
    participant.online = false;
    saveRoomParticipant(participant);

    const room = await findRoomByName(participant.room_name);
    if (room) {
        const wsMessage: ParticipantLeftMessage = {
            type: MessageType.PARTICIPANT_LEFT,
            participantName: participant.participant_name,
            persistentId: participant.persistent_id,
            roomName: participant.room_name
        };

        await client.postToConnection({
            ConnectionId: room.connection_id,
            Data: JSON.stringify(wsMessage),
        }).promise();
    }
}
