'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function PatientChat({ messages, isLoading, inputValue, setInputValue, handleSendMessage, handleOptionSelect, messagesEndRef }) {
  return (
    <Card className="w-full">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="text-lg font-medium text-primary">Patient Chat</CardTitle>
      </CardHeader>
      <div className="h-[70vh] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div key={message.id} className="mb-4">
              {message.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                    <p className="text-foreground">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className={`${message.role === 'system' ? 'bg-muted' : 'bg-card border'} rounded-lg p-3 max-w-[80%]`}>
                    <p className="text-foreground">{message.content}</p>
                    
                    {message.options && (
                      <div className="mt-3 flex gap-2">
                        {message.options.map(option => (
                          <Button
                            key={option}
                            onClick={() => handleOptionSelect(option)}
                            variant={option === 'Use Now' ? 'default' : 'secondary'}
                            size="sm"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>
        
        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}