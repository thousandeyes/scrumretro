import Post from "../models/Post";
import dynamoDb from "./dynamoDb";

const TABLE_NAME: string = process.env.DYNAMODB_TB_POSTS!;
const COLUMN_ID_INDEX: string = process.env.DYNAMODB_TB_POSTS_IDX_COLUMN_ID!;

export async function findPostsByColumnId(columnId: string): Promise<Post[]> {
  const results = await dynamoDb
    .query({
      TableName: TABLE_NAME,
      IndexName: COLUMN_ID_INDEX,
      KeyConditionExpression: "column_id = :column_id",
      ExpressionAttributeValues: {
        ":column_id": columnId
      }
    })
    .promise();

  return (results.Items as Post[]) || [];
}

export async function findPostsByColumnIdAndParticipantId(
  roomName: string,
  participantId: string
): Promise<Post[]> {
  const results = await dynamoDb
    .query({
      TableName: TABLE_NAME,
      IndexName: COLUMN_ID_INDEX,
      KeyConditionExpression: "column_id = :column_id",
      FilterExpression: "participant_id = :participant_id",
      ExpressionAttributeValues: {
        ":column_id": roomName,
        ":participant_id": participantId
      }
    })
    .promise();

  return (results.Items as Post[]) || [];
}

export async function savePost(post: Post): Promise<void> {
  await dynamoDb
    .put({
      TableName: TABLE_NAME,
      Item: post
    })
    .promise();
}

export async function deletePostById(postId: string): Promise<void> {
  await dynamoDb
    .delete({
      TableName: TABLE_NAME,
      Key: { post_id: postId }
    })
    .promise();
}
