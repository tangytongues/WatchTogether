import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import type { ChatMessage } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ChatSidebarProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
}

export function ChatSidebar({ messages, currentUserId, onSendMessage }: ChatSidebarProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        data-testid="chat-messages-container"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">
              No messages yet.<br />Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div 
                key={message.id}
                className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}
                data-testid={`message-${message.id}`}
              >
                {!isOwn && (
                  <span className="text-xs font-medium text-muted-foreground px-1">
                    {message.senderUsername}
                  </span>
                )}
                <div 
                  className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                    isOwn 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground px-1">
                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full"
            maxLength={1000}
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim()}
            className="rounded-full flex-shrink-0"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
