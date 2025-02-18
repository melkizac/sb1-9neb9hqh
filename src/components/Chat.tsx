import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createChatSession, sendChatMessage, getChatMessages } from '../lib/chats';
import type { ChatMessage } from '../types/database';

export function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitorId, setVisitorId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a unique visitor ID if not exists
    const storedVisitorId = localStorage.getItem('visitorId');
    if (!storedVisitorId) {
      const newVisitorId = crypto.randomUUID();
      localStorage.setItem('visitorId', newVisitorId);
      setVisitorId(newVisitorId);
    } else {
      setVisitorId(storedVisitorId);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      // Fetch initial messages
      const loadInitialMessages = async () => {
        try {
          const messages = await getChatMessages(sessionId);
          setMessages(messages);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      loadInitialMessages();

      // Set up real-time subscription
      const channel = supabase
        .channel(`chat_${sessionId}`)
        .on(
          'postgres_changes',
          { 
            event: '*',
            schema: 'public', 
            table: 'chat_messages', 
            filter: `session_id=eq.${sessionId}` 
          }, 
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMessages(prev => {
                // Ensure we don't add duplicate messages
                if (!prev.some(msg => msg.id === payload.new.id)) {
                  return [...prev, payload.new as ChatMessage];
                }
                return prev;
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [sessionId]);

  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen, visitorId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const initializeChat = async () => {
    setLoading(true);
    try {
      const session = await createChatSession({
        visitor_id: visitorId,
      });
      
      setSessionId(session.id);
      
      // Fetch initial messages
      const messages = await getChatMessages(session.id);
      setMessages(messages);
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !sessionId) return;

    const trimmedMessage = message.trim();
    setMessage('');
    
    const newMessage = {
      session_id: sessionId,
      visitor_id: visitorId,
      content: trimmedMessage,
      is_from_visitor: true,
      user_id: null,
      read: false,
    };

    try {
      const sentMessage = await sendChatMessage(newMessage);
      // Optimistically add the message to the UI
      setMessages(prev => [...prev, sentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
      setMessage(trimmedMessage);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div
          className={`bg-white rounded-lg shadow-xl transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[500px]'
          } w-[350px] flex flex-col`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-nexius-navy text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Chat with Us</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                ref={messageContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-4"
              >
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${
                      msg.is_from_visitor ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        msg.is_from_visitor
                          ? 'bg-nexius-teal text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-4 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-nexius-teal text-white p-4 rounded-full shadow-lg hover:bg-nexius-teal/90 transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}