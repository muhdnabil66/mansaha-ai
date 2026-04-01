export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
  attachments?: string[];
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  starred?: boolean;
};

export type Attachment = {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "file";
};
