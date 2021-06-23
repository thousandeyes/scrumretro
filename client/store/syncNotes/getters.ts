import SyncNotesState from "../../models/SyncNotesState";

export default {
  getSyncNotes(state: SyncNotesState): SyncNotesState {
    console.log(state);
    return state;
  }
};
