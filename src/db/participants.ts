import Participant from '../models/Participant';
import dynamoDb from './dynamoDb';

const TABLE_NAME: string = process.env.DYNAMODB_TB_PARTICIPANTS!;

export async function findParticipantByRoomNameAndPersistentId(roomName: string, persistentId: string): Promise<object | undefined> {
    const result = await dynamoDb.query({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'persistent_id = :persistent_id',
        ExpressionAttributeValues: {
            ':persistent_id': persistentId,
        },
    }).promise();

    if (result.Count == null) {
        return;
    }
    else if (result.Count > 1) {
        throw new Error('findParticipantByRoomNameAndPersistentId returned more than one participant with the same persistent id');
    }
    const participant = result.Items![0];

    if (participant.room_name === roomName) {
        return participant as Participant;
    }
}

export async function saveRoomParticipant(participant: Partial<Participant>): Promise<void> {
    await dynamoDb.put({
        TableName: TABLE_NAME,
        Item: {
            ...participant,
        },
    }).promise();
}
