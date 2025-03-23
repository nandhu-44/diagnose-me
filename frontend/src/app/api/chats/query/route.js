import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import Chat from '@/models/Chat';

export async function POST(req) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;

    await MongoConnect();
    const { query, chatId } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json(
        { message: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    let chat;
    if (chatId) {
      // Add message to existing chat
      chat = await Chat.findById(chatId);
      if (!chat) {
        return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
      }
      if (chat.patientId.toString() !== userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      chat.messages.push({
        role: 'user',
        content: query,
        timestamp: new Date()
      });
    } else {
      // Create new chat with only one user message
      chat = new Chat({
        patientId: userId,
        currentSymptoms: query,
        messages: [] // Start with an empty message array
      });

      await chat.save();
    }

    return NextResponse.json({ 
      message: chatId ? 'Message added successfully' : 'Chat created successfully',
      chatId: chat._id 
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating chat' },
      { status: 500 }
    );
  }
}

// Get chat messages
export async function GET(req, { params }) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const chatId = params.chatId;
    if (!chatId) {
      return NextResponse.json({ message: 'Chat ID is required' }, { status: 400 });
    }

    await MongoConnect();
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching chat' },
      { status: 500 }
    );
  }
}