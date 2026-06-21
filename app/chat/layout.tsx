import { WebLLMProvider } from "@/providers/WebLLMProvider";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <WebLLMProvider>{children}</WebLLMProvider>;
}
