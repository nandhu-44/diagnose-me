'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import Header from '@/components/Header';
import PatientChat from '@/components/PatientChat';
import DoctorDashboard from '@/components/DoctorDashboard';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ChatPage() {
  const [userType, setUserType] = useState(null);
  const [chats, setChats] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        
        const response = await fetch('/api/chats/patient', { headers });
        
        if (!response.ok) {
          console.log('[Auth] Invalid token, redirecting to login');
          localStorage.clear();
          await router.replace('/');
          return;
        }
        
        setUserType(storedUserType);
        if (storedUserType === 'patient') {
          const data = await response.json();
          setChats(data.chats);
        }
      } catch (error) {
        console.error('[Auth] Error checking auth:', error);
        localStorage.clear();
        await router.replace('/');
      }
    };

    checkAuth();
  }, [router]);

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

    try {
      const token = localStorage.getItem('token');
      console.log('[Frontend] Creating new chat with message:', messageContent);

      // First create a new chat in MongoDB
      const createResponse = await fetch('/api/chats/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: messageContent })
      });

      const data = await createResponse.json();
      console.log('[Frontend] Create chat response:', { status: createResponse.status, data });

      if (!createResponse.ok) {
        throw new Error(data.message || 'Failed to create chat');
      }

      if (!data.chatId) {
        throw new Error('No chat ID returned from server');
      }

      // Then connect to Python backend for AI response
      const pythonResponse = await fetch('http://localhost:5000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: messageContent })
      });

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
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }

      // Update the chat with AI response
      const updateResponse = await fetch(`/api/chats/query/${data.chatId}`, {
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

      if (!updateResponse.ok) {
        console.error('Failed to update chat with AI response');
      }

      console.log('[Frontend] Chat created successfully, redirecting to:', `/chat/${data.chatId}`);
      toast.success('Chat created successfully!');
      router.push(`/chat/${data.chatId}`);
    } catch (error) {
      console.error('[Frontend] Error creating chat:', error);
      toast.error(error.message || 'Failed to create chat');
      if (error.message === 'Invalid token') {
        localStorage.clear();
        router.replace('/');
      }
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
        {showSidebar && userType === 'patient' && (
          <div className="w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-center text-gray-100 mb-4">Your Chats</h2>
              {chats.length === 0 ? (
                <p className="text-gray-400 text-xs text-center flex justify-center items-center">No chats yet</p>
              ) : (
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <Card 
                      key={chat._id}
                      className="p-3 bg-gray-800 hover:bg-gray-700 cursor-pointer"
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

        <main className="flex-1">
          <div className="h-full relative">
            <Button
              variant="ghost"
              className="absolute top-4 left-4 z-50 bg-gray-700 text-white rounded-full py-3 px-3 shadow-lg"
              onClick={toggleSidebarPosition}
            >
              {showSidebar ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>

            <Card className="w-full h-full mx-auto rounded-none bg-gray-900 border-gray-800">
              <div className="flex flex-col h-[calc(100vh-3.6rem)]">
                <div className="p-4 mt-auto border-t border-gray-800">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Describe your symptoms..."
                      className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400 rounded px-3 py-2"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-gray-100"
                    >
                      {isLoading ? 'Creating...' : 'Start Chat'}
                    </Button>
                  </form>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Note: This is not a substitute for professional medical advice. 
                    In case of emergency, please contact your healthcare provider immediately.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}