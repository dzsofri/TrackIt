import { User } from "./user";

export interface Friend_Request {
    id: string;
    senderId: number;
    receiverId: number;
    status: string;
    sender?: User;
    receiver?: User;
}