// Copyright 2022 Cisco Systems, Inc. and its affiliates
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
