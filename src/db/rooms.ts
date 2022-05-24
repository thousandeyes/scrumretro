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
