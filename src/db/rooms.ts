import Room from '../models/Room';
import dynamoDb from './dynamoDb';

const TABLE_NAME: string = process.env.DYNAMODB_ROOMS_TABLE!;
const CONNECTION_ID_IDX_NAME: string = process.env.DYNAMODB_ROOMS_CONNECTION_ID_INDEX!;
const ROOM_TTL_DEFAULT: number = 2 * 60 * 60;

export async function findRoomByName(roomName: string): Promise<Room | undefined> {
    const result = await dynamoDb.get({
        TableName: TABLE_NAME,
        Key: { room: roomName },
    }).promise();

    if (result.Item) {
        return result.Item as Room;
    }
}

export async function findRoomByConnectionId(connectionId: string): Promise<Room | undefined> {
    const result = await dynamoDb.query({
        TableName: TABLE_NAME,
        IndexName: CONNECTION_ID_IDX_NAME,
        KeyConditionExpression: 'connectionId = :connectionId',
        ExpressionAttributeValues: {
            ':connectionId': connectionId,
        },
    }).promise();

    if (result.Count == null) {
        return;
    }
    else if (result.Count > 1) {
        return Promise.reject(new Error('findRoomByConnectionId returned more than one room'));
    }
    else if (result.Count == 1) {
        return result.Items![0] as Room;
    }
}

export async function saveRoom(room: Partial<Room>): Promise<void> {
    await dynamoDb.put({
        TableName: TABLE_NAME,
        Item: {
            createdAt: Date.now(),
            ttl: Math.floor(Date.now() / 1000) + ROOM_TTL_DEFAULT,
            ...room,
        },
    }).promise();
}

export async function deleteRoom(room: Room): Promise<void> {
    await dynamoDb.delete({
        TableName: TABLE_NAME,
        Key: { room: room.room },
    }).promise();
}
