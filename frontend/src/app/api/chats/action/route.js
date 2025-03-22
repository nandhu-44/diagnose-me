import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import { getServerAuthSession } from '@/lib/auth';
import Chat from '@/models/Chat';

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.userType !== 'patient') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await MongoConnect();
    const { chatId, action } = await req.json();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
    }

    if (chat.patientId.toString() !== session.userId) {
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
      message: action === 'accept' 
        ? 'Response accepted and saved'
        : 'Query sent for doctor review',
      status: chat.status
    });
  } catch (error) {
    console.error('Error processing patient action:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your action' },
      { status: 500 }
    );
  }
}