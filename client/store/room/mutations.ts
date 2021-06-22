import {
  ColumnsUpdatedMessage,
  PersistentIdGeneratedMessage,
  PostAddedMessage,
  RoomJoinedMessage
} from "../../../messages";
import { keyBy } from "lodash";
import Room, { ROOM_MODE } from "../../models/Room";
import getDefaultState from "./state";

const persistentStorageKeyMap: Record<ROOM_MODE, string> = {
  HOST: "persistentId",
  PLAYER: "participant/persistentId"
};

export default {
  init(state: Room, stage: string, roomMode: ROOM_MODE) {
    Object.assign(state, getDefaultState(), {
      roomMode,
      stage,
      persistentId: loadPersistentId(stage, roomMode)
    });
  },
  connected(state: Room) {
    state.connected = true;
  },
  resetPersistentId(state: Room) {
    removeStoredPersistentId(state.stage!, state.roomMode!);
    window.location.reload();
  },
  PERSISTENT_ID_GENERATED(
    state: Room,
    { persistentId }: PersistentIdGeneratedMessage
  ) {
    state.persistentId = persistentId;
    storePersistentId(state.stage!, state.roomMode!, persistentId);
  },
  ROOM_JOINED(state: Room, { roomName, columns }: RoomJoinedMessage) {
    Object.assign(state, { roomName, columns });
  },
  COLUMNS_UPDATED(state: Room, { columns }: ColumnsUpdatedMessage) {
    Object.assign(state, { columns });
    const columnsById = keyBy(state.columns, "columnId");
    state.columns = columns.map(colDef => ({
      ...colDef,
      posts:
        (columnsById[colDef.columnId] && columnsById[colDef.columnId].posts) ||
        []
    }));
  },
  POST_ADDED(state: Room, { post }: PostAddedMessage) {
    const columnsById = keyBy(state.columns, "columnId");
    const column = columnsById[post.columnId];
    if (!column) {
      return;
    }

    column.posts.push(post);
  }
};

function loadPersistentId(stage: string, roomMode: ROOM_MODE) {
  let persistentId: string | undefined;
  const localStorageKey = getPersistentIdStorageKey(stage, roomMode);
  if (window.localStorage && window.localStorage[localStorageKey] != null) {
    persistentId = window.localStorage[localStorageKey];
  }
  return persistentId;
}

function storePersistentId(
  stage: string,
  roomMode: ROOM_MODE,
  persistentId: string
) {
  const localStorageKey = getPersistentIdStorageKey(stage, roomMode);
  window.localStorage[localStorageKey] = persistentId;
}

function getPersistentIdStorageKey(stage: string, roomMode: ROOM_MODE): string {
  return `${stage}/${persistentStorageKeyMap[roomMode]}`;
}

function removeStoredPersistentId(stage: string, roomMode: ROOM_MODE) {
  const localStorageKey = getPersistentIdStorageKey(stage, roomMode);
  delete window.localStorage[localStorageKey];
}
