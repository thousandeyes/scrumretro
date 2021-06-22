import Room from "../../models/Room";

export default () =>
  ({
    connected: false,
    persistentId: undefined,
    roomName: undefined,
    columns: [],
    participants: []
  } as Room);
