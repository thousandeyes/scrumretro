import Room, { Scenario } from "../../models/Room";

export default () =>
  ({
    joined: false,
    scenario: Scenario.BOARD,
    connected: false,
    persistentId: undefined,
    roomName: undefined,
    columns: [],
    participants: []
  } as Room);
