import { ApiGatewayManagementApi } from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
import { 
    APIGatewayProxyEvent, 
    APIGatewayProxyResult 
} from 'aws-lambda';
import { 
    ClientMessage, 
    MessageType, 
    PersistentIdGeneratedMessage 
} from "../../messages";
import { findRoomByName, saveRoom } from '../db/rooms';

export default async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const client = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    const message: ClientMessage = JSON.parse(event.body!);

    switch(message.type) {
        case MessageType.PARTICIPANT_LOGIN:
            if (typeof message.persistentId !== undefined) {
                const participantId = await createParticipantId();
                respondToWebsocket(client, event, {
                    type: MessageType.PERSISTENT_ID_GENERATED,
                    participantId
                });
            }

            await joinRoom(client, message.participantName, event.requestContext.connectionId!, message.roomName);
            return { statusCode: 200, body: 'handled' };
        default:
            return respondToWebsocket(client, event, {
                error: `Unknown message type: ${message.type}`
            });
    }
    await client.postToConnection({
        ConnectionId: event.requestContext.connectionId!,
        Data: JSON.stringify({ message: 'hello!' }),
    }).promise();

    return {
        statusCode: 200,
        body: 'handled',
    };
}

async function joinRoom(client: ApiGatewayManagementApi, playerName: string, playerConnectionId: string, roomName: string): Promise<void> {
    const room = await findRoomByName(roomName);
    if (!room) {
        return Promise.reject();
    }
}

async function createParticipantId(): Promise<string> {
    return uuidv4();
}

async function respondToWebsocket(client: ApiGatewayManagementApi, event: APIGatewayProxyEvent, wsMessage: any): Promise<APIGatewayProxyResult> {
    await client.postToConnection({
        ConnectionId: event.requestContext.connectionId!,
        Data: JSON.stringify(wsMessage),
    }).promise();

    return {
        statusCode: 200,
        body: 'handled',
    };
}
