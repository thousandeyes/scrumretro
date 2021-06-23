import SyncNotesState from "../../models/SyncNotesState";

export default () =>
  ({
    tokenExists: false,
    message: "",
    confluencePageUrl: ""
  } as SyncNotesState);
