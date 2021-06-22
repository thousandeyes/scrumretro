import Column from "../models/Column";
import dynamoDb from "./dynamoDb";

const TABLE_NAME: string = process.env.DYNAMODB_TB_COLUMNS!;
const ROOM_NAME_IDX: string = process.env.DYNAMODB_TB_COLUMNS_IDX_ROOM_NAME!;

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