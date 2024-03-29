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

import Room from "../models/Room";
import dynamoDb from "./dynamoDb";

const TABLE_NAME: string = process.env.DYNAMODB_TB_ROOMS!;
const CONNECTION_ID_IDX_NAME: string = process.env
  .DYNAMODB_TB_ROOMS_IDX_CONNECTION_ID!;
const PERSISTENT_ID_IDX_NAME: string = process.env
  .DYNAMODB_TB_ROOMS_IDX_PERSISTENT_ID!;

export async function findRoomByName(
  roomName: string
): Promise<Room | undefined> {
  const result = await dynamoDb
    .get({
      TableName: TABLE_NAME,
      Key: { room_name: roomName }
    })
    .promise();

  if (result.Item) {
    return result.Item as Room;
  }
}

export async function findRoomByConnectionId(
  connectionId: string
): Promise<Room | undefined> {
  const result = await dynamoDb
    .query({
      TableName: TABLE_NAME,
      IndexName: CONNECTION_ID_IDX_NAME,
      KeyConditionExpression: "connection_id = :connection_id",
      ExpressionAttributeValues: {
        ":connection_id": connectionId
      }
    })
    .promise();

  if (result.Count == null) {
    return;
  } else if (result.Count > 1) {
    return Promise.reject(
      new Error("findRoomByConnectionId returned more than one room")
    );
  } else if (result.Count == 1) {
    return result.Items![0] as Room;
  }
}

export async function findRoomByPersistentId(
  persistentId: string
): Promise<Room | undefined> {
  const result = await dynamoDb
    .query({
      TableName: TABLE_NAME,
      IndexName: PERSISTENT_ID_IDX_NAME,
      KeyConditionExpression: "persistent_id = :persistent_id",
      ExpressionAttributeValues: {
        ":persistent_id": persistentId
      }
    })
    .promise();

  if (result.Count == null) {
    return;
  } else if (result.Count > 1) {
    return Promise.reject(
      new Error("findRoomByPersistentId returned more than one room")
    );
  } else if (result.Count == 1) {
    return result.Items![0] as Room;
  }
}

export async function saveRoom(room: Partial<Room>): Promise<void> {
  await dynamoDb
    .put({
      TableName: TABLE_NAME,
      Item: {
        updated_date: Date.now(),
        ...room
      }
    })
    .promise();
}

export async function deleteRoom(room: Room): Promise<void> {
  await dynamoDb
    .delete({
      TableName: TABLE_NAME,
      Key: { room_name: room.room_name }
    })
    .promise();
}
