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

import { ClientMessage, MessageType, ServerMessage } from "../../messages";

const PING_INTERVAL_MS = 10000;

let socket: WebSocket | null = null;
let pingIntervalId: any | null = null;

export default {
  connect,
  send,
  close
};

function send(message: ClientMessage) {
  if (checkSocket(socket)) {
    socket.send(JSON.stringify(message));
  }
}

function connect(
  websocketUrl: string,
  onopen: () => {},
  onmessage: (message: ServerMessage) => {}
) {
  // close previous connections
  close();

  socket = new WebSocket(websocketUrl);
  socket.onopen = onopen;
  socket.onmessage = event => {
    onmessage(JSON.parse(event.data));
  };

  pingIntervalId = setInterval(sendPing, PING_INTERVAL_MS);
}

function close() {
  if (socket != null) {
    socket.close();
  }

  if (pingIntervalId != null) {
    clearInterval(pingIntervalId);
  }

  socket = null;
  pingIntervalId = null;
}

function checkSocket(socket: WebSocket | null): socket is WebSocket {
  if (socket == null) {
    throw new Error("Socket was not initialized");
  }
  return true;
}

function sendPing() {
  if (socket) {
    send({
      type: MessageType.CLIENT_PING
    });
  }
}
