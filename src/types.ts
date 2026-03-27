export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  image?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
  folder?: string;
}
