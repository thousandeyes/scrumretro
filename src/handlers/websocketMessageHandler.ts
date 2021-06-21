import { ApiGatewayManagementApi } from 'aws-sdk';
import { 
    APIGatewayProxyEvent, 
    APIGatewayProxyResult 
} from 'aws-lambda';
// import { ClientMessage } from "../../messages";

export default async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const client = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

//    const message: ClientMessage = JSON.parse(event.body!);

    await client.postToConnection({
        ConnectionId: event.requestContext.connectionId!,
        Data: JSON.stringify({ message: 'hello!' }),
    }).promise();

    return {
        statusCode: 200,
        body: 'handled',
    };
}
