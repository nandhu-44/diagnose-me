'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import Header from '@/components/Header';
import PatientChat from '@/components/PatientChat';
import DoctorDashboard from '@/components/DoctorDashboard';

export default function ChatPage() {
  const [userType, setUserType] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingQueries, setPendingQueries] = useState([]);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    
    if (!token || !storedUserType) {
      router.push('/');
      return;
    }
    
    setUserType(storedUserType);
    
    // Fetch initial data based on user type
    if (storedUserType === 'patient') {
      fetchPatientChats();
    } else {
      fetchPendingQueries();
    }
  }, [router]);

  const fetchPatientChats = async () => {
    try {
      const response = await fetch('/api/chats/patient', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.chats.length === 0) {
          setMessages([{
            id: Date.now(),
            role: 'system',
            content: 'Welcome to Diagnose Me! Please describe your symptoms in detail, and I\'ll provide health insights based on your medical history.'
          }]);
        } else {
          setMessages(data.chats[0].messages); // Show most recent chat
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchPendingQueries = async () => {
    try {
      const response = await fetch('/api/chats/doctor/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingQueries(data.queries);
      }
    } catch (error) {
      console.error('Error fetching pending queries:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const messageContent = inputValue;
    setInputValue('');
    
    setMessages(prev => [...prev, { 
      id: Date.now(),
      role: 'user',
      content: messageContent
    }]);
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chats/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ query: messageContent })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'assistant',
          content: data.response,
          options: ['Use Now', 'Wait for Doctor']
        }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'system',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (option) => {
    try {
      const response = await fetch('/api/chats/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: option === 'Use Now' ? 'accept' : 'review',
          chatId: messages[messages.length - 2].id // Get the user's message ID
        })
      });
      
      if (response.ok) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'system',
          content: option === 'Use Now' 
            ? 'You have chosen to use this information now. The solution has been saved to your medical history.'
            : 'Your query has been sent to a doctor for review. You will be notified when they respond.'
        }]);
      }
    } catch (error) {
      console.error('Error processing action:', error);
    }
  };

  const handleApproveQuery = async (id) => {
    try {
      const response = await fetch(`/api/chats/doctor/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          chatId: id,
          action: 'approve'
        })
      });
      
      if (response.ok) {
        setPendingQueries(queries => 
          queries.map(q => q.id === id ? {...q, status: 'approved'} : q)
        );
      }
    } catch (error) {
      console.error('Error approving query:', error);
    }
  };

  const handleRejectQuery = async (id) => {
    try {
      const response = await fetch(`/api/chats/doctor/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          chatId: id,
          action: 'reject'
        })
      });
      
      if (response.ok) {
        setPendingQueries(queries => 
          queries.map(q => q.id === id ? {...q, status: 'rejected'} : q)
        );
      }
    } catch (error) {
      console.error('Error rejecting query:', error);
    }
  };

  if (!userType) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} handleLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userType === 'patient' ? (
          <PatientChat 
            messages={messages} 
            isLoading={isLoading}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
            handleOptionSelect={handleOptionSelect}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <DoctorDashboard
            pendingQueries={pendingQueries}
            handleApproveQuery={handleApproveQuery}
            handleRejectQuery={handleRejectQuery}
          />
        )}
      </main>
    </div>
  );
}