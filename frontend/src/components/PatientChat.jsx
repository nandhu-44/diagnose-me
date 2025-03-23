'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function PatientChat({ 
  messages, 
  isLoading, 
  inputValue, 
  setInputValue, 
  handleSendMessage,
  messagesEndRef 
}) {
  return (
    <Card className="w-full h-full mx-auto rounded-none bg-gray-900 border-gray-800">
      <CardHeader className="bg-gray-800/50 border-b border-gray-800">
        <CardTitle className="text-lg font-medium text-gray-100 text-center">
          Chat with AI Health Assistant
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-gray-900">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages?.map((message) => (
            <div
              key={message.id || message._id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] p-4 rounded-lg
                ${message.role === 'user' 
                  ? 'bg-blue-600 text-gray-100 ml-12'
                  : message.role === 'system'
                  ? 'bg-gray-800 text-gray-300'
                  : 'text-gray-100 mr-12'}
              `}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0" {...props} />
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-4 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400/40 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-400/40 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-400/40 animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-gray-100"
            >
              Send
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Note: This is not a substitute for professional medical advice. 
            In case of emergency, please contact your healthcare provider immediately.
          </p>
        </div>
      </div>
    </Card>
  );
}