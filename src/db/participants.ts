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
