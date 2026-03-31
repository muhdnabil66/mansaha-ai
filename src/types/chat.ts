export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  starred?: boolean; // new field
};
