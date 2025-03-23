import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import MongoConnect from '@/lib/MongoConnect';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';
import { sign } from '@/lib/auth';

export async function POST(req) {
  try {
    await MongoConnect();
    const body = await req.json();
    const { userType, username, password } = body;

    const Model = userType === 'patient' ? Patient : Doctor;
    const user = await Model.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await sign({
      userId: user._id.toString(),
      userType,
      username: user.username
    });

    const userData = {
      id: user._id.toString(),
      username: user.username,
      userType,
      fullName: user.fullName
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}