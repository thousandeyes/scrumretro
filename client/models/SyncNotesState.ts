export enum Team {
  AMBER = "AMBER",
  CLIENT = "CLIENT",
  RIVIA = "RIVIA",
}

export default interface SyncNotesState {
  tokenExists: boolean;
  message: string;
  confluencePageUrl: string;
  team: Team;
}
