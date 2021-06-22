import Participant from "./Participant";

export default interface Post {
  postId: string;
  text: string;
  participant: Participant;
  submittedDate: number;
}
