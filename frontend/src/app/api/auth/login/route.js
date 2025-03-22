import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import MongoConnect from '@/lib/MongoConnect';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';

const JWT_SECRET = process.env.JWT_SECRET

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

    const token = jwt.sign(
      {
        userId: user._id,
        userType,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userData = user.toJSON();
    delete userData.password;

    return NextResponse.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}