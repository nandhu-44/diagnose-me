import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import MongoConnect from '@/lib/MongoConnect';
import Patient from '@/models/Patient';
import { sign } from '@/lib/auth';

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

    const token = await sign({
      userId: patient._id.toString(),
      userType: 'patient',
      username: patient.username
    });

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