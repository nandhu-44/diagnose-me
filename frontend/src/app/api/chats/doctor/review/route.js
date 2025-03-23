import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import Chat from '@/models/Chat';

export async function PUT(req) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.userType !== 'doctor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, approved, notes } = await req.json();
    
    await MongoConnect();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
    }

    chat.status = approved ? 'approved' : 'rejected';
    chat.doctorId = payload.userId;
    chat.doctorReview = {
      approved,
      notes,
      reviewDate: new Date()
    };

    chat.messages.push({
      role: 'doctor',
      content: notes,
      timestamp: new Date()
    });

    await chat.save();

    return NextResponse.json({
      message: 'Review submitted successfully',
      chat
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { message: 'An error occurred while submitting review' },
      { status: 500 }
    );
  }
}