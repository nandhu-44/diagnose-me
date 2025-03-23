import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import Chat from '@/models/Chat';
import Patient from '@/models/Patient';

export async function GET(req) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.userType !== 'doctor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await MongoConnect();

    const chats = await Chat.find({ status: 'in_review' })
      .populate('patientId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching pending chats:', error);
    return NextResponse.json(
      { message: 'Error fetching pending chats' },
      { status: 500 }
    );
  }
}