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
