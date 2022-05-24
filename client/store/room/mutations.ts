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

import {
  ColumnNameChangedMessage,
  ColumnOpenStateChangedMessage,
  ColumnsUpdatedMessage,
  ParticipantJoinedMessage,
  PersistentIdGeneratedMessage,
  PostAddedMessage,
  PostDeletedMessage,
  RoomJoinedMessage
} from "../../../messages";
import { keyBy } from "lodash";
import Room, { ROOM_MODE, Scenario } from "../../models/Room";
import getDefaultState from "./state";

const persistentStorageKeyMap: Record<ROOM_MODE, string> = {
  HOST: "persistentId",
  PLAYER: "participant/persistentId"
};

const roomModeBaseUrlMap: Record<ROOM_MODE, string> = {
  HOST: "/host",
  PLAYER: "/play"
};

export default {
  init(
    state: Room,
    { stage, roomMode }: { stage: string; roomMode: ROOM_MODE }
  ) {
    Object.assign(state, getDefaultState(), {
      roomMode,
      stage,
      persistentId: loadPersistentId(stage, roomMode)
    });
  },
  connected(state: Room) {
    state.connected = true;
  },
  scenarioSet(state: Room, scenario: Scenario) {
    state.scenario = scenario;
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
    Object.assign(state, { joined: true, roomName, columns });
    const { roomMode } = state;
    if (roomMode === ROOM_MODE.PLAYER) {
      window.history.replaceState(
        {},
        `LOL Scrum Retro ${roomName}`,
        `${roomModeBaseUrlMap[roomMode]}/${roomName}`
      );
    }
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
  },
  COLUMN_OPEN_STATE_CHANGED(
    state: Room,
    { columnId, isOpen }: ColumnOpenStateChangedMessage
  ) {
    const columnsById = keyBy(state.columns, "columnId");
    const column = columnsById[columnId];
    if (!column) {
      return;
    }

    column.isOpen = isOpen;
  },
  COLUMN_NAME_CHANGED(
    state: Room,
    { columnId, columnName }: ColumnNameChangedMessage
  ) {
    const columnsById = keyBy(state.columns, "columnId");
    const column = columnsById[columnId];
    if (!column) {
      return;
    }

    column.columnName = columnName;
  },
  PARTICIPANT_JOINED(
    state: Room,
    { persistentId, participantName }: ParticipantJoinedMessage
  ) {
    const participantsById = keyBy(state.participants, "persistentId");
    if (participantsById[persistentId]) {
      Object.assign(participantsById[persistentId], { participantName });
      return;
    }

    state.participants.push({
      persistentId,
      participantName
    });
  },
  POST_DELETED(state: Room, { postId: deletedPostId }: PostDeletedMessage) {
    state.columns = state.columns.map(column => ({
      ...column,
      posts: column.posts.filter(({ postId }) => postId !== deletedPostId)
    }));
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

function removeStoredPersistentId(stage: string, roomMode: ROOM_MODE) {
  const localStorageKey = getPersistentIdStorageKey(stage, roomMode);
  delete window.localStorage[localStorageKey];
}

function getPersistentIdStorageKey(stage: string, roomMode: ROOM_MODE): string {
  return `${stage}/${persistentStorageKeyMap[roomMode]}`;
}
