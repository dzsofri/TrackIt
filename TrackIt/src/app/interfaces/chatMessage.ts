export interface ChatMessage {
  id?: string;
  senderId: string;
  sender: string;
  receiverId: string;
  receiver: string;
  message: string;  // Az üzenet szövege
  createdAt: string;  // Az üzenet időpontja

}
