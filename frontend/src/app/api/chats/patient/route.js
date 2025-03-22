import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import { getServerAuthSession } from '@/lib/auth';
import Chat from '@/models/Chat';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session || session.userType !== 'patient') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await MongoConnect();

    const chats = await Chat.find({ patientId: session.userId })
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