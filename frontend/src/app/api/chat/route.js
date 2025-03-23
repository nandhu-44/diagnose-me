import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import MongoConnect from '@/lib/MongoConnect';
import Chat from '@/models/Chat';

async function connectWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    const response = await connectWithRetry('http://localhost:5000/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: body.messages[body.messages.length - 1].content })
    });

    const data = await response.json();
    return NextResponse.json({
      message: data.response
    });

  } catch (error) {
    console.error('Error in chat stream:', error);
    return NextResponse.json(
      { error: error.message || "Failed to connect to AI service. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const chatId = new URL(req.url).searchParams.get('chatId');
  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
  }

  // Set up SSE headers
  const responseHeaders = new Headers();
  responseHeaders.set('Content-Type', 'text/event-stream');
  responseHeaders.set('Cache-Control', 'no-cache');
  responseHeaders.set('Connection', 'keep-alive');

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendData = async (data) => {
    await writer.write(
      encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
    );
  };

  try {
    await MongoConnect();
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Get the last user message
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('No user message found');
    }

    // Connect to Python backend for AI response with retry mechanism
    const pythonBackendUrl = 'http://localhost:5000/process';
    const response = await connectWithRetry(pythonBackendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: lastMessage.content,
      }),
    });

    // Process the streaming response from Python backend
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Parse and forward chunks to the client
      const text = new TextDecoder().decode(value);
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonData = line.slice(6); // Remove "data: " prefix
          try {
            const data = JSON.parse(jsonData);
            await sendData({ chunk: data.chunk });
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }

    // Send end event
    await sendData({ done: true });
  } catch (error) {
    console.error('Error in chat stream:', error);
    await sendData({ error: error.message });
  } finally {
    await writer.close();
  }

  return new Response(stream.readable, {
    headers: responseHeaders,
  });
}
