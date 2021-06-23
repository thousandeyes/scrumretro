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
