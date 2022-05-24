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
