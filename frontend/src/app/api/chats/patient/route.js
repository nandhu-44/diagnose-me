import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import Chat from '@/models/Chat';

export async function GET(req) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;

    await MongoConnect();

    const chats = await Chat.find({ patientId: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching patient chats:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching chats' },
      { status: 500 }
    );
  }
}