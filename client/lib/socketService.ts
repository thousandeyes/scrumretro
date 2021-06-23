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
