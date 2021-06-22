import axios from 'axios';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { ConfluenceNotesSyncMessage, MessageType } from "../../../messages";
import { findRoomByPersistentId } from "../../db/rooms";
import { respondToWebsocket } from "../../utils/websockets";

export default async function confluenceNotesSyncHandler(
  client: ApiGatewayManagementApi,
  event: APIGatewayProxyEvent,
  request: ConfluenceNotesSyncMessage
): Promise<APIGatewayProxyResult> {
  let { persistentId } = request;
  if (persistentId == null) {
    respondToWebsocket(client, event, {
      type: MessageType.CONFLUENCE_NOTES_SYNCED,
      response: "Unknown room to sync notes from"
    });
    return { statusCode: 200, body: "handled" };
  }

  const pageUrl = await syncConfluenceNotes(client, persistentId);
  respondToWebsocket(client, event, {
    type: MessageType.CONFLUENCE_NOTES_SYNCED,
    response: pageUrl ? "OK" : "Failed to sync notes",
    confluencePageUrl: pageUrl
  });
  return { statusCode: 200, body: "handled" };
}

async function syncConfluenceNotes(
  client: ApiGatewayManagementApi,
  persistentId: string
): Promise<string> {
  const room = await findRoomByPersistentId(persistentId);
  if (!room?.atlassian_username || !room?.atlassian_token) {
    return Promise.reject();
  }

  const config: Config = {
    baseURL: 'https://thousandeyes.atlassian.net/wiki',
    headers: {
      'content-type': 'application/json'
    },
    auth: {
      username: room.atlassian_username!,
      password: room.atlassian_token!
    }
  }

  const now = new Date();

  const foo = formatRetroPageContent(
    now,
    "ggeorgalis",
    ["ggeorgalis", "ftw", "ftw2"],
    [ { text: "foo", complete: false, user: "ggeorgalis"} ],
    [ "Bad", "Well", "Notes" ],
    [ [ "One bad thing", "one good thing", "one note thing" ] ],
    [ { text: "foo new new", complete: false, user: "ggeorgalis"} ]
  );

  let p = await findEndpointRetroPage(now, config);
  if (!p) {
      // If page does not exist, we should create a new confluence page
      let parent = await findEndpointRetroPagesParent(now, config);
      p = await createRetroPage(now, parent!, config);
  }

  p = await updateRetroPage(p!, foo, config);

  return "https://thousandeyes.atlassian.net/wiki";
}

export interface ConfluencePageVersion {
  number: number;
}

export interface ConfluencePage {
  id: string;
  title: string;
  version: ConfluencePageVersion;
}

export interface ActionItem {
  text: string;
  user: string;
  complete: boolean;
}

export interface Config {
  baseURL: string;
  headers: object;
  auth: {
    username: string;
    password: string;
  }
}

export async function findEndpointRetroPage(date: Date, config: Config) : Promise<ConfluencePage | undefined> {
  const findEndpointRetroPageQuery = `/rest/api/content?title=${formatRetroDate(date)}%20Retrospective%20-%20Endpoint Team&spaceKey=ENGG&expand=page,version`;
  const rawResponse = await axios.get(findEndpointRetroPageQuery, config);
  const response = rawResponse.data;

  if (response?.results?.length != 1) {
      return;
  }

  return response.results[0] as ConfluencePage;
}

export async function findEndpointRetroPagesParent(date: Date, config: Config) : Promise<ConfluencePage | undefined> {
  const findEndpointRetroPagesParentQuery = '/rest/api/content?title=Endpoint%20Retrospectives&spaceKey=ENGG&expand=children.page';
  const rawResponse = await axios.get(findEndpointRetroPagesParentQuery, config);
  const response = rawResponse.data;

  if (response?.results?.length != 1) {
      return;
  }

  const retroPagesParent = response.results[0].children?.page?.results?.filter(
      p => p.title.startsWith(date.getFullYear())
  );

  if (retroPagesParent?.length != 1) {
      return;
  }

  return retroPagesParent[0] as ConfluencePage;
}

export async function createRetroPage(date: Date, parent: ConfluencePage, config: Config) : Promise<ConfluencePage | undefined> {
  const createObj = {
      type: "page",
      title: `${formatRetroDate(date)} Retrospective - Endpoint Team`,
      ancestors: [ { id: parent.id } ],
      space: { key : "ENGG" },
      body: {
          storage: {
              value: "<p>TODO: Add retro </p>",
              representation: "storage"
          }
      }
  };
  const rawResponse = await axios.post('/rest/api/content', createObj, config);
  const response = rawResponse.data;

  return response as ConfluencePage;
}

export async function updateRetroPage(page: ConfluencePage, content: string, config: Config) : Promise<ConfluencePage | undefined> {
  const updateObj = {
      id: page.id,
      type: "page",
      title: page.title,
      space: { key : "ENGG" },
      body: {
          storage: {
              value: content,
              representation: "storage"
          }
      },
      version: { number: page.version?.number + 1 }
  };
  const rawResponse = await axios.put(`/rest/api/content/${page.id}`, updateObj, config);
  const response = rawResponse.data;

  return response as ConfluencePage;
}

// Formatting functions

function formatRetroDate(date: Date) : string {
  const lpadStr = n => n < 10 ? '0' + n : n;
  return date.getFullYear() + "-" + lpadStr(date.getMonth() + 1) + "-" + lpadStr(date.getDate());
}

function formatUser(user: string) : string {
  return `
  <ac:link>
      <ri:user ri:username="${user}" />
  </ac:link>`;
}

function formatUsers(users: Array<string>) : string {
  return users.reduce((r, i) => r + formatUser(i), '');
}

function formatTask(task: ActionItem) : string {
  return `
  <ac:task>
      <!-- <ac:task-id>939</ac:task-id> -->
      <ac:task-status>${task.complete ? 'complete' : 'incomplete'}</ac:task-status>
      <ac:task-body>
          <span class="placeholder-inline-tasks">
              <ac:link>
                  <ri:user ri:username="${task.user}" />
              </ac:link>
              ${task.text}
          </span>
      </ac:task-body>
  </ac:task>`;
}

function formatTasks(tasks: Array<ActionItem>) : string {
  return tasks.reduce((r, i) => r + formatTask(i), '');
}

function formatRetroColumnName(name: string) : string {
  return `
  <th>
      <p>
          <strong>${name}</strong>
      </p>
  </th>`;
}

function formatRetroColumnItem(text?: string) : string {
  return text ?
  `<td>
      <p>${text}</p>
  </td>`
  :
  `<td>
      <p/>
  </td>`;
}

function formatRetroTableHeader(items: Array<string>) : string {
  return `
  <tr>
      ${items.reduce((result, i) => result + formatRetroColumnName(i), '')}
  </tr>`;
}

function formatRetroTableRow(items: Array<string>) : string {
  return `
  <tr>
      ${items.reduce((result, i) => result + formatRetroColumnItem(i), '')}
  </tr>`;

}

function formatRetroTableRows(rows: Array<Array<string>>, columns: number) : string {
  return rows.reduce((r, i) => formatRetroTableRow(i), '');
}

function formatRetroPageContent(date: Date,
                              scrummaster: string,
                              participants: Array<string>,
                              previousActionItems: Array<ActionItem>,
                              retroColumns: Array<string>,
                              retroRows: Array<Array<string>>,
                              actionItems: Array<ActionItem>) : string {
  return `
  <ac:structured-macro ac:name="details" ac:schema-version="1" data-layout="full-width" ac:macro-id="95336a1f-af29-4faa-b356-15c8fa100ff8">
  <ac:rich-text-body>
      <p/>
      <table data-layout="full-width">
          <colgroup>
              <col style="width: 87.0px;" />
              <col style="width: 1178.0px;" />
          </colgroup>
          <tbody>
              <tr>
                  <th>
                      <p>Date</p>
                  </th>
                  <td>
                      <p>
                          <time datetime="${formatRetroDate(date)}" />
                      </p>
                  </td>
              </tr>
              <tr>
                  <th>
                      <p>Team</p>
                  </th>
                  <td>
                      <p>
                          <a href="https://thousandeyes.atlassian.net/people/team/4858d3b8-106d-4a49-be87-bcad6b5462bf?ref=confluence&amp;src=retrospective-blueprint">Endpoint Agent</a>
                      </p>
                  </td>
              </tr>
              <tr>
                  <th>
                      <p>Scrum master</p>
                  </th>
                  <td>
                      <p>
                          ${formatUser(scrummaster)}
                      </p>
                  </td>
              </tr>
              <tr>
                  <th>
                      <p>Participants</p>
                  </th>
                  <td>
                      <p>
                          ${formatUsers(participants)}
                      </p>
                  </td>
              </tr>
          </tbody>
      </table>
  </ac:rich-text-body>
  </ac:structured-macro>

  <h2>Previous action items</h2>
  <ac:task-list>
      ${formatTasks(previousActionItems)}
  </ac:task-list>

  <h2>Retrospective</h2>
  <table data-layout="default">
      <colgroup>
          <col style="width: 211.0px;" />
          <col style="width: 261.0px;" />
          <col style="width: 288.0px;" />
      </colgroup>
      <tbody>
          ${formatRetroTableHeader(retroColumns)}
          ${formatRetroTableRows(retroRows, retroColumns.length)}
      </tbody>
  </table>

  <h2>Action items</h2>
  <ac:task-list>
      ${formatTasks(actionItems)}
  </ac:task-list>

  <h2>Happiness Index</h2>
  <p>
      Very Sad - 0% <br/>
      Sad - 0% <br/>
      Happy - 60% <br/>
      Very Happy - 40%
  </p>`;
}
