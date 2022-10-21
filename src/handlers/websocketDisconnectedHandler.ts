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
