import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import { getServerAuthSession } from '@/lib/auth';
import Chat from '@/models/Chat';

export async function GET(req, { params }) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;

    await MongoConnect();
    const chat = await Chat.findById(params.chatId);
    
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
    }

    if (chat.patientId.toString() !== userId && payload.userType !== 'doctor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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

export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;

    await MongoConnect();
    const { userMessage, aiResponse } = await req.json();
    
    const chat = await Chat.findById(params.chatId);
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
    }

    if (chat.patientId.toString() !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Add the new messages
    chat.messages.push(
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      },
      {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }
    );

    // Update AI response field
    chat.aiResponse = {
      diagnosis: aiResponse,
      timestamp: new Date()
    };

    await chat.save();

    return NextResponse.json({ 
      message: 'Chat updated successfully',
      chat 
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the chat' },
      { status: 500 }
    );
  }
}