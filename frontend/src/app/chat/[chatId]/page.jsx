'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PatientChat from '@/components/PatientChat';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster, toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
      // Connect directly to Python backend first
      const pythonResponse = await fetch(`${process.env.BACKEND_URL || "https://localhost:5000"}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: messageContent })
      });

      // Add initial assistant message
      const assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      const reader = pythonResponse.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                fullResponse += data.chunk;
                // Update the last message with new content
                setMessages(prev => {
                  const updatedMessages = [...prev];
                  updatedMessages[updatedMessages.length - 1] = {
                    ...updatedMessages[updatedMessages.length - 1],
                    content: fullResponse
                  };
                  return updatedMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }

      // After getting full response, save to MongoDB
      const token = localStorage.getItem('token');
      const saveResponse = await fetch(`/api/chats/query/${params.chatId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userMessage: messageContent,
          aiResponse: fullResponse
        })
      });

      if (!saveResponse.ok) {
        console.error('Failed to save conversation to database');
      }

    } catch (error) {
      console.error('[Chat] Error:', error);
      toast.error(error.message || 'Failed to send message');
      // Remove the last message if it failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleSidebarPosition = () => {
    setShowSidebar((prev) => !prev);
  };

  if (!userType) return null;

  return (
    <div className="bg-background">
      <Toaster position="top-center" />
      <Header userType={userType} handleLogout={handleLogout} />
      
      <div className="flex h-[calc(100vh-3.6rem)]">
        {/* Sidebar */}
        {showSidebar && userType === 'patient' && (
          <div className="w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0">
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
              className="absolute top-4 left-4 z-50 bg-gray-700 text-white rounded-full p-3 shadow-lg"
              onClick={toggleSidebarPosition}
            >
              {showSidebar ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
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
      </div> {/* Closing div for the main container */}
    </div>
  );
}