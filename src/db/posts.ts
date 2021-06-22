import Post from '../models/Post';
import dynamoDb from './dynamoDb';

const TABLE_NAME: string = process.env.DYNAMODB_TB_POSTS!;
const COLUMN_ID_INDEX: string = process.env.DYNAMODB_TB_POSTS_IDX_COLUMN_ID!;
const ROOM_NAME_INDEX: string = process.env.DYNAMODB_TB_POSTS_IDX_ROOM_NAME!;

export async function findPostsByRoomName(roomName: string): Promise<Post[]> {
    const results = await dynamoDb.query({
        TableName: TABLE_NAME,
        IndexName: ROOM_NAME_INDEX,
        KeyConditionExpression: 'room_name = :room_name',
        ExpressionAttributeValues: {
            ':room_name': roomName,
        },
    }).promise();

    return results.Items as Post[] || [];
}

export async function findPostsByRoomNameAndParticipantId(roomName: string, participantId: string): Promise<Post[]> {
    const results = await dynamoDb.query({
        TableName: TABLE_NAME,
        IndexName: ROOM_NAME_INDEX,
        KeyConditionExpression: 'room_name = :room_name',
        FilterExpression: 'participant_id = :participant_id',
        ExpressionAttributeValues: {
            ':room_name': roomName,
            ':participant_id': participantId,
        }
    }).promise();

    return results.Items as Post[] || [];
}

export async function savePost(post: Post): Promise<void> {
    await dynamoDb.put({
        TableName: TABLE_NAME,
        Item: post
    }).promise();
}
