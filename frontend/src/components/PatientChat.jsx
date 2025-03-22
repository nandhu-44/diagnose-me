'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function PatientChat({ 
  messages, 
  isLoading, 
  inputValue, 
  setInputValue, 
  handleSendMessage,
  handleOptionSelect,
  messagesEndRef 
}) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="text-lg font-medium gradient-text">
          Chat with AI Health Assistant
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col h-[calc(100vh-16rem)]">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] p-4 rounded-lg
                ${message.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-12'
                  : message.role === 'system'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-accent text-accent-foreground mr-12'}
              `}>
                <p className="text-sm">{message.content}</p>
                {message.options && (
                  <div className="flex gap-2 mt-3">
                    {message.options.map((option) => (
                      <Button
                        key={option}
                        variant={option === 'Use Now' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleOptionSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-4 rounded-lg max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t bg-card">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Note: This is not a substitute for professional medical advice. 
            In case of emergency, please contact your healthcare provider immediately.
          </p>
        </div>
      </div>
    </Card>
  );
}