import { User } from "./user";
import { User_Challenge } from "./user_challenges";

export interface Friend_Request {
    id: string;
    senderId: number;
    receiverId: number;
    status: string;
    sender?: User;
    receiver?: User;
    activeChallenge: User_Challenge | null;
}