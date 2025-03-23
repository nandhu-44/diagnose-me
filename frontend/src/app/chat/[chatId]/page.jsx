'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PatientChat from '@/components/PatientChat';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster, toast } from 'sonner';

export default function ChatPage({ params }) {
  const [userType, setUserType] = useState(null);
  const [chats, setChats] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history and setup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUserType = localStorage.getItem('userType');
        
        if (!token || !storedUserType) {
          console.log('[Auth] No token or userType found, redirecting to login');
          await router.replace('/');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Load chat history for sidebar
        const chatsResponse = await fetch('/api/chats/patient', { headers });
        if (!chatsResponse.ok) {
          throw new Error('Failed to fetch chats');
        }
        const chatsData = await chatsResponse.json();
        setChats(chatsData.chats);

        // Load current chat messages
        const chatResponse = await fetch(`/api/chats/query/${params.chatId}`, { headers });
        if (!chatResponse.ok) {
          throw new Error('Failed to fetch chat');
        }
        const chatData = await chatResponse.json();
        setMessages(chatData.chat.messages || []);
        
        setUserType(storedUserType);
      } catch (error) {
        console.error('[Chat] Error:', error);
        toast.error('Failed to load chat');
        if (error.message === 'Invalid token') {
          localStorage.clear();
          router.replace('/');
        }
      }
    };

    checkAuth();
  }, [router, params.chatId]);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      await router.replace('/');
    } catch (error) {
      console.error('[Auth] Error during logout:', error);
      window.location.href = '/';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const messageContent = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Add user message immediately
    const newMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chats/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: messageContent, chatId: params.chatId })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Start SSE connection for AI response
      const eventSource = new EventSource(`/api/chat?chatId=${params.chatId}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.chunk) {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              // Append to existing assistant message
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + data.chunk
              };
              return updatedMessages;
            } else {
              // Create new assistant message
              return [...prev, {
                role: 'assistant',
                content: data.chunk,
                timestamp: new Date()
              }];
            }
          });
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        setIsLoading(false);
        toast.error('Failed to get AI response');
      };

      eventSource.addEventListener('end', () => {
        eventSource.close();
        setIsLoading(false);
      });
    } catch (error) {
      console.error('[Chat] Error:', error);
      toast.error(error.message || 'Failed to send message');
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  if (!userType) return null;

  return (
    <div className="bg-background">
      <Toaster position="top-center" />
      <Header userType={userType} handleLogout={handleLogout} />
      
      <div className="flex h-[calc(100vh-3.6rem)]">
        {/* Sidebar */}
        {showSidebar && userType === 'patient' && (
          <div className="w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-center text-gray-100 mb-4">Your Chats</h2>
              {chats.length === 0 ? (
                <p className="text-gray-400 text-xs text-center">No chats yet</p>
              ) : (
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <Card 
                      key={chat._id}
                      className={`p-3 bg-gray-800 hover:bg-gray-700 cursor-pointer ${
                        chat._id === params.chatId ? 'border-blue-500' : ''
                      }`}
                      onClick={() => router.push(`/chat/${chat._id}`)}
                    >
                      <p className="text-sm text-gray-100 truncate">{chat.currentSymptoms}</p>
                      <p className="text-xs text-gray-400">{new Date(chat.createdAt).toLocaleDateString()}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div className="h-full relative">
            <Button
              variant="ghost"
              className="absolute top-4 left-4 z-10"
              onClick={toggleSidebar}
            >
              {showSidebar ? '←' : '→'}
            </Button>

            <PatientChat
              messages={messages}
              isLoading={isLoading}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
            />
          </div>
        </main>
      </div>
    </div>
  );
}