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
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUserType = localStorage.getItem('userType');
    
    if (!isLoggedIn || !storedUserType) {
      router.push('/');
      return;
    }
    
    setUserType(storedUserType);
    
    if (storedUserType === 'patient') {
      setMessages([
        {
          id: Date.now(),
          role: 'system',
          content: 'Welcome to Diagnose Me! Please describe your symptoms in detail, and I\'ll provide health insights based on your medical history.'
        }
      ]);
    } else {
      setPendingQueries([
        {
          id: 1,
          patientName: 'John Smith',
          query: 'I\'ve been experiencing severe headaches for the past 3 days, particularly in the morning.',
          aiResponse: 'Based on the symptoms described and your history of high blood pressure, these could be tension headaches or potentially related to blood pressure fluctuations. I recommend scheduling an appointment with your doctor to rule out serious conditions.',
          status: 'pending'
        },
        {
          id: 2,
          patientName: 'Sarah Johnson',
          query: 'I have a persistent dry cough that has lasted for 2 weeks now. No fever or other symptoms.',
          aiResponse: 'A persistent dry cough lasting two weeks without fever could be due to several causes including post-nasal drip, asthma, GERD, or an environmental irritant. Given your history of seasonal allergies, this could be related. Monitor for any changes and consider an antihistamine.',
          status: 'pending'
        }
      ]);
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setMessages(prevMessages => [
      ...prevMessages,
      { id: Date.now(), role: 'user', content: inputValue }
    ]);
    
    setIsLoading(true);
    setTimeout(() => {
      const mockResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Based on your symptoms "${inputValue}", it appears you may be experiencing a common condition. Please note this is not a definitive diagnosis. Would you like to use this information now or wait for a doctor's review?`,
        options: ['Use Now', 'Wait for Doctor']
      };
      
      setMessages(prevMessages => [...prevMessages, mockResponse]);
      setIsLoading(false);
    }, 1500);
    
    setInputValue('');
  };

  const handleOptionSelect = (option) => {
    if (option === 'Use Now') {
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: Date.now(), 
          role: 'system', 
          content: 'You have chosen to use this information now. The solution has been saved to your medical history.' 
        }
      ]);
    } else {
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: Date.now(), 
          role: 'system', 
          content: 'Your query has been sent to a doctor for review. You will be notified when they respond.' 
        }
      ]);
    }
  };

  const handleApproveQuery = (id) => {
    setPendingQueries(queries => 
      queries.map(q => q.id === id ? {...q, status: 'approved'} : q)
    );
  };

  const handleRejectQuery = (id) => {
    setPendingQueries(queries => 
      queries.map(q => q.id === id ? {...q, status: 'rejected'} : q)
    );
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