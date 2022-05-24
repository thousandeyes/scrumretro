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
  AtlassianTokenAddedMessage,
  ConfluenceNotesSyncedMessage
} from "../../../messages";
import SyncNotesState from "../../models/SyncNotesState";

export default {
  ATLASSIAN_TOKEN_ADDED(
    state: SyncNotesState,
    { result }: AtlassianTokenAddedMessage
  ) {
    Object.assign(state, { tokenExists: result });
  },
  CONFLUENCE_NOTES_SYNCED(
    state: SyncNotesState,
    { response, confluencePageUrl }: ConfluenceNotesSyncedMessage
  ) {
    Object.assign(state, { response, confluencePageUrl });
  }
};
