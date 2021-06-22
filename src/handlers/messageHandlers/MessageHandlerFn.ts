import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { ClientMessage } from "../../../messages";

export default interface MessageHandlerFn {
  (
    client: ApiGatewayManagementApi,
    event: APIGatewayProxyEvent,
    request: ClientMessage
  ): Promise<APIGatewayProxyResult>;
}
