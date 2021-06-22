import Participant from "./Participant";

export default interface Post {
  postId: string;
  columnId: string;
  text: string;
  participant: Participant;
  submittedDate: number;
}
