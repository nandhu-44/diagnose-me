import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import MongoConnect from '@/lib/MongoConnect';
import Patient from '@/models/Patient';
import { setAuthCookie } from '@/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req) {
  try {
    await MongoConnect();
    const data = await req.json();
    
    const existingUser = await Patient.findOne({
      $or: [
        { username: data.username },
        { email: data.email }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const patient = new Patient({
      ...data,
      password: hashedPassword,
      dateOfBirth: new Date(data.dateOfBirth)
    });

    await patient.save();

    const token = jwt.sign(
      {
        userId: patient._id,
        userType: 'patient',
        username: patient.username
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    setAuthCookie(token);

    const patientData = patient.toJSON();
    delete patientData.password;

    return NextResponse.json({
      message: 'Registration successful',
      user: patientData,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}