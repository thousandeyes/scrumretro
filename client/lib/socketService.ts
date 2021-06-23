import { ClientMessage, ServerMessage } from "../../messages";

let socket: WebSocket | null = null;

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
}

function close() {
  if (socket != null) {
    socket.close();
  }

  socket = null;
}

function checkSocket(socket: WebSocket | null): socket is WebSocket {
  if (socket == null) {
    throw new Error("Socket was not initialized");
  }
  return true;
}
