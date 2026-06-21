export type MessageRole = "user" | "assistant" | "system";

export type ContextOption = "market" | "indices" | "macro" | "derivados" | "portfolio";

export interface ChatMessage {
  role: MessageRole;
  content: string;
  displayContent?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type ModelStatus =
  | "inicializando"
  | "descargando"
  | "cargando_pesos"
  | "compilando_shaders"
  | "preparando_inferencia"
  | "listo"
  | "error";

export interface DownloadProgress {
  status: ModelStatus;
  progress: number;
  text: string;
  loadedMB: number;
  totalMB: number;
  speedMBs: number;
}

export interface ChatStore {
  chats: Chat[];
  activeChatId: string | null;
  modelStatus: ModelStatus;
  downloadProgress: DownloadProgress | null;
}
