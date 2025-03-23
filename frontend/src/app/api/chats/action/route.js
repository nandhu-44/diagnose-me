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
    const { chatId, action } = await req.json();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
    }

    if (chat.patientId.toString() !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    chat.status = action === 'accept' ? 'completed' : 'in_review';

    chat.messages.push({
      role: 'system',
      content: action === 'accept' 
        ? 'Patient has accepted the AI recommendation. The solution has been saved.'
        : 'Query has been sent for doctor review.',
      timestamp: new Date()
    });

    await chat.save();

    return NextResponse.json({
      message: `Chat ${action === 'accept' ? 'accepted' : 'sent for review'} successfully`,
      chat
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating chat' },
      { status: 500 }
    );
  }
}