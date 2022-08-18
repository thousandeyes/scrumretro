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

import Participant from "../models/Participant";
import dynamoDb from "./dynamoDb";

const TABLE_NAME: string = process.env.DYNAMODB_TB_PARTICIPANTS!;
const ROOM_NAME_IDX: string = process.env
  .DYNAMODB_TB_PARTICIPANTS_IDX_ROOM_NAME!;
const CONNECTION_ID_IDX_NAME: string = process.env.DYNAMODB_PARTICIPANTS_CONNECTION_ID_INDEX!;

export async function findParticipantByRoomNameAndPersistentId(
  roomName: string,
  persistentId: string
): Promise<Participant | undefined> {
  const result = await dynamoDb
    .query({
      TableName: TABLE_NAME,
      KeyConditionExpression: "persistent_id = :persistent_id",
      FilterExpression: "room_name = :room_name",
      ExpressionAttributeValues: {
        ":persistent_id": persistentId,
        ":room_name": roomName
      }
    })
    .promise();

  if (result.Count == null) {
    return;
  } else if (result.Count > 1) {
    throw new Error(
      "findParticipantByRoomNameAndPersistentId returned more than one participant with the same persistent id"
    );
  }
  const participant: Participant | undefined = result.Items![0] as any;
  return participant;
}

export async function findParticipantsByRoomName(
  roomName: string
): Promise<Participant[]> {
  const results = await dynamoDb
    .query({
      TableName: TABLE_NAME,
      IndexName: ROOM_NAME_IDX,
      KeyConditionExpression: "room_name = :room_name",
      ExpressionAttributeValues: {
        ":room_name": roomName
      }
    })
    .promise();

  return (results.Items as Participant[]) || [];
}

export async function saveRoomParticipant(
  participant: Partial<Participant>
): Promise<void> {
  await dynamoDb
    .put({
      TableName: TABLE_NAME,
      Item: {
        ...participant
      }
    })
    .promise();
}

export async function findParticipantByConnectionId(
    connectionId: string
): Promise<Participant | undefined> {
    const result = await dynamoDb.query({
        TableName: TABLE_NAME,
        IndexName: CONNECTION_ID_IDX_NAME,
        KeyConditionExpression: 'connection_id = :connectionId',
        ExpressionAttributeValues: {
            ':connectionId': connectionId,
        },
    }).promise();

    if (result.Count == null) {
        return;
    }
    else if (result.Count > 1) {
        return Promise.reject(new Error('findParticipantByConnectionId returned more than one player'));
    }
    else if (result.Count == 1) {
        return result.Items![0] as Participant;
    }
}
