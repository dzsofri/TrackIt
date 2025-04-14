import { User } from "./user";

export interface ChatMessage {
  id?: string;
  senderId: string;
  sender:  User | null;
  receiverId: string;
  receiver: string;
  message: string;  // Az üzenet szövege
  createdAt: string;  // Az üzenet időpontja

}
