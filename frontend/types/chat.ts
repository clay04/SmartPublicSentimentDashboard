export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface MapAction {
  type: "navigate";
  latitude: number;
  longitude: number;
  zoom?: number;
}

export interface ChatResponse {
  status: "success" | "error";
  answer: string;
  source_document: string | null;
  model_used: string | null;
  map_action?: MapAction | null;
}

export interface ConversationResponse {
  id: number;
  user_id: number;
  created_at?: string;
}

