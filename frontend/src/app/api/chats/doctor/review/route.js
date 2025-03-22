import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import { getServerAuthSession } from '@/lib/auth';
import Chat from '@/models/Chat';

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.userType !== 'doctor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await MongoConnect();
    const { chatId, action, notes } = await req.json();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
    }

    chat.status = action === 'approve' ? 'approved' : 'rejected';
    chat.doctorReview = {
      approved: action === 'approve',
      notes: notes || '',
      reviewDate: new Date()
    };
    chat.doctorId = session.userId;

    chat.messages.push({
      role: 'doctor',
      content: `Doctor has ${action}ed the AI response.${notes ? ` Notes: ${notes}` : ''}`,
      timestamp: new Date()
    });

    await chat.save();

    return NextResponse.json({
      message: `Chat ${action}ed successfully`,
      status: chat.status
    });
  } catch (error) {
    console.error('Error processing doctor review:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing the review' },
      { status: 500 }
    );
  }
}