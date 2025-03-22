import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import { getServerAuthSession } from '@/lib/auth';
import Chat from '@/models/Chat';
import Patient from '@/models/Patient';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session || session.userType !== 'doctor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await MongoConnect();

    const chats = await Chat.find({
      status: { $in: ['pending', 'in_review'] }
    })
    .populate('patient', 'fullName')
    .sort({ isUrgent: -1, createdAt: -1 });


    const queries = chats.map(chat => ({
      id: chat._id,
      patientName: chat.patient.fullName,
      query: chat.currentSymptoms,
      aiResponse: chat.aiResponse.diagnosis + '\n' + chat.aiResponse.recommendations,
      status: chat.status,
      timestamp: chat.createdAt,
      isUrgent: chat.isUrgent
    }));

    return NextResponse.json({ queries });
  } catch (error) {
    console.error('Error fetching pending queries:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching queries' },
      { status: 500 }
    );
  }
}