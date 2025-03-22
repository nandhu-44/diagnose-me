import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import { getServerAuthSession } from '@/lib/auth';
import Chat from '@/models/Chat';

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await MongoConnect();
    const { query } = await req.json();

    const chat = new Chat({
      patientId: session.userId,
      currentSymptoms: query,
      messages: [
        {
          role: 'user',
          content: query,
          timestamp: new Date()
        }
      ],
      aiModel: 'gpt-4o',
      status: 'pending'
    });
    

    const mockAIResponse = {
      diagnosis: 'Based on your symptoms, this could be a common condition.',
      confidence: 0.85,
      recommendations: 'Rest and stay hydrated. Monitor your symptoms.',
      warnings: 'Seek immediate medical attention if symptoms worsen.'
    };

    chat.messages.push({
      role: 'assistant',
      content: `${mockAIResponse.diagnosis}\n\n${mockAIResponse.recommendations}\n\nWarning: ${mockAIResponse.warnings}`,
      timestamp: new Date()
    });

    chat.aiResponse = mockAIResponse;
    await chat.save();

    return NextResponse.json({
      response: chat.messages[chat.messages.length - 1].content,
      chatId: chat._id
    });
  } catch (error) {
    console.error('Chat query error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your query' },
      { status: 500 }
    );
  }
}