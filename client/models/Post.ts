import Participant from './Participant';

export default interface Post {
    text: string;
    participant: Participant;
    submittedDate: number;
}
