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

import Column from "../models/Column";
import dynamoDb from "./dynamoDb";

const TABLE_NAME: string = process.env.DYNAMODB_TB_COLUMNS!;
const ROOM_NAME_IDX: string = process.env.DYNAMODB_TB_COLUMNS_IDX_ROOM_NAME!;

export async function findColumnByColumnIdAndRoomName(
    columnId: string,
    roomName: string
): Promise<Column | undefined> {
    const result = await dynamoDb.query({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'column_id = :column_id',
        FilterExpression: 'room_name = :room_name',
        ExpressionAttributeValues: {
            ':column_id': columnId,
            ':room_name': roomName,
        },
    }).promise();

    const column: Column | undefined = result.Items![0] as any;
    return column;
}

export async function findColumnsByRoomName(
  roomName: string
): Promise<Column[]> {
  const result = await dynamoDb
    .query({
      TableName: TABLE_NAME,
      IndexName: ROOM_NAME_IDX,
      KeyConditionExpression: "room_name = :room_name",
      ExpressionAttributeValues: {
        ":room_name": roomName
      }
    })
    .promise();
  return (result.Items as Column[]) || [];
}

export async function saveColumns(columns: Column[]): Promise<void> {
  for (const col of columns) {
    await saveColumn(col);
  }
}

export async function saveColumn(column: Column): Promise<void> {
  await dynamoDb
    .put({
      TableName: TABLE_NAME,
      Item: {
        ...column,
        created_date: Date.now() / 1000
      }
    })
    .promise();
}

export async function updateColumnOpenStateByColumnId(columnId: string, isOpen: boolean): Promise<Column> {
  const result = await dynamoDb.update({
    TableName: TABLE_NAME,
    Key: { column_id: columnId },
    UpdateExpression: 'SET is_open = :is_open',
    ExpressionAttributeValues: {
      ':is_open': isOpen
    },
    ReturnValues: 'ALL_NEW'
  }).promise();
  return result.Attributes as Column;
}

export async function updateColumnNameByColumnId(columnId: string, columnName: string): Promise<Column> {
  const result = await dynamoDb.update({
    TableName: TABLE_NAME,
    Key: { column_id: columnId },
    UpdateExpression: 'SET column_name = :column_name',
    ExpressionAttributeValues: {
      ':column_name': columnName
    },
    ReturnValues: 'ALL_NEW'
  }).promise();
  return result.Attributes as Column;
}

export async function deleteColumnById(columnId: string): Promise<void> {
  await dynamoDb.delete({
    TableName: TABLE_NAME,
    Key: { column_id: columnId },
  }).promise();
}
